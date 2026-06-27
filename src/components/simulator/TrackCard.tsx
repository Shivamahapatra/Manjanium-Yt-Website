'use client'

import { motion } from 'framer-motion'
import { Track } from '@/types/simulator'

interface TrackCardProps {
  track: Track
  onSelect: (track: Track) => void
  isSelected?: boolean
}

export default function TrackCard({ track, onSelect, isSelected }: TrackCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(track)}
      className={`relative overflow-hidden rounded-lg border-2 transition-all transform hover:scale-105 ${
        isSelected
          ? 'border-[#FBBF24] bg-[#FBBF24]/10'
          : 'border-[#333333] bg-[#0a0a0a]/80 hover:border-[#FBBF24]/50'
      }`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Track image placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-[#1F2937] to-[#131313] flex items-center justify-center">
        <div className="text-4xl font-bold text-[#6B7280]">{track.shortCode}</div>
      </div>

      {/* Track info */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-white text-sm">{track.name}</h3>
        <p className="text-xs text-[#6B7280]">{track.location}</p>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#333333]">
          <div>
            <p className="text-xs text-[#6B7280]">Laps</p>
            <p className="font-bold text-[#FBBF24]">{track.laps}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Length</p>
            <p className="font-bold text-white text-sm">{track.length_km}km</p>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#FBBF24] text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          ✓
        </div>
      )}
    </motion.button>
  )
}
