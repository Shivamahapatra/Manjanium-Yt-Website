import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';
    
    const [positionsRes, intervalsRes, driversRes, sessionsRes] = await Promise.all([
      fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/sessions?session_key=${sessionKey}`, { cache: 'no-store' })
    ]);

    const positions = await positionsRes.json();
    const intervals = await intervalsRes.json();
    const drivers = await driversRes.json();
    const sessions = await sessionsRes.json();
    
    const session = Array.isArray(sessions) ? sessions[sessions.length - 1] : sessions;

    return NextResponse.json({
      positions,
      intervals,
      drivers,
      session: session || null
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
