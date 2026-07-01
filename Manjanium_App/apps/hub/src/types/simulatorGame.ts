export interface CarState {
  position: [number, number, number]
  velocity: [number, number, number]
  speed_kmh: number
  gear: number
  rpm: number
  throttle: number
  brake: number
  steering: number
}

export interface LapData {
  lap_number: number
  start_time: number
  lap_time: number | null
  sector_times: [number | null, number | null, number | null]
  is_valid: boolean
}

export interface TrackCheckpoint {
  id: string
  position: [number, number, number]
  radius: number
  type: 'start-finish' | 'sector' | 'drs-zone'
}

export interface GamePhysicsConfig {
  gravity: number
  car_mass: number
  max_speed_kmh: number
  throttle_force: number
  brake_force: number
  friction: number
  wheel_radius: number
}
