import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'current';
    
    // Jolpica/Ergast handles driverStandings and constructorStandings
    const [driversRes, constructorsRes] = await Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
    ]);

    const driversData = await driversRes.json();
    const constructorsData = await constructorsRes.json();

    return NextResponse.json({
      drivers: driversData.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings || [],
      constructors: constructorsData.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings || []
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
