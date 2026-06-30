import { create } from 'zustand';

export interface RemotePlayer {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion
  lastUpdate: number;
}

interface MultiplayerState {
  players: Record<string, RemotePlayer>;
  updatePlayer: (id: string, data: Partial<RemotePlayer>) => void;
  removePlayer: (id: string) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set) => ({
  players: {},
  updatePlayer: (id, data) => set((state) => {
    const existing = state.players[id] || { id, position: [0, 0, 0], rotation: [0, 0, 0, 1], lastUpdate: Date.now() };
    return {
      players: {
        ...state.players,
        [id]: { ...existing, ...data, lastUpdate: Date.now() }
      }
    };
  }),
  removePlayer: (id) => set((state) => {
    const newPlayers = { ...state.players };
    delete newPlayers[id];
    return { players: newPlayers };
  })
}));
