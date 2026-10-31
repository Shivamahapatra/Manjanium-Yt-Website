"""API-Football Provider Adapter (Disabled by Default).
Can be toggled via API_FOOTBALL_ENABLED=true if upgraded to a paid plan.
Preserves existing logic and circuit breaker at 90 calls/day.
"""
import os
from typing import Any, Dict, List, Optional
import httpx
from football.cache import cache
from football.quota import quota_guard

API_FOOTBALL_BASE_URL = os.getenv("API_FOOTBALL_BASE_URL", "https://v3.football.api-sports.io")


class APIFootballAdapter:
    def __init__(self):
        self.api_key = os.getenv("API_FOOTBALL_KEY", os.getenv("RAPIDAPI_KEY", ""))
        # Kept disabled by default on free plan per user instruction
        self.enabled = os.getenv("API_FOOTBALL_ENABLED", "false").lower() == "true"

    def _headers(self) -> dict:
        key = self.api_key
        if not key:
            return {}
        return {
            "x-apisports-key": key,
            "x-rapidapi-key": key,
            "x-rapidapi-host": "v3.football.api-sports.io",
        }

    async def get_live_scores(self) -> Dict[str, Any]:
        """Fetch live scores from API-Football if enabled."""
        if not self.enabled:
            return {
                "status": "disabled",
                "message": "API-Football adapter is disabled on free tier (season 2026 restricted).",
                "data": [],
            }

        if not self.api_key or not quota_guard.can_request("api_football"):
            return {
                "status": "rate_limited",
                "message": "API-Football rate limit / cutoff reached (90 calls/day limit).",
                "data": [],
            }

        quota_guard.record_request("api_football")
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(f"{API_FOOTBALL_BASE_URL}/fixtures", params={"live": "all"}, headers=self._headers())
                if resp.status_code == 200:
                    raw_data = resp.json()
                    # Check for plan season error
                    if raw_data.get("errors", {}).get("plan"):
                        return {"status": "plan_restricted", "message": raw_data["errors"]["plan"], "data": []}
                    return {"data": raw_data.get("response", []), "source": "api-football", "cached": False}
        except Exception as e:
            print(f"[APIFootball] Error: {e}")

        return {"status": "error", "message": "Failed to query API-Football", "data": []}


api_football_adapter = APIFootballAdapter()
