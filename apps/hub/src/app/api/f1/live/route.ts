import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('session_key') || 'latest';

    // 1. Fetch small data endpoints in parallel
    const [
      positionsRes,
      intervalsRes,
      stintsRes,
      pitRes,
      lapsRes,
      driversRes,
      sessionsRes
    ] = await Promise.all([
      fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { cache: 'no-store' }),
      fetch(`https://api.openf1.org/v1/sessions?session_key=${sessionKey}`, { cache: 'no-store' }),
    ]);

    const positions = await positionsRes.json().catch(() => []);
    const intervals = await intervalsRes.json().catch(() => []);
    const stints = await stintsRes.json().catch(() => []);
    const pits = await pitRes.json().catch(() => []);
    const laps = await lapsRes.json().catch(() => []);
    const drivers = await driversRes.json().catch(() => []);
    const sessions = await sessionsRes.json().catch(() => []);

    const session = Array.isArray(sessions) && sessions.length > 0 ? sessions[sessions.length - 1] : null;

    // 2. Fetch latest telemetry/car_data
    // Find the latest timestamp from positions or laps to get recent data
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
      // Get the last 15 seconds of car data to guarantee a data point for each driver
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

    // Process positions & intervals
    const latestPosMap = getLatestPerDriver(positions, 'date');
    const latestIntvMap = getLatestPerDriver(intervals, 'date');
    const latestCarMap = getLatestPerDriver(carData, 'date');

    // Calculate personal best and session best sector times
    // We group all laps by driver_number to find their best sectors, and find the overall bests
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

    // Get the latest lap per driver
    const latestLapMap = getLatestPerDriver(laps, 'date_start'); // lap start timestamp

    // To compare with previous lap for red/yellow sector tracking
    // We construct a Map of driver_number to their second latest lap
    const prevLapMap = new Map<number, any>();
    if (Array.isArray(laps)) {
      const sortedLaps = [...laps].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
      const driverLapsCount = new Map<number, number>();
      sortedLaps.forEach((lap) => {
        const dNum = Number(lap.driver_number);
        if (isNaN(dNum)) return;
        const currentCount = driverLapsCount.get(dNum) || 0;
        driverLapsCount.set(dNum, currentCount + 1);
      });

      const driverLapsTracker = new Map<number, number>();
      sortedLaps.forEach((lap) => {
        const dNum = Number(lap.driver_number);
        if (isNaN(dNum)) return;
        const index = driverLapsTracker.get(dNum) || 0;
        const totalLaps = driverLapsCount.get(dNum) || 0;
        // Second to last lap
        if (index === totalLaps - 2) {
          prevLapMap.set(dNum, lap);
        }
        driverLapsTracker.set(dNum, index + 1);
      });
    }

    // Process stints & pit stops
    const driverStintsMap = new Map<number, any[]>();
    if (Array.isArray(stints)) {
      stints.forEach((stint: any) => {
        const dNum = Number(stint.driver_number);
        if (isNaN(dNum)) return;
        if (!driverStintsMap.has(dNum)) {
          driverStintsMap.set(dNum, []);
        }
        driverStintsMap.get(dNum)!.push(stint);
      });
    }

    const driverPitsMap = new Map<number, any[]>();
    if (Array.isArray(pits)) {
      pits.forEach((pit: any) => {
        const dNum = Number(pit.driver_number);
        if (isNaN(dNum)) return;
        if (!driverPitsMap.has(dNum)) {
          driverPitsMap.set(dNum, []);
        }
        driverPitsMap.get(dNum)!.push(pit);
      });
    }

    // Assemble the unified driver list
    const unifiedDrivers = Array.isArray(drivers) ? drivers.map((driver: any) => {
      const dNum = Number(driver.driver_number);
      const pos = latestPosMap.get(dNum);
      const intv = latestIntvMap.get(dNum);
      const lastLap = latestLapMap.get(dNum);
      const prevLap = prevLapMap.get(dNum);
      const car = latestCarMap.get(dNum);
      const dstints = driverStintsMap.get(dNum) || [];
      const dpits = driverPitsMap.get(dNum) || [];

      // Sort stints by stint number
      dstints.sort((a: any, b: any) => Number(a.stint_number) - Number(b.stint_number));
      const latestStint = dstints[dstints.length - 1];

      // Personal Best sector times
      const pbSectors = personalBestSectors.get(dNum) || { s1: Infinity, s2: Infinity, s3: Infinity };

      // Find driver's best lap time
      let bestLapTime: any = null;
      if (Array.isArray(laps)) {
        const driverLaps = laps.filter((l: any) => l.driver_number === dNum && l.lap_duration != null);
        if (driverLaps.length > 0) {
          const sorted = driverLaps.sort((a: any, b: any) => Number(a.lap_duration) - Number(b.lap_duration));
          bestLapTime = sorted[0].lap_duration;
        }
      }

      // Determine sector colors and miniSectorColors
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

      // Tire Compound Map
      let tireCompound = 'H';
      if (latestStint?.compound) {
        const cStr = latestStint.compound.toUpperCase();
        if (cStr.includes('SOFT')) tireCompound = 'S';
        else if (cStr.includes('MEDIUM')) tireCompound = 'M';
        else if (cStr.includes('HARD')) tireCompound = 'H';
        else if (cStr.includes('INTER')) tireCompound = 'I';
        else if (cStr.includes('WET')) tireCompound = 'W';
      }

      // Tire Laps
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
        // In-car telemetry values
        throttle: car?.throttle || 0,
        brake: car?.brake || 0,
        gear: car?.gear || car?.n_gear || 0,
        rpm: car?.rpm || 0,
        drs: car?.drs || 0,
      };
    }) : [];

    // Sort by position ascending
    unifiedDrivers.sort((a: any, b: any) => a.position - b.position);

    return NextResponse.json({
      drivers: unifiedDrivers,
      session: session || null,
      positions: positions || [],
      intervals: intervals || [],
    });
  } catch (error) {
    console.error("Live API route error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
