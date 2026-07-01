-- Simulator profiles table
CREATE TABLE simulator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  auto_transmission BOOLEAN DEFAULT true,
  mouse_steering BOOLEAN DEFAULT false,
  mouse_sensitivity FLOAT DEFAULT 1.0,
  camera_distance FLOAT DEFAULT 1.5,
  brake_assist BOOLEAN DEFAULT true,
  traction_control INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Simulator leaderboards table
CREATE TABLE simulator_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  track_id VARCHAR(50) NOT NULL,
  best_lap_time INT NOT NULL,
  weather VARCHAR(20) DEFAULT 'clear',
  difficulty VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, track_id, weather, difficulty)
);

-- Multiplayer rooms table
CREATE TABLE simulator_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) NOT NULL UNIQUE,
  host_user_id UUID NOT NULL REFERENCES auth.users(id),
  track_id VARCHAR(50) NOT NULL,
  weather VARCHAR(20) DEFAULT 'clear',
  difficulty VARCHAR(20) DEFAULT 'medium',
  max_players INT DEFAULT 8,
  current_players INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT now(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE simulator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON simulator_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON simulator_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read leaderboards" ON simulator_leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own leaderboard entries" ON simulator_leaderboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read rooms" ON simulator_rooms
  FOR SELECT USING (true);

CREATE POLICY "Users can create rooms" ON simulator_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);
