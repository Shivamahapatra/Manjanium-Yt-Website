import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
// Vercel Serverless Function Timeout is typically 10-15s on Hobby, up to 60s on Pro.
export const maxDuration = 10; 

const CACHE_KEY = 'f1_last_fetch_time';
const COOLDOWN_MS = 10000; // 10 seconds

// Helper to keep only the latest entry per driver_number
function getLatestPerDriver(data: any[], dateField: string = 'date'): Map<number, any> {
  const latestMap = new Map<number, any>();
  if (!Array.isArray(data)) return latestMap;

  data.forEach((item) => {
    const driverNum = Number(item.driver_number);
    if (isNaN(driverNum)) return;

    if (!latestMap.has(driverNum)) {
      latestMap.set(driverNum, item);
    } else {
      const existing = latestMap.get(driverNum);
      const existingTime = new Date(existing[dateField]).getTime();
      const newTime = new Date(item[dateField]).getTime();
      if (newTime > existingTime) {
        latestMap.set(driverNum, item);
      }
    }
  });

  return latestMap;
}

// Extract the heavy fetch logic into a standalone async function
async function fetchAndPushToSupabase(sessionKey: string) {
  try {
    const [
      positionsRes,
      intervalsRes,
      stintsRes,
      pitRes,
      lapsRes,
      driversRes,
      sessionsRes,
      weatherRes,
      raceControlRes,
      radioRes
    ] = await Promise.all([
      fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/sessions?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/team_radio?session_key=${sessionKey}`, { cache: 'no-store' })
    ]);

    const positions = await positionsRes.json().catch(() => []);
    const intervals = await intervalsRes.json().catch(() => []);
    const stints = await stintsRes.json().catch(() => []);
    const pits = await pitRes.json().catch(() => []);
    const laps = await lapsRes.json().catch(() => []);
    const drivers = await driversRes.json().catch(() => []);
    const sessions = await sessionsRes.json().catch(() => []);
    const weatherData = await weatherRes.json().catch(() => []);
    const raceControlMsgs = await raceControlRes.json().catch(() => []);
    const radioMsgs = await radioRes.json().catch(() => []);

    const session = Array.isArray(sessions) && sessions.length > 0 ? sessions[sessions.length - 1] : null;

    let latestTime = '';
    const posDates = Array.isArray(positions) 
      ? positions.map((p: any) => new Date(p.date).getTime()).filter((t: number) => !isNaN(t))
      : [];
    if (posDates.length > 0) {
      latestTime = new Date(Math.max(...posDates)).toISOString();
    } else {
      latestTime = new Date().toISOString();
    }

    let carData: any[] = [];
    if (latestTime) {
      const fifteenSecsAgo = new Date(new Date(latestTime).getTime() - 15000).toISOString();
      try {
        const carRes = await fetch(
          `https://api.openf1.org/v1/car_data?session_key=${sessionKey}&date>=${fifteenSecsAgo}`,
          { cache: 'no-store' }
        );
        carData = await carRes.json().catch(() => []);
      } catch (err) {
        console.error("Failed to fetch car_data", err);
      }
    }

    const latestPosMap = getLatestPerDriver(positions, 'date');
    const latestIntvMap = getLatestPerDriver(intervals, 'date');
    const latestCarMap = getLatestPerDriver(carData, 'date');

    const personalBestSectors = new Map<number, { s1: number; s2: number; s3: number }>();
    let overallBestS1 = Infinity;
    let overallBestS2 = Infinity;
    let overallBestS3 = Infinity;

    if (Array.isArray(laps)) {
      laps.forEach((lap: any) => {
        const dNum = Number(lap.driver_number);
        if (isNaN(dNum)) return;

        const s1 = Number(lap.duration_sector_1);
        const s2 = Number(lap.duration_sector_2);
        const s3 = Number(lap.duration_sector_3);

        if (!personalBestSectors.has(dNum)) {
          personalBestSectors.set(dNum, { s1: Infinity, s2: Infinity, s3: Infinity });
        }

        const pb = personalBestSectors.get(dNum)!;
        if (!isNaN(s1) && s1 > 0 && s1 < pb.s1) pb.s1 = s1;
        if (!isNaN(s2) && s2 > 0 && s2 < pb.s2) pb.s2 = s2;
        if (!isNaN(s3) && s3 > 0 && s3 < pb.s3) pb.s3 = s3;

        if (!isNaN(s1) && s1 > 0 && s1 < overallBestS1) overallBestS1 = s1;
        if (!isNaN(s2) && s2 > 0 && s2 < overallBestS2) overallBestS2 = s2;
        if (!isNaN(s3) && s3 > 0 && s3 < overallBestS3) overallBestS3 = s3;
      });
    }

    const latestLapMap = getLatestPerDriver(laps, 'date_start');
    const prevLapMap = new Map<number, any>();
    if (Array.isArray(laps)) {
      const sortedLaps = [...laps].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
      const driverLapsCount = new Map<number, number>();
      sortedLaps.forEach((lap) => {
        const dNum = Number(lap.driver_number);
        if (isNaN(dNum)) return;
        driverLapsCount.set(dNum, (driverLapsCount.get(dNum) || 0) + 1);
      });

      const driverLapsTracker = new Map<number, number>();
      sortedLaps.forEach((lap) => {
        const dNum = Number(lap.driver_number);
        if (isNaN(dNum)) return;
        const index = driverLapsTracker.get(dNum) || 0;
        const totalLaps = driverLapsCount.get(dNum) || 0;
        if (index === totalLaps - 2) {
          prevLapMap.set(dNum, lap);
        }
        driverLapsTracker.set(dNum, index + 1);
      });
    }

    const driverStintsMap = new Map<number, any[]>();
    if (Array.isArray(stints)) {
      stints.forEach((stint: any) => {
        const dNum = Number(stint.driver_number);
        if (isNaN(dNum)) return;
        if (!driverStintsMap.has(dNum)) driverStintsMap.set(dNum, []);
        driverStintsMap.get(dNum)!.push(stint);
      });
    }

    const driverPitsMap = new Map<number, any[]>();
    if (Array.isArray(pits)) {
      pits.forEach((pit: any) => {
        const dNum = Number(pit.driver_number);
        if (isNaN(dNum)) return;
        if (!driverPitsMap.has(dNum)) driverPitsMap.set(dNum, []);
        driverPitsMap.get(dNum)!.push(pit);
      });
    }

    const unifiedDrivers = Array.isArray(drivers) ? drivers.map((driver: any) => {
      const dNum = Number(driver.driver_number);
      const pos = latestPosMap.get(dNum);
      const intv = latestIntvMap.get(dNum);
      const lastLap = latestLapMap.get(dNum);
      const prevLap = prevLapMap.get(dNum);
      const car = latestCarMap.get(dNum);
      const dstints = driverStintsMap.get(dNum) || [];
      const dpits = driverPitsMap.get(dNum) || [];

      dstints.sort((a: any, b: any) => Number(a.stint_number) - Number(b.stint_number));
      const latestStint = dstints[dstints.length - 1];
      const pbSectors = personalBestSectors.get(dNum) || { s1: Infinity, s2: Infinity, s3: Infinity };

      let bestLapTime: any = null;
      if (Array.isArray(laps)) {
        const driverLaps = laps.filter((l: any) => l.driver_number === dNum && l.lap_duration != null);
        if (driverLaps.length > 0) {
          const sorted = driverLaps.sort((a: any, b: any) => Number(a.lap_duration) - Number(b.lap_duration));
          bestLapTime = sorted[0].lap_duration;
        }
      }

      const getSectorColor = (currVal: number | null, pbVal: number | null, overallBest: number | null, prevVal: number | null) => {
        if (currVal === null || currVal === undefined || isNaN(currVal)) return 'white';
        if (overallBest && currVal <= overallBest) return 'purple';
        if (pbVal && currVal <= pbVal) return 'green';
        if (prevVal && currVal > prevVal) return 'red';
        return 'yellow';
      };

      const s1Color = getSectorColor(lastLap?.duration_sector_1, pbSectors.s1, overallBestS1, prevLap?.duration_sector_1);
      const s2Color = getSectorColor(lastLap?.duration_sector_2, pbSectors.s2, overallBestS2, prevLap?.duration_sector_2);
      const s3Color = getSectorColor(lastLap?.duration_sector_3, pbSectors.s3, overallBestS3, prevLap?.duration_sector_3);

      const getMiniSectorColors = (color: string) => {
        if (color === 'purple') return ['purple', 'purple', 'purple', 'purple', 'purple'];
        if (color === 'green') return ['green', 'green', 'green', 'green', 'yellow'];
        if (color === 'red') return ['yellow', 'yellow', 'yellow', 'red', 'red'];
        if (color === 'white') return ['white', 'white', 'white', 'white', 'white'];
        return ['yellow', 'yellow', 'yellow', 'yellow', 'yellow'];
      };

      const miniSectorColors = [
        ...getMiniSectorColors(s1Color),
        ...getMiniSectorColors(s2Color),
        ...getMiniSectorColors(s3Color),
      ];

      let tireCompound = 'H';
      if (latestStint?.compound) {
        const cStr = latestStint.compound.toUpperCase();
        if (cStr.includes('SOFT')) tireCompound = 'S';
        else if (cStr.includes('MEDIUM')) tireCompound = 'M';
        else if (cStr.includes('HARD')) tireCompound = 'H';
        else if (cStr.includes('INTER')) tireCompound = 'I';
        else if (cStr.includes('WET')) tireCompound = 'W';
      }

      const currentLapNum = lastLap?.lap_number || 1;
      const stintStartLap = latestStint?.lap_start || 1;
      const stintAgeAtStart = latestStint?.tyre_age_at_start || 0;
      const tireLaps = stintAgeAtStart + Math.max(0, currentLapNum - stintStartLap);

      return {
        driverNumber: dNum,
        driver_number: dNum,
        nameAcronym: driver.name_acronym || '',
        name_acronym: driver.name_acronym || '',
        fullName: driver.full_name || '',
        full_name: driver.full_name || '',
        broadcast_name: driver.broadcast_name || driver.full_name || '',
        teamName: driver.team_name || '',
        team_name: driver.team_name || '',
        teamColor: driver.team_colour || '3b82f6',
        team_colour: driver.team_colour || '3b82f6',
        position: pos ? pos.position : 20,
        gapToLeader: intv ? intv.gap_to_leader : '-',
        interval: intv ? intv.interval : '-',
        lastLapTime: lastLap?.lap_duration || null,
        bestLapTime,
        s1Last: lastLap?.duration_sector_1 || null,
        s2Last: lastLap?.duration_sector_2 || null,
        s3Last: lastLap?.duration_sector_3 || null,
        s1Best: pbSectors.s1 !== Infinity ? pbSectors.s1 : null,
        s2Best: pbSectors.s2 !== Infinity ? pbSectors.s2 : null,
        s3Best: pbSectors.s3 !== Infinity ? pbSectors.s3 : null,
        s1IsBest: pbSectors.s1 !== Infinity && pbSectors.s1 <= overallBestS1,
        s2IsBest: pbSectors.s2 !== Infinity && pbSectors.s2 <= overallBestS2,
        s3IsBest: pbSectors.s3 !== Infinity && pbSectors.s3 <= overallBestS3,
        speed1: lastLap?.i1_speed || null,
        speed2: lastLap?.i2_speed || null,
        speed3: lastLap?.st_speed || null,
        tireCompound,
        tireLaps,
        pitCount: dpits.length,
        stints: dstints.map((st: any) => ({
          stintNumber: st.stint_number,
          compound: st.compound,
          lapStart: st.lap_start,
          lapEnd: st.lap_end || currentLapNum,
        })),
        miniSectorColors,
        throttle: car?.throttle || 0,
        brake: car?.brake || 0,
        gear: car?.gear || car?.n_gear || 0,
        rpm: car?.rpm || 0,
        drs: car?.drs || 0,
      };
    }) : [];

    unifiedDrivers.sort((a: any, b: any) => a.position - b.position);

    const payload = {
      drivers: unifiedDrivers,
      session: session || null,
      weatherData,
      raceControlMsgs,
      radioMsgs,
    };

    // Push to Supabase using service role for bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // We UPSERT into f1_live_timing
    const currentSessionKey = session?.session_key || sessionKey || 'latest';
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

    // We don't await this so the API responds instantly and the fetch happens in background
    // Note: Vercel standard Edge/Serverless might kill background tasks if not using `waitUntil`.
    // Next 14 handles promises cleanly if edge runtime is used, but for standard node, 
    // we just await it to be safe (max 10s). Let's await it.
    await fetchAndPushToSupabase(sessionKey);

    return NextResponse.json({ status: 'updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
