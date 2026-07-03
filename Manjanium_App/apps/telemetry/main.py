import os
import tempfile
from pathlib import Path
from typing import Optional

import fastf1
import numpy as np
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Configure FastF1 cache
# Use /tmp for ephemeral caching (acceptable cold start penalty)
CACHE_DIR = Path(os.getenv("FASTF1_CACHE_DIR", tempfile.gettempdir())) / "fastf1_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

app = FastAPI(
    title="Manjanium Telemetry API",
    description="FastF1 powered F1 telemetry backend",
    version="1.0.0",
)

# Allow requests from Next.js hub
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://manjanium-yt-website.vercel.app",
        os.getenv("HUB_URL", "*"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "cache_dir": str(CACHE_DIR)}


@app.get("/api/compare-laps")
async def compare_laps(
    year: int = Query(..., description="Season year e.g. 2024"),
    round: int = Query(..., description="Round number e.g. 1"),
    session: str = Query(default="Q", description="Session type: Q, R, FP1, FP2, FP3, S"),
    driver1: str = Query(..., description="Driver code e.g. VER"),
    driver2: str = Query(..., description="Driver code e.g. HAM"),
    lap: Optional[str] = Query(default="fastest", description="Lap: 'fastest' or lap number"),
):
    """
    Compare two drivers' laps with distance-synchronized telemetry.
    Returns perfectly interpolated telemetry points for charting.
    """
    try:
        # Load session (cached after first load)
        f1_session = fastf1.get_session(year, round, session)
        f1_session.load(
            telemetry=True,
            weather=False,
            messages=False,
            laps=True,
        )

        # Get lap data for each driver
        def get_lap(driver: str):
            if lap == "fastest":
                return f1_session.laps.pick_driver(driver).pick_fastest()
            else:
                lap_num = int(lap)
                driver_laps = f1_session.laps.pick_driver(driver)
                return driver_laps[driver_laps["LapNumber"] == lap_num].iloc[0]

        lap1 = get_lap(driver1)
        lap2 = get_lap(driver2)

        # Get telemetry (adds Distance column automatically)
        tel1 = lap1.get_telemetry().add_distance()
        tel2 = lap2.get_telemetry().add_distance()

        # Define distance grid for interpolation
        # Use the shorter of the two laps to avoid extrapolation
        max_dist = min(tel1["Distance"].max(), tel2["Distance"].max())
        distance_grid = np.linspace(0, max_dist, 500)

        def interpolate_channel(tel: pd.DataFrame, channel: str) -> list:
            """Interpolate a telemetry channel onto the distance grid."""
            try:
                values = np.interp(
                    distance_grid,
                    tel["Distance"].values,
                    tel[channel].values,
                )
                return [round(float(v), 3) for v in values]
            except Exception:
                return [0.0] * len(distance_grid)

        # Interpolate both drivers' telemetry onto same distance grid
        speed1 = interpolate_channel(tel1, "Speed")
        speed2 = interpolate_channel(tel2, "Speed")
        throttle1 = interpolate_channel(tel1, "Throttle")
        throttle2 = interpolate_channel(tel2, "Throttle")
        brake1 = [int(b) for b in interpolate_channel(tel1, "Brake")]
        brake2 = [int(b) for b in interpolate_channel(tel2, "Brake")]
        gear1 = [int(g) for g in interpolate_channel(tel1, "nGear")]
        gear2 = [int(g) for g in interpolate_channel(tel2, "nGear")]
        rpm1 = interpolate_channel(tel1, "RPM")
        rpm2 = interpolate_channel(tel2, "RPM")

        # Calculate time delta
        # Convert speed (km/h) to time per distance increment
        dist_step = distance_grid[1] - distance_grid[0]  # meters per step

        def speed_to_time(speed_list: list) -> list:
            """Cumulative time from speed at each distance point."""
            times = [0.0]
            for i in range(1, len(speed_list)):
                spd = max(speed_list[i], 1)  # avoid division by zero
                dt = (dist_step / 1000) / (spd / 3600)  # hours → seconds
                times.append(times[-1] + dt)
            return times

        time1 = speed_to_time(speed1)
        time2 = speed_to_time(speed2)

        # Delta: positive = driver1 is ahead, negative = driver2 is ahead
        delta = [round(t1 - t2, 4) for t1, t2 in zip(time1, time2)]

        # Build response
        points = []
        for i, dist in enumerate(distance_grid):
            points.append({
                "distance": round(float(dist), 1),
                "driver1": {
                    "speed": speed1[i],
                    "throttle": throttle1[i],
                    "brake": brake1[i],
                    "gear": gear1[i],
                    "rpm": rpm1[i],
                },
                "driver2": {
                    "speed": speed2[i],
                    "throttle": throttle2[i],
                    "brake": brake2[i],
                    "gear": gear2[i],
                    "rpm": rpm2[i],
                },
                "delta": delta[i],
            })

        # Lap time info
        lap1_time = str(lap1["LapTime"]) if pd.notna(lap1["LapTime"]) else "N/A"
        lap2_time = str(lap2["LapTime"]) if pd.notna(lap2["LapTime"]) else "N/A"

        return {
            "metadata": {
                "year": year,
                "round": round,
                "session": session,
                "driver1": {
                    "code": driver1,
                    "lap_time": lap1_time,
                    "lap_number": int(lap1["LapNumber"]) if pd.notna(lap1["LapNumber"]) else 0,
                    "compound": str(lap1["Compound"]) if pd.notna(lap1["Compound"]) else "UNKNOWN",
                },
                "driver2": {
                    "code": driver2,
                    "lap_time": lap2_time,
                    "lap_number": int(lap2["LapNumber"]) if pd.notna(lap2["LapNumber"]) else 0,
                    "compound": str(lap2["Compound"]) if pd.notna(lap2["Compound"]) else "UNKNOWN",
                },
                "track_length_m": round(float(max_dist), 1),
                "sample_points": len(points),
            },
            "telemetry": points,
        }

    except IndexError:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for {driver1} or {driver2} in {year} Round {round} {session}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"FastF1 error: {str(e)}",
        )


@app.get("/api/available-sessions")
async def available_sessions(year: int = Query(default=2024)):
    """Get list of available sessions for a year."""
    try:
        schedule = fastf1.get_event_schedule(year)
        events = []
        for _, row in schedule.iterrows():
            events.append({
                "round": int(row["RoundNumber"]),
                "name": str(row["EventName"]),
                "location": str(row["Location"]),
                "country": str(row["Country"]),
                "date": str(row["EventDate"]),
                "format": str(row["EventFormat"]),
            })
        return {"year": year, "events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/session-drivers")
async def session_drivers(
    year: int = Query(...),
    round: int = Query(...),
    session: str = Query(default="Q"),
):
    """Get list of drivers in a session."""
    try:
        f1_session = fastf1.get_session(year, round, session)
        f1_session.load(telemetry=False, weather=False, messages=False, laps=True)

        drivers = []
        for driver in f1_session.drivers:
            info = f1_session.get_driver(driver)
            drivers.append({
                "code": str(info["Abbreviation"]),
                "full_name": str(info["FullName"]),
                "team": str(info["TeamName"]),
                "number": str(info["DriverNumber"]),
            })
        return {"drivers": drivers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
