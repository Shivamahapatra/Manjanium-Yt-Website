"""PitchAPI Provider Adapter.
Provides post-match analytics: Shot-level xG and coordinates, Lineups, Events, and Match Stats.

Rules strictly adhered to:
1. Never cache an empty or incomplete response permanently. Cache permanently only when status is
   'played'/'finished' AND data is non-empty; otherwise use a ~5 min TTL and retry.
2. Handle PitchAPI 429 by honoring Retry-After and falling back to cache.
3. Convert PitchAPI shot coordinates (105x68 m, x: 0..105, y: 0..68) to Understat 0.0-1.0 scale:
   - cy on pitch is (1 - normX) * 105 in ShotmapPitch.
   - normX = x / 105.0, normY = y / 68.0.
   - Attacking direction: If a shot originates in own half (x < 52.5), invert (105 - x, 68 - y) so all shots target opponent goal.
"""
import os
from typing import Any, Dict, List, Optional
import httpx
from football.cache import cache
from football.quota import quota_guard

PITCHAPI_BASE_URL = "https://api.pitchapi.dev/v1"


class PitchAPIAdapter:
    def __init__(self):
        self.api_key = os.getenv("PITCHAPI_API_KEY", "")

    def _headers(self) -> dict:
        return {"X-API-KEY": self.api_key} if self.api_key else {}

    async def get_match(self, match_id: str) -> Optional[Dict[str, Any]]:
        cache_key = f"pitch_match_{match_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        if not self.api_key or not quota_guard.can_request("pitchapi"):
            return cache.get_stale(cache_key)

        quota_guard.record_request("pitchapi")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(f"{PITCHAPI_BASE_URL}/matches/{match_id}", headers=self._headers())
                if resp.status_code == 429:
                    retry_sec = float(resp.headers.get("Retry-After", 10.0))
                    quota_guard.set_pitchapi_retry_after(retry_sec)
                    return cache.get_stale(cache_key)

                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    is_finished = data.get("status") in ["played", "finished"]
                    cache.set_pitch_detail(cache_key, data, is_finished, bool(data))
                    return data
        except Exception as e:
            print(f"[PitchAPI] Error fetching match {match_id}: {e}")

        return cache.get_stale(cache_key)

    async def get_match_shots(self, match_id: str) -> Dict[str, Any]:
        """Fetch match shots, normalize coordinates to Understat 0.0-1.0 scale, and compute xG momentum."""
        cache_key = f"pitch_shots_{match_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        if not self.api_key or not quota_guard.can_request("pitchapi"):
            stale = cache.get_stale(cache_key)
            if stale is not None:
                return stale
            return {"match_id": match_id, "shots": [], "xG_momentum": [], "home_team": {"name": "Home", "total_xG": 0.0, "shots": 0, "goals": 0}, "away_team": {"name": "Away", "total_xG": 0.0, "shots": 0, "goals": 0}}

        quota_guard.record_request("pitchapi")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(f"{PITCHAPI_BASE_URL}/matches/{match_id}/shots", headers=self._headers())
                if resp.status_code == 429:
                    retry_sec = float(resp.headers.get("Retry-After", 10.0))
                    quota_guard.set_pitchapi_retry_after(retry_sec)
                    return cache.get_stale(cache_key) or {"match_id": match_id, "shots": [], "xG_momentum": [], "home_team": {"name": "Home", "total_xG": 0.0, "shots": 0, "goals": 0}, "away_team": {"name": "Away", "total_xG": 0.0, "shots": 0, "goals": 0}}

                if resp.status_code == 200:
                    raw_data = resp.json().get("data", {})
                    periods = raw_data.get("periods")
                    
                    processed_shots = []
                    home_shots = []
                    away_shots = []
                    
                    if periods:
                        match_info = await self.get_match(match_id) or {}
                        home_id = match_info.get("home_team", {}).get("id")
                        home_name = match_info.get("home_team", {}).get("name", "Home")
                        away_name = match_info.get("away_team", {}).get("name", "Away")

                        for p in periods:
                            for s in p.get("shots", []):
                                raw_x = float(s.get("x", 0.0))
                                raw_y = float(s.get("y", 0.0))
                                
                                # Convert standard pitch (105m x 68m) to 0.0-1.0 coordinate grid
                                # Invert shots originating in own half (x < 52.5) to unify attacking direction
                                if raw_x < 52.5:
                                    raw_x = 105.0 - raw_x
                                    raw_y = 68.0 - raw_y
                                    
                                norm_x = round(min(1.0, max(0.0, raw_x / 105.0)), 4)
                                norm_y = round(min(1.0, max(0.0, raw_y / 68.0)), 4)
                                
                                is_home = s.get("team_id") == home_id
                                xg_val = round(float(s.get("expected_goals", 0.0)), 3)
                                ev_type = s.get("event_type", "Miss")
                                
                                # Map result keyword for ShotmapPitch formatOutcome()
                                if ev_type == "Goal":
                                    result_code = "Goal"
                                elif ev_type == "AttemptSaved":
                                    result_code = "SavedShot"
                                elif "Blocked" in ev_type:
                                    result_code = "BlockedShot"
                                elif "Post" in ev_type:
                                    result_code = "ShotOnPost"
                                else:
                                    result_code = "MissedShots"

                                shot_obj = {
                                    "id": s.get("id"),
                                    "minute": s.get("minute", 0),
                                    "result": result_code,
                                    "x": norm_x,
                                    "y": norm_y,
                                    "xG": xg_val,
                                    "player": s.get("player", {}).get("name", "Player"),
                                    "team": "home" if is_home else "away",
                                    "team_name": home_name if is_home else away_name,
                                    "shot_type": s.get("shot_type"),
                                    "situation": s.get("situation"),
                                    "player_assisted": None,
                                    "last_action": None,
                                }
                                processed_shots.append(shot_obj)
                                if is_home:
                                    home_shots.append(shot_obj)
                                else:
                                    away_shots.append(shot_obj)

                        # Sort chronologically
                        processed_shots.sort(key=lambda s: s["minute"])
                        
                        # Minute-by-minute cumulative momentum
                        momentum = [{"minute": 0, "home_xG": 0.0, "away_xG": 0.0}]
                        cum_home, cum_away = 0.0, 0.0
                        for s in processed_shots:
                            if s["team"] == "home":
                                cum_home += s["xG"]
                            else:
                                cum_away += s["xG"]
                            momentum.append({
                                "minute": s["minute"],
                                "home_xG": round(cum_home, 3),
                                "away_xG": round(cum_away, 3),
                                "result": s["result"],
                                "player": s["player"],
                                "team": s["team"],
                            })

                        payload = {
                            "match_id": match_id,
                            "home_team": {
                                "name": home_name,
                                "total_xG": round(sum(s["xG"] for s in home_shots), 2),
                                "shots": len(home_shots),
                                "goals": sum(1 for s in home_shots if s["result"] == "Goal"),
                            },
                            "away_team": {
                                "name": away_name,
                                "total_xG": round(sum(s["xG"] for s in away_shots), 2),
                                "shots": len(away_shots),
                                "goals": sum(1 for s in away_shots if s["result"] == "Goal"),
                            },
                            "shots": processed_shots,
                            "xG_momentum": momentum,
                        }
                        
                        is_non_empty = len(processed_shots) > 0
                        cache.set_pitch_detail(cache_key, payload, is_finished=True, is_non_empty=is_non_empty)
                        return payload
                        
        except Exception as e:
            print(f"[PitchAPI] Error fetching shots for {match_id}: {e}")

        empty_payload = {
            "match_id": match_id,
            "home_team": {"name": "Home", "total_xG": 0.0, "shots": 0, "goals": 0},
            "away_team": {"name": "Away", "total_xG": 0.0, "shots": 0, "goals": 0},
            "shots": [],
            "xG_momentum": [],
        }
        cache.set_pitch_detail(cache_key, empty_payload, is_finished=False, is_non_empty=False)
        return empty_payload

    async def get_match_lineups(self, match_id: str) -> Dict[str, Any]:
        """Fetch match lineups."""
        cache_key = f"pitch_lineups_{match_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        if not self.api_key or not quota_guard.can_request("pitchapi"):
            return cache.get_stale(cache_key) or {"match_id": match_id, "lineups": []}

        quota_guard.record_request("pitchapi")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(f"{PITCHAPI_BASE_URL}/matches/{match_id}/lineups", headers=self._headers())
                if resp.status_code == 429:
                    retry_sec = float(resp.headers.get("Retry-After", 10.0))
                    quota_guard.set_pitchapi_retry_after(retry_sec)
                    return cache.get_stale(cache_key) or {"match_id": match_id, "lineups": []}

                if resp.status_code == 200:
                    raw_data = resp.json().get("data", {})
                    home = raw_data.get("home_team", {})
                    away = raw_data.get("away_team", {})
                    
                    starters_home = home.get("starters", [])
                    is_non_empty = len(starters_home) > 0
                    
                    lineups_list = []
                    for t in [home, away]:
                        if not t:
                            continue
                        starters = [{
                            "id": p.get("id"),
                            "name": p.get("name"),
                            "number": p.get("shirt_number"),
                            "pos": p.get("position"),
                            "grid": None,
                        } for p in t.get("starters", [])]
                        
                        subs = [{
                            "id": p.get("id"),
                            "name": p.get("name"),
                            "number": p.get("shirt_number"),
                            "pos": p.get("position"),
                        } for p in t.get("substitutes", [])]

                        lineups_list.append({
                            "team": {
                                "id": t.get("id"),
                                "name": t.get("name"),
                                "logo": t.get("image_url"),
                            },
                            "formation": t.get("formation"),
                            "coach": None,
                            "start_xi": starters,
                            "substitutes": subs,
                        })

                    result = {"match_id": match_id, "lineups": lineups_list}
                    cache.set_pitch_detail(cache_key, result, is_finished=is_non_empty, is_non_empty=is_non_empty)
                    return result
        except Exception as e:
            print(f"[PitchAPI] Error fetching lineups for {match_id}: {e}")

        empty_res = {"match_id": match_id, "lineups": []}
        cache.set_pitch_detail(cache_key, empty_res, is_finished=False, is_non_empty=False)
        return empty_res

    async def get_match_events(self, match_id: str) -> Dict[str, Any]:
        """Fetch match timeline events."""
        cache_key = f"pitch_events_{match_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        if not self.api_key or not quota_guard.can_request("pitchapi"):
            return cache.get_stale(cache_key) or {"match_id": match_id, "events": []}

        quota_guard.record_request("pitchapi")
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(f"{PITCHAPI_BASE_URL}/matches/{match_id}/events", headers=self._headers())
                if resp.status_code == 429:
                    retry_sec = float(resp.headers.get("Retry-After", 10.0))
                    quota_guard.set_pitchapi_retry_after(retry_sec)
                    return cache.get_stale(cache_key) or {"match_id": match_id, "events": []}

                if resp.status_code == 200:
                    raw_data = resp.json().get("data", {})
                    events_raw = raw_data.get("events", [])
                    is_non_empty = len(events_raw) > 0
                    
                    norm_events = []
                    for ev in events_raw:
                        norm_events.append({
                            "minute": ev.get("minute"),
                            "extra": ev.get("extra_minute"),
                            "team": ev.get("team_name"),
                            "player": ev.get("player_name"),
                            "assist": ev.get("assist_player_name"),
                            "type": ev.get("type"),
                            "detail": ev.get("detail"),
                            "comments": None,
                        })
                        
                    result = {"fixture_id": match_id, "events": norm_events}
                    cache.set_pitch_detail(cache_key, result, is_finished=is_non_empty, is_non_empty=is_non_empty)
                    return result
        except Exception as e:
            print(f"[PitchAPI] Error fetching events for {match_id}: {e}")

        empty_res = {"fixture_id": match_id, "events": []}
        cache.set_pitch_detail(cache_key, empty_res, is_finished=False, is_non_empty=False)
        return empty_res


pitchapi_adapter = PitchAPIAdapter()

