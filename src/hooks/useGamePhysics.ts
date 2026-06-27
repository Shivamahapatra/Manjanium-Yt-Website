import { create } from 'zustand'
import { CarState, LapData } from '@/types/simulatorGame'

interface GamePhysicsStore {
  // Car telemetry
  carState: CarState
  lapData: LapData
  
  // Controls
  throttle: number
  brake: number
  steering: number
  
  // Game state
  isRacing: boolean
  isPaused: boolean
  currentLap: number
  bestLapTime: number | null
  totalTime: number
  
  // Actions
  setCarState: (state: Partial<CarState>) => void
  setThrottle: (value: number) => void
  setBrake: (value: number) => void
  setSteering: (value: number) => void
  setRacing: (racing: boolean) => void
  setPaused: (paused: boolean) => void
  completeLap: (lapTime: number) => void
  resetGame: () => void
}

const initialCarState: CarState = {
  position: [0, 0.5, 0],
  velocity: [0, 0, 0],
  speed_kmh: 0,
  gear: 1,
  rpm: 0,
  throttle: 0,
  brake: 0,
  steering: 0,
}

const initialLapData: LapData = {
  lap_number: 1,
  start_time: 0,
  lap_time: null,
  sector_times: [null, null, null],
  is_valid: true,
}

export const useGamePhysics = create<GamePhysicsStore>((set) => ({
  carState: initialCarState,
  lapData: initialLapData,
  throttle: 0,
  brake: 0,
  steering: 0,
  isRacing: false,
  isPaused: false,
  currentLap: 1,
  bestLapTime: null,
  totalTime: 0,

  setCarState: (state) =>
    set((prev) => ({
      carState: { ...prev.carState, ...state },
    })),

  setThrottle: (throttle) => set({ throttle: Math.min(1, Math.max(0, throttle)) }),
  setBrake: (brake) => set({ brake: Math.min(1, Math.max(0, brake)) }),
  setSteering: (steering) => set({ steering: Math.min(1, Math.max(-1, steering)) }),

  setRacing: (racing) => set({ isRacing: racing }),
  setPaused: (paused) => set({ isPaused: paused }),

  completeLap: (lapTime) =>
    set((prev) => ({
      currentLap: prev.currentLap + 1,
      bestLapTime:
        prev.bestLapTime === null
          ? lapTime
          : Math.min(prev.bestLapTime, lapTime),
      totalTime: prev.totalTime + lapTime,
      lapData: {
        ...initialLapData,
        lap_number: prev.currentLap + 1,
        start_time: Date.now(),
      },
    })),

  resetGame: () => set({
    carState: initialCarState,
    lapData: initialLapData,
    throttle: 0,
    brake: 0,
    steering: 0,
    isRacing: false,
    isPaused: false,
    currentLap: 1,
    bestLapTime: null,
    totalTime: 0,
  }),
}))
