'use client'

import { useState, useEffect, useCallback } from 'react'
import FotmobMatchCard from './FotmobMatchCard'

interface FotmobLiveMatchesProps {
  filterLive?: boolean
  maxLeagues?: number
  date?: string
}

export default function FotmobLiveMatches({
  filterLive = false,
  maxLeagues = 10,
  date,
}: FotmobLiveMatchesProps) {
  const [leagues, setLeagues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMatches = useCallback(async () => {
    try {
      const dateStr = date ||
        new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const res = await fetch(
        `/api/football/fotmob/matches?date=${dateStr}`,
        { cache: 'no-store' }
      )
      const data = await res.json()

      let leagueData = data.leagues || []

      if (filterLive) {
        leagueData = leagueData
          .map((league: any) => ({
            ...league,
            matches: league.matches.filter((m: any) => m.live || m.started),
          }))
          .filter((league: any) => league.matches.length > 0)
      }

      setLeagues(leagueData.slice(0, maxLeagues))
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('Failed to fetch matches')
    } finally {
      setLoading(false)
    }
  }, [date, filterLive, maxLeagues])

  useEffect(() => {
    fetchMatches()
    // Refresh every 30 seconds
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [fetchMatches])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[#1F2937] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-[#EF4444]">
        ⚠️ {error}
        <button
          onClick={fetchMatches}
          className="block mx-auto mt-2 text-sm text-[#10B981]"
        >
          Retry
        </button>
      </div>
    )
  }

  if (leagues.length === 0) {
    return (
      <div className="text-center py-8 text-[#6B7280]">
        {filterLive ? 'No live matches right now' : 'No matches today'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      {filterLive && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs text-[#10B981] font-bold uppercase tracking-wider">
            Live Now
          </span>
          {lastUpdated && (
            <span className="text-xs text-[#6B7280] ml-auto">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {leagues.map((league) => (
        <div key={league.league_id} className="space-y-2">
          {/* League Header */}
          <div className="flex items-center gap-2 pb-1 border-b border-[#1F2937]">
            <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">
              {league.country && `${league.country} · `}{league.league_name}
            </span>
            <span className="text-xs text-[#6B7280] ml-auto">
              {league.matches.filter((m: any) => m.live).length > 0 && (
                <span className="text-[#10B981]">
                  {league.matches.filter((m: any) => m.live).length} live
                </span>
              )}
            </span>
          </div>

          {/* Matches */}
          <div className="space-y-2">
            {league.matches.map((match: any) => (
              <FotmobMatchCard key={match.match_id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
