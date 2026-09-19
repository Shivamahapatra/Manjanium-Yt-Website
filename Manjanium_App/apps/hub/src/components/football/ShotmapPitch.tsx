'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface UnderstatShot {
  id: string
  minute: number
  player: string
  x: number // 0 (own goal) to 1 (opponent goal)
  y: number // 0 (left touchline) to 1 (right touchline)
  xG: number // 0.00 to 0.99
  result: 'Goal' | 'SavedShot' | 'MissedShot' | 'MissedShots' | 'BlockedShot' | 'ShotOnPost' | string
  team: string
  shot_type?: string
  situation?: string
  player_assisted?: string
}

interface ShotmapPitchProps {
  shots: UnderstatShot[]
  homeTeam?: string
  awayTeam?: string
}

export default function ShotmapPitch({ shots, homeTeam, awayTeam }: ShotmapPitchProps) {
  const [activeShot, setActiveShot] = useState<UnderstatShot | null>(null)

  // Mapped to the Stitch Design System telemetry accent colors
  const getShotColor = (result: string) => {
    switch (result) {
      case 'Goal':
        return '#10B981' // Emerald 500
      case 'SavedShot':
        return '#38BDF8' // Sky 400
      case 'BlockedShot':
        return '#94A3B8' // Slate 400
      case 'ShotOnPost':
        return '#F59E0B' // Amber 500
      default:
        return '#F43F5E' // Rose 500 (Missed)
    }
  }

  const formatOutcome = (result: string) => {
    if (result === 'MissedShots') return 'Missed'
    return result.replace('Shot', '')
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-[#0B0E14] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden font-sans">
      {/* Telemetry HUD Overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none w-52 sm:w-60">
        <h3 className="text-gray-400 font-mono text-[10px] font-semibold tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          xG TELEMETRY
        </h3>

        <AnimatePresence mode="wait">
          {activeShot ? (
            <motion.div
              key={`shot-${activeShot.id}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="backdrop-blur-md bg-black/75 p-2.5 rounded-lg border border-gray-700/60 shadow-lg"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-bold text-xs truncate max-w-[140px]">{activeShot.player}</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">{activeShot.minute}&apos;</span>
              </div>
              <div className="flex flex-col gap-1 mt-1.5 border-t border-gray-700/50 pt-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-400">EXPECTED GOALS</span>
                  <span className="text-white font-bold">{activeShot.xG.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-gray-400">OUTCOME</span>
                  <span style={{ color: getShotColor(activeShot.result) }} className="font-semibold">
                    {formatOutcome(activeShot.result)}
                  </span>
                </div>
                {activeShot.player_assisted && (
                  <div className="flex justify-between text-[10px] font-mono border-t border-gray-800/80 pt-1 text-gray-400">
                    <span>ASSIST</span>
                    <span className="text-gray-300 truncate max-w-[110px]">{activeShot.player_assisted}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-[10px] font-mono italic px-1"
            >
              Hover over coordinate nodes for trajectory data.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend & Direction indicator */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none flex flex-col items-end gap-1">
        <span className="text-[9px] font-mono text-zinc-400 bg-black/50 px-2 py-0.5 rounded border border-zinc-800">
          ATTACKING ➔
        </span>
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Goal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" /> Saved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" /> Missed
          </span>
        </div>
      </div>

      {/* 
        SVG Canvas: 
        Real-world proportions mapped to viewBox
        Width = 68 meters. Length (Attacking Half) = 52.5 meters.
      */}
      <svg
        viewBox="0 0 68 52.5"
        className="w-full h-auto drop-shadow-xl"
        style={{ background: 'radial-gradient(circle at 50% 0%, #151a21 0%, #0B0E14 100%)' }}
      >
        {/* Pitch Outlines */}
        <g stroke="#2A313C" strokeWidth="0.2" fill="none">
          {/* Outer Boundary & Halfway Line */}
          <rect x="0" y="0" width="68" height="52.5" />
          <line x1="0" y1="52.5" x2="68" y2="52.5" />

          {/* Center Circle (Top arc visible at halfway line) */}
          <path d="M 24.85,52.5 A 9.15,9.15 0 0,1 43.15,52.5" />

          {/* Penalty Box (16.5m deep, 40.32m wide) */}
          <rect x="13.84" y="0" width="40.32" height="16.5" />

          {/* Six Yard Box (5.5m deep, 18.32m wide) */}
          <rect x="24.84" y="0" width="18.32" height="5.5" />

          {/* Goal Frame */}
          <rect x="30.34" y="-1.5" width="7.32" height="1.5" strokeWidth="0.4" stroke="#4B5563" fill="#111827" />

          {/* Penalty Spot (11m from goal line) */}
          <circle cx="34" cy="11" r="0.3" fill="#2A313C" />

          {/* D-Arc (9.15m radius from penalty spot) */}
          <path d="M 26.6875,16.5 A 9.15,9.15 0 0,1 41.3125,16.5" />
        </g>

        {/* Shot Coordinate Nodes */}
        {shots.map((shot, index) => {
          // Normalize coordinates defensively: accept both 0-1 and 0-100 formats
          const normX = shot.x > 1 ? shot.x / 100 : shot.x
          const normY = shot.y > 1 ? shot.y / 100 : shot.y

          // Normalize Understat 0-1 values directly to the 105x68m grid.
          // X = 1.0 is the opponent goal line.
          const cy = (1 - normX) * 105
          const cx = normY * 68

          // Exclude shots from own half to keep the half-pitch clean
          if (cy > 52.5 || cy < 0) return null

          // Scale node size exponentially based on xG quality
          const nodeRadius = 0.5 + shot.xG * 2.5

          return (
            <motion.circle
              key={shot.id || `shot-${index}`}
              cx={cx}
              cy={cy}
              r={nodeRadius}
              fill={getShotColor(shot.result)}
              stroke="#000"
              strokeWidth={0.15}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{
                delay: index * 0.03,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{
                scale: 1.6,
                opacity: 1,
                strokeWidth: 0.4,
                stroke: '#FFF',
              }}
              onMouseEnter={() => setActiveShot(shot)}
              onMouseLeave={() => setActiveShot(null)}
              className="cursor-crosshair drop-shadow-md"
            />
          )
        })}
      </svg>
    </div>
  )
}
