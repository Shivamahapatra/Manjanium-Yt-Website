import { supabase } from './supabase';
import { useMultiplayerStore } from '../store/multiplayer';

let channel: ReturnType<typeof supabase.channel> | null = null;
let myId = Math.random().toString(36).substring(7);

export const initMultiplayer = (roomId: string = 'global-track') => {
  if (channel) return;

  channel = supabase.channel(`room:${roomId}`, {
    config: {
      broadcast: { ack: false },
    },
  });

  channel
    .on('broadcast', { event: 'position' }, (payload) => {
      if (payload.payload.id !== myId) {
        useMultiplayerStore.getState().updatePlayer(payload.payload.id, {
          position: payload.payload.position,
          rotation: payload.payload.rotation,
        });
      }
    })
    .subscribe();
};

// Throttle broadcast to ~15-20hz to save bandwidth
let lastBroadcast = 0;
const BROADCAST_INTERVAL = 50;

export const broadcastPosition = (position: [number, number, number], rotation: [number, number, number, number]) => {
  if (!channel) return;
  const now = Date.now();
  if (now - lastBroadcast < BROADCAST_INTERVAL) return;
  lastBroadcast = now;

  channel.send({
    type: 'broadcast',
    event: 'position',
    payload: { id: myId, position, rotation },
  });
};

export const leaveMultiplayer = () => {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
};
