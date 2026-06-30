'use client'

import { motion } from 'framer-motion'
import { GameMode } from '@/types/simulator'

interface GameModeSelectorProps {
  selected: GameMode
  onSelect: (mode: GameMode) => void
}

export default function GameModeSelector({ selected, onSelect }: GameModeSelectorProps) {
  const modes: { id: GameMode; name: string; description: string; icon: string }[] = [
    {
      id: 'single-player',
      name: 'Single Player',
      description: 'Race against AI',
      icon: '🤖',
    },
    {
      id: 'multiplayer',
      name: 'Multiplayer',
      description: 'Race online with friends',
      icon: '👥',
    },
    {
      id: 'time-trial',
      name: 'Time Trial',
      description: 'Pure qualifying pace',
      icon: '⏱️',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selected === mode.id
              ? 'border-[#FBBF24] bg-[#FBBF24]/10'
              : 'border-[#333333] bg-[#0a0a0a]/80 hover:border-[#FBBF24]/50'
          }`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-3xl mb-2">{mode.icon}</div>
          <h3 className="font-bold text-white text-sm">{mode.name}</h3>
          <p className="text-xs text-[#6B7280] mt-1">{mode.description}</p>
        </motion.button>
      ))}
    </div>
  )
}
