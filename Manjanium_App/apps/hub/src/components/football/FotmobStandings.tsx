'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FOTMOB_LEAGUES } from '@/lib/football-utils'

interface FotmobStandingsProps {
  leagueId?: string
  showXG?: boolean
}

export default function FotmobStandings({
  leagueId = '47',
  showXG = true,
}: FotmobStandingsProps) {
  const [standings, setStandings] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState(leagueId)

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/football/fotmob/league/${selectedLeague}`
        )
        const data = await res.json()
        setStandings(data.standings || [])
        setMeta(data)

        if (data.standings?.length === 0 && data.off_season) {
          setError(data.message || 'Standings unavailable for this league')
        }
      } catch {
        setError('Failed to load standings')
      } finally {
        setLoading(false)
      }
    }
    fetchStandings()
  }, [selectedLeague])

  return (
    <div className="space-y-4">
      {/* League Selector Buttons */}
      <div className="flex gap-2 flex-wrap bg-[#0a0a0a]/90 p-2 rounded-xl border border-[#1F2937]">
        {Object.entries(FOTMOB_LEAGUES).map(([key, league]) => (
          <button
            key={key}
            onClick={() => setSelectedLeague(String(league.id))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLeague === String(league.id)
                ? 'bg-success text-black shadow-sm shadow-success/20'
                : 'bg-[#1F2937]/50 text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'
            }`}
          >
            {league.name}
          </button>
        ))}
      </div>

      {/* League Header Metadata */}
      {meta && meta.league_name && (
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-white font-heading">{meta.league_name}</h3>
          <span className="text-xs text-[#8B949E] font-mono">{meta.season || '2024/2025'}</span>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-10 bg-[#1F2937] rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && standings.length === 0 && (
        <div className="text-center py-6 space-y-2 bg-[#0a0a0a]/40 border border-[#1F2937] rounded-xl p-4">
          <div className="text-2xl">🌴</div>
          <div className="text-[#FBBF24] font-bold text-sm">League Off-Season</div>
          <p className="text-[#6B7280] text-xs max-w-xs mx-auto">{error}</p>
        </div>
      )}

      {!loading && standings.length > 0 && (
        <div className="overflow-x-auto border border-[#1F2937] rounded-xl bg-[#0a0a0a]/80 backdrop-blur-md">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[#8B949E] text-[11px] font-bold uppercase tracking-wider border-b border-[#1F2937] bg-[#161B22]">
                <th className="text-left py-2.5 px-3 w-8">#</th>
                <th className="text-left py-2.5 px-3">Team</th>
                <th className="text-center py-2.5 px-2 w-8">MP</th>
                <th className="text-center py-2.5 px-2 w-8">W</th>
                <th className="text-center py-2.5 px-2 w-8">D</th>
                <th className="text-center py-2.5 px-2 w-8">L</th>
                <th className="text-center py-2.5 px-2 w-10">GD</th>
                <th className="text-center py-2.5 px-3 w-10 text-white font-bold">Pts</th>
                {showXG && (
                  <>
                    <th className="text-center py-2.5 px-2 w-12 text-[#FBBF24]">xG</th>
                    <th className="text-center py-2.5 px-2 w-12 text-alert">xGA</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {standings.map((team, i) => (
                <motion.tr
                  key={team.team_id || team.team || i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className="border-b border-[#1F2937]/50 hover:bg-[#161B22]/60 transition-colors"
                >
                  <td className="py-2.5 px-3 text-[#8B949E] text-xs font-mono">{team.position || i + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={team.badge || `https://images.fotmob.com/image_resources/logo/teamlogo/${team.team_id}_small.png`}
                        alt={team.team}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <span className="font-bold text-white text-xs sm:text-sm">{team.team}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-[#9CA3AF] text-xs font-mono">{team.played}</td>
                  <td className="py-2.5 px-2 text-center text-success text-xs font-mono">{team.wins}</td>
                  <td className="py-2.5 px-2 text-center text-[#FBBF24] text-xs font-mono">{team.draws}</td>
                  <td className="py-2.5 px-2 text-center text-alert text-xs font-mono">{team.losses}</td>
                  <td className="py-2.5 px-2 text-center text-[#9CA3AF] text-xs font-mono">
                    {(team.goal_diff || 0) > 0 ? `+${team.goal_diff}` : team.goal_diff}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-white text-xs font-mono bg-white/5">{team.points}</td>
                  {showXG && (
                    <>
                      <td className="py-2.5 px-2 text-center text-[#FBBF24] font-mono text-xs">
                        {team.xg_for ? Number(team.xg_for).toFixed(1) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center text-alert font-mono text-xs">
                        {team.xg_against ? Number(team.xg_against).toFixed(1) : '-'}
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

