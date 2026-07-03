import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_KEY = 'f1_live_data';
const CACHE_TTL = 10; // seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';
    
    // Check KV cache first
    let cached = null;
    try {
      cached = await kv.get(CACHE_KEY);
    } catch {
      // KV not available (local dev) - skip cache
    }

    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=10',
        },
      });
    }

    // Proxy the FastF1 backend
    const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000';
    
    // If the frontend asks for specific year/round/session we pass it, otherwise let it use defaults
    // Since sessionKey might just be "latest", we just ping the backend's live-timing
    const res = await fetch(`${TELEMETRY_URL}/api/live-timing`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Telemetry API error: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.error && data.error.includes("Initializing")) {
      // It's still initializing, don't cache this
      return NextResponse.json(data, { status: 200 });
    }

    // At the END, before returning:
    try {
      await kv.set(CACHE_KEY, data, { ex: CACHE_TTL });
    } catch {
      // KV write failed - return result anyway
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=10',
      },
    });
  } catch (error) {
    console.error('F1 live error:', error);
    return NextResponse.json(
      {
        drivers: [],
        session: null,
        positions: {},
        intervals: {},
        error: 'F1 data temporarily unavailable',
      },
      { status: 200 }
    );
  }
}
