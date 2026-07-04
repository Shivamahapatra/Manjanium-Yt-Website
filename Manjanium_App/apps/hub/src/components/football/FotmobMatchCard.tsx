'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FotmobMatchDetail from './FotmobMatchDetail'

interface MatchCardProps {
  match: {
    match_id: string
    home_team: string
    home_team_id: string
    home_flag?: string
    home_score: number | null
    away_team: string
    away_team_id: string
    away_flag?: string
    away_score: number | null
    status: string
    stage?: string
    started: boolean
    finished: boolean
    live: boolean
    kickoff: string
    minute: string | null
  }
}

export default function FotmobMatchCard({ match }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [matchDetail, setMatchDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const handleExpand = async () => {
    if (!match.started) return
    setExpanded(!expanded)

    if (!matchDetail && !expanded) {
      setLoadingDetail(true)
      try {
        const res = await fetch(
          `/api/football/fotmob/match/${match.match_id}`
        )
        const data = await res.json()
        setMatchDetail(data)
      } catch {
        console.error('Failed to load match detail')
      } finally {
        setLoadingDetail(false)
      }
    }
  }

  return (
    <motion.div
      className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#1F2937] rounded-lg overflow-hidden hover:border-[#10B981]/30 transition-colors"
      whileHover={{ y: -1 }}
    >
      {/* Match Header */}
      <div
        className={`p-4 ${match.started ? 'cursor-pointer' : ''}`}
        onClick={handleExpand}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-3">
            <img
              src={match.home_flag || `https://flagcdn.com/w40/${match.home_team_id ? '' : ''}.png`}
              alt={match.home_team}
              className="w-6 h-4 object-cover rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className={`font-bold text-sm ${
              match.finished && (match.home_score ?? 0) > (match.away_score ?? 0)
                ? 'text-white'
                : 'text-[#9CA3AF]'
            }`}>
              {match.home_team}
            </span>
          </div>

          {/* Score / Status */}
          <div className="text-center min-w-20">
            {match.started ? (
              <div className="flex items-center gap-2 justify-center">
                <span className="text-2xl font-bold text-white font-mono">
                  {match.home_score ?? 0}
                </span>
                <span className="text-[#6B7280]">-</span>
                <span className="text-2xl font-bold text-white font-mono">
                  {match.away_score ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-center">
                {match.kickoff ? (
                  <>
                    <div className="text-xs text-[#6B7280]">
                      {new Date(match.kickoff).toLocaleDateString('en-GB', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {new Date(match.kickoff).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-[#6B7280]">TBD</span>
                )}
                {match.stage && (
                  <div className="text-xs text-[#FBBF24] mt-1">{match.stage}</div>
                )}
              </div>
            )}

            {/* Live indicator */}
            {match.live && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#10B981] font-bold">
                  {match.minute || 'LIVE'}
                </span>
              </div>
            )}
            {match.finished && (
              <div className="text-xs text-[#6B7280] mt-1">FT</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center gap-3 justify-end">
            <span className={`font-bold text-sm ${
              match.finished && (match.away_score ?? 0) > (match.home_score ?? 0)
                ? 'text-white'
                : 'text-[#9CA3AF]'
            }`}>
              {match.away_team}
            </span>
            <img
              src={match.away_flag || `https://flagcdn.com/w40/${match.away_team_id ? '' : ''}.png`}
              alt={match.away_team}
              className="w-6 h-4 object-cover rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>

          {/* Expand indicator */}
          {match.started && (
            <div className={`text-[#6B7280] text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </div>
          )}
        </div>
      </div>

      {/* Expanded Match Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#1F2937] overflow-hidden"
          >
            {loadingDetail ? (
              <div className="p-4 flex items-center justify-center gap-2 text-[#6B7280] text-sm">
                <div className="w-4 h-4 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                Loading match details...
              </div>
            ) : matchDetail ? (
              <FotmobMatchDetail data={matchDetail} />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
