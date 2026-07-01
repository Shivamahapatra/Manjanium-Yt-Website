import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driver1 = searchParams.get('d1');
    const driver2 = searchParams.get('d2');
    const year = searchParams.get('year');
    const round = searchParams.get('round');
    const sessionType = searchParams.get('session');
    
    let sessionKey = searchParams.get('session_key') || 'latest';
    
    // If year/round/session provided, resolve to session_key
    if (year && round && sessionType) {
      try {
        // Map session shorthand to OpenF1 session_type
        const sessionTypeMap: Record<string, string> = {
          'FP1': 'Practice 1', 'FP2': 'Practice 2', 'FP3': 'Practice 3',
          'Q': 'Qualifying', 'R': 'Race', 'S': 'Sprint',
          'SQ': 'Sprint Qualifying',
        };
        const mappedType = sessionTypeMap[sessionType] || sessionType;
        
        const sessRes = await fetch(
          `https://api.openf1.org/v1/sessions?year=${year}&session_type=${encodeURIComponent(mappedType)}`,
          { cache: 'no-store' }
        );
        const sessData = await sessRes.json();
        
        if (Array.isArray(sessData) && sessData.length > 0) {
          // Find session matching the round number
          const roundNum = parseInt(round);
          // Sessions don't have round numbers directly, so we pick by index or match by meeting_key
          const matchedSession = sessData[roundNum - 1] || sessData[sessData.length - 1];
          if (matchedSession?.session_key) {
            sessionKey = matchedSession.session_key.toString();
          }
        }
      } catch (e) {
        // Fall back to latest
        console.error('Session resolution failed:', e);
      }
    }

    const urls: Promise<Response>[] = [];
    if (driver1) urls.push(fetch(`https://api.openf1.org/v1/car_data?driver_number=${driver1}&session_key=${sessionKey}`, { cache: 'no-store' }));
    if (driver2) urls.push(fetch(`https://api.openf1.org/v1/car_data?driver_number=${driver2}&session_key=${sessionKey}`, { cache: 'no-store' }));

    // Also fetch drivers for color info
    const driversRes = await fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { cache: 'no-store' });
    const driversData = await driversRes.json();

    const responses = await Promise.all(urls);
    const data = await Promise.all(responses.map(res => res.json()));

    return NextResponse.json({
      telemetry: data,
      drivers: Array.isArray(driversData) ? driversData : [],
      sessionKey
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
