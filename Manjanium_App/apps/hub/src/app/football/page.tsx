'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
  Activity,
  Flame,
  Shield,
  Crosshair,
  RefreshCw,
  Search,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'

// ==============================================================================
// TYPE DEFINITIONS
// ==============================================================================

interface Match {
  match_id: string
  home_team: string
  home_team_id?: string
  home_flag?: string
  home_score: number | null
  away_team: string
  away_team_id?: string
  away_flag?: string
  away_score: number | null
  status: string
  minute?: string
  live: boolean
  finished: boolean
  started: boolean
  kickoff?: string
  league_name?: string
  understat_id?: string
}

interface LeagueGroup {
  league_id: string
  league_name: string
  country?: string
  logo?: string
  matches: Match[]
}

interface UnderstatShot {
  id: string
  minute: number
  result: string // Goal, SavedShot, MissedShots, BlockedShot, ShotOnPost
  x: number // 0-100
  y: number // 0-100
  xG: number
  player: string
  team: 'home' | 'away'
  team_name?: string
  shot_type?: string
  situation?: string
  player_assisted?: string
}

interface UnderstatData {
  match_id: string
  home_team: { name: string; total_xG: number; shots: number; goals: number }
  away_team: { name: string; total_xG: number; shots: number; goals: number }
  shots: UnderstatShot[]
  xG_momentum: Array<{ minute: number; home_xG: number; away_xG: number; result?: string; player?: string; team?: string }>
}

interface TimelineEvent {
  minute: number
  extra?: number
  team: string
  player: string
  assist?: string
  type: string
  detail: string
}

interface StandingRow {
  position: number
  team_id?: number
  name: string
  short_name?: string
  crest?: string
  played: number
  won: number
  draw: number
  lost: number
  points: number
  goal_difference: number
}

interface BarcelonaTracker {
  team: { id: number; name: string; short_name: string; crest: string }
  la_liga: { standing: { position: number; played: number; points: number }; recent: any[]; upcoming: any[] }
  champions_league: { standing: { position: number; points: number }; recent: any[]; upcoming: any[] }
  next_match: any | null
  recent_form: string[]
}

