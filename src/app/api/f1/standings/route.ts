import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes cache

const TEAM_COLORS_MAP: Record<string, string> = {
  'mercedes': '#00D2BE',
  'ferrari': '#DC143C',
  'mclaren': '#FF8700',
  'red_bull': '#3671C6',
  'red bull': '#3671C6',
  'alpine': '#FF69B4',
  'racing_bulls': '#6692FF',
  'rb': '#6692FF',
  'sauber': '#D4AF37',
  'kick sauber': '#D4AF37',
  'audi': '#D4AF37',
  'aston_martin': '#358C75',
  'aston martin': '#358C75',
  'williams': '#64C4FF',
  'haas': '#B6BABD',
  'haas f1 team': '#B6BABD',
  'cadillac': '#FFFFFF'
};

function getTeamColor(teamName: string, constructorId?: string): string {
  const nameLower = (teamName || '').toLowerCase();
  const idLower = (constructorId || '').toLowerCase();

  for (const [key, color] of Object.entries(TEAM_COLORS_MAP)) {
    if (nameLower.includes(key) || idLower.includes(key)) {
      return color;
    }
  }
  return '#3b82f6';
}

function getRaceAbbreviation(raceName: string): string {
  const name = raceName.replace('Grand Prix', '').trim();
  if (name.toLowerCase() === 'bahrain') return 'BHR';
  if (name.toLowerCase() === 'saudi arabia') return 'SAU';
  if (name.toLowerCase() === 'australian') return 'AUS';
  if (name.toLowerCase() === 'chinese') return 'CHN';
  if (name.toLowerCase() === 'miami') return 'MIA';
  if (name.toLowerCase() === 'emilia romagna') return 'EMI';
  if (name.toLowerCase() === 'monaco') return 'MON';
  if (name.toLowerCase() === 'canadian') return 'CAN';
  if (name.toLowerCase() === 'spanish') return 'ESP';
  if (name.toLowerCase() === 'austrian') return 'AUT';
  if (name.toLowerCase() === 'british') return 'GBR';
  if (name.toLowerCase() === 'hungarian') return 'HUN';
  if (name.toLowerCase() === 'belgian') return 'BEL';
  if (name.toLowerCase() === 'dutch') return 'NED';
  if (name.toLowerCase() === 'italian') return 'ITA';
  if (name.toLowerCase() === 'azerbaijan') return 'AZE';
  if (name.toLowerCase() === 'singapore') return 'SIN';
  if (name.toLowerCase() === 'united states') return 'USA';
  if (name.toLowerCase() === 'mexico city') return 'MEX';
  if (name.toLowerCase() === 'sao paulo') return 'BRA';
  if (name.toLowerCase() === 'las vegas') return 'LAS';
  if (name.toLowerCase() === 'qatar') return 'QAT';
  if (name.toLowerCase() === 'abu dhabi') return 'ABU';
  return name.slice(0, 3).toUpperCase();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2026';
    const includeCharts = searchParams.get('charts') === 'true';

    // 1. Fetch current standings
    const promises: Promise<any>[] = [
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverstandings.json`, { next: { revalidate: 300 } }),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorstandings.json`, { next: { revalidate: 300 } })
    ];

    if (includeCharts) {
      promises.push(
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/results.json?limit=500`, { next: { revalidate: 300 } }),
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/sprint.json?limit=100`, { next: { revalidate: 300 } })
      );
    }

    const responses = await Promise.all(promises);
    const [driversData, constructorsData] = await Promise.all([
      responses[0].json().catch(() => ({})),
      responses[1].json().catch(() => ({}))
    ]);

    const resultsData = includeCharts ? await responses[2].json().catch(() => ({})) : null;
    const sprintData = includeCharts ? await responses[3].json().catch(() => ({})) : null;

    // Parse driver standings
    const driverStandingsLists = driversData.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    const driverStandings = driverStandingsLists.map((item: any) => {
      const driver = item.Driver;
      const constructor = item.Constructors?.[0] || {};
      return {
        position: Number(item.position),
        driverCode: driver.code || driver.driverId.slice(0, 3).toUpperCase(),
        firstName: driver.givenName || '',
        lastName: driver.familyName || '',
        nationality: driver.nationality || '',
        teamName: constructor.name || '',
        teamColor: getTeamColor(constructor.name, constructor.constructorId),
        points: Number(item.points),
        wins: Number(item.wins)
      };
    });

    // Parse constructor standings
    const constructorStandingsLists = constructorsData.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
    const constructorStandings = constructorStandingsLists.map((item: any) => {
      const constructor = item.Constructor;
      return {
        position: Number(item.position),
        constructorId: constructor.constructorId || '',
        name: constructor.name || '',
        nationality: constructor.nationality || '',
        teamColor: getTeamColor(constructor.name, constructor.constructorId),
        points: Number(item.points),
        wins: Number(item.wins)
      };
    });

    let driverRankingEvo: any[] = [];
    let constructorRankingEvo: any[] = [];
    let driverStats: any[] = [];
    let constructorStats: any[] = [];

    if (includeCharts && resultsData) {
      // Extract races and derive completed rounds
      const races = resultsData.MRData?.RaceTable?.Races || [];
      const completedRounds = races.map((race: any) => ({
        round: Number(race.round),
        raceName: race.raceName,
        raceAbbr: getRaceAbbreviation(race.raceName)
      })).sort((a: any, b: any) => a.round - b.round);

      // Fetch standings round-by-round in parallel to build evolution data
      const roundPromises = completedRounds.map(async (r: any) => {
        const [dRes, cRes] = await Promise.all([
          fetch(`https://api.jolpi.ca/ergast/f1/${year}/${r.round}/driverstandings.json`, { next: { revalidate: 300 } }),
          fetch(`https://api.jolpi.ca/ergast/f1/${year}/${r.round}/constructorstandings.json`, { next: { revalidate: 300 } })
        ]);
        const dJson = await dRes.json().catch(() => null);
        const cJson = await cRes.json().catch(() => null);
        return {
          round: r.round,
          raceName: r.raceName,
          raceAbbr: r.raceAbbr,
          dJson,
          cJson
        };
      });

      const roundsData = await Promise.all(roundPromises);

      driverRankingEvo = roundsData.map((rd: any) => {
        const positions: Record<string, number> = {};
        const lists = rd.dJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        lists.forEach((item: any) => {
          const dCode = item.Driver.code || item.Driver.driverId.slice(0, 3).toUpperCase();
          positions[dCode] = Number(item.position);
        });
        return {
          round: rd.round,
          raceName: rd.raceName,
          raceAbbr: rd.raceAbbr,
          positions
        };
      });

      constructorRankingEvo = roundsData.map((rd: any) => {
        const positions: Record<string, number> = {};
        const lists = rd.cJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
        lists.forEach((item: any) => {
          const cName = item.Constructor.name;
          positions[cName] = Number(item.position);
        });
        return {
          round: rd.round,
          raceName: rd.raceName,
          raceAbbr: rd.raceAbbr,
          positions
        };
      });

      // Derive driver & constructor statistics from race results
      const dStatsMap = new Map<string, { wins: number; podiums: number; pointFinishes: number; dnfs: number; poles: number }>();
      const cStatsMap = new Map<string, { wins: number; podiums: number; pointFinishes: number; dnfs: number }>();

      const isDNF = (status: string) => {
        const s = status.toLowerCase();
        return !s.includes('finished') && !s.includes('lap');
      };

      races.forEach((race: any) => {
        const results = race.Results || [];
        results.forEach((r: any) => {
          const dCode = r.Driver.code || r.Driver.driverId.slice(0, 3).toUpperCase();
          const cName = r.Constructor.name;

          const pos = Number(r.position);
          const grid = Number(r.grid);
          const status = r.status || '';

          // Initialize driver stats
          if (!dStatsMap.has(dCode)) {
            dStatsMap.set(dCode, { wins: 0, podiums: 0, pointFinishes: 0, dnfs: 0, poles: 0 });
          }
          const dStat = dStatsMap.get(dCode)!;
          if (pos === 1) dStat.wins++;
          if (pos <= 3) dStat.podiums++;
          if (pos <= 10) dStat.pointFinishes++;
          if (isDNF(status)) dStat.dnfs++;
          if (grid === 1) dStat.poles++;

          // Initialize constructor stats
          if (!cStatsMap.has(cName)) {
            cStatsMap.set(cName, { wins: 0, podiums: 0, pointFinishes: 0, dnfs: 0 });
          }
          const cStat = cStatsMap.get(cName)!;
          if (pos === 1) cStat.wins++;
          if (pos <= 3) cStat.podiums++;
          if (pos <= 10) cStat.pointFinishes++;
          if (isDNF(status)) cStat.dnfs++;
        });
      });

      driverStats = Array.from(dStatsMap.entries()).map(([driverCode, stats]) => ({
        driverCode,
        ...stats
      }));

      constructorStats = Array.from(cStatsMap.entries()).map(([name, stats]) => ({
        name,
        ...stats
      }));
    }

    // Calculate total points
    const totalPoints = driverStandings.reduce((sum: number, d: any) => sum + d.points, 0);

    return NextResponse.json({
      driverStandings,
      constructorStandings,
      driverRankingEvo,
      constructorRankingEvo,
      driverStats,
      constructorStats,
      totalPoints
    });
  } catch (error) {
    console.error("Standings API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
