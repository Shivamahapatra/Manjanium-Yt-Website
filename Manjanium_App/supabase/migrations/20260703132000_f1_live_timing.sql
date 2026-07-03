-- Migration: F1 Live Timing (Phase 2 - Realtime)

CREATE TABLE IF NOT EXISTS public.f1_live_timing (
    session_key TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.f1_live_timing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on f1_live_timing"
    ON public.f1_live_timing
    FOR SELECT
    USING (true);

-- Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.f1_live_timing;
