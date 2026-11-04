from fastapi import APIRouter, Depends, Request, Response, HTTPException
try:
    from admin_auth import admin_auth
    from metric_collector import metric_collector
except ImportError:
    from .admin_auth import admin_auth
    from .metric_collector import metric_collector
import os
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
_supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

@router.get("/admin/metrics")
async def get_metrics(auth: dict = Depends(admin_auth)):
    # Fetch all metrics from Supabase
    if not metric_collector._supabase:
        raise HTTPException(status_code=500, detail="Metrics DB not configured")
    resp = metric_collector._supabase.table("admin_metrics").select("*").execute()
    data = resp.data if hasattr(resp, "data") else []
    return data
