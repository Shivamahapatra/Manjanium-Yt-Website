import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.API_SPORTS_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API_SPORTS_KEY not set", response: [] },
        { status: 500 }
      );
    }

    const headers = {
      "x-apisports-key": apiKey
    };

    // Parallel fetch: Live globally, and Next 10 WC 2026 matches
    const [liveRes, upcomingRes] = await Promise.all([
      fetch('https://v3.football.api-sports.io/fixtures?live=all', {
        headers,
        cache: 'no-store'
      }),
      fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026&next=10', {
        headers,
        cache: 'no-store'
      })
    ]);

    const liveData = await liveRes.json();
    const upcomingData = await upcomingRes.json();

    const liveMatches = liveData.response || [];
    const upcomingMatches = upcomingData.response || [];

    // Deduplicate upcoming matches if they are already live
    const liveMatchIds = new Set(liveMatches.map((m: any) => m.fixture.id));
    const filteredUpcoming = upcomingMatches.filter((m: any) => !liveMatchIds.has(m.fixture.id));

    const merged = [...liveMatches, ...filteredUpcoming];

    return NextResponse.json({
      response: merged,
      debug: {
        liveCount: liveMatches.length,
        wcUpcomingCount: upcomingMatches.length,
        liveStatus: liveData.errors?.length ? 'error' : 'ok',
        wcStatus: upcomingData.errors?.length ? 'error' : 'ok'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { response: [], error: String(error) },
      { status: 500 }
    );
  }
}
