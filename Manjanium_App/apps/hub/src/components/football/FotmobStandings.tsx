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

        // Handle off-season
        if (data.off_season || data.standings?.length === 0) {
          setError(data.message || 'League is currently in off-season (July). Season data returns in August.')
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
      {/* League Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(FOTMOB_LEAGUES).slice(0, 6).map(([key, league]) => (
          <button
            key={key}
            onClick={() => setSelectedLeague(String(league.id))}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              selectedLeague === String(league.id)
                ? 'bg-success text-black'
                : 'bg-[#1F2937] text-[#6B7280] hover:text-white'
            }`}
          >
            {league.name}
          </button>
        ))}
      </div>

      {/* League Header */}
      {meta && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{meta.league_name}</h3>
          <span className="text-xs text-[#6B7280]">{meta.season}</span>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-10 bg-[#1F2937] rounded animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-6 space-y-2">
          <div className="text-3xl">🌴</div>
          <div className="text-[#FBBF24] font-bold text-sm">Off-Season</div>
          <p className="text-[#6B7280] text-xs max-w-xs mx-auto">{error}</p>
        </div>
      )}

      {!loading && !error && standings.length === 0 && (
        <div className="text-center py-8 space-y-2">
          <div className="text-[#6B7280]">No standings available</div>
          <div className="text-xs text-[#333333]">
            Standings are not available for knockout stages.
            Try Premier League or La Liga.
          </div>
        </div>
      )}

      {!loading && standings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6B7280] text-xs border-b border-[#1F2937]">
                <th className="text-left py-2 w-8">#</th>
                <th className="text-left py-2">Team</th>
                <th className="text-center py-2 w-8">P</th>
                <th className="text-center py-2 w-8">W</th>
                <th className="text-center py-2 w-8">D</th>
                <th className="text-center py-2 w-8">L</th>
                <th className="text-center py-2 w-12">GD</th>
                <th className="text-center py-2 w-10">Pts</th>
                {showXG && (
                  <>
                    <th className="text-center py-2 w-12 text-[#FBBF24]">xG</th>
                    <th className="text-center py-2 w-12 text-alert">xGA</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {standings.map((team, i) => (
                <motion.tr
                  key={team.team_id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#1F2937]/50 hover:bg-[#1F2937]/30 transition-colors"
                >
                  <td className="py-2 text-[#6B7280] text-xs">{team.position}</td>
                  <td className="py-2">
                    <span className="font-bold text-white">{team.team}</span>
                  </td>
                  <td className="py-2 text-center text-muted-light">{team.played}</td>
                  <td className="py-2 text-center text-success">{team.wins}</td>
                  <td className="py-2 text-center text-[#FBBF24]">{team.draws}</td>
                  <td className="py-2 text-center text-alert">{team.losses}</td>
                  <td className="py-2 text-center text-muted-light">
                    {(team.goal_diff || 0) > 0 ? `+${team.goal_diff}` : team.goal_diff}
                  </td>
                  <td className="py-2 text-center font-bold text-white">{team.points}</td>
                  {showXG && (
                    <>
                      <td className="py-2 text-center text-[#FBBF24] font-mono text-xs">
                        {team.xg_for ? Number(team.xg_for).toFixed(1) : '-'}
                      </td>
                      <td className="py-2 text-center text-alert font-mono text-xs">
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
