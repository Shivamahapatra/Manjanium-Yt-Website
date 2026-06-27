'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { WeatherType, DifficultyLevel } from '@/types/simulator'

interface GameSettingsProps {
  difficulty: DifficultyLevel
  weather: WeatherType
  laps: number
  onDifficultyChange: (difficulty: DifficultyLevel) => void
  onWeatherChange: (weather: WeatherType) => void
  onLapsChange: (laps: number) => void
}

export default function GameSettings({
  difficulty,
  weather,
  laps,
  onDifficultyChange,
  onWeatherChange,
  onLapsChange,
}: GameSettingsProps) {
  return (
    <div className="space-y-6 bg-[#0a0a0a]/80 backdrop-blur-md border border-[#FBBF24]/20 rounded-lg p-6">
      {/* Difficulty */}
      <div>
        <label className="block text-sm font-bold text-[#FBBF24] mb-3">
          Difficulty
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['easy', 'medium', 'hard', 'pro'] as DifficultyLevel[]).map((level) => (
            <motion.button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={`py-2 rounded-lg text-sm font-bold transition-colors capitalize ${
                difficulty === level
                  ? 'bg-[#FBBF24] text-black'
                  : 'bg-[#1F2937] text-[#6B7280] hover:bg-[#374151]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {level}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div>
        <label className="block text-sm font-bold text-[#FBBF24] mb-3">
          Weather
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['clear', 'rain', 'mixed'] as WeatherType[]).map((w) => (
            <motion.button
              key={w}
              onClick={() => onWeatherChange(w)}
              className={`py-2 rounded-lg text-sm font-bold transition-colors capitalize ${
                weather === w
                  ? 'bg-[#FBBF24] text-black'
                  : 'bg-[#1F2937] text-[#6B7280] hover:bg-[#374151]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {w === 'clear' && '☀️'} {w === 'rain' && '🌧️'} {w === 'mixed' && '⛅'}
              <span className="ml-1 capitalize">{w}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Laps */}
      <div>
        <label className="block text-sm font-bold text-[#FBBF24] mb-3">
          Number of Laps: {laps}
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={laps}
          onChange={(e) => onLapsChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}
