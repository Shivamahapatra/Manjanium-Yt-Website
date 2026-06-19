import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'current';
    const round = searchParams.get('round') || 'last';
    
    const [raceRes, qualiRes, sprintRes] = await Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/qualifying.json`),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/sprint.json`).catch(() => null)
    ]);

    const raceData = await raceRes.json();
    const qualiData = await qualiRes.json();
    
    let sprintData = null;
    if (sprintRes && sprintRes.ok) {
      sprintData = await sprintRes.json();
    }
    
    const raceResults = raceData.MRData?.RaceTable?.Races[0] || null;
    
    // Extract fastest laps from race results
    let fastestLaps: any[] = [];
    if (raceResults?.Results) {
      fastestLaps = raceResults.Results
        .filter((r: any) => r.FastestLap)
        .sort((a: any, b: any) => Number(a.FastestLap.rank) - Number(b.FastestLap.rank))
        .map((r: any) => ({
          position: r.FastestLap.rank,
          Driver: r.Driver,
          Constructor: r.Constructor,
          lap: r.FastestLap.lap,
          time: r.FastestLap.Time.time,
          avgSpeed: r.FastestLap.AverageSpeed?.speed,
        }));
    }

    return NextResponse.json({
      race: raceResults,
      qualifying: qualiData.MRData?.RaceTable?.Races[0] || null,
      sprint: sprintData?.MRData?.RaceTable?.Races[0] || null,
      fastestLaps
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
