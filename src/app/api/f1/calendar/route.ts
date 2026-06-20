import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour

function findMatchingRound(race: any): number {
  const name = (race.raceName || '').toLowerCase();
  const country = (race.Circuit?.Location?.country || '').toLowerCase();
  const circuit = (race.Circuit?.circuitName || '').toLowerCase();

  if (name.includes('australian') || country.includes('australia')) return 1;
  if (name.includes('chinese') || country.includes('china')) return 2;
  if (name.includes('japanese') || country.includes('japan')) return 3;
  if (name.includes('miami')) return 4;
  if (name.includes('monaco')) return 5;
  if (name.includes('barcelona') || circuit.includes('catalunya')) return 6;
  if (name.includes('canadian') || country.includes('canada')) return 7;
  if (name.includes('austrian') || country.includes('austria')) return 8;
  if (name.includes('british') || country.includes('united kingdom') || country === 'uk') return 9;
  if (name.includes('belgian') || country.includes('belgium')) return 10;
  if (name.includes('hungarian') || country.includes('hungary')) return 11;
  if (name.includes('dutch') || country.includes('netherlands')) return 12;
  if (name.includes('italian') || circuit.includes('monza')) return 13;
  if (name.includes('spanish') || name.includes('madrid')) return 14;
  if (name.includes('azerbaijan') || country.includes('azerbaijan')) return 15;
  if (name.includes('singapore')) return 16;
  if (name.includes('united states') || circuit.includes('americas')) return 17;
  if (name.includes('mexico')) return 18;
  if (name.includes('são paulo') || name.includes('brazilian') || circuit.includes('interlagos')) return 19;
  if (name.includes('las vegas')) return 20;
  if (name.includes('qatar')) return 21;
  if (name.includes('abu dhabi') || country.includes('uae') || country.includes('united arab emirates')) return 22;

  return Number(race.round);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'current';
    
    const calendarRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    const calendarData = await calendarRes.json();
    const races = calendarData.MRData?.RaceTable?.Races || [];
    
    // Enrich with matched rounds, sprint info and past race winners
    const enrichedRaces = races.map((race: any) => {
      const matchedRound = findMatchingRound(race);
      const isSprint = !!(race.Sprint);
      return {
        ...race,
        round: String(matchedRound),
        isSprint,
      };
    });

    // Sort races by round number ascending to match 2026 custom calendar order
    enrichedRaces.sort((a: any, b: any) => Number(a.round) - Number(b.round));

    // Try to fetch latest results for completed races
    const now = new Date();
    const completedRaces = enrichedRaces.filter((r: any) => {
      const raceDate = new Date(`${r.date}T${r.time || '00:00:00Z'}`);
      return raceDate < now;
    });
    
    // Fetch winners for completed races (batch - only last race to avoid rate limits)
    if (completedRaces.length > 0) {
      try {
        const lastCompleted = completedRaces[completedRaces.length - 1];
        const resultRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${lastCompleted.round}/results.json`);
        const resultData = await resultRes.json();
        const results = resultData.MRData?.RaceTable?.Races[0]?.Results;
        if (results && results.length > 0) {
          const winner = results[0];
          lastCompleted.winner = `${winner.Driver.givenName} ${winner.Driver.familyName}`;
          lastCompleted.winnerTime = winner.Time?.time;
        }
      } catch {
        // Silent fail for winner fetch
      }
    }

    return NextResponse.json({
      calendar: enrichedRaces
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
