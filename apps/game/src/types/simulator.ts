export interface GameState {
  // Race Status
  lap: number;
  totalLaps: number;
  speed: number;
  gear: number;
  delta: number;
  
  // Systems
  ersBattery: number; // 0 to 100
  ersActive: boolean;
  drsActive: boolean;
  drsAvailable: boolean;
  tireWear: number; // 0 to 100
  
  // Settings
  transmission: 'auto' | 'manual';
  mouseSteering: boolean;
  steeringSensitivity: number;
  
  // Multiplayer
  isMultiplayer: boolean;
  roomCode?: string;
  isHost: boolean;
}

export interface PhysicsVariables {
  tireFriction: number;
  suspensionStiffness: number;
  engineForce: number;
  maxSpeed: number;
  gForceThreshold: number; // Threshold for DNF/penalty
}

export interface LeaderboardEntry {
  id: string;
  track_id: string;
  user_id: string;
  best_lap_time: number;
  weather: 'sunny' | 'rain' | 'cloudy';
  created_at: string;
}

export interface RoomEntry {
  id: string;
  room_code: string;
  host_id: string;
  active_players: number;
  created_at: string;
}

export type TrackId = 'monza' | 'monaco' | 'spa' | 'austin' | 'silverstone';
