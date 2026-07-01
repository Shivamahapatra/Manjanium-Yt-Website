'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getLeaderboard,
  formatLapTime,
  type LeaderboardEntry,
} from '@/lib/leaderboard'

interface LeaderboardProps {
  trackId: string
  weather?: string
  currentUserId?: string
  highlightUserId?: string
}

export default function Leaderboard({
  trackId,
  weather = 'clear',
  currentUserId,
  highlightUserId,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      const data = await getLeaderboard(trackId, weather, 10)
      setEntries(data)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [trackId, weather])

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-[#1F2937] rounded animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-[#6B7280] py-8">
        No times recorded yet. Be the first!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {entries.map((entry, index) => {
          const isCurrentUser = entry.user_id === (highlightUserId || currentUserId)
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                isCurrentUser
                  ? 'bg-[#FBBF24]/10 border-[#FBBF24]/50'
                  : 'bg-[#1F2937] border-[#333333]'
              }`}
            >
              {/* Position */}
              <div className="flex items-center gap-3 w-8">
                {medal ? (
                  <span className="text-lg">{medal}</span>
                ) : (
                  <span className="text-[#6B7280] font-mono text-sm">
                    {entry.position}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 ml-2">
                <p className={`font-bold text-sm ${
                  isCurrentUser ? 'text-[#FBBF24]' : 'text-white'
                }`}>
                  {entry.user_name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-[#FBBF24]/70">(You)</span>
                  )}
                </p>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className={`font-mono font-bold ${
                  index === 0 ? 'text-[#FBBF24]' : 'text-white'
                }`}>
                  {formatLapTime(entry.best_lap_time)}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
