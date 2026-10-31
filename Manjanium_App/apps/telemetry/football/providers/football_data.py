"""football-data.org Provider Adapter.
Primary source for fixtures, live/delayed match scores, league standings, and scorers.
All scores return with optional 'delayed': True flag indicating latency on free tier.
"""
import os
from typing import Any, Dict, List, Optional
import httpx
from football.cache import cache
from football.quota import quota_guard
from football.ids import LEAGUE_MAP

FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4"


class FootballDataAdapter:
    def __init__(self):
        self.api_key = os.getenv("FOOTBALL_DATA_ORG_KEY", os.getenv("FOOTBALL_DATA_KEY", ""))

    def _headers(self) -> dict:
        return {"X-Auth-Token": self.api_key} if self.api_key else {}

    async def get_matches_for_date(self, date_str: str) -> List[Dict[str, Any]]:
        """Fetch matches across all competitions for a specific date (YYYY-MM-DD)."""
        cache_key = f"fd_matches_{date_str}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        if not self.api_key or not quota_guard.can_request("football_data"):
            stale = cache.get_stale(cache_key)
            return stale if stale is not None else []

        quota_guard.record_request("football_data")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(
                    f"{FOOTBALL_DATA_BASE_URL}/matches",
                    params={"dateFrom": date_str, "dateTo": date_str},
                    headers=self._headers(),
                )
                if resp.status_code == 200:
                    raw_matches = resp.json().get("matches", [])
                    leagues_map: Dict[str, Dict[str, Any]] = {}
                    
                    for m in raw_matches:
                        comp = m.get("competition", {})
                        code = comp.get("code")
                        # Filter to supported competitions if available
                        comp_info = LEAGUE_MAP.get(code, {})
                        league_id = comp_info.get("api_football_id", str(comp.get("id")))
                        league_name = comp_info.get("name", comp.get("name", "Unknown League"))
                        
                        if league_name not in leagues_map:
                            leagues_map[league_name] = {
                                "league_id": league_id,
                                "league_name": league_name,
                                "country": comp.get("code") or comp_info.get("country", ""),
                                "logo": comp_info.get("logo", comp.get("emblem", "")),
                                "matches": [],
                            }
                            
                        st = m.get("status")
                        is_live = st in ["IN_PLAY", "PAUSED", "LIVE"]
                        is_finished = st in ["FINISHED", "AWARDED"]
                        sc = m.get("score", {}).get("fullTime", {})
                        
                        leagues_map[league_name]["matches"].append({
                            "match_id": str(m.get("id")),
                            "home_team": m.get("homeTeam", {}).get("name", "Home"),
                            "home_team_id": str(m.get("homeTeam", {}).get("id", "")),
                            "home_flag": m.get("homeTeam", {}).get("crest", ""),
                            "home_score": sc.get("home"),
                            "away_team": m.get("awayTeam", {}).get("name", "Away"),
                            "away_team_id": str(m.get("awayTeam", {}).get("id", "")),
                            "away_flag": m.get("awayTeam", {}).get("crest", ""),
                            "away_score": sc.get("away"),
                            "status": "FT" if is_finished else ("LIVE" if is_live else st),
                            "minute": "FT" if is_finished else ("LIVE" if is_live else ""),
                            "live": is_live,
                            "finished": is_finished,
                            "started": is_live or is_finished,
                            "kickoff": m.get("utcDate"),
                            "league_name": league_name,
                            "delayed": True,  # Tagged per requirement
                        })
                    
                    result = list(leagues_map.values())
                    cache.live_fixtures[cache_key] = result
                    cache.stale_store[cache_key] = result
                    return result
        except Exception as e:
            print(f"[FootballData] Error fetching matches: {e}")

        return cache.get_stale(cache_key) or []

    async def get_standings(self, comp_code: str) -> Optional[Dict[str, Any]]:
        """Fetch league standings table."""
        code = comp_code.upper()
        cache_key = f"fd_standings_{code}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        if not self.api_key or not quota_guard.can_request("football_data"):
            return cache.get_stale(cache_key)

        quota_guard.record_request("football_data")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(
                    f"{FOOTBALL_DATA_BASE_URL}/competitions/{code}/standings",
                    headers=self._headers(),
                )
                if resp.status_code == 200:
                    raw_data = resp.json()
                    tables = raw_data.get("standings", [])
                    total_table = []
                    for tbl in tables:
                        if tbl.get("type") == "TOTAL":
                            for row in tbl.get("table", []):
                                team = row.get("team", {})
                                total_table.append({
                                    "position": row.get("position"),
                                    "team_id": team.get("id"),
                                    "name": team.get("name"),
                                    "short_name": team.get("shortName"),
                                    "crest": team.get("crest"),
                                    "played": row.get("playedGames"),
                                    "won": row.get("won"),
                                    "draw": row.get("draw"),
                                    "lost": row.get("lost"),
                                    "points": row.get("points"),
                                    "goals_for": row.get("goalsFor"),
                                    "goals_against": row.get("goalsAgainst"),
                                    "goal_difference": row.get("goalDifference"),
                                    "form": row.get("form"),
                                })
                            break

                    result = {
                        "competition": raw_data.get("competition", {}).get("name", code),
                        "code": code,
                        "season": raw_data.get("season", {}).get("startDate", "")[:4],
                        "table": total_table,
                    }
                    cache.standings[cache_key] = result
                    cache.stale_store[cache_key] = result
                    return result
        except Exception as e:
            print(f"[FootballData] Error fetching standings: {e}")

        return cache.get_stale(cache_key)


football_data_adapter = FootballDataAdapter()
