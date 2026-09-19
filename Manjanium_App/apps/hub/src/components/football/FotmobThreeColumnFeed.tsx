'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Activity, 
  Trophy, 
  Star, 
  Flame, 
  Clock, 
  ExternalLink,
  Shield
} from 'lucide-react'
import FotmobMatchCard from './FotmobMatchCard'
import { formatFotmobDate, FOTMOB_LEAGUES } from '@/lib/football-utils'

interface NewsItem {
  id: string
  title: string
  source: string
  timeAgo: string
  imageUrl: string
  url?: string
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Champions League: Quarter-final draw and tactical breakdown',
    source: 'The Athletic',
    timeAgo: '1h ago',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    title: 'Transfer Watch: Top European clubs enter race for teenage sensation',
    source: 'Sky Sports',
    timeAgo: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    title: 'Premier League Title Race: Analytical xG and Points Projection model',
    source: 'BBC Sport',
    timeAgo: '4h ago',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '4',
    title: 'La Liga Highlights: Real Madrid and Barcelona prepare for decisive El Clasico',
    source: 'Marca',
    timeAgo: '6h ago',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '5',
    title: 'Tactical Analysis: How modern high-pressing is reshaping European midfields',
    source: 'FotMob Editorial',
    timeAgo: '8h ago',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=300&q=80',
  }
]

const TOP_CLUBS = [
  { id: '8634', name: 'FC Barcelona', country: 'ESP' },
  { id: '8633', name: 'Real Madrid', country: 'ESP' },
  { id: '8456', name: 'Manchester City', country: 'ENG' },
  { id: '9825', name: 'Arsenal', country: 'ENG' },
  { id: '8650', name: 'Liverpool', country: 'ENG' },
  { id: '9823', name: 'Bayern Munich', country: 'GER' },
]

