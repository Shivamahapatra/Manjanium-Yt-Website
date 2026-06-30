import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';
    
    const controlRes = await fetch(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`, { cache: 'no-store' });
    const controlData = await controlRes.json();

    return NextResponse.json({
      racecontrol: controlData
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
