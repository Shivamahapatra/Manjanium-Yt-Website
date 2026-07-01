export interface Waypoint {
  position: [number, number, number]
  speed_limit: number // max speed at this waypoint km/h
}

// AI waypoints for each track (oval circuit)
export const TRACK_WAYPOINTS: Record<string, Waypoint[]> = {
  monza: [
    { position: [0, 0.5, -50], speed_limit: 280 },
    { position: [50, 0.5, -40], speed_limit: 200 },
    { position: [80, 0.5, 0], speed_limit: 150 },
    { position: [50, 0.5, 40], speed_limit: 200 },
    { position: [0, 0.5, 50], speed_limit: 280 },
    { position: [-50, 0.5, 40], speed_limit: 200 },
    { position: [-80, 0.5, 0], speed_limit: 150 },
    { position: [-50, 0.5, -40], speed_limit: 200 },
  ],
  monaco: [
    { position: [0, 0.5, -40], speed_limit: 180 },
    { position: [40, 0.5, -30], speed_limit: 120 },
    { position: [60, 0.5, 0], speed_limit: 100 },
    { position: [40, 0.5, 30], speed_limit: 120 },
    { position: [0, 0.5, 40], speed_limit: 180 },
    { position: [-40, 0.5, 30], speed_limit: 120 },
    { position: [-60, 0.5, 0], speed_limit: 100 },
    { position: [-40, 0.5, -30], speed_limit: 120 },
  ],
  spa: [
    { position: [0, 0.5, -60], speed_limit: 300 },
    { position: [60, 0.5, -50], speed_limit: 220 },
    { position: [90, 0.5, 0], speed_limit: 160 },
    { position: [60, 0.5, 50], speed_limit: 220 },
    { position: [0, 0.5, 60], speed_limit: 300 },
    { position: [-60, 0.5, 50], speed_limit: 220 },
    { position: [-90, 0.5, 0], speed_limit: 160 },
    { position: [-60, 0.5, -50], speed_limit: 220 },
  ],
  austin: [
    { position: [0, 0.5, -55], speed_limit: 270 },
    { position: [55, 0.5, -45], speed_limit: 190 },
    { position: [75, 0.5, 0], speed_limit: 140 },
    { position: [55, 0.5, 45], speed_limit: 190 },
    { position: [0, 0.5, 55], speed_limit: 270 },
    { position: [-55, 0.5, 45], speed_limit: 190 },
    { position: [-75, 0.5, 0], speed_limit: 140 },
    { position: [-55, 0.5, -45], speed_limit: 190 },
  ],
  silverstone: [
    { position: [0, 0.5, -55], speed_limit: 290 },
    { position: [55, 0.5, -45], speed_limit: 210 },
    { position: [80, 0.5, 0], speed_limit: 155 },
    { position: [55, 0.5, 45], speed_limit: 210 },
    { position: [0, 0.5, 55], speed_limit: 290 },
    { position: [-55, 0.5, 45], speed_limit: 210 },
    { position: [-80, 0.5, 0], speed_limit: 155 },
    { position: [-55, 0.5, -45], speed_limit: 210 },
  ],
}

export const AI_DIFFICULTY = {
  easy: { speed_multiplier: 0.7, reaction_time: 0.3 },
  medium: { speed_multiplier: 0.85, reaction_time: 0.15 },
  hard: { speed_multiplier: 0.95, reaction_time: 0.05 },
  pro: { speed_multiplier: 1.0, reaction_time: 0.02 },
}
