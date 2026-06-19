import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'current';
    const round = searchParams.get('round') || 'last';
    
    const [raceRes, qualiRes] = await Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`),
      fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/qualifying.json`)
    ]);

    const raceData = await raceRes.json();
    const qualiData = await qualiRes.json();

    return NextResponse.json({
      race: raceData.MRData?.RaceTable?.Races[0] || null,
      qualifying: qualiData.MRData?.RaceTable?.Races[0] || null
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
