import asyncio
import fastf1
import pandas as pd
from typing import Optional, Tuple
from datetime import datetime, timezone, timedelta
import math

GLOBAL_LIVE_TIMING = {}
CURRENT_TRACKING: Optional[Tuple[int, int, str]] = None

def parse_lap_time_to_seconds(time_val) -> float | None:
    if time_val is None:
        return None
    try:
        if pd.isna(time_val):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(time_val, (int, float)):
        if math.isnan(time_val):
            return None
        return float(time_val)
    if hasattr(time_val, 'total_seconds'):
        secs = time_val.total_seconds()
        return None if math.isnan(secs) else round(secs, 3)
    if isinstance(time_val, str):
        time_val = time_val.strip()
        if not time_val or time_val == '-' or time_val == 'nan':
            return None
        if 'days' in time_val:
            parts = time_val.split(' days ')
            time_val = parts[-1].strip()
        try:
            parts = time_val.split(':')
            if len(parts) == 3:
                h = int(parts[0])
                m = int(parts[1])
                s = float(parts[2])
                total = h * 3600 + m * 60 + s
                return round(total, 3)
        except (ValueError, IndexError):
            pass
    return None

def is_session_live_or_recent(session_date_str: str) -> bool:
    if not session_date_str:
        return False
    try:
        if isinstance(session_date_str, str):
            session_date_str = session_date_str.replace("Z", "+00:00")
            session_dt = datetime.fromisoformat(session_date_str)
        else:
            session_dt = session_date_str
        if session_dt.tzinfo is None:
            session_dt = session_dt.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        diff = now - session_dt
        return diff.total_seconds() < 6 * 3600
    except Exception:
        return False

