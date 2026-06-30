'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGamePhysics } from '@/hooks/useGamePhysics'
import { useSimulatorGame } from '@/hooks/useSimulatorGame'

export default function GameHUD() {
  const { carState, lapData, currentLap, bestLapTime, throttle, brake, isRacing } = useGamePhysics()
  const { session } = useSimulatorGame()

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
  }

  const currentLapTime = useMemo(() => {
    if (!isRacing || !lapData.start_time) return 0
    return Date.now() - lapData.start_time
  }, [isRacing, lapData.start_time])

  return (
    <>
      {/* Speedometer - Bottom Left */}
      <motion.div
        className="fixed bottom-6 left-6 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#FBBF24]/50 rounded-lg p-4 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-4xl font-bold text-[#FBBF24] font-mono">
          {Math.round(carState.speed_kmh)}
        </div>
        <div className="text-xs text-[#6B7280] mt-1">km/h</div>
      </motion.div>

      {/* Gear Display - Center Bottom */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#FBBF24]/50 rounded-lg p-6 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-6xl font-bold text-[#FBBF24] font-heading">
          {carState.gear}
        </div>
        <div className="text-xs text-[#6B7280] text-center mt-2">GEAR</div>
        <div className="text-xs text-[#FBBF24] text-center mt-1 font-mono">
          {Math.round(carState.rpm)} RPM
        </div>
      </motion.div>

      {/* Lap Timer - Top Right */}
      <motion.div
        className="fixed top-6 right-6 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#FBBF24]/50 rounded-lg p-4 z-40 space-y-3 min-w-48"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Current Lap */}
        <div>
          <div className="text-xs text-[#6B7280] uppercase">Lap {currentLap}</div>
          <div className="text-2xl font-bold text-[#FBBF24] font-mono">
            {formatTime(currentLapTime)}
          </div>
        </div>

        {/* Best Lap */}
        {bestLapTime !== null && (
          <>
            <div className="border-t border-[#333333]" />
            <div>
              <div className="text-xs text-[#6B7280] uppercase">Best Lap</div>
              <div className="text-lg font-bold text-[#10B981] font-mono">
                {formatTime(bestLapTime)}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Throttle & Brake Bars - Top Left */}
      <motion.div
        className="fixed top-6 left-6 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#FBBF24]/50 rounded-lg p-4 z-40 flex gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Throttle */}
        <div className="flex flex-col items-center">
          <div className="w-2 h-24 bg-[#1F2937] rounded border border-[#333333] overflow-hidden">
            <motion.div
              className="w-full bg-[#10B981]"
              animate={{ height: `${throttle * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
          <div className="text-xs text-[#6B7280] mt-2">THR</div>
        </div>

        {/* Brake */}
        <div className="flex flex-col items-center">
          <div className="w-2 h-24 bg-[#1F2937] rounded border border-[#333333] overflow-hidden">
            <motion.div
              className="w-full bg-[#EF4444]"
              animate={{ height: `${brake * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
          <div className="text-xs text-[#6B7280] mt-2">BRK</div>
        </div>
      </motion.div>

      {/* Track Info - Top Center */}
      <motion.div
        className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#FBBF24]/50 rounded-lg px-6 py-3 z-40 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-sm font-bold text-white">{session?.track.name}</div>
        <div className="text-xs text-[#6B7280] mt-1">
          Laps: {currentLap} / {session?.numberOfLaps}
        </div>
      </motion.div>

      {/* Controls Help - Bottom Center (fade out after 5s) */}
      <motion.div
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 text-center text-xs text-[#6B7280] z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        exit={{ opacity: 0 }}
      >
        W/↑ Throttle | S/↓ Brake | A/D / ← → Steering | ESC Pause
      </motion.div>
    </>
  )
}
