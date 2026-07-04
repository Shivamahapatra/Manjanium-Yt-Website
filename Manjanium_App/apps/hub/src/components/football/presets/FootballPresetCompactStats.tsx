'use client'

import FotmobLiveMatches from '@/components/football/FotmobLiveMatches'
import FotmobStandings from '@/components/football/FotmobStandings'

export default function FootballPresetCompactStats() {
  return (
    <div className="w-full h-full grid grid-cols-3 gap-4 p-4 overflow-hidden">
      {/* Col 1: Live Only */}
      <div className="overflow-y-auto space-y-3">
        <h3 className="text-sm font-bold text-[#10B981] uppercase tracking-wider">
          🔴 Live
        </h3>
        <FotmobLiveMatches filterLive={true} maxLeagues={5} />
      </div>

      {/* Col 2: Today's Schedule */}
      <div className="overflow-y-auto space-y-3 border-x border-[#1F2937] px-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          📅 Today
        </h3>
        <FotmobLiveMatches filterLive={false} maxLeagues={6} />
      </div>

      {/* Col 3: Standings */}
      <div className="overflow-y-auto space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          🏆 Table
        </h3>
        <FotmobStandings leagueId="47" showXG={false} />
      </div>
    </div>
  )
}