async def live_timing_loop():
    global GLOBAL_LIVE_TIMING, CURRENT_TRACKING
    while True:
        try:
            if CURRENT_TRACKING:
                year, round, session = CURRENT_TRACKING
                print(f"Fetching live timing for {year} Round {round} Session {session}")
                f1_session = fastf1.get_session(year, round, session)
                f1_session.load(telemetry=False, weather=False, messages=False)
                
                session_date = str(f1_session.date) if hasattr(f1_session, 'date') else ""
                is_current = is_session_live_or_recent(session_date)
                
                if not is_current:
                    GLOBAL_LIVE_TIMING = {
                        "session": {
                            "session_key": None,
                            "session_name": "No Active Session",
                            "session_type": None,
                            "is_live": False,
                            "date": session_date,
                        },
                        "drivers": [],
                        "weatherData": None,
                        "raceControlMsgs": [],
                        "radioMsgs": [],
                        "stale": True,
                        "next_session": "Check F1 calendar for next event",
                    }
                    await asyncio.sleep(15)
                    continue

                results = f1_session.results
                laps = f1_session.laps
                
                # Calculate overall best sectors
                overallBestS1 = laps["Sector1Time"].min().total_seconds() if not laps["Sector1Time"].isnull().all() else float('inf')
                overallBestS2 = laps["Sector2Time"].min().total_seconds() if not laps["Sector2Time"].isnull().all() else float('inf')
                overallBestS3 = laps["Sector3Time"].min().total_seconds() if not laps["Sector3Time"].isnull().all() else float('inf')
                
                unifiedDrivers = []
                for idx, driver in results.iterrows():
                    try:
                        dNum = int(driver["DriverNumber"])
                        d_laps = laps.pick_driver(str(dNum)) if not laps.empty else pd.DataFrame()
                        
                        bestLapTime = None
                        lastLapTimeStr = None
                        s1Last, s2Last, s3Last = None, None, None
                        s1Best, s2Best, s3Best = None, None, None
                        s1IsBest, s2IsBest, s3IsBest = False, False, False
                        tireCompound = "UNKNOWN"
                        tireLaps = 0
                        pitCount = 0
                        stints = []

                        if not d_laps.empty:
                            bestLap = d_laps.pick_fastest()
                            if not bestLap.empty and pd.notna(bestLap.get("LapTime")):
                                bestLapTime = bestLap["LapTime"]
                            
                            # Find last lap
                            valid_laps = d_laps.dropna(subset=["LapTime"])
                            if not valid_laps.empty:
                                lastLap = valid_laps.iloc[-1]
                                lastLapTimeStr = lastLap["LapTime"]
                                
                                s1Last = lastLap["Sector1Time"]
                                s2Last = lastLap["Sector2Time"]
                                s3Last = lastLap["Sector3Time"]
                                
                            s1Best = d_laps["Sector1Time"].min().total_seconds() if not d_laps["Sector1Time"].isnull().all() else None
                            s2Best = d_laps["Sector2Time"].min().total_seconds() if not d_laps["Sector2Time"].isnull().all() else None
                            s3Best = d_laps["Sector3Time"].min().total_seconds() if not d_laps["Sector3Time"].isnull().all() else None
                            
                            if s1Best and s1Best <= overallBestS1: s1IsBest = True
                            if s2Best and s2Best <= overallBestS2: s2IsBest = True
                            if s3Best and s3Best <= overallBestS3: s3IsBest = True
                            
                            latest_lap = d_laps.iloc[-1]
                            tireCompound = str(latest_lap["Compound"]) if pd.notna(latest_lap["Compound"]) else "UNKNOWN"
                            tireLaps = int(latest_lap["TyreLife"]) if pd.notna(latest_lap["TyreLife"]) else 0
                            
                            if "Stint" in d_laps.columns:
                                pitCount = max(0, len(d_laps["Stint"].dropna().unique()) - 1)
                                for stint_num in d_laps["Stint"].dropna().unique():
                                    stint_laps = d_laps[d_laps["Stint"] == stint_num]
                                    if not stint_laps.empty:
                                        stints.append({
                                            "stintNumber": int(stint_num),
                                            "compound": str(stint_laps.iloc[0]["Compound"]),
                                            "lapStart": int(stint_laps.iloc[0]["LapNumber"]),
                                            "lapEnd": int(stint_laps.iloc[-1]["LapNumber"])
                                        })

                        tc = "H"
                        cStr = tireCompound.upper()
                        if "SOFT" in cStr: tc = "S"
                        elif "MEDIUM" in cStr: tc = "M"
                        elif "HARD" in cStr: tc = "H"
                        elif "INTER" in cStr: tc = "I"
                        elif "WET" in cStr: tc = "W"

                        unifiedDrivers.append({
                            "position": int(driver["Position"]) if pd.notna(driver["Position"]) else 20,
                            "driverNumber": dNum,
                            "nameAcronym": str(driver["Abbreviation"]),
                            "fullName": str(driver["FullName"]),
                            "teamName": str(driver["TeamName"]),
                            "teamColor": str(driver["TeamColor"]),
                            "gapToLeader": str(driver["Time"]).split(" ")[-1] if pd.notna(driver["Time"]) else "-",
                            "interval": "-", 
                            "lastLapTime": parse_lap_time_to_seconds(lastLapTimeStr),
                            "bestLapTime": parse_lap_time_to_seconds(bestLapTime),
                            "s1Last": parse_lap_time_to_seconds(s1Last),
                            "s2Last": parse_lap_time_to_seconds(s2Last),
                            "s3Last": parse_lap_time_to_seconds(s3Last),
                            "s1Best": s1Best,
                            "s2Best": s2Best,
                            "s3Best": s3Best,
                            "s1IsBest": s1IsBest,
                            "s2IsBest": s2IsBest,
                            "s3IsBest": s3IsBest,
                            "tireCompound": tc,
                            "tireLaps": tireLaps,
                            "pitCount": pitCount,
                            "stints": stints,
                            "miniSectorColors": ["white"]*15,
                            "throttle": 0,
                            "brake": 0,
                            "gear": 0,
                            "rpm": 0,
                            "drs": 0,
                        })
                    except Exception as e:
                        print(f"Error processing driver {driver.get('Abbreviation', 'Unknown')}: {e}")
                
                unifiedDrivers.sort(key=lambda x: x["position"])
                GLOBAL_LIVE_TIMING = {
                    "drivers": unifiedDrivers,
                    "session": {"session_key": f"{year}_{round}_{session}"},
                    "positions": [],
                    "intervals": [],
                }
                
        except Exception as e:
            print(f"Background live timing error: {e}")
            
        await asyncio.sleep(15)

def get_live_timing(year: int, round: int, session: str):
    global CURRENT_TRACKING
    CURRENT_TRACKING = (year, round, session)
    
    if not GLOBAL_LIVE_TIMING:
        return {
            "drivers": [],
            "session": None,
            "error": "Initializing live timing data... (This may take up to 30 seconds)"
        }
    return GLOBAL_LIVE_TIMING
