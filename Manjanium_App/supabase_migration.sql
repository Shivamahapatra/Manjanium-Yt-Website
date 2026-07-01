-- ============================================================
-- user_customization table for Manjanium Sports Network
-- IMPORTANT: user_id is TEXT (not UUID) because Clerk user IDs
-- are strings like "user_2abc123", not PostgreSQL UUIDs.
--
-- RLS: The project uses Clerk (not Supabase Auth) on the client
-- with the anon key. auth.uid() is always NULL in this context.
-- We disable RLS and rely on app-level filtering by user_id.
-- Upgrade path: add Clerk JWT template to Supabase to enable RLS.
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS user_customization (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   TEXT NOT NULL UNIQUE,           -- Clerk userId string
  f1_dashboard_preset       TEXT DEFAULT 'live-focused',
  football_dashboard_preset TEXT DEFAULT 'fb_live_matches',
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- 2. Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_customization_user_id
  ON user_customization (user_id);

-- 3. Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_customization_updated_at
  BEFORE UPDATE ON user_customization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS: disabled for now (Clerk JWT not wired to Supabase Auth)
--    All filtering is done in application code (.eq('user_id', clerkUserId))
--    Uncomment the lines below ONLY after setting up Clerk JWT template:
--    https://supabase.com/docs/guides/auth/auth-clerk
ALTER TABLE user_customization DISABLE ROW LEVEL SECURITY;

-- (Future RLS - enable after Clerk JWT setup)
-- ALTER TABLE user_customization ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage own data" ON user_customization
--   FOR ALL
--   USING  ((auth.jwt() ->> 'sub') = user_id)
--   WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

-- 5. Verify
SELECT 'user_customization table created successfully' AS status;
