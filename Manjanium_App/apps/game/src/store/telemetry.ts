import { create } from 'zustand'

export interface TelemetryState {
  // Telemetry
  speed: number;
  gear: number;
  setTelemetry: (speed: number, gear: number) => void;
  
  // Race Status
  lap: number;
  totalLaps: number;
  setLap: (lap: number) => void;
  resetRace: () => void;
  raceFinished: boolean;
  setRaceFinished: (finished: boolean) => void;
  
  // Systems
  ersBattery: number; // 0 to 100
  ersActive: boolean;
  drsActive: boolean;
  drsAvailable: boolean;
  setSystems: (ers: number, ersActive: boolean, drsActive: boolean, drsAvailable: boolean) => void;
  
  // Settings
  transmission: 'auto' | 'manual';
  mouseSteering: boolean;
  steeringSensitivity: number;
  updateSettings: (settings: Partial<Pick<TelemetryState, 'transmission' | 'mouseSteering' | 'steeringSensitivity'>>) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  speed: 0,
  gear: 1,
  setTelemetry: (speed, gear) => set({ speed, gear }),
  
  lap: 1,
  totalLaps: 3,
  setLap: (lap) => set({ lap }),
  resetRace: () => set({ lap: 1, raceFinished: false, ersBattery: 100 }),
  raceFinished: false,
  setRaceFinished: (raceFinished) => set({ raceFinished }),
  
  ersBattery: 100,
  ersActive: false,
  drsActive: false,
  drsAvailable: false,
  setSystems: (ersBattery, ersActive, drsActive, drsAvailable) => set({ ersBattery, ersActive, drsActive, drsAvailable }),
  
  transmission: 'auto',
  mouseSteering: false,
  steeringSensitivity: 1.0,
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
}))
