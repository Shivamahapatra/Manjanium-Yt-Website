'use client'

import React, { useState } from 'react'
import { useF1DashboardPreset } from '@/hooks/useDashboardPreset'
import { TopAppBar } from '@/components/ui/TopAppBar'
import { NavigationDrawer } from '@/components/ui/NavigationDrawer'
import { BottomNavBar } from '@/components/ui/BottomNavBar'

export default function F1Page() {
  const [activeTab, setActiveTab] = useState('F1 Hub')
  const { config, presetId } = useF1DashboardPreset()

  return (
    <>
      <TopAppBar title="F1 Hub" leading="F1" trailingIcon="sensors" />
      <div className="flex pt-16 pb-16 md:pb-0">
        <NavigationDrawer activeTab={activeTab} onTabChange={setActiveTab} />

        <main
          style={{
            backgroundColor: 'var(--color-background)',
            width: config.mainContentWidth === 'full' ? '100%' : 'auto'
          }}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Title */}
            <div>
              <h1 style={{ color: 'var(--color-text-primary)' }} className="font-display-lg text-4xl font-bold mb-2">
                F1 Championship Hub
              </h1>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                Preset: <span style={{ color: 'var(--color-primary)' }} className="font-bold uppercase">{presetId}</span>
              </p>
            </div>

            {/* Bento Grid - Responsive based on preset */}
            <div
              className={
                config.timingTowerSize === 'large'
                  ? 'grid grid-cols-1 lg:grid-cols-4 gap-6'
                  : config.timingTowerSize === 'medium'
                    ? 'grid grid-cols-1 lg:grid-cols-3 gap-6'
                    : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
              }
            >
              {/* LIVE TIMING TOWER - Always shown */}
              {config.showLiveTimingTower && (
                <div
                  className={
                    config.timingTowerSize === 'large'
                      ? 'lg:col-span-1'
                      : config.timingTowerSize === 'medium'
                        ? 'lg:col-span-1'
                        : 'lg:col-span-1'
                  }
                >
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-6 border h-96 overflow-y-auto"
                  >
                    <h2 style={{ color: 'var(--color-primary)' }} className="font-label-caps text-xs uppercase mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Live Timing Tower
                    </h2>
                    <div className="space-y-2 font-telemetry-sm">
                      {[1, 2, 3, 4, 5, 6].map(pos => (
                        <div key={pos} style={{ color: 'var(--color-text-primary)' }} className="flex justify-between py-2 border-b border-outline-variant">
                          <span>{pos}</span>
                          <span>VER / NOR / LEC</span>
                          <span style={{ color: 'var(--color-primary)' }}>+{(pos * 0.2).toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN CONTENT AREA */}
              <div
                className={
                  config.timingTowerSize === 'large'
                    ? 'lg:col-span-2'
                    : config.timingTowerSize === 'medium'
                      ? 'lg:col-span-2'
                      : 'lg:col-span-1'
                }
              >
                {/* Circuit Focus Card */}
                {config.showCircuitFocus && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl overflow-hidden border h-80 mb-6"
                  >
                    <div
                      style={{
                        backgroundImage:
                          'url(https://images.unsplash.com/photo-1488208840635-d5b3d6b89b99?w=800)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      className="w-full h-full relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-headline-md text-2xl font-bold">
                          Monaco Grand Prix
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                          3.337 km | 78 Laps
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Telemetry Charts */}
                {config.showTelemetryCharts && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-6 border"
                  >
                    <h2 style={{ color: 'var(--color-primary)' }} className="font-label-caps text-xs uppercase mb-4">
                      Head-to-Head Telemetry
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div style={{ backgroundColor: 'var(--color-surface-container)' }} className="p-4 rounded-lg">
                        <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs mb-2">Speed Trace</p>
                        <div style={{ height: '100px', backgroundColor: 'var(--color-surface-container-high)' }} className="rounded"></div>
                      </div>
                      <div style={{ backgroundColor: 'var(--color-surface-container)' }} className="p-4 rounded-lg">
                        <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs mb-2">Throttle Input</p>
                        <div style={{ height: '100px', backgroundColor: 'var(--color-surface-container-high)' }} className="rounded"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDEBAR */}
              <div
                className={
                  config.timingTowerSize === 'large'
                    ? 'lg:col-span-1'
                    : config.timingTowerSize === 'medium'
                      ? 'lg:col-span-0'
                      : 'lg:col-span-1'
                }
              >
                {/* Weather Widget */}
                {config.showWeather && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-4 border mb-4"
                  >
                    <h3 style={{ color: 'var(--color-text-secondary)' }} className="font-label-caps text-xs uppercase mb-3">
                      Weather
                    </h3>
                    <div style={{ color: 'var(--color-text-primary)' }} className="space-y-2 font-telemetry-sm">
                      <div className="flex justify-between">
                        <span>Air Temp</span>
                        <span style={{ color: 'var(--color-primary)' }}>24°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Track Temp</span>
                        <span style={{ color: 'var(--color-primary)' }}>38°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rain Chance</span>
                        <span style={{ color: 'var(--color-primary)' }}>15%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strategy Widget */}
                {config.showStrategy && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      backdropFilter: 'blur(12px)'
                    }}
                    className="rounded-xl p-4 border"
                  >
                    <h3 style={{ color: 'var(--color-text-secondary)' }} className="font-label-caps text-xs uppercase mb-3">
                      Strategy Hint
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
                      One-stop (Soft-Hard) is fastest predicted strategy.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* STANDINGS - Full Width if shown */}
            {config.showStandings && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  backdropFilter: 'blur(12px)'
                }}
                className="rounded-xl p-6 border"
              >
                <h2 style={{ color: 'var(--color-primary)' }} className="font-label-caps text-xs uppercase mb-4">
                  Championship Standings
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottomColor: 'var(--color-border)' }} className="border-b">
                        <th className="text-left py-2" style={{ color: 'var(--color-text-secondary)' }}>
                          POS
                        </th>
                        <th className="text-left py-2" style={{ color: 'var(--color-text-secondary)' }}>
                          DRIVER
                        </th>
                        <th className="text-right py-2" style={{ color: 'var(--color-text-secondary)' }}>
                          PTS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map(pos => (
                        <tr key={pos} style={{ borderBottomColor: 'var(--color-border)' }} className="border-b">
                          <td style={{ color: 'var(--color-primary)' }} className="py-2 font-bold">
                            {pos}
                          </td>
                          <td style={{ color: 'var(--color-text-primary)' }} className="py-2">
                            Driver {pos}
                          </td>
                          <td style={{ color: 'var(--color-text-primary)' }} className="text-right py-2 font-bold">
                            {(100 - pos * 5)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
