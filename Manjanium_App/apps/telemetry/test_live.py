import os
import tempfile
from pathlib import Path
import fastf1
import pandas as pd

CACHE_DIR = Path(os.getenv("FASTF1_CACHE_DIR", tempfile.gettempdir())) / "fastf1_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

year = 2024
round = 12
session = "R"

try:
    print(f"Fetching live timing for {year} Round {round} Session {session}")
    f1_session = fastf1.get_session(year, round, session)
    f1_session.load(telemetry=False, weather=False, messages=False)
    
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
                    bestLapTime = str(bestLap["LapTime"])
                
                valid_laps = d_laps.dropna(subset=["LapTime"])
                if not valid_laps.empty:
                    lastLap = valid_laps.iloc[-1]
                    lastLapTimeStr = str(lastLap["LapTime"])
                    
                    s1Last = lastLap["Sector1Time"].total_seconds() if pd.notna(lastLap["Sector1Time"]) else None
                    s2Last = lastLap["Sector2Time"].total_seconds() if pd.notna(lastLap["Sector2Time"]) else None
                    s3Last = lastLap["Sector3Time"].total_seconds() if pd.notna(lastLap["Sector3Time"]) else None
                    
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
                            
            print(f"OK: {driver['Abbreviation']}")
        except Exception as e:
            print(f"Error processing driver {driver.get('Abbreviation', 'Unknown')}: {type(e).__name__} - {e}")
            import traceback
            traceback.print_exc()

except Exception as e:
    print(f"Background live timing error: {type(e).__name__} - {e}")
    import traceback
    traceback.print_exc()
