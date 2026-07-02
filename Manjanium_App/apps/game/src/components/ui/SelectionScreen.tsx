import React, { useState } from 'react';
import { Button } from '@manjanium/ui';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ROOMS = [
  { id: '1', name: 'Monza Time Attack', players: 4, max: 10, ping: '24ms' },
  { id: '2', name: 'Global Hub 1', players: 8, max: 20, ping: '45ms' },
  { id: '3', name: 'Beginner Practice', players: 2, max: 10, ping: '12ms' },
];

const TRACKS = [
  { id: 'monza', name: 'Monza', color: 'from-green-500 to-red-500' },
  { id: 'monaco', name: 'Monaco', color: 'from-blue-400 to-yellow-500' },
  { id: 'spa', name: 'Spa', color: 'from-yellow-400 to-red-600' },
  { id: 'austin', name: 'Austin', color: 'from-red-500 to-blue-500' },
  { id: 'silverstone', name: 'Silverstone', color: 'from-gray-500 to-blue-700' },
];

export function SelectionScreen({ onStart, userId }: { onStart: () => void, userId?: string | null }) {
  const [mode, setMode] = useState<'single' | 'multi' | 'time'>('single');
  const [track, setTrack] = useState('monza');

  return (
    <div className="absolute inset-0 z-50 flex bg-[url('/bg-placeholder.jpg')] bg-cover bg-center">
      {/* Heavy Glassmorphic overlay */}
      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xl" />

      <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-12">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-white tracking-tighter">
              PADDOCK HUB
            </h1>
            <p className="text-[#0EA5E9] uppercase tracking-widest text-xs mt-2 font-bold">Stitch Design System</p>
          </div>
          {userId && (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-white/70 uppercase tracking-widest font-mono">
                {userId.substring(0, 8)}
              </span>
            </div>
          )}
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
          
          {/* LEFT: Matchmaking */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Active Matchmaking</h2>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {MOCK_ROOMS.map((room) => (
                <div key={room.id} className="group relative bg-black/40 hover:bg-white/10 border border-white/5 hover:border-[#0EA5E9]/50 rounded-xl p-4 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0EA5E9]/0 to-[#0EA5E9]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">{room.name}</h3>
                      <p className="text-xs text-white/50 mt-1">Ping: {room.ping}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-[#0EA5E9]">{room.players}/{room.max}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Track Selection & Modes */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8 h-full min-h-0">
            <div>
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Select Mode</h2>
              <div className="flex gap-4">
                {['single', 'multi', 'time'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m as any)}
                    className={`flex-1 py-4 px-6 rounded-xl font-bold uppercase text-sm border transition-all duration-300 ${
                      mode === m 
                        ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9] shadow-[0_0_20px_rgba(14,165,233,0.3)]' 
                        : 'border-white/10 hover:border-white/30 text-white/50 hover:text-white bg-white/5'
                    }`}
                  >
                    {m === 'single' ? 'Single Player' : m === 'multi' ? 'Multiplayer' : 'Time Trial'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Select Circuit</h2>
              {/* Carousel */}
              <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-center">
                {TRACKS.map(t => (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTrack(t.id)}
                    className={`relative min-w-[280px] h-full max-h-[300px] rounded-2xl cursor-pointer border-2 transition-all duration-300 overflow-hidden flex flex-col justify-end p-6 ${
                      track === t.id 
                        ? 'border-[#0EA5E9] shadow-[0_0_30px_rgba(14,165,233,0.3)]' 
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-30`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {track === t.id && (
                      <div className="absolute top-4 right-4 bg-[#0EA5E9] text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                        Selected
                      </div>
                    )}
                    
                    <h3 className="relative z-10 text-3xl font-black italic tracking-tighter text-white">{t.name}</h3>
                    <p className="relative z-10 text-xs text-white/70 uppercase tracking-widest mt-1">Circuit Length: 5.8km</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              onClick={onStart}
              variant="primary"
              size="lg"
              className="w-full h-16 text-xl font-black italic tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)]"
            >
              INITIALIZE IGNITION
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
