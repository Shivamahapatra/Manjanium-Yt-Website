# Supabase migration to create admin tables

-- admin_metrics stores real‑time provider statistics
CREATE TABLE IF NOT EXISTS public.admin_metrics (
    provider text PRIMARY KEY,
    key_set boolean NOT NULL,
    requests_minute integer NOT NULL DEFAULT 0,
    requests_day integer NOT NULL DEFAULT 0,
    limit_minute integer,
    limit_day integer,
    last_success timestamp with time zone,
    last_error text,
    avg_latency_ms double precision,
    cache_hits integer NOT NULL DEFAULT 0,
    cache_misses integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- admin_audit_log records every admin‑access attempt
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text,
    email text,
    action text NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    success boolean NOT NULL
);

-- Row‑level security: only the service role may SELECT/INSERT
ALTER TABLE public.admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (replace "service_role" with actual role name if different)
CREATE POLICY admin_metrics_select ON public.admin_metrics FOR SELECT USING (true);
CREATE POLICY admin_metrics_upsert ON public.admin_metrics FOR INSERT, UPDATE USING (true);

CREATE POLICY admin_audit_log_insert ON public.admin_audit_log FOR INSERT WITH CHECK (true);

-- Revoke public access (if any default privileges exist)
REVOKE ALL ON public.admin_metrics FROM public;
REVOKE ALL ON public.admin_audit_log FROM public;

