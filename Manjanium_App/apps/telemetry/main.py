import os
import tempfile
from pathlib import Path
from typing import Optional
from datetime import datetime, date

import httpx
import fastf1
import numpy as np
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from live import live_timing_loop, get_live_timing
import asyncio

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

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(live_timing_loop())

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

@app.get("/api/live-timing")
async def api_live_timing(
    year: int = Query(default=2024),
    round: int = Query(default=12),
    session: str = Query(default="R"),
):
    """Get real-time live timing data powered by FastF1 background loop."""
    return get_live_timing(year, round, session)


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

FOTMOB_BASE = "https://www.fotmob.com/api"

# Shared headers to avoid rate limiting
FOTMOB_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.fotmob.com/",
    "Origin": "https://www.fotmob.com",
}

@app.get("/api/football/matches")
async def get_matches_by_date(date_str: str = Query(default=None)):
    """Get all football matches for a date (YYYYMMDD format)."""
    if not date_str:
        date_str = datetime.now().strftime("%Y%m%d")
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{FOTMOB_BASE}/matches",
                params={"date": date_str},
                headers=FOTMOB_HEADERS,
            )
            response.raise_for_status()
            data = response.json()
        
        # Parse and normalize the response
        leagues = []
        for league in data.get("leagues", []):
            matches = []
            for match in league.get("matches", []):
                home = match.get("home", {})
                away = match.get("away", {})
                status = match.get("status", {})
                matches.append({
                    "match_id": str(match.get("id")),
                    "home_team": home.get("name"),
                    "home_team_id": str(home.get("id")),
                    "home_score": home.get("score"),
                    "away_team": away.get("name"),
                    "away_team_id": str(away.get("id")),
                    "away_score": away.get("score"),
                    "status": status.get("scoreStr", "--"),
                    "started": status.get("started", False),
                    "finished": status.get("finished", False),
                    "live": status.get("started") and not status.get("finished"),
                    "kickoff": match.get("status", {}).get("utcTime"),
                    "minute": status.get("liveTime", {}).get("short"),
                })
            if matches:
                leagues.append({
                    "league_id": str(league.get("id")),
                    "league_name": league.get("name"),
                    "country": league.get("ccode"),
                    "matches": matches,
                })
        
        return {
            "date": date_str,
            "total_matches": sum(len(l["matches"]) for l in leagues),
            "leagues": leagues,
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"FotMob error: {str(e)}")


