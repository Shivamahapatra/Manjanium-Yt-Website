import { create } from 'zustand'

export interface GamePhysicsState {
  // Input
  throttle: number
  brake: number
  steering: number
  setThrottle: (val: number) => void
  setBrake: (val: number) => void
  setSteering: (val: number) => void

  // Telemetry
  speed: number
  gear: number
  rpm: number
  setSpeed: (val: number) => void
  setGear: (val: number) => void
  setRPM: (val: number) => void

  // Laps
  currentLap: number
  totalLaps: number
  bestLapTime: number | null
  currentLapTime: number
  completeLap: (lapTime: number) => void
  setTotalLaps: (laps: number) => void

  // Tire system
  tireWear: number
  tireFriction: number
  weather: 'clear' | 'rain' | 'mixed'
  setTireWear: (wear: number) => void
  setTireFriction: (friction: number) => void
  setWeather: (weather: 'clear' | 'rain' | 'mixed') => void

  // ERS
  battery: number
  ersActive: boolean
  setBattery: (battery: number) => void
  setERSActive: (active: boolean) => void

  // DRS
  drsAvailable: boolean
  drsActive: boolean
  setDRSAvailable: (available: boolean) => void
  setDRSActive: (active: boolean) => void

  // Lap sectors
  sector1Cleared: boolean
  sector2Cleared: boolean
  clearSectors: () => void
  setSector1: () => void
  setSector2: () => void
  resetRace: () => void

  // Settings
  mouseSteeringEnabled: boolean
  mouseSensitivity: number
  setMouseSteering: (enabled: boolean) => void
  setMouseSensitivity: (sensitivity: number) => void
}

export const WEATHER_FRICTION_MULTIPLIER = {
  clear: 1.0,
  mixed: 1.4,
  rain: 1.8,
}

export const BASE_FRICTION = 1.2
export const DEGRADATION_RATE = 0.00008

export function calculateTireFriction(
  tireWear: number,
  weather: 'clear' | 'rain' | 'mixed'
): number {
  const wearFactor = tireWear / 100
  const weatherMod = WEATHER_FRICTION_MULTIPLIER[weather]
  return Math.max(0.4, (BASE_FRICTION * wearFactor) / weatherMod)
}

export const useGamePhysics = create<GamePhysicsState>((set) => ({
  throttle: 0,
  brake: 0,
  steering: 0,
  setThrottle: (throttle) => set({ throttle }),
  setBrake: (brake) => set({ brake }),
  setSteering: (steering) => set({ steering }),

  speed: 0,
  gear: 1,
  rpm: 0,
  setSpeed: (speed) => set({ speed }),
  setGear: (gear) => set({ gear }),
  setRPM: (rpm) => set({ rpm }),

  currentLap: 1,
  totalLaps: 5,
  bestLapTime: null,
  currentLapTime: 0,
  completeLap: (lapTime) => set((state) => ({
    currentLap: state.currentLap + 1,
    bestLapTime: state.bestLapTime ? Math.min(state.bestLapTime, lapTime) : lapTime
  })),
  setTotalLaps: (totalLaps) => set({ totalLaps }),

  tireWear: 100,
  tireFriction: BASE_FRICTION,
  weather: 'clear',
  setTireWear: (tireWear) => set({ tireWear }),
  setTireFriction: (tireFriction) => set({ tireFriction }),
  setWeather: (weather) => set({ weather }),

  battery: 100,
  ersActive: false,
  setBattery: (battery) => set({ battery }),
  setERSActive: (ersActive) => set({ ersActive }),

  drsAvailable: false,
  drsActive: false,
  setDRSAvailable: (drsAvailable) => set({ drsAvailable }),
  setDRSActive: (drsActive) => set({ drsActive }),

  sector1Cleared: false,
  sector2Cleared: false,
  clearSectors: () => set({ sector1Cleared: false, sector2Cleared: false }),
  setSector1: () => set({ sector1Cleared: true }),
  setSector2: () => set({ sector2Cleared: true }),
  resetRace: () => set({ currentLap: 1, battery: 100 }),

  mouseSteeringEnabled: false,
  mouseSensitivity: 0.005,
  setMouseSteering: (mouseSteeringEnabled) => set({ mouseSteeringEnabled }),
  setMouseSensitivity: (mouseSensitivity) => set({ mouseSensitivity })
}))
