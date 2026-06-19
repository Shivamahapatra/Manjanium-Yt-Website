import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || 'current';
    
    const calendarRes = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    const calendarData = await calendarRes.json();

    return NextResponse.json({
      calendar: calendarData.MRData?.RaceTable?.Races || []
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
