'use client'

import FotmobStandings from '@/components/football/FotmobStandings'
import { FOTMOB_LEAGUES } from '@/lib/football-utils'

export default function FootballPresetStandingsFocus() {
  return (
    <div className="w-full h-full p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white font-heading">
          📊 League Standings
        </h2>
        <div className="text-xs text-success font-bold">
          Powered by FotMob • Includes xG
        </div>
      </div>

      <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-success/20 rounded-lg p-6">
        <FotmobStandings leagueId="47" showXG={true} />
      </div>
    </div>
  )
}
