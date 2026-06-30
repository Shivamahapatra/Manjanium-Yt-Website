import { create } from 'zustand'

interface TelemetryState {
  speed: number;
  gear: number;
  setTelemetry: (speed: number, gear: number) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  speed: 0,
  gear: 1,
  setTelemetry: (speed, gear) => set({ speed, gear }),
}))
