-- Ensure user_customization table exists with correct schema
CREATE TABLE IF NOT EXISTS user_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  f1_dashboard_preset VARCHAR(50) DEFAULT 'live-focused',
  football_dashboard_preset VARCHAR(50) DEFAULT 'live-matches',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Drop and recreate RLS policies cleanly
ALTER TABLE user_customization ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON user_customization;
DROP POLICY IF EXISTS "Users can update own data" ON user_customization;
DROP POLICY IF EXISTS "Users can insert own data" ON user_customization;

CREATE POLICY "Users can read own data" ON user_customization
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON user_customization
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON user_customization
  FOR INSERT WITH CHECK (true);
