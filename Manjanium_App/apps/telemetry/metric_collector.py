import os
import time
from typing import Dict
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

# Initialize Supabase client (service role) for metrics storage
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
_supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class MetricCollector:
    """Collects per‑provider metrics and persists them to Supabase.
    All methods are thread‑safe for the simple single‑process dev server.
    """

    def __init__(self):
        self._data: Dict[str, dict] = {}
        # provider -> dict of stats
        # stats keys: requests_minute, requests_day, last_success, last_error, avg_latency_ms, cache_hits, cache_misses, key_set

    def _ensure(self, provider: str):
        if provider not in self._data:
            self._data[provider] = {
                "requests_minute": 0,
                "requests_day": 0,
                "last_success": None,
                "last_error": None,
                "avg_latency_ms": 0.0,
                "cache_hits": 0,
                "cache_misses": 0,
                "key_set": bool(os.getenv(self._key_env_name(provider))),
                "latency_acc": 0.0,
                "latency_cnt": 0,
            }

    @staticmethod
    def _key_env_name(provider: str) -> str:
        mapping = {
            "api_football": "API_FOOTBALL_KEY",
            "football_data": "FOOTBALL_DATA_ORG_KEY",
            "pitchapi": "PITCHAPI_API_KEY",
        }
        return mapping.get(provider, "")

    def record_request(self, provider: str, latency_seconds: float, success: bool, cache_hit: bool = False):
        self._ensure(provider)
        stats = self._data[provider]
        # minute/day counters – we rely on QuotaGuard for reset, here we just increment
        stats["requests_minute"] += 1
        stats["requests_day"] += 1
        # latency aggregation
        stats["latency_acc"] += latency_seconds * 1000
        stats["latency_cnt"] += 1
        stats["avg_latency_ms"] = stats["latency_acc"] / max(1, stats["latency_cnt"])
        # cache
        if cache_hit:
            stats["cache_hits"] += 1
        else:
            stats["cache_misses"] += 1
        # timestamps
        if success:
            stats["last_success"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        else:
            stats["last_error"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        # Persist to Supabase (upsert)
        if _supabase:
            upsert_data = {
                "provider": provider,
                "key_set": stats["key_set"],
                "requests_minute": stats["requests_minute"],
                "requests_day": stats["requests_day"],
                "last_success": stats["last_success"],
                "last_error": stats["last_error"],
                "avg_latency_ms": stats["avg_latency_ms"],
                "cache_hits": stats["cache_hits"],
                "cache_misses": stats["cache_misses"],
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            _supabase.table("admin_metrics").upsert(upsert_data, on_conflict="provider").execute()

    def record_cache_hit(self, provider: str):
        self.record_request(provider, latency_seconds=0.0, success=True, cache_hit=True)

    def record_cache_miss(self, provider: str):
        self.record_request(provider, latency_seconds=0.0, success=True, cache_hit=False)

metric_collector = MetricCollector()

