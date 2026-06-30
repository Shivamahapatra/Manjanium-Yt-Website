import { create } from 'zustand'
import { GameSession, Track } from '@/types/simulator'

interface GameStore {
  // Game state
  session: GameSession | null
  currentTrack: Track | null
  isLoading: boolean
  
  // Actions
  createSession: (session: GameSession) => void
  setCurrentTrack: (track: Track) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
}

export const useSimulatorGame = create<GameStore>((set) => ({
  session: null,
  currentTrack: null,
  isLoading: false,
  
  createSession: (session) => set({ session }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  clearSession: () => set({ session: null, currentTrack: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
