'use client'

import React, { useState } from 'react'
import { useFootballDashboardPreset } from '@/hooks/useDashboardPreset'
import { TopAppBar } from '@/components/ui/TopAppBar'
import { NavigationDrawer } from '@/components/ui/NavigationDrawer'
import { BottomNavBar } from '@/components/ui/BottomNavBar'

export default function FootballPage() {
  const [activeTab, setActiveTab] = useState('Football')
  const { config, presetId } = useFootballDashboardPreset()

  return (
    <>
      <TopAppBar title="Football Hub" leading="FB" trailingIcon="sensors" />
      <div className="flex pt-16 pb-16 md:pb-0">
        <NavigationDrawer activeTab={activeTab} onTabChange={setActiveTab} />

        <main
          style={{
            backgroundColor: 'var(--color-background)'
          }}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Title */}
            <div>
              <h1 style={{ color: 'var(--color-text-primary)' }} className="font-display-lg text-4xl font-bold mb-2">
                Football Championship Hub
              </h1>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                Preset: <span style={{ color: 'var(--color-secondary)' }} className="font-bold uppercase">{presetId}</span>
              </p>
            </div>

            {/* LAYOUT 1: Main Only */}
            {config.layout === 'main-only' && (
              <div className="space-y-6">
                {/* Live Matches - Full Width */}
                {config.showLiveMatches && (
                  <div className="space-y-4">
                    <h2 style={{ color: 'var(--color-secondary)' }} className="font-label-caps text-xs uppercase">
                      Live Matches
                    </h2>
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          backdropFilter: 'blur(12px)'
                        }}
                        className="rounded-xl p-8 border"
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-center flex-1">
                            <h3 style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                              Team {i}
                            </h3>
                          </div>
                          <div className="text-center">
                            <span style={{ color: 'var(--color-secondary)' }} className="font-telemetry-lg text-5xl font-black">
                              2 - 1
                            </span>
                          </div>
                          <div className="text-center flex-1">
                            <h3 style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                              Team {i + 1}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LAYOUT 2: Split (Matches + Standings) */}
            {config.layout === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Matches */}
                {config.showLiveMatches && (
                  <div className="space-y-4">
                    <h2 style={{ color: 'var(--color-secondary)' }} className="font-label-caps text-xs uppercase">
                      Live Matches
                    </h2>
                    {[1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          backdropFilter: 'blur(12px)'
                        }}
                        className="rounded-xl p-6 border"
                      >
                        <div className="flex justify-between items-center">
                          <span style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                            Team {i}
                          </span>
                          <span style={{ color: 'var(--color-secondary)' }} className="font-telemetry-lg text-3xl">
                            2-1
                          </span>
                          <span style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                            Team {i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Standings */}
                {config.showStandings && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-6 border"
                  >
                    <h2 style={{ color: 'var(--color-secondary)' }} className="font-label-caps text-xs uppercase mb-4">
                      League Standings
                    </h2>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(pos => (
                        <div
                          key={pos}
                          style={{
                            backgroundColor: 'var(--color-surface-container)',
                            borderColor: 'var(--color-border)'
                          }}
                          className="flex justify-between p-3 rounded border"
                        >
                          <span style={{ color: 'var(--color-primary)' }} className="font-bold">
                            {pos}
                          </span>
                          <span style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                            Team {pos}
                          </span>
                          <span style={{ color: 'var(--color-text-primary)' }} className="font-bold">
                            {pos * 3} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LAYOUT 3: Three Column (Everything) */}
            {config.layout === 'three-column' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Matches */}
                {config.showLiveMatches && (
                  <div className="space-y-4">
                    <h2 style={{ color: 'var(--color-secondary)' }} className="font-label-caps text-xs uppercase">
                      Matches
                    </h2>
                    {[1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-border)',
                          backdropFilter: 'blur(12px)'
                        }}
                        className="rounded-xl p-4 border"
                      >
                        <p style={{ color: 'var(--color-text-primary)' }} className="text-xs font-bold">
                          T{i} vs T{i + 1}
                        </p>
                        <p style={{ color: 'var(--color-secondary)' }} className="font-telemetry-lg">
                          2-1
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Standings */}
                {config.showStandings && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-4 border"
                  >
                    <h3 style={{ color: 'var(--color-secondary)' }} className="font-label-caps text-xs uppercase mb-3">
                      Standings
                    </h3>
                    <div className="space-y-1 text-xs">
                      {[1, 2, 3, 4].map(pos => (
                        <div key={pos} className="flex justify-between">
                          <span style={{ color: 'var(--color-text-primary)' }}>T{pos}</span>
                          <span style={{ color: 'var(--color-primary)' }} className="font-bold">
                            {pos * 3}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {config.showPlayerStats && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-4 border"
                  >
                    <h3 style={{ color: 'var(--color-secondary)' }} className="font-label-caps text-xs uppercase mb-3">
                      Top Scorers
                    </h3>
                    <div className="space-y-2 text-xs">
                      {['Salah', 'Kane', 'Benzema'].map(player => (
                        <div key={player} className="flex justify-between">
                          <span style={{ color: 'var(--color-text-primary)' }}>{player}</span>
                          <span style={{ color: 'var(--color-secondary)' }} className="font-bold">
                            {Math.floor(Math.random() * 20) + 5}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