export default function FotmobThreeColumnFeed() {
  // Current active date object
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [filterMode, setFilterMode] = useState<'all' | 'live' | 'finished' | 'scheduled'>('all')
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string | null>(null)
  const [leagues, setLeagues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsedLeagues, setCollapsedLeagues] = useState<Record<string, boolean>>({})

  // Formatted date string for API
  const dateStr = useMemo(() => formatFotmobDate(currentDate), [currentDate])

  // Fetch matches whenever date changes
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/football/fotmob/matches?date=${dateStr}&expand=3`,
        { 
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache' }
        }
      )

      if (!res.ok) {
        throw new Error('Failed to load matches')
      }

      const data = await res.json()
      let rawLeagues = data?.leagues || []

      setLeagues(rawLeagues)
    } catch (err) {
      setError('Unable to load matches for this date')
    } finally {
      setLoading(false)
    }
  }, [dateStr])

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [fetchMatches])

  // Date Navigation Handlers
  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() - 1)
      return next
    })
  }

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + 1)
      return next
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = useMemo(() => {
    const today = new Date()
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }, [currentDate])

  const dateLabel = useMemo(() => {
    if (isToday) return 'Today'
    return currentDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }, [currentDate, isToday])

  const toggleLeagueAccordion = (leagueId: string) => {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }))
  }

  // Filtered Leagues based on pills and sidebar selection
  const displayedLeagues = useMemo(() => {
    let result = leagues

    // League filter from left sidebar
    if (selectedLeagueFilter) {
      result = result.filter((l) => String(l.league_id) === String(selectedLeagueFilter))
    }

    // Filter by live/finished/scheduled status pills
    if (filterMode === 'live') {
      result = result
        .map((l) => ({ ...l, matches: l.matches.filter((m: any) => m.live) }))
        .filter((l) => l.matches.length > 0)
    } else if (filterMode === 'finished') {
      result = result
        .map((l) => ({ ...l, matches: l.matches.filter((m: any) => m.finished) }))
        .filter((l) => l.matches.length > 0)
    } else if (filterMode === 'scheduled') {
      result = result
        .map((l) => ({ ...l, matches: l.matches.filter((m: any) => !m.started) }))
        .filter((l) => l.matches.length > 0)
    }

    return result
  }, [leagues, selectedLeagueFilter, filterMode])

  const totalMatchesCount = useMemo(() => {
    return displayedLeagues.reduce((acc, l) => acc + (l.matches?.length || 0), 0)
  }, [displayedLeagues])

  const totalLiveMatches = useMemo(() => {
    return leagues.reduce(
      (acc, l) => acc + (l.matches?.filter((m: any) => m.live)?.length || 0),
      0
    )
  }, [leagues])

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* ========================================================================= */}
      {/* 1. LEFT COLUMN: Navigation Sidebar (~20% on lg:col-span-3 or xl:col-span-3) */}
      {/* ========================================================================= */}
      <aside className="lg:col-span-3 xl:col-span-3 space-y-6">
        <div className="sticky top-20 space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Followed & Top Leagues */}
          <div className="bg-[#0a0a0a]/90 border border-[#1F2937] rounded-2xl p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#1F2937]">
              <Trophy className="w-4 h-4 text-success" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Top Leagues</h3>
              {selectedLeagueFilter && (
                <button
                  onClick={() => setSelectedLeagueFilter(null)}
                  className="ml-auto text-[10px] text-success hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <ul className="space-y-1">
              {Object.entries(FOTMOB_LEAGUES).map(([key, league]) => {
                const isSelected = selectedLeagueFilter === String(league.id)
                return (
                  <li key={key}>
                    <button
                      onClick={() => setSelectedLeagueFilter(isSelected ? null : String(league.id))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-success text-black font-bold shadow-sm shadow-success/20'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-3.5 h-3.5 opacity-70" />
                        <span>{league.name}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-mono ${isSelected ? 'text-black' : 'text-[#6B7280]'}`}>
                        {league.country}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Followed Teams Tracking */}
          <div className="bg-[#0a0a0a]/90 border border-[#1F2937] rounded-2xl p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#1F2937]">
              <Star className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Club Tracking</h3>
            </div>

            <ul className="space-y-1">
              {TOP_CLUBS.map((club) => (
                <li key={club.id}>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#9CA3AF] hover:text-white hover:bg-[#161B22] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://images.fotmob.com/image_resources/logo/teamlogo/${club.id}_small.png`}
                        alt={club.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                      />
                      <span>{club.name}</span>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-mono">{club.country}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. CENTER COLUMN: Main Match Feed (~55% on lg:col-span-6 or xl:col-span-6) */}
      {/* ========================================================================= */}
      <main className="lg:col-span-6 xl:col-span-6 space-y-4">
        
        {/* Date Selector & Day Navigation Header */}
        <div className="bg-[#0a0a0a]/95 border border-[#1F2937] rounded-2xl p-3.5 backdrop-blur-md shadow-sm space-y-3">
          
          <div className="flex items-center justify-between">
            {/* Prev Day */}
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg bg-[#161B22] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Current Date Button / Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToday}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  isToday ? 'bg-white text-black' : 'bg-[#161B22] text-[#9CA3AF] hover:text-white'
                }`}
              >
                {dateLabel}
              </button>
            </div>

            {/* Next Day */}
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg bg-[#161B22] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills (All, Live, Finished, Scheduled) */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1F2937]/70">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-success text-black'
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-white'
                }`}
              >
                All ({totalMatchesCount})
              </button>

              <button
                onClick={() => setFilterMode('live')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  filterMode === 'live'
                    ? 'bg-alert text-white'
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${totalLiveMatches > 0 ? 'bg-white animate-pulse' : 'bg-[#6B7280]'}`} />
                Live {totalLiveMatches > 0 ? `(${totalLiveMatches})` : ''}
              </button>

              <button
                onClick={() => setFilterMode('finished')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'finished'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-white'
                }`}
              >
                Finished
              </button>

              <button
                onClick={() => setFilterMode('scheduled')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'scheduled'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-white'
                }`}
              >
                By Time
              </button>
            </div>

            {/* Custom Date Input Icon */}
            <div className="flex items-center gap-1 bg-[#161B22] px-2 py-1 rounded-lg border border-[#30363D]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#8B949E]" />
              <input
                type="date"
                value={currentDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number)
                    setCurrentDate(new Date(y, m - 1, d))
                  }
                }}
                className="bg-transparent text-[11px] text-white font-mono outline-none border-none cursor-pointer w-24"
              />
            </div>
          </div>

        </div>

        {/* Loading Skeleton */}
        {loading && leagues.length === 0 && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#161B22] rounded-2xl animate-pulse border border-[#1F2937]" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-alert bg-alert/10 border border-alert/30 rounded-2xl p-4">
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
        {!loading && displayedLeagues.length === 0 && !error && (
          <div className="text-center py-12 border border-[#1F2937] rounded-2xl bg-[#0a0a0a]/50 p-6 space-y-2">
            <Activity className="w-8 h-8 text-[#6B7280] mx-auto" />
            <div className="text-[#9CA3AF] font-bold text-sm">
              {filterMode === 'live' ? 'No live matches in progress right now' : 'No matches scheduled for this date'}
            </div>
            <p className="text-xs text-[#6B7280]">
              Select another date or filter pill above.
            </p>
          </div>
        )}

        {/* Accordion League Groups */}
        <div className="space-y-4">
          {displayedLeagues.map((league) => {
            const isCollapsed = collapsedLeagues[league.league_id] || false
            const liveCount = league.matches?.filter((m: any) => m.live)?.length || 0

            return (
              <div
                key={league.league_id}
                className="border border-[#1F2937] bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Accordion Header */}
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

                  <div className="flex items-center gap-2.5">
                    {liveCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-alert/20 text-alert text-[10px] font-bold border border-alert/40">
                        🔴 {liveCount} LIVE
                      </span>
                    )}
                    <span className="text-xs text-[#8B949E] font-mono">
                      {league.matches?.length || 0}
                    </span>
                  </div>
                </button>

                {/* Match Cards Body */}
                {!isCollapsed && (
                  <div className="p-3 space-y-2.5">
                    {league.matches?.map((match: any) => (
                      <FotmobMatchCard key={match.match_id} match={match} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. RIGHT COLUMN: News Cards (~25% on lg:col-span-3 xl:col-span-3)        */}
      {/* ========================================================================= */}
      <aside className="lg:col-span-3 xl:col-span-3 space-y-4">
        <div className="sticky top-20 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pl-1" style={{ scrollbarWidth: 'thin' }}>
          
          <div className="bg-[#0a0a0a]/90 border border-[#1F2937] rounded-2xl p-4 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1F2937]">
              <Flame className="w-4 h-4 text-alert" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Top Stories & News</h3>
            </div>

            <div className="space-y-3">
              {DEFAULT_NEWS.map((news) => (
                <article
                  key={news.id}
                  className="group flex gap-3 p-2 rounded-xl hover:bg-[#161B22] transition-colors cursor-pointer border border-transparent hover:border-[#1F2937]"
                >
                  {/* Thumbnail Image Left */}
                  <div className="w-20 h-16 sm:w-22 sm:h-18 shrink-0 rounded-lg overflow-hidden bg-[#161B22]">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Headline & Metadata Right */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-success transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-[#8B949E] mt-1.5 font-mono">
                      <span>{news.source}</span>
                      <span>{news.timeAgo}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1F2937] text-center">
              <span className="text-[11px] text-[#8B949E] font-mono flex items-center justify-center gap-1 hover:text-white cursor-pointer transition-colors">
                View all news <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>
      </aside>

    </div>
  )
}
