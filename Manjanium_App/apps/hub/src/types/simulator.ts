// Game modes
export type GameMode = 'single-player' | 'multiplayer' | 'time-trial'
export type WeatherType = 'clear' | 'rain' | 'mixed'
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'pro'

// Track data
export interface Track {
  id: string
  name: string
  location: string
  shortCode: string
  laps: number
  length_km: number
  drs_zones: number
  imageUrl: string // placeholder or real
}

// Game session
export interface GameSession {
  id: string
  mode: GameMode
  track: Track
  weather: WeatherType
  difficulty: DifficultyLevel
  numberOfLaps: number
  aiDifficulty: number // 1-10
  isMultiplayer: boolean
  multiplayerRoomCode?: string
  hostUserId?: string
}

// Multiplayer room (Supabase)
export interface SimulatorRoom {
  id: string
  room_code: string
  host_user_id: string
  track_id: string
  weather: WeatherType
  difficulty: DifficultyLevel
  max_players: number
  current_players: number
  created_at: string
  started_at?: string
  status: 'waiting' | 'in-progress' | 'finished'
}

// User simulator profile
export interface SimulatorProfile {
  id: string
  user_id: string
  auto_transmission: boolean
  mouse_steering: boolean
  mouse_sensitivity: number
  camera_distance: number
  brake_assist: boolean
  traction_control: number // 0-100
  best_lap_times: {
    [trackId: string]: number // milliseconds
  }
}

// Leaderboard entry
export interface SimulatorLeaderboard {
  id: string
  user_id: string
  track_id: string
  best_lap_time: number // milliseconds
  weather: WeatherType
  difficulty: DifficultyLevel
  date: string
  position?: number
}
