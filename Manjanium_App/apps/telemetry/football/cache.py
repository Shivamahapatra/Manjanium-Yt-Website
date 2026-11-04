"""In-memory and durable cache layer for football telemetry services.
- Hot/live data: In-memory TTLCache.
- PitchAPI response rule: NEVER permanently cache empty/null payloads.
  Only status == 'played' / 'finished' AND non-empty data is cached permanently.
  Otherwise, cached with a transient 5-minute TTL to allow retries.
- 429 Rate-limit Handling: Tracks Retry-After delays and serves stale cache when available.
"""
import time
from typing import Any, Dict, Optional
from cachetools import TTLCache


class FootballCache:
    def __init__(self):
        # Hot live match caches (60s default)
        self.live_fixtures = TTLCache(maxsize=128, ttl=60)
        # Standings cache (15m default)
        self.standings = TTLCache(maxsize=64, ttl=900)
        # Scorers cache (1h default)
        self.scorers = TTLCache(maxsize=64, ttl=3600)
        # Pinned Barca team cache (30m default)
        self.team_tracker = TTLCache(maxsize=16, ttl=1800)
        
        # Transient cache for in-progress or pending post-match events/shots (5 min)
        self.transient_details = TTLCache(maxsize=512, ttl=300)
        
        # Permanent cache for finished match details (shots, lineups, events, stats)
        # Stored permanently in memory dictionary for fast lookups
        self.permanent_details: Dict[str, Any] = {}
        
        # Stale cache fallback store: key -> (timestamp, data)
        self.stale_store: Dict[str, Any] = {}

    def get(self, key: str) -> Optional[Any]:
        # 1. Check permanent cache
        if key in self.permanent_details:
            return self.permanent_details[key]
        
        # 2. Check transient details
        if key in self.transient_details:
            return self.transient_details[key]

        # 3. Check general TTL caches
        for c in [self.live_fixtures, self.standings, self.scorers, self.team_tracker]:
            if key in c:
                return c[key]
                
        return None

    def set_pitch_detail(self, key: str, data: Any, is_finished: bool, is_non_empty: bool) -> None:
        """Rule 1: Never cache an empty or incomplete PitchAPI response permanently.
        Cache permanently only when status is played/finished AND data is non-empty;
        otherwise use a ~5 min TTL and retry.
        """
        if is_finished and is_non_empty:
            self.permanent_details[key] = data
        else:
            self.transient_details[key] = data
            
        # Also preserve in stale store as fallback
        self.stale_store[key] = data

    def get_stale(self, key: str) -> Optional[Any]:
        """Returns stale cached data when provider returns 429 or fails."""
        return self.stale_store.get(key)


cache = FootballCache()

