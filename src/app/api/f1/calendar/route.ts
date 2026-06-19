import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'current';
    
    const calendarRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    const calendarData = await calendarRes.json();
    const races = calendarData.MRData?.RaceTable?.Races || [];
    
    // Enrich with sprint info and past race winners
    const enrichedRaces = races.map((race: any) => {
      const isSprint = !!(race.Sprint);
      return {
        ...race,
        isSprint,
      };
    });

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
