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

    // World Cup 2026 Standings (League ID = 1 for World Cup in API-Sports)
    const res = await fetch('https://v3.football.api-sports.io/standings?league=1&season=2026', {
      headers,
      next: { revalidate: 60 }
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { response: [], error: String(error) },
      { status: 500 }
    );
  }
}
