'use client'

import { useF1DashboardPreset, useFootballDashboardPreset } from './useDashboardPreset'

export function useF1PresetLayout() {
  const { config } = useF1DashboardPreset()

  return {
    // Apply visibility classes
    timingTowerClass: config.showLiveTimingTower ? 'block' : 'hidden',
    telemetryChartsClass: config.showTelemetryCharts ? 'block' : 'hidden',
    standingsClass: config.showStandings ? 'block' : 'hidden',
    circuitFocusClass: config.showCircuitFocus ? 'block' : 'hidden',
    weatherClass: config.showWeather ? 'block' : 'hidden',
    strategyClass: config.showStrategy ? 'block' : 'hidden',

    // Apply size adjustments
    timingTowerHeight:
      config.timingTowerSize === 'large'
        ? 'h-96'
        : config.timingTowerSize === 'medium'
          ? 'h-80'
          : 'h-64',

    // Apply layout adjustments
    mainGridCols:
      config.timingTowerSize === 'large'
        ? 'lg:col-span-4'
        : config.timingTowerSize === 'medium'
          ? 'lg:col-span-3'
          : 'lg:col-span-2',

    timingTowerCols:
      config.timingTowerSize === 'large'
        ? 'lg:col-span-1'
        : config.timingTowerSize === 'medium'
          ? 'lg:col-span-1'
          : 'lg:col-span-1'
  }
}

export function useFootballPresetLayout() {
  const { config } = useFootballDashboardPreset()

  return {
    // Apply visibility classes
    liveMatchesClass: config.showLiveMatches ? 'block' : 'hidden',
    standingsClass: config.showStandings ? 'block' : 'hidden',
    playerStatsClass: config.showPlayerStats ? 'block' : 'hidden',
    matchStatsClass: config.showMatchStats ? 'block' : 'hidden',
    lineupsClass: config.showLineups ? 'block' : 'hidden',

    // Apply layout based on preset
    gridLayout:
      config.layout === 'three-column'
        ? 'grid-cols-1 lg:grid-cols-3'
        : config.layout === 'split'
          ? 'grid-cols-1 lg:grid-cols-2'
          : 'grid-cols-1',

    matchCardSize:
      config.matchCardSize === 'large'
        ? 'h-auto'
        : config.matchCardSize === 'medium'
          ? 'h-64'
          : 'h-48'
  }
}
