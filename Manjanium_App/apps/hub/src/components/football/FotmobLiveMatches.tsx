'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight, Calendar as CalendarIcon, Activity } from 'lucide-react'
import FotmobMatchCard from './FotmobMatchCard'

interface FotmobLiveMatchesProps {
  filterLive?: boolean
  maxLeagues?: number
  date?: string
  onMatchesLoaded?: (matches: any[]) => void
}

export default function FotmobLiveMatches({
  filterLive = false,
  maxLeagues = 15,
  date: initialDate,
  onMatchesLoaded,
}: FotmobLiveMatchesProps) {
  const [leagues, setLeagues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate
    const now = new Date()
    return now.toISOString().split('T')[0].replace(/-/g, '')
  })

  // Accordion collapsed state for leagues
  const [collapsedLeagues, setCollapsedLeagues] = useState<Record<string, boolean>>({})

  // Quick Date Helpers
  const dateButtons = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const formatStr = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '')

    return [
      { label: 'Yesterday', value: formatStr(yesterday) },
      { label: 'Today', value: formatStr(today) },
      { label: 'Tomorrow', value: formatStr(tomorrow) },
    ]
  }, [])

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/football/fotmob/matches?date=${selectedDate}&expand=3`,
        { cache: 'no-store' }
      )
      
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        return
      }

      let leagueData = data.leagues || []

      if (filterLive) {
        leagueData = leagueData
          .map((league: any) => ({
            ...league,
            matches: league.matches.filter((m: any) => m.live),
          }))
          .filter((league: any) => league.matches.length > 0)
      }

      const slicedLeagues = leagueData.slice(0, maxLeagues)
      setLeagues(slicedLeagues)
      setLastUpdated(new Date())
      setError(null)

      if (onMatchesLoaded) {
        const allMatches = slicedLeagues.flatMap((l: any) => l.matches || [])
        onMatchesLoaded(allMatches)
      }
    } catch (err) {
      setError('Failed to fetch matches')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, filterLive, maxLeagues, onMatchesLoaded])

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [fetchMatches])

  const toggleLeagueAccordion = (leagueId: string) => {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }))
  }

  // Format date for display picker
  const formattedDisplayDate = useMemo(() => {
    if (selectedDate.length === 8) {
      const y = selectedDate.substring(0, 4)
      const m = selectedDate.substring(4, 6)
      const d = selectedDate.substring(6, 8)
      return `${y}-${m}-${d}`
    }
    return selectedDate
  }, [selectedDate])

  return (
    <div className="space-y-6">
      {/* Date Navigator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a]/90 border border-[#1F2937] p-3 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          {dateButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setSelectedDate(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === btn.value
                  ? 'bg-success text-black shadow-md shadow-success/20'
                  : 'bg-[#1F2937]/60 text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Custom Date Input Picker */}
        <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-3 py-1 rounded-lg">
          <CalendarIcon className="w-3.5 h-3.5 text-[#8B949E]" />
          <input
            type="date"
            value={formattedDisplayDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value.replace(/-/g, ''))
              }
            }}
            className="bg-transparent text-xs text-white font-mono outline-none border-none cursor-pointer"
          />
        </div>
      </div>

      {/* Live status bar header */}
      {filterLive && (
        <div className="flex items-center gap-2 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success font-bold uppercase tracking-wider">
            Live Matches Right Now
          </span>
          {lastUpdated && (
            <span className="text-xs text-[#6B7280] ml-auto">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && leagues.length === 0 && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-[#1F2937] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-alert bg-alert/10 border border-alert/30 rounded-xl p-4">
          ⚠️ {error}
          <button
            onClick={fetchMatches}
            className="block mx-auto mt-3 px-4 py-1.5 bg-success text-black rounded-lg font-bold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && leagues.length === 0 && !error && (
        <div className="text-center py-12 border border-[#1F2937] rounded-xl bg-[#0a0a0a]/50 p-6 space-y-2">
          <Activity className="w-8 h-8 text-[#6B7280] mx-auto animate-bounce" />
          <div className="text-[#9CA3AF] font-bold text-sm">
            {filterLive ? 'No live matches in progress right now' : 'No matches scheduled for this date'}
          </div>
          <p className="text-xs text-[#6B7280]">
            Try selecting a different date from the navigator above.
          </p>
        </div>
      )}

      {/* Collapsible Accordion League Feed */}
      {leagues.map((league) => {
        const isCollapsed = collapsedLeagues[league.league_id] || false
        const liveCount = league.matches.filter((m: any) => m.live).length

        return (
          <div
            key={league.league_id}
            className="border border-[#1F2937] bg-[#0a0a0a]/80 backdrop-blur-md rounded-xl overflow-hidden shadow-sm"
          >
            {/* Accordion League Header */}
            <button
              onClick={() => toggleLeagueAccordion(league.league_id)}
              className="w-full flex items-center justify-between p-3.5 bg-[#161B22]/80 hover:bg-[#161B22] transition-colors text-left border-b border-[#1F2937]"
            >
              <div className="flex items-center gap-2.5">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-[#8B949E]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8B949E]" />
                )}
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  {league.country && `${league.country} · `}{league.league_name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {liveCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold border border-success/40">
                    🔴 {liveCount} LIVE
                  </span>
                )}
                <span className="text-xs text-[#8B949E] font-mono">
                  {league.matches.length} {league.matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
            </button>

            {/* Accordion Body: Match Rows */}
            {!isCollapsed && (
              <div className="p-3 space-y-2.5">
                {league.matches.map((match: any) => (
                  <FotmobMatchCard key={match.match_id} match={match} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

