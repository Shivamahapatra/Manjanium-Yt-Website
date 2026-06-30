import React from 'react';

export function GameHUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      <div className="flex justify-between items-start">
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded border border-white/10 text-white font-mono">
          <div className="text-xs text-neutral-400">LAP</div>
          <div className="text-2xl font-bold">1 / 5</div>
        </div>
        
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded border border-white/10 text-white font-mono text-right">
          <div className="text-xs text-neutral-400">DELTA</div>
          <div className="text-xl font-bold text-green-400">-0.240</div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="bg-black/50 backdrop-blur p-4 rounded border border-white/10 text-white font-mono w-48">
          <div className="text-xs text-neutral-400 mb-1">TIRE WEAR</div>
          <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
            <div className="h-full bg-green-500 w-[95%]"></div>
          </div>
          
          <div className="text-xs text-neutral-400 mt-3 mb-1">ERS BATTERY (T)</div>
          <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
            <div className="h-full bg-yellow-500 w-[80%]"></div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur px-6 py-4 rounded border border-white/10 text-white font-mono text-center flex items-center gap-6">
          <div>
            <div className="text-xs text-neutral-400">SPEED</div>
            <div className="text-4xl font-black italic">312 <span className="text-sm text-neutral-500">KM/H</span></div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div>
            <div className="text-xs text-neutral-400">GEAR</div>
            <div className="text-5xl font-black italic text-yellow-500">7</div>
          </div>
        </div>
      </div>
    </div>
  );
}