@app.get("/api/football/match/{match_id}")
async def get_match_details(match_id: str):
    """Get full match details including xG, shots, lineups, player stats."""
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{FOTMOB_BASE}/matchDetails",
                params={"matchId": match_id},
                headers=FOTMOB_HEADERS,
            )
            response.raise_for_status()
            data = response.json()
        
        general = data.get("general", {})
        header = data.get("header", {})
        content = data.get("content", {})
        
        # Parse stats
        stats_raw = content.get("stats", {}).get("stats", [])
        stats_parsed = {}
        for stat_group in stats_raw:
            title = stat_group.get("title", "").lower().replace(" ", "_")
            stats_parsed[title] = stat_group.get("stats", [])
        
        # Parse shotmap
        shotmap = content.get("shotmap", {}).get("shots", [])
        shots_parsed = []
        for shot in shotmap:
            shots_parsed.append({
                "player": shot.get("playerName"),
                "team_id": str(shot.get("teamId")),
                "minute": shot.get("min"),
                "type": shot.get("situation"),
                "result": shot.get("shotType"),
                "xg": shot.get("expectedGoals"),
                "x": shot.get("x"),      # shot map coordinates
                "y": shot.get("y"),
            })
        
        # Parse lineups
        lineup = content.get("lineup", {})
        
        # Parse player ratings
        player_stats = content.get("playerStats", {})
        
        # Parse events timeline
        events = content.get("matchFacts", {}).get("events", {}).get("events", [])
        timeline = []
        for event in events:
            if event.get("type") in ["Goal", "Card", "SubstitutionIn", "YellowCard", "RedCard"]:
                timeline.append({
                    "type": event.get("type"),
                    "minute": event.get("time"),
                    "player": event.get("player", {}).get("name") if isinstance(event.get("player"), dict) else event.get("player"),
                    "team": event.get("teamId"),
                })
        
        # Parse momentum
        momentum = content.get("momentum", {}).get("main", {}).get("data", [])
        
        return {
            "match_id": match_id,
            "general": {
                "home_team": general.get("homeTeam", {}),
                "away_team": general.get("awayTeam", {}),
                "league": general.get("leagueName"),
                "round": general.get("leagueRoundName"),
                "season": general.get("parentLeagueSeason"),
                "venue": general.get("venue"),
                "referee": general.get("referee"),
            },
            "score": {
                "home": header.get("teams", [{}])[0].get("score"),
                "away": header.get("teams", [{}])[1].get("score") if len(header.get("teams", [])) > 1 else None,
                "status": header.get("status", {}).get("scoreStr"),
                "finished": header.get("status", {}).get("finished"),
            },
            "stats": stats_parsed,
            "shotmap": shots_parsed,
            "lineup": lineup,
            "player_stats": player_stats,
            "timeline": timeline,
            "momentum": momentum,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/football/league/{league_id}")
async def get_league_standings(
    league_id: str,
    season: str = Query(default=None),
):
    """Get league standings table with xG."""
    try:
        params = {"id": league_id}
        if season:
            params["season"] = season
        
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{FOTMOB_BASE}/leagues",
                params=params,
                headers=FOTMOB_HEADERS,
            )
            response.raise_for_status()
            data = response.json()
        
        # Extract standings
        table_data = data.get("table", [{}])[0]
        standings = []
        for team in table_data.get("data", {}).get("table", {}).get("all", []):
            standings.append({
                "position": team.get("idx"),
                "team": team.get("name"),
                "team_id": str(team.get("id")),
                "played": team.get("played"),
                "wins": team.get("wins"),
                "draws": team.get("draws"),
                "losses": team.get("losses"),
                "goals_for": team.get("scoresStr", "0-0").split("-")[0] if "-" in str(team.get("scoresStr","")) else 0,
                "goals_against": team.get("scoresStr", "0-0").split("-")[1] if "-" in str(team.get("scoresStr","")) else 0,
                "goal_diff": team.get("goalConDiff"),
                "points": team.get("pts"),
                "form": team.get("qualColor"),
                "xg_for": team.get("xgData", {}).get("xg"),
                "xg_against": team.get("xgData", {}).get("xgAgainst"),
            })
        
        return {
            "league_id": league_id,
            "league_name": data.get("details", {}).get("name"),
            "season": data.get("details", {}).get("selectedSeason"),
            "available_seasons": data.get("details", {}).get("allAvailableSeasons", []),
            "standings": standings,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/football/team/{team_id}")
async def get_team_details(team_id: str):
    """Get team info, squad, form, and recent fixtures."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{FOTMOB_BASE}/teams",
                params={"id": team_id},
                headers=FOTMOB_HEADERS,
            )
            response.raise_for_status()
            data = response.json()
        
        details = data.get("details", {})
        squad = data.get("squad", [])
        fixtures = data.get("fixtures", {})
        
        return {
            "team_id": team_id,
            "name": details.get("name"),
            "country": details.get("country"),
            "stadium": details.get("stadium", {}).get("name"),
            "stadium_capacity": details.get("stadium", {}).get("capacity"),
            "league_position": details.get("tableData", {}).get("idx"),
            "league": details.get("shortName"),
            "form": details.get("form", []),
            "squad": squad,
            "upcoming_fixtures": fixtures.get("upcoming", [])[:5],
            "recent_results": fixtures.get("previousMatches", [])[:5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/football/search")
async def search_football(term: str = Query(...)):
    """Search for teams, players, leagues."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{FOTMOB_BASE}/searchapi/",
                params={"term": term, "lang": "en"},
                headers=FOTMOB_HEADERS,
            )
            response.raise_for_status()
            data = response.json()
        
        return {
            "term": term,
            "teams": data.get("squadMemberTeamItems", [])[:5],
            "players": data.get("squadMemberItems", [])[:5],
            "leagues": data.get("tournaments", [])[:5],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
