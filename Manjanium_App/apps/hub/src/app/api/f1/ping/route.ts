import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; 

const CACHE_KEY = 'f1_last_fetch_time';
const COOLDOWN_MS = 10000; // 10 seconds

async function fetchAndPushToSupabase(sessionKey: string) {
  try {
    const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000';
    const res = await fetch(`${TELEMETRY_URL}/api/live-timing`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Telemetry API error: ${res.status}`);
    }

    const payload = await res.json();
    
    if (payload.error && payload.error.includes("Initializing")) {
      console.log("Telemetry API is still initializing...");
      return;
    }

    // Push to Supabase using service role for bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // We UPSERT into f1_live_timing
    const currentSessionKey = payload.session?.session_key || sessionKey || 'latest';
    const { error } = await supabase
      .from('f1_live_timing')
      .upsert({
        session_key: String(currentSessionKey),
        payload: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_key' });

    if (error) {
      console.error('Supabase UPSERT Error:', error);
    }
  } catch (error) {
    console.error('f1 background sync error:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';

    let lastFetch = 0;
    try {
      lastFetch = (await kv.get<number>(CACHE_KEY)) || 0;
    } catch {
      // KV unavailable - just proceed
    }

    const now = Date.now();
    if (now - lastFetch < COOLDOWN_MS) {
      return NextResponse.json({ status: 'cooldown' }, { status: 200 });
    }

    // Immediately set the timestamp to lock other pings out
    try {
      await kv.set(CACHE_KEY, now, { ex: 20 });
    } catch {
      // ignore
    }

    await fetchAndPushToSupabase(sessionKey);

    return NextResponse.json({ status: 'updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
