'use client'

import FotmobLiveMatches from '@/components/football/FotmobLiveMatches'
import FotmobStandings from '@/components/football/FotmobStandings'

export default function FootballPresetLiveMatches() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
      {/* Left: Live Matches (wider) */}
      <div className="lg:col-span-2 overflow-y-auto pr-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-heading">
            ⚽ Live Matches
          </h2>
          <span className="text-xs text-[#6B7280]">Click match for stats</span>
        </div>
        <FotmobLiveMatches filterLive={false} maxLeagues={8} />
      </div>

      {/* Right: Quick Standings */}
      <div className="overflow-y-auto border-l border-[#1F2937] pl-6 space-y-4">
        <h2 className="text-xl font-bold text-white font-heading">
          📊 Standings
        </h2>
        <FotmobStandings leagueId="47" showXG={true} />
      </div>
    </div>
  )
}
