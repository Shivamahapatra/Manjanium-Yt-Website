"""Quota Guard for Football Data APIs.
Protects free-tier rate limits:
- API-Football: Cutoff at 90 requests/day, 10/min.
- football-data.org: Rate limit at 8 requests/min (free plan limit 10/min).
- PitchAPI: Honors Retry-After headers on 429 and applies client-side burst spacing.
"""
import time
from typing import Dict, Tuple


class QuotaGuard:
    def __init__(self):
        # Sliding minute windows: provider -> list of timestamps
        self._minute_calls: Dict[str, list] = {
            "api_football": [],
            "football_data": [],
            "pitchapi": [],
        }
        # Daily counter: provider -> (date_str, count)
        self._daily_calls: Dict[str, Tuple[str, int]] = {
            "api_football": ("", 0),
            "football_data": ("", 0),
            "pitchapi": ("", 0),
        }
        # PitchAPI 429 Retry-After cooldown timestamp
        self._pitch_cooldown_until: float = 0.0

    def _clean_minute(self, provider: str, now: float):
        self._minute_calls[provider] = [t for t in self._minute_calls[provider] if now - t < 60.0]

    def _today_str(self) -> str:
        return time.strftime("%Y-%m-%d", time.gmtime())

    def can_request(self, provider: str) -> bool:
        now = time.time()
        today = self._today_str()

        # Check PitchAPI Retry-After cooldown
        if provider == "pitchapi":
            if now < self._pitch_cooldown_until:
                return False
            return True

        self._clean_minute(provider, now)

        # 1. API-Football limits: 10/min, 90/day cutoff
        if provider == "api_football":
            if len(self._minute_calls[provider]) >= 9:
                return False
            d_str, count = self._daily_calls[provider]
            if d_str == today and count >= 90:
                return False
            return True

        # 2. Football-Data.org limits: 8/min cutoff (buffer under 10/min)
        if provider == "football_data":
            if len(self._minute_calls[provider]) >= 8:
                return False
            return True

        return True

    def record_request(self, provider: str) -> None:
        now = time.time()
        today = self._today_str()
        self._minute_calls[provider].append(now)

        d_str, count = self._daily_calls[provider]
        if d_str == today:
            self._daily_calls[provider] = (today, count + 1)
        else:
            self._daily_calls[provider] = (today, 1)

    def set_pitchapi_retry_after(self, retry_after_seconds: float) -> None:
        """Handle PitchAPI 429 by honoring Retry-After."""
        self._pitch_cooldown_until = time.time() + max(1.0, retry_after_seconds)

    def is_pitchapi_cooling_down(self) -> bool:
        return time.time() < self._pitch_cooldown_until


quota_guard = QuotaGuard()
