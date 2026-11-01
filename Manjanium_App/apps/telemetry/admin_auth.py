import os
import hmac
from typing import Optional
from fastapi import Request, HTTPException

try:
    from jose import jwt, JWTError
except ImportError:
    jwt = None
    JWTError = Exception
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

# Initialize Supabase client (service role) for audit logging
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
_supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Shared secret for internal calls (optional)
ADMIN_SHARED_SECRET = os.getenv("ADMIN_SHARED_SECRET", "").encode()

# Clerk JWT verification (simplified – production should fetch JWKS)
CLERK_JWT_ISS = os.getenv("CLERK_JWT_ISSUER")
CLERK_JWT_PUBLIC_KEY = os.getenv("CLERK_JWT_PUBLIC_KEY")

def constant_time_compare(a: bytes, b: bytes) -> bool:
    return hmac.compare_digest(a, b)

async def admin_auth(request: Request):
    """FastAPI dependency that verifies admin access.
    Returns a dict with auth info on success; raises HTTPException(404) otherwise.
    """
    # ---- Shared secret path (server‑to‑server) ----
    secret_header = request.headers.get("X-Admin-Secret", "").encode()
    if ADMIN_SHARED_SECRET and secret_header:
        if constant_time_compare(secret_header, ADMIN_SHARED_SECRET):
            return {"method": "shared_secret"}
        raise HTTPException(status_code=404)

    # ---- Clerk JWT path ----
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=404)
    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, CLERK_JWT_PUBLIC_KEY, algorithms=["RS256"], issuer=CLERK_JWT_ISS)
    except JWTError:
        raise HTTPException(status_code=404)

    email = payload.get("email")
    email_verified = payload.get("email_verified")
    if not email or not email_verified:
        raise HTTPException(status_code=404)

    allowlist_raw = os.getenv("ADMIN_EMAILS", "")
    allowlist = [e.strip().lower() for e in allowlist_raw.split(",") if e.strip()]
    if not allowlist:
        raise HTTPException(status_code=404)
    if email.strip().lower() not in allowlist:
        raise HTTPException(status_code=404)

    # Log successful admin access
    if _supabase:
        _supabase.table("admin_audit_log").insert({
            "user_id": payload.get("sub"),
            "email": email,
            "action": "access_admin",
            "success": True,
        }).execute()
    return {"method": "clerk_jwt", "email": email}

# Helper for failed attempts (can be called by catch blocks)
async def log_failed_audit(request: Request, reason: str):
    if _supabase:
        auth_header = request.headers.get("Authorization", "")
        email = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            try:
                payload = jwt.decode(token, CLERK_JWT_PUBLIC_KEY, algorithms=["RS256"], issuer=CLERK_JWT_ISS)
                email = payload.get("email")
            except JWTError:
                pass
        _supabase.table("admin_audit_log").insert({
            "user_id": payload.get("sub") if email else None,
            "email": email,
            "action": f"access_admin_failed:{reason}",
            "success": False,
        }).execute()

