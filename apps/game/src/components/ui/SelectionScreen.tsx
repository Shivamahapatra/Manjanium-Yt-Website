import React, { useState } from 'react';

export function SelectionScreen({ onStart }: { onStart: () => void }) {
  const [mode, setMode] = useState<'single' | 'multi' | 'time'>('single');
  const [track, setTrack] = useState('monza');

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-md">
      <div className="bg-black/60 p-8 rounded-2xl border border-neutral-800 w-full max-w-2xl">
        <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-8 text-center">
          PADDOCK SIMULATOR
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-widest">Select Mode</h2>
            <div className="flex gap-4">
              {['single', 'multi', 'time'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m as any)}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold uppercase text-sm border transition-all ${
                    mode === m ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-neutral-700 hover:border-neutral-500 text-neutral-300'
                  }`}
                >
                  {m === 'single' ? 'Single Player' : m === 'multi' ? 'Multiplayer' : 'Time Trial'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-widest">Select Track</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['monza', 'monaco', 'spa', 'austin', 'silverstone'].map(t => (
                <button
                  key={t}
                  onClick={() => setTrack(t)}
                  className={`py-2 px-3 rounded-lg font-bold uppercase text-xs border transition-all ${
                    track === t ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-neutral-700 hover:border-neutral-500 text-neutral-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full py-4 mt-4 bg-white text-black font-black italic text-xl uppercase rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Drive
          </button>
        </div>
      </div>
    </div>
  );
}
