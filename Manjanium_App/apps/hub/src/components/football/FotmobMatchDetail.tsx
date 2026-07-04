'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface MatchDetailProps {
  data: {
    general: any
    score: any
    stats: any
    shotmap: any[]
    lineup: any
    player_stats: any
    timeline: any[]
    momentum: any[]
  }
}

export default function FotmobMatchDetail({ data }: MatchDetailProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'lineup' | 'shotmap' | 'timeline'>('stats')

  const tabs = ['stats', 'lineup', 'shotmap', 'timeline'] as const

  // Extract xG from stats
  const xgStats = data.stats?.expected_goals_xg_?.[0] ||
    Object.values(data.stats || {}).find((group: any) =>
      group?.some?.((s: any) => s?.title?.toLowerCase().includes('xg'))
    )

  return (
    <div className="p-4 space-y-4">
      {/* Tab Selector */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors ${
              activeTab === tab
                ? 'bg-[#10B981] text-black'
                : 'bg-[#1F2937] text-[#6B7280] hover:text-white'
            }`}
          >
            {tab === 'shotmap' ? 'Shots' : tab}
          </button>
        ))}
      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-3">
          {Object.entries(data.stats || {}).slice(0, 6).map(([key, statGroup]: any) => (
            <div key={key}>
              {Array.isArray(statGroup) && statGroup.map((stat: any, i: number) => {
                const homeVal = parseFloat(stat?.stats?.[0]) || 0
                const awayVal = parseFloat(stat?.stats?.[1]) || 0
                const total = homeVal + awayVal || 1
                const homePercent = (homeVal / total) * 100

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-[#9CA3AF]">
                      <span className="font-bold text-white">{stat?.stats?.[0]}</span>
                      <span className="text-[#6B7280]">{stat?.title}</span>
                      <span className="font-bold text-white">{stat?.stats?.[1]}</span>
                    </div>
                    <div className="flex h-1.5 rounded overflow-hidden bg-[#1F2937]">
                      <div
                        className="bg-[#10B981] transition-all"
                        style={{ width: `${homePercent}%` }}
                      />
                      <div
                        className="bg-[#0EA5E9] transition-all"
                        style={{ width: `${100 - homePercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* LINEUP TAB */}
      {activeTab === 'lineup' && data.lineup && (
        <div className="grid grid-cols-2 gap-4">
          {['homeTeam', 'awayTeam'].map((side) => {
            const team = data.lineup[side]
            if (!team) return null
            return (
              <div key={side}>
                <div className="text-xs text-[#6B7280] mb-2 font-bold">
                  {team.name} — {team.formation}
                </div>
                <div className="space-y-1">
                  {(team.players || []).flat().map((player: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs py-1 border-b border-[#1F2937]"
                    >
                      <span className="text-[#6B7280] w-4">{player?.shirt}</span>
                      <span className="text-white flex-1">{player?.name?.firstName} {player?.name?.lastName}</span>
                      {player?.rating?.num && (
                        <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${
                          parseFloat(player.rating.num) >= 7.5
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : parseFloat(player.rating.num) >= 6.5
                            ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                            : 'bg-[#EF4444]/20 text-[#EF4444]'
                        }`}>
                          {player.rating.num}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SHOTMAP TAB */}
      {activeTab === 'shotmap' && (
        <div className="space-y-3">
          {/* Shot map SVG pitch */}
          <div className="relative bg-[#0f3020] rounded-lg overflow-hidden" style={{ paddingBottom: '65%' }}>
            <svg
              viewBox="0 0 100 65"
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Pitch outline */}
              <rect x="0" y="0" width="100" height="65" fill="#0f3020" />
              <rect x="2" y="2" width="96" height="61" fill="none" stroke="#1a5c35" strokeWidth="0.5" />
              {/* Centre circle */}
              <circle cx="50" cy="32.5" r="9.15" fill="none" stroke="#1a5c35" strokeWidth="0.5" />
              {/* Halfway line */}
              <line x1="50" y1="2" x2="50" y2="63" stroke="#1a5c35" strokeWidth="0.5" />
              {/* Left penalty box */}
              <rect x="2" y="13.84" width="16.5" height="40.32" fill="none" stroke="#1a5c35" strokeWidth="0.5" />
              {/* Right penalty box */}
              <rect x="81.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="#1a5c35" strokeWidth="0.5" />
              {/* Left goal */}
              <rect x="2" y="24.84" width="4" height="13.68" fill="none" stroke="#1a5c35" strokeWidth="0.5" />
              {/* Right goal */}
              <rect x="94" y="24.84" width="4" height="13.68" fill="none" stroke="#1a5c35" strokeWidth="0.5" />

              {/* Shot dots */}
              {data.shotmap.map((shot, i) => {
                const x = shot.x || 50
                const y = shot.y || 32.5
                const isGoal = shot.result === 'Goal'
                const isHome = shot.team_id === data.general?.home_team?.id

                return (
                  <g key={i}>
                    <circle
                      cx={isHome ? x : 100 - x}
                      cy={y}
                      r={isGoal ? 2.5 : 1.5}
                      fill={isGoal
                        ? '#10B981'
                        : isHome
                        ? 'rgba(16,185,129,0.5)'
                        : 'rgba(14,165,233,0.5)'}
                      stroke={isGoal ? '#fff' : 'none'}
                      strokeWidth="0.3"
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Shot list */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {data.shotmap.map((shot, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[#1F2937]">
                <span className="text-[#6B7280]">{shot.minute}'</span>
                <span className="text-white">{shot.player}</span>
                <span className="text-[#6B7280] capitalize">{shot.type}</span>
                <span className={`font-bold ${
                  shot.result === 'Goal' ? 'text-[#10B981]' : 'text-[#6B7280]'
                }`}>
                  {shot.result === 'Goal' ? '⚽ GOAL' : shot.result}
                </span>
                {shot.xg && (
                  <span className="text-[#FBBF24] font-mono">
                    xG {shot.xg.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {/* Momentum bar if available */}
          {data.momentum?.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-[#6B7280] mb-2">Match Momentum</div>
              <div className="flex h-8 gap-px rounded overflow-hidden bg-[#1F2937]">
                {data.momentum.map((point: any, i: number) => {
                  const value = point.value || 0
                  const isHome = value > 0
                  const height = Math.abs(value) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col justify-center"
                    >
                      <div
                        className={`w-full ${isHome ? 'bg-[#10B981]/70' : 'bg-[#0EA5E9]/70'}`}
                        style={{ height: `${Math.min(height, 100)}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                <span>← Home</span>
                <span>Away →</span>
              </div>
            </div>
          )}

          {/* Events */}
          {data.timeline.map((event, i) => {
            const icon = event.type === 'Goal' ? '⚽'
              : event.type === 'YellowCard' ? '🟨'
              : event.type === 'RedCard' ? '🟥'
              : event.type === 'SubstitutionIn' ? '🔄'
              : '📌'

            return (
              <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-[#1F2937]">
                <span className="text-[#6B7280] w-8 text-xs font-mono">
                  {event.minute}'
                </span>
                <span>{icon}</span>
                <span className="text-white">{event.player}</span>
                <span className="text-xs text-[#6B7280] capitalize ml-auto">
                  {event.type?.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
