import React, { useState } from 'react';
import { useTelemetryStore } from '../../store/telemetry';
import { Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { PostRacePodium } from './PostRacePodium';
import { ghostPlayer } from '../physics/VehicleController';

export function GameHUD() {
  const { speed, gear, lap, totalLaps, ersBattery, ersActive, drsAvailable, drsActive, raceFinished } = useTelemetryStore();
  const [showSettings, setShowSettings] = useState(false);
  const delta = -240; // mock delta for now

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-white font-mono shadow-lg">
            <div className="text-xs text-neutral-400 font-['Inter'] mb-1 tracking-wider">LAP</div>
            <div className="text-3xl font-black font-[Outfit]">{lap} <span className="text-lg text-neutral-500">/ {totalLaps}</span></div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-white font-mono text-right shadow-lg">
              <div className="text-xs text-neutral-400 font-['Inter'] mb-1 tracking-wider">DELTA</div>
              {ghostPlayer.hasGhost() ? (
                <div className="text-center">
                  <div className="text-xs text-[#6B7280]">vs GHOST</div>
                  <div className={`text-lg font-mono font-bold ${
                    delta < 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {delta < 0 ? '' : '+'}{(delta / 1000).toFixed(3)}s
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-[#10B981] font-[Outfit]">-0.240</div>
              )}
            </div>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="pointer-events-auto bg-black/60 hover:bg-[#1E1E1E] transition-colors p-3 rounded-xl border border-white/10 text-white shadow-lg"
            >
              <Settings className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="bg-black/60 backdrop-blur-md p-5 rounded-xl border border-white/10 text-white font-mono w-56 shadow-lg">
            {/* ERS */}
            <div className="flex justify-between items-end mb-2">
              <div className="text-xs text-neutral-400 font-['Inter'] tracking-wider">ERS (SHIFT)</div>
              {ersActive && <div className="text-[10px] text-yellow-400 font-bold animate-pulse">DEPLOYING</div>}
            </div>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-200 ${ersActive ? 'bg-yellow-400' : 'bg-yellow-500'}`} 
                style={{ width: `${ersBattery}%` }}
              />
            </div>
            
            {/* DRS */}
            <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <div className="text-xs text-neutral-400 font-['Inter'] tracking-wider">DRS (SPACE)</div>
              <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                drsActive ? 'bg-[#10B981] text-black' : 
                drsAvailable ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-500'
              }`}>
                {drsActive ? 'OPEN' : drsAvailable ? 'READY' : 'OFF'}
              </div>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-md px-8 py-5 rounded-xl border border-white/10 text-white font-mono text-center flex items-center gap-8 shadow-lg">
            <div>
              <div className="text-xs text-neutral-400 font-['Inter'] tracking-wider mb-1">SPEED</div>
              <div className="text-5xl font-black italic font-[Outfit]">{speed} <span className="text-lg text-neutral-500 not-italic">KM/H</span></div>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div>
              <div className="text-xs text-neutral-400 font-['Inter'] tracking-wider mb-1">GEAR</div>
              <div className="text-5xl font-black italic text-[#0EA5E9] font-[Outfit]">{gear}</div>
            </div>
          </div>
        </div>
      </div>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {raceFinished && <PostRacePodium />}
    </>
  );
}