// Top Leagues configuration
const TOP_LEAGUES = [
  { id: 'PD', name: 'La Liga', country: 'Spain', flag: '🇪🇸', compCode: 'PD', logo: 'https://crests.football-data.org/PD.png' },
  { id: 'CL', name: 'Champions League', country: 'Europe', flag: '🇪🇺', compCode: 'CL', logo: 'https://crests.football-data.org/CL.png' },
  { id: 'PL', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', compCode: 'PL', logo: 'https://crests.football-data.org/PL.png' },
  { id: 'BL1', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', compCode: 'BL1', logo: 'https://crests.football-data.org/BL1.png' },
  { id: 'SA', name: 'Serie A', country: 'Italy', flag: '🇮🇹', compCode: 'SA', logo: 'https://crests.football-data.org/SA.png' },
  { id: 'FL1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', compCode: 'FL1', logo: 'https://crests.football-data.org/FL1.png' },
]

// Fallback Standings for Football-Data.org when API key is pending
const INITIAL_LA_LIGA_STANDINGS: StandingRow[] = [
  { position: 1, name: 'FC Barcelona', short_name: 'Barça', crest: 'https://crests.football-data.org/81.svg', played: 4, won: 4, draw: 0, lost: 0, points: 12, goal_difference: 10 },
  { position: 2, name: 'Real Madrid CF', short_name: 'Real Madrid', crest: 'https://crests.football-data.org/86.png', played: 4, won: 3, draw: 1, lost: 0, points: 10, goal_difference: 6 },
  { position: 3, name: 'Atlético de Madrid', short_name: 'Atleti', crest: 'https://crests.football-data.org/78.svg', played: 4, won: 2, draw: 2, lost: 0, points: 8, goal_difference: 4 },
  { position: 4, name: 'Villarreal CF', short_name: 'Villarreal', crest: 'https://crests.football-data.org/94.png', played: 4, won: 2, draw: 2, lost: 0, points: 8, goal_difference: 2 },
  { position: 5, name: 'Girona FC', short_name: 'Girona', crest: 'https://crests.football-data.org/298.png', played: 4, won: 2, draw: 1, lost: 1, points: 7, goal_difference: 3 },
  { position: 6, name: 'Athletic Club', short_name: 'Athletic', crest: 'https://crests.football-data.org/77.png', played: 4, won: 2, draw: 1, lost: 1, points: 7, goal_difference: 2 },
]

// Fallback Understat Shotmap Data
const SAMPLE_UNDERSTAT_SHOTS: UnderstatShot[] = [
  { id: 's1', minute: 14, result: 'SavedShot', x: 88.5, y: 48.2, xG: 0.14, player: 'Robert Lewandowski', team: 'home', shot_type: 'RightFoot', situation: 'OpenPlay' },
  { id: 's2', minute: 23, result: 'Goal', x: 92.1, y: 51.4, xG: 0.48, player: 'Lamine Yamal', team: 'home', shot_type: 'LeftFoot', situation: 'OpenPlay', player_assisted: 'Raphinha' },
  { id: 's3', minute: 31, result: 'MissedShots', x: 79.4, y: 64.0, xG: 0.04, player: 'Pedri', team: 'home', shot_type: 'RightFoot', situation: 'OpenPlay' },
  { id: 's4', minute: 42, result: 'SavedShot', x: 86.0, y: 52.0, xG: 0.11, player: 'Vinícius Júnior', team: 'away', shot_type: 'RightFoot', situation: 'OpenPlay' },
  { id: 's5', minute: 58, result: 'Goal', x: 94.0, y: 49.5, xG: 0.62, player: 'Robert Lewandowski', team: 'home', shot_type: 'Head', situation: 'FromCorner', player_assisted: 'Raphinha' },
  { id: 's6', minute: 67, result: 'BlockedShot', x: 82.3, y: 43.1, xG: 0.07, player: 'Kylian Mbappé', team: 'away', shot_type: 'RightFoot', situation: 'OpenPlay' },
  { id: 's7', minute: 75, result: 'Goal', x: 89.2, y: 53.8, xG: 0.28, player: 'Kylian Mbappé', team: 'away', shot_type: 'RightFoot', situation: 'OpenPlay', player_assisted: 'Jude Bellingham' },
  { id: 's8', minute: 86, result: 'ShotOnPost', x: 87.0, y: 47.0, xG: 0.21, player: 'Dani Olmo', team: 'home', shot_type: 'RightFoot', situation: 'OpenPlay' },
]

export default function FootballHubPage() {
  // State: Date navigation
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  // State: Filter pills (all, live, finished, scheduled)
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'finished' | 'scheduled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLeagueFilter, setActiveLeagueFilter] = useState<string | null>(null)

  // State: Collapsible accordions for center column league groups
  const [collapsedLeagues, setCollapsedLeagues] = useState<Record<string, boolean>>({})

  // State: Right column active match & tab
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [rightColumnTab, setRightColumnTab] = useState<'shotmap' | 'timeline' | 'lineups' | 'standings'>('shotmap')

  // State: Data streams
  const [leagueGroups, setLeagueGroups] = useState<LeagueGroup[]>([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [barcaTracker, setBarcaTracker] = useState<BarcelonaTracker | null>(null)
  const [barcaComp, setBarcaComp] = useState<'PD' | 'CL'>('PD')
  const [standings, setStandings] = useState<StandingRow[]>(INITIAL_LA_LIGA_STANDINGS)
  const [selectedCompetition, setSelectedCompetition] = useState<string>('PD')

  // Understat & Event state
  const [understatData, setUnderstatData] = useState<UnderstatData | null>(null)
  const [hoveredShot, setHoveredShot] = useState<UnderstatShot | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  // ============================================================================
  // 1. DATA FETCHING: MATCHDAY SCHEDULE
  // ============================================================================
  const fetchMatches = useCallback(async (dateStr: string) => {
    setLoadingMatches(true)
    try {
      // Attempt to hit the Next.js API proxy to Telemetry API
      const res = await fetch(`/api/football/fotmob/matches?date=${dateStr.replace(/-/g, '')}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.leagues && data.leagues.length > 0) {
          setLeagueGroups(data.leagues)
          // Default select the first live match if none selected
          const firstLive = data.leagues
            .flatMap((l: LeagueGroup) => l.matches)
            .find((m: Match) => m.live)
          if (firstLive && !selectedMatch) {
            setSelectedMatch(firstLive)
          }
          setLoadingMatches(false)
          return
        }
      }
    } catch (err) {
      console.warn('Backend matchday feed offline or pending, rendering fallback feed:', err)
    }

    // High quality initial match fixtures if backend is connecting
    const fallbackGroups: LeagueGroup[] = [
      {
        league_id: '87',
        league_name: 'La Liga EA Sports',
        country: 'Spain',
        logo: 'https://crests.football-data.org/PD.png',
        matches: [
          {
            match_id: 'laliga_1',
            home_team: 'FC Barcelona',
            home_flag: 'https://crests.football-data.org/81.svg',
            home_score: 2,
            away_team: 'Real Madrid',
            away_flag: 'https://crests.football-data.org/86.png',
            away_score: 1,
            status: '2H',
            minute: "74'",
            live: true,
            finished: false,
            started: true,
            kickoff: '2026-09-19T19:00:00Z',
            understat_id: '22676',
          },
          {
            match_id: 'laliga_2',
            home_team: 'Atlético Madrid',
            home_flag: 'https://crests.football-data.org/78.svg',
            home_score: 1,
            away_team: 'Sevilla FC',
            away_flag: 'https://crests.football-data.org/559.svg',
            away_score: 0,
            status: 'FT',
            minute: 'FT',
            live: false,
            finished: true,
            started: true,
            kickoff: '2026-09-19T16:15:00Z',
          },
          {
            match_id: 'laliga_3',
            home_team: 'Athletic Club',
            home_flag: 'https://crests.football-data.org/77.png',
            home_score: null,
            away_team: 'Real Sociedad',
            away_flag: 'https://crests.football-data.org/92.svg',
            away_score: null,
            status: 'SCHEDULED',
            minute: '',
            live: false,
            finished: false,
            started: false,
            kickoff: '2026-09-19T21:00:00Z',
          },
        ],
      },
      {
        league_id: '47',
        league_name: 'Premier League',
        country: 'England',
        logo: 'https://crests.football-data.org/PL.png',
        matches: [
          {
            match_id: 'pl_1',
            home_team: 'Manchester City',
            home_flag: 'https://crests.football-data.org/65.png',
            home_score: 3,
            away_team: 'Arsenal',
            away_flag: 'https://crests.football-data.org/57.png',
            away_score: 2,
            status: '2H',
            minute: "88'",
            live: true,
            finished: false,
            started: true,
            kickoff: '2026-09-19T16:30:00Z',
          },
          {
            match_id: 'pl_2',
            home_team: 'Liverpool',
            home_flag: 'https://crests.football-data.org/64.png',
            home_score: 2,
            away_team: 'Chelsea',
            away_flag: 'https://crests.football-data.org/61.png',
            away_score: 0,
            status: 'FT',
            minute: 'FT',
            live: false,
            finished: true,
            started: true,
            kickoff: '2026-09-19T14:00:00Z',
          },
        ],
      },
      {
        league_id: '42',
        league_name: 'UEFA Champions League',
        country: 'Europe',
        logo: 'https://crests.football-data.org/CL.png',
        matches: [
          {
            match_id: 'ucl_1',
            home_team: 'Bayern Munich',
            home_flag: 'https://crests.football-data.org/5.svg',
            home_score: null,
            away_team: 'Paris Saint-Germain',
            away_flag: 'https://crests.football-data.org/524.png',
            away_score: null,
            status: 'SCHEDULED',
            minute: '',
            live: false,
            finished: false,
            started: false,
            kickoff: '2026-09-19T20:00:00Z',
          },
        ],
      },
    ]

    setLeagueGroups(fallbackGroups)
    if (!selectedMatch) {
      setSelectedMatch(fallbackGroups[0].matches[0])
    }
    setLoadingMatches(false)
  }, [selectedMatch])

  useEffect(() => {
    fetchMatches(selectedDate)
  }, [selectedDate, fetchMatches])

  // ============================================================================
  // 2. DATA FETCHING: BARCELONA PINNED TRACKER & STANDINGS
  // ============================================================================
  useEffect(() => {
    async function loadBarcaTracker() {
      try {
        const res = await fetch('http://localhost:8000/api/football/teams/barcelona/tracker')
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            setBarcaTracker(json.data)
            return
          }
        }
      } catch (err) {
        // Fallback Barça state
      }

      setBarcaTracker({
        team: {
          id: 81,
          name: 'FC Barcelona',
          short_name: 'Barça',
          crest: 'https://crests.football-data.org/81.svg',
        },
        la_liga: {
          standing: { position: 1, played: 4, points: 12 },
          recent: [
            { id: 101, opponent: 'Valencia CF', score: '2-1', result: 'W' },
            { id: 102, opponent: 'Athletic Club', score: '2-1', result: 'W' },
            { id: 103, opponent: 'Rayo Vallecano', score: '2-1', result: 'W' },
            { id: 104, opponent: 'Real Valladolid', score: '7-0', result: 'W' },
          ],
          upcoming: [
            { id: 105, opponent: 'Girona FC', date: '2026-09-22', home: false },
            { id: 106, opponent: 'Villarreal CF', date: '2026-09-28', home: false },
          ],
        },
        champions_league: {
          standing: { position: 1, points: 3 },
          recent: [{ id: 201, opponent: 'Monaco', score: '2-1', result: 'W' }],
          upcoming: [{ id: 202, opponent: 'Young Boys', date: '2026-10-01', home: true }],
        },
        next_match: {
          opponent: 'Girona FC',
          competition: 'La Liga EA Sports',
          utc_date: '2026-09-22T14:15:00Z',
          home: false,
        },
        recent_form: ['W', 'W', 'W', 'W', 'W'],
      })
    }

    loadBarcaTracker()
  }, [])

  // Fetch Understat shots when a match is selected
  useEffect(() => {
    const match = selectedMatch
    if (!match) return

    async function loadShots() {
      try {
        const matchId = match.understat_id || '22676'
        const res = await fetch(`http://localhost:8000/api/football/understat/shots/${matchId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            setUnderstatData(json.data)
            return
          }
        }
      } catch (err) {
        // Fallback to sample Understat shots
      }

      setUnderstatData({
        match_id: match.match_id,
        home_team: { name: match.home_team, total_xG: 2.15, shots: 14, goals: match.home_score || 2 },
        away_team: { name: match.away_team, total_xG: 1.18, shots: 8, goals: match.away_score || 1 },
        shots: SAMPLE_UNDERSTAT_SHOTS,
        xG_momentum: [
          { minute: 0, home_xG: 0.0, away_xG: 0.0 },
          { minute: 14, home_xG: 0.14, away_xG: 0.0 },
          { minute: 23, home_xG: 0.62, away_xG: 0.0, result: 'Goal', player: 'Lamine Yamal', team: 'home' },
          { minute: 42, home_xG: 0.66, away_xG: 0.11 },
          { minute: 58, home_xG: 1.28, away_xG: 0.11, result: 'Goal', player: 'Robert Lewandowski', team: 'home' },
          { minute: 75, home_xG: 1.28, away_xG: 0.39, result: 'Goal', player: 'Kylian Mbappé', team: 'away' },
          { minute: 86, home_xG: 1.49, away_xG: 0.39 },
        ],
      })
    }

    // Default timeline events
    setTimelineEvents([
      { minute: 23, team: match.home_team, player: 'Lamine Yamal', assist: 'Raphinha', type: 'Goal', detail: 'Normal Goal' },
      { minute: 38, team: match.away_team, player: 'Aurélien Tchouaméni', type: 'Card', detail: 'Yellow Card' },
      { minute: 58, team: match.home_team, player: 'Robert Lewandowski', assist: 'Raphinha', type: 'Goal', detail: 'Header' },
      { minute: 71, team: match.home_team, player: 'Pedri', type: 'Card', detail: 'Yellow Card' },
      { minute: 75, team: match.away_team, player: 'Kylian Mbappé', assist: 'Jude Bellingham', type: 'Goal', detail: 'Right Foot Shot' },
    ])

    loadShots()
  }, [selectedMatch])

  // ============================================================================
  // ACCORDION TOGGLE HANDLER
  // ============================================================================
  const toggleLeagueAccordion = (leagueId: string) => {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }))
  }

  // Filter matches based on search and status
  const filteredLeagueGroups = useMemo(() => {
    return leagueGroups
      .filter((group) => {
        if (activeLeagueFilter && group.league_id !== activeLeagueFilter) {
          return false
        }
        return true
      })
      .map((group) => {
        const filteredMatches = group.matches.filter((m) => {
          if (statusFilter === 'live' && !m.live) return false
          if (statusFilter === 'finished' && !m.finished) return false
          if (statusFilter === 'scheduled' && (m.live || m.finished)) return false

          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            return (
              m.home_team.toLowerCase().includes(query) ||
              m.away_team.toLowerCase().includes(query)
            )
          }
          return true
        })

        return { ...group, matches: filteredMatches }
      })
      .filter((group) => group.matches.length > 0)
  }, [leagueGroups, activeLeagueFilter, statusFilter, searchQuery])

  // Count active live games
  const totalLiveMatches = useMemo(() => {
    return leagueGroups.reduce(
      (acc, group) => acc + group.matches.filter((m) => m.live).length,
      0
    )
  }, [leagueGroups])

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-3 md:p-6 antialiased font-sans">
      {/* Top Telemetry Brand Bar */}
      <div className="max-w-[1680px] mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Trophy className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-50">
                MANJANIUM // FOOTBALL HUB
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                MULTI-API v2.0
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              API-Football (Scores) • Football-Data.org (Standings) • Understat (xG Shotmaps)
            </p>
          </div>
        </div>

        {/* Global Live Ticker Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">{totalLiveMatches} LIVE FIXTURES</span>
          </div>
          <button
            onClick={() => fetchMatches(selectedDate)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all text-xs flex items-center gap-1.5"
            title="Refresh Fixtures"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMatches ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 3-Column FotMob Layout */}
      <div className="max-w-[1680px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: PINNED TEAMS & TOP LEAGUES NAVIGATION (3 COLS)           */}
        {/* ==================================================================== */}
        <div className="lg:col-span-3 space-y-5 lg:sticky lg:top-6">
          {/* PINNED TEAM: FC BARCELONA TRACKER */}
          <div className="rounded-2xl bg-gradient-to-b from-zinc-900 to-[#121215] border border-zinc-800/80 p-4 shadow-xl shadow-black/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-red-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">
                    PINNED CLUB
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/50">
                  TRACKING
                </span>
              </div>

              {/* Team Crest & Name */}
              <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <img
                  src={barcaTracker?.team.crest || 'https://crests.football-data.org/81.svg'}
                  alt="FC Barcelona"
                  className="w-11 h-11 object-contain drop-shadow"
                />
                <div>
                  <div className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                    FC Barcelona
                    <span className="text-xs font-normal text-zinc-400">(Barça)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {barcaTracker?.recent_form.map((res, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center font-mono ${
                          res === 'W'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : res === 'D'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Competition Toggle (La Liga vs Champions League) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800/70 mb-3.5">
                <button
                  onClick={() => setBarcaComp('PD')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    barcaComp === 'PD'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>🇪🇸</span> La Liga
                </button>
                <button
                  onClick={() => setBarcaComp('CL')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    barcaComp === 'CL'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>⭐️</span> UCL
                </button>
              </div>

              {/* Standing Stats Pill */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-center mb-3">
                <div>
                  <div className="text-[10px] uppercase font-mono text-zinc-500">Rank</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    #{barcaComp === 'PD' ? barcaTracker?.la_liga.standing.position : barcaTracker?.champions_league.standing.position}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-zinc-500">Points</div>
                  <div className="text-sm font-bold font-mono text-zinc-100">
                    {barcaComp === 'PD' ? barcaTracker?.la_liga.standing.points : barcaTracker?.champions_league.standing.points} pts
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-zinc-500">Played</div>
                  <div className="text-sm font-bold font-mono text-zinc-300">
                    {barcaComp === 'PD' ? barcaTracker?.la_liga.standing.played : 1}
                  </div>
                </div>
              </div>

              {/* Next Match Teaser */}
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-xs">
                <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  NEXT FIXTURE
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">
                    vs {barcaTracker?.next_match?.opponent || 'Girona FC'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                    La Liga
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TOP LEAGUES SELECTOR */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">
                  TOP LEAGUES
                </span>
              </div>
              {activeLeagueFilter && (
                <button
                  onClick={() => setActiveLeagueFilter(null)}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {TOP_LEAGUES.map((league) => {
                const isSelected = activeLeagueFilter === league.id
                return (
                  <button
                    key={league.id}
                    onClick={() => {
                      setActiveLeagueFilter(isSelected ? null : league.id)
                      setSelectedCompetition(league.compCode)
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-zinc-100 font-medium'
                        : 'hover:bg-zinc-800/60 text-zinc-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{league.flag}</span>
                      <div>
                        <div className="text-xs font-medium">{league.name}</div>
                        <div className="text-[10px] text-zinc-500">{league.country}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CENTER COLUMN: LIVE MATCH DAY FEED WITH FRAMER MOTION (6 COLS)       */}
        {/* ==================================================================== */}
        <div className="lg:col-span-6 space-y-4">
          {/* DATE SELECTOR & SEARCH BAR */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const d = new Date(selectedDate)
                    d.setDate(d.getDate() - 1)
                    setSelectedDate(d.toISOString().split('T')[0])
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-all"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const d = new Date(selectedDate)
                    d.setDate(d.getDate() + 1)
                    setSelectedDate(d.toISOString().split('T')[0])
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-all"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Today Button */}
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
              >
                TODAY
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'live', 'finished', 'scheduled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-all ${
                      statusFilter === filter
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {filter === 'live' && totalLiveMatches > 0 && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-950 animate-ping mr-1.5" />
                    )}
                    {filter}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-40 pl-8 pr-3 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* LEAGUE ACCORDION MATCH GROUPS (FRAMER MOTION WRAPPED) */}
          <div className="space-y-4">
            {loadingMatches ? (
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 text-center text-zinc-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                <p className="text-xs font-mono">STREAMING MATCHDAY TELEMETRY...</p>
              </div>
            ) : filteredLeagueGroups.length === 0 ? (
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 text-center text-zinc-500">
                <p className="text-sm font-medium text-zinc-400">No matches found</p>
                <p className="text-xs text-zinc-500 mt-1">Try changing the date or clearing filters</p>
              </div>
            ) : (
              filteredLeagueGroups.map((group) => {
                const isCollapsed = !!collapsedLeagues[group.league_id]

                return (
                  <div
                    key={group.league_id}
                    className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-lg overflow-hidden transition-all"
                  >
                    {/* Collapsible League Accordion Header */}
                    <button
                      onClick={() => toggleLeagueAccordion(group.league_id)}
                      className="w-full px-4 py-3 bg-zinc-900/90 hover:bg-zinc-800/50 flex items-center justify-between border-b border-zinc-800/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {group.logo && (
                          <img
                            src={group.logo}
                            alt={group.league_name}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <div>
                          <span className="text-xs font-bold text-zinc-200 tracking-wide">
                            {group.league_name}
                          </span>
                          {group.country && (
                            <span className="text-[10px] text-zinc-500 ml-2">
                              {group.country}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {group.matches.length}
                        </span>
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {/* Framer Motion Accordion Body */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="divide-y divide-zinc-800/50 overflow-hidden"
                        >
                          {group.matches.map((match) => {
                            const isSelected = selectedMatch?.match_id === match.match_id

                            return (
                              <div
                                key={match.match_id}
                                onClick={() => setSelectedMatch(match)}
                                className={`p-3.5 cursor-pointer transition-all hover:bg-zinc-800/50 ${
                                  isSelected
                                    ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                                    : ''
                                }`}
                              >
                                <div className="grid grid-cols-12 items-center gap-2">
                                  {/* Status Indicator */}
                                  <div className="col-span-2 text-center">
                                    {match.live ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="text-[10px] font-mono font-bold text-emerald-400 animate-pulse">
                                          {match.minute || 'LIVE'}
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      </div>
                                    ) : match.finished ? (
                                      <span className="text-[10px] font-mono font-bold text-zinc-500">
                                        FT
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono text-zinc-400">
                                        {match.kickoff
                                          ? new Date(match.kickoff).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })
                                          : 'SCHED'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Home Team */}
                                  <div className="col-span-4 flex items-center justify-end gap-2 text-right">
                                    <span
                                      className={`text-xs font-semibold truncate ${
                                        (match.home_score ?? 0) > (match.away_score ?? 0) &&
                                        match.started
                                          ? 'text-zinc-100 font-bold'
                                          : 'text-zinc-300'
                                      }`}
                                    >
                                      {match.home_team}
                                    </span>
                                    {match.home_flag && (
                                      <img
                                        src={match.home_flag}
                                        alt={match.home_team}
                                        className="w-5 h-5 object-contain"
                                      />
                                    )}
                                  </div>

                                  {/* Score Banner */}
                                  <div className="col-span-2 text-center">
                                    {match.started ? (
                                      <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-zinc-950 font-mono text-sm font-bold border border-zinc-800">
                                        <span
                                          className={
                                            match.live ? 'text-emerald-400' : 'text-zinc-100'
                                          }
                                        >
                                          {match.home_score ?? 0}
                                        </span>
                                        <span className="text-zinc-600">-</span>
                                        <span
                                          className={
                                            match.live ? 'text-emerald-400' : 'text-zinc-100'
                                          }
                                        >
                                          {match.away_score ?? 0}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-zinc-600 font-mono">VS</span>
                                    )}
                                  </div>

                                  {/* Away Team */}
                                  <div className="col-span-4 flex items-center justify-start gap-2 text-left">
                                    {match.away_flag && (
                                      <img
                                        src={match.away_flag}
                                        alt={match.away_team}
                                        className="w-5 h-5 object-contain"
                                      />
                                    )}
                                    <span
                                      className={`text-xs font-semibold truncate ${
                                        (match.away_score ?? 0) > (match.home_score ?? 0) &&
                                        match.started
                                          ? 'text-zinc-100 font-bold'
                                          : 'text-zinc-300'
                                      }`}
                                    >
                                      {match.away_team}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: DETAILED CONTEXT, UNDERSTAT SHOTMAP & STANDINGS (3 COLS)*/}
        {/* ==================================================================== */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-4 shadow-xl">
            {/* Header: Tab Navigation */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-1">
                {(['shotmap', 'timeline', 'standings'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightColumnTab(tab)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                      rightColumnTab === tab
                        ? 'bg-zinc-800 text-emerald-400 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab === 'shotmap' ? 'Shotmap (xG)' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: UNDERSTAT SHOTMAP & xG MOMENTUM */}
            {rightColumnTab === 'shotmap' && (
              <div className="space-y-4">
                {/* Match Summary Header */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    UNDERSTAT SHOTMAP TELEMETRY
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold px-2">
                    <span className="text-zinc-200 truncate max-w-[90px]">
                      {selectedMatch?.home_team || 'Home'}
                    </span>
                    <span className="text-emerald-400 font-mono text-sm">
                      {selectedMatch?.home_score ?? 2} - {selectedMatch?.away_score ?? 1}
                    </span>
                    <span className="text-zinc-200 truncate max-w-[90px]">
                      {selectedMatch?.away_team || 'Away'}
                    </span>
                  </div>

                  {/* xG Metric Comparison */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/60 font-mono text-xs">
                    <div>
                      <span className="text-zinc-500 text-[10px]">HOME xG: </span>
                      <span className="font-bold text-emerald-400">
                        {understatData?.home_team.total_xG || 2.15}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px]">AWAY xG: </span>
                      <span className="font-bold text-sky-400">
                        {understatData?.away_team.total_xG || 1.18}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SVG FOOTBALL PITCH SHOTMAP VISUALIZATION */}
                <div className="relative rounded-xl bg-[#0d1f14] border border-emerald-950 p-2 shadow-inner overflow-hidden">
                  <div className="text-[9px] font-mono text-emerald-500/80 mb-1 flex items-center justify-between">
                    <span>ATTACKING DIRECTION ➔</span>
                    <span>105m × 68m</span>
                  </div>

                  <svg
                    viewBox="0 0 100 68"
                    className="w-full h-auto aspect-[100/68] stroke-emerald-600/40 fill-none"
                    style={{ strokeWidth: 0.8 }}
                  >
                    {/* Pitch Boundary */}
                    <rect x="0" y="0" width="100" height="68" fill="#0b1a11" />
                    <rect x="2" y="2" width="96" height="64" />

                    {/* Halfway Line & Center Circle */}
                    <line x1="50" y1="2" x2="50" y2="66" />
                    <circle cx="50" cy="34" r="9.15" />
                    <circle cx="50" cy="34" r="0.8" fill="currentColor" />

                    {/* Left Penalty Area (Home Defense / Away Attack) */}
                    <rect x="2" y="14" width="16.5" height="40" />
                    <rect x="2" y="24.5" width="5.5" height="19" />
                    <path d="M 18.5 27.5 A 9.15 9.15 0 0 1 18.5 40.5" />

                    {/* Right Penalty Area (Home Attack / Away Defense) */}
                    <rect x="81.5" y="14" width="16.5" height="40" />
                    <rect x="92.5" y="24.5" width="5.5" height="19" />
                    <path d="M 81.5 27.5 A 9.15 9.15 0 0 0 81.5 40.5" />

                    {/* Render Interactive Shots from Understat */}
                    {(understatData?.shots || SAMPLE_UNDERSTAT_SHOTS).map((shot) => {
                      // Map coordinates to SVG pitch
                      const cx = shot.x
                      const cy = (shot.y / 100) * 68
                      const radius = Math.max(1.5, Math.min(4.5, shot.xG * 6 + 1.2))

                      const isGoal = shot.result === 'Goal'
                      const isSaved = shot.result === 'SavedShot'
                      const isMissed = shot.result === 'MissedShots' || shot.result === 'ShotOnPost'

                      const fillColor = isGoal
                        ? '#10b981' // emerald
                        : isSaved
                        ? '#38bdf8' // sky
                        : isMissed
                        ? '#f43f5e' // rose
                        : '#94a3b8' // slate for blocked

                      return (
                        <g
                          key={shot.id}
                          className="cursor-pointer transition-transform hover:scale-125"
                          onMouseEnter={() => setHoveredShot(shot)}
                          onMouseLeave={() => setHoveredShot(null)}
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill={fillColor}
                            stroke="#000"
                            strokeWidth="0.5"
                            className="opacity-90 hover:opacity-100"
                          />
                          {isGoal && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={radius + 1.2}
                              stroke="#10b981"
                              strokeWidth="0.6"
                              strokeDasharray="1,1"
                              className="animate-pulse"
                            />
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Tooltip on Hover */}
                  {hoveredShot && (
                    <div className="mt-2 p-2 rounded-lg bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono">
                      <div className="font-bold text-zinc-100 flex items-center justify-between">
                        <span>{hoveredShot.player}</span>
                        <span
                          className={
                            hoveredShot.result === 'Goal'
                              ? 'text-emerald-400'
                              : 'text-zinc-400'
                          }
                        >
                          {hoveredShot.result}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[10px] mt-0.5">
                        Minute: {hoveredShot.minute}&apos; • xG: {hoveredShot.xG} •{' '}
                        {hoveredShot.shot_type || 'Shot'}
                      </div>
                    </div>
                  )}

                  {/* Shot Legend */}
                  <div className="flex items-center justify-between pt-2 text-[9px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Goal
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-400" /> Saved
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Missed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Blocked
                    </span>
                  </div>
                </div>

                {/* xG Momentum Summary Timeline */}
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      xG MOMENTUM PROGRESSION
                    </span>
                    <span>MINUTE 0-90+</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {understatData?.xG_momentum
                      .filter((m) => m.result === 'Goal')
                      .map((goal, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded bg-zinc-900/80 border border-zinc-800/60"
                        >
                          <span className="font-mono text-emerald-400 font-bold">
                            {goal.minute}&apos; ⚽
                          </span>
                          <span className="text-zinc-200 truncate">{goal.player}</span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            xG: {goal.team === 'home' ? goal.home_xG : goal.away_xG}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MATCH TIMELINE (API-FOOTBALL) */}
            {rightColumnTab === 'timeline' && (
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                  LIVE MATCH EVENTS
                </div>
                <div className="relative pl-4 space-y-3 border-l border-zinc-800">
                  {timelineEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div className="text-xs font-bold text-zinc-200">
                        {event.minute}&apos; • {event.type}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {event.player} {event.assist && `(Assist: ${event.assist})`}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">{event.team}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STANDINGS TABLE (FOOTBALL-DATA.ORG) */}
            {rightColumnTab === 'standings' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    {selectedCompetition === 'PD' ? 'LA LIGA TABLE' : 'LEAGUE STANDINGS'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">2026 SEASON</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-800 text-[10px]">
                        <th className="pb-1">#</th>
                        <th className="pb-1">Club</th>
                        <th className="pb-1 text-center">P</th>
                        <th className="pb-1 text-center">GD</th>
                        <th className="pb-1 text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {standings.map((row) => {
                        const isBarca = row.name.includes('Barcelona')
                        return (
                          <tr
                            key={row.position}
                            className={`hover:bg-zinc-800/40 ${
                              isBarca ? 'bg-blue-950/20 font-bold text-blue-300' : 'text-zinc-300'
                            }`}
                          >
                            <td className="py-2 text-[11px] font-bold text-zinc-400">
                              {row.position}
                            </td>
                            <td className="py-2 flex items-center gap-1.5 truncate max-w-[110px]">
                              {row.crest && (
                                <img
                                  src={row.crest}
                                  alt={row.name}
                                  className="w-3.5 h-3.5 object-contain inline"
                                />
                              )}
                              <span className="truncate">{row.short_name || row.name}</span>
                            </td>
                            <td className="py-2 text-center text-zinc-400">{row.played}</td>
                            <td className="py-2 text-center text-zinc-400">
                              {row.goal_difference > 0
                                ? `+${row.goal_difference}`
                                : row.goal_difference}
                            </td>
                            <td className="py-2 text-right font-bold text-emerald-400">
                              {row.points}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
