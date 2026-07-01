'use client'

import { useGamePhysics } from '@/store/telemetry'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { SettingsModal } from './SettingsModal'

export default function GameHUD() {
  const {
    speed, gear, rpm,
    currentLap, totalLaps,
    tireWear, battery,
    ersActive, drsActive, drsAvailable,
    bestLapTime, currentLapTime,
  } = useGamePhysics()
  
  const [showSettings, setShowSettings] = useState(false)

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    const ms2 = Math.floor((ms % 1000) / 10)
    return `${m}:${String(s).padStart(2, '0')}.${String(ms2).padStart(2, '0')}`
  }

  const tireColor = tireWear > 60 ? '#10B981' : tireWear > 30 ? '#FBBF24' : '#EF4444'
  const batteryColor = battery > 50 ? '#10B981' : battery > 20 ? '#FBBF24' : '#EF4444'

  return (
    <>
      {/* Settings Button */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#333333] rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7280]"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </div>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* TOP LEFT: Lap Counter */}
      <div className="fixed top-4 left-4 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#333333] rounded-lg p-3 z-40">
        <div className="text-xs text-[#6B7280]">LAP</div>
        <div className="text-3xl font-bold text-white">
          {currentLap}
          <span className="text-lg text-[#6B7280]"> / {totalLaps}</span>
        </div>
      </div>

      {/* TOP RIGHT: Delta + Settings */}
      <div className="fixed top-4 right-16 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#333333] rounded-lg p-3 z-40">
        <div className="text-xs text-[#6B7280]">BEST LAP</div>
        <div className="text-lg font-mono font-bold text-[#FBBF24]">
          {bestLapTime ? formatTime(bestLapTime) : '--:--.--'}
        </div>
        <div className="text-xs text-[#6B7280] mt-1">CURRENT</div>
        <div className="text-sm font-mono text-white">
          {formatTime(currentLapTime)}
        </div>
      </div>

      {/* BOTTOM LEFT: ERS + DRS */}
      <div className="fixed bottom-4 left-4 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#333333] rounded-lg p-4 z-40 space-y-3 min-w-40">
        {/* ERS Battery */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6B7280]">ERS (SHIFT)</span>
            <span style={{ color: batteryColor }}>{Math.round(battery)}%</span>
          </div>
          <div className="w-full h-2 bg-[#1F2937] rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{ backgroundColor: batteryColor }}
              animate={{ width: `${battery}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          {ersActive && (
            <div className="text-xs text-[#FBBF24] mt-1 font-bold animate-pulse">
              ⚡ BOOST ACTIVE
            </div>
          )}
        </div>

        {/* Tire Wear */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6B7280]">TIRES</span>
            <span style={{ color: tireColor }}>{Math.round(tireWear)}%</span>
          </div>
          <div className="w-full h-2 bg-[#1F2937] rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{ backgroundColor: tireColor }}
              animate={{ width: `${tireWear}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* DRS */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">DRS (SPACE)</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            drsActive
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50'
              : drsAvailable
              ? 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/50'
              : 'bg-[#1F2937] text-[#6B7280] border border-[#333333]'
          }`}>
            {drsActive ? 'OPEN' : drsAvailable ? 'READY' : 'DISABLED'}
          </span>
        </div>
      </div>

      {/* BOTTOM RIGHT: Speed + Gear */}
      <div className="fixed bottom-4 right-4 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#333333] rounded-lg p-4 z-40">
        <div className="flex items-end gap-6">
          <div>
            <div className="text-xs text-[#6B7280] mb-1">SPEED</div>
            <div className="text-5xl font-bold font-mono text-white">
              {Math.round(speed)}
            </div>
            <div className="text-xs text-[#6B7280]">KM/H</div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] mb-1">GEAR</div>
            <div className="text-5xl font-bold font-mono text-[#FBBF24]">
              {gear}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs text-[#6B7280]">RPM</div>
          <div className="w-full h-1.5 bg-[#1F2937] rounded overflow-hidden mt-1">
            <motion.div
              className="h-full bg-[#EF4444] rounded"
              animate={{ width: `${(rpm / 15000) * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
