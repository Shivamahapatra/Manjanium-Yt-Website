CREATE TABLE simulator_lap_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id VARCHAR(100) NOT NULL,
  track_id VARCHAR(50) NOT NULL,
  lap_number INT NOT NULL,
  lap_time INT NOT NULL,
  weather VARCHAR(20) DEFAULT 'clear',
  difficulty VARCHAR(20) DEFAULT 'medium',
  valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE simulator_lap_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own laps" ON simulator_lap_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read lap records" ON simulator_lap_records
  FOR SELECT USING (true);
