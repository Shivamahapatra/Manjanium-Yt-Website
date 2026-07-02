'use client'

import { useGamePhysics } from '@/store/telemetry'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { SettingsModal } from './SettingsModal'

// SVG Gauge Component
const CircularGauge = ({ 
  value, 
  max, 
  radius, 
  strokeWidth, 
  color, 
  bgColor = '#1F2937' 
}: { 
  value: number, 
  max: number, 
  radius: number, 
  strokeWidth: number, 
  color: string,
  bgColor?: string
}) => {
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  // We want an arc that starts from bottom left to bottom right. Let's make it 270 degrees.
  const arcLength = circumference * 0.75; 
  const strokeDashoffset = arcLength - (percentage * arcLength);

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius*2 + strokeWidth*2, height: radius*2 + strokeWidth*2 }}>
      <svg width={radius*2 + strokeWidth*2} height={radius*2 + strokeWidth*2} className="transform rotate-135">
        {/* Background Arc */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="transparent"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <motion.circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

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
  
  // RPM color mapping (Green -> Yellow -> Red)
  const rpmRatio = rpm / 15000;
  const rpmColor = rpmRatio > 0.9 ? '#EF4444' : rpmRatio > 0.7 ? '#FBBF24' : '#10B981';

  return (
    <>
      {/* Settings Button */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 bg-[#0a0a0a]/70 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </div>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* TOP LEFT: Lap Counter */}
      <div className="fixed top-4 left-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-40 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">LAP</div>
        <div className="text-4xl font-black italic text-white flex items-baseline">
          {currentLap}
          <span className="text-xl text-white/40 font-bold ml-1"> / {totalLaps}</span>
        </div>
      </div>

      {/* TOP RIGHT: Delta */}
      <div className="fixed top-4 right-20 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-40 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex gap-6">
        <div>
          <div className="text-[10px] text-[#0EA5E9] font-bold uppercase tracking-widest mb-1">BEST LAP</div>
          <div className="text-xl font-mono font-bold text-white">
            {bestLapTime ? formatTime(bestLapTime) : '--:--.--'}
          </div>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">CURRENT</div>
          <div className="text-xl font-mono text-white/80">
            {formatTime(currentLapTime)}
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT: ERS + DRS */}
      <div className="fixed bottom-6 left-6 z-40 space-y-4 min-w-[240px]">
        
        {/* DRS */}
        <div className={`backdrop-blur-xl border rounded-xl p-3 flex items-center justify-between transition-colors duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] ${
            drsActive
              ? 'bg-[#10B981]/20 border-[#10B981]/50'
              : drsAvailable
              ? 'bg-[#FBBF24]/20 border-[#FBBF24]/50'
              : 'bg-black/50 border-white/10'
          }`}>
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">DRS (G)</span>
          <span className={`text-xs font-black uppercase tracking-wider ${drsActive ? 'text-[#10B981]' : drsAvailable ? 'text-[#FBBF24]' : 'text-white/30'}`}>
            {drsActive ? 'ACTIVE' : drsAvailable ? 'READY' : 'DISABLED'}
          </span>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          {/* ERS Battery */}
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="text-white/70">ERS BATTERY (T)</span>
              <span style={{ color: batteryColor }}>{Math.round(battery)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: batteryColor }}
                animate={{ width: `${battery}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
            {ersActive && (
              <div className="text-[10px] text-[#0EA5E9] mt-2 font-black italic uppercase tracking-widest animate-pulse">
                ⚡ DEPLOYING KINETIC ENERGY
              </div>
            )}
          </div>

          {/* Tire Wear */}
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="text-white/70">TIRE LIFE</span>
              <span style={{ color: tireColor }}>{Math.round(tireWear)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: tireColor }}
                animate={{ width: `${tireWear}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: SVG Speedometer Gauge */}
      <div className="fixed bottom-6 right-6 z-40 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="relative flex items-center justify-center">
          
          {/* Outer RPM Gauge */}
          <CircularGauge value={rpm} max={15000} radius={80} strokeWidth={6} color={rpmColor} />
          
          {/* Inner Speed Gauge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CircularGauge value={speed} max={350} radius={65} strokeWidth={4} color="#0EA5E9" bgColor="rgba(255,255,255,0.05)" />
          </div>

          {/* Center Text Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-black italic font-mono text-white tracking-tighter leading-none mt-4">
              {Math.round(speed)}
            </div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              KM/H
            </div>
            <div className="mt-2 text-2xl font-black text-[#FBBF24]">
              {gear}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
