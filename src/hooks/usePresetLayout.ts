'use client'

import { useF1DashboardPreset, useFootballDashboardPreset } from './useDashboardPreset'

export function useF1PresetLayout() {
  const { config } = useF1DashboardPreset()

  return {
    // Visibility classes
    timingTowerClass: config.showLiveTimingTower ? '' : 'hidden',
    telemetryChartsClass: config.showTelemetryCharts ? '' : 'hidden',
    standingsClass: config.showStandings ? '' : 'hidden',
    circuitFocusClass: config.showCircuitFocus ? '' : 'hidden',
    weatherClass: config.showWeather ? '' : 'hidden',
    strategyClass: config.showStrategy ? '' : 'hidden',

    // Timing tower height — must be generous enough to show the full table
    timingTowerHeight:
      config.timingTowerSize === 'large'
        ? 'h-[700px]'
        : config.timingTowerSize === 'medium'
          ? 'h-[600px]'
          : 'h-[450px]',

    // On a 12-col grid, how wide should the timing tower column be
    timingTowerCols:
      config.timingTowerSize === 'large'
        ? 'lg:col-span-5'
        : config.timingTowerSize === 'medium'
          ? 'lg:col-span-4'
          : 'lg:col-span-3',

    // The main content area (globe / weather) fills the remaining cols
    mainGridCols:
      config.timingTowerSize === 'large'
        ? 'lg:col-span-7'
        : config.timingTowerSize === 'medium'
          ? 'lg:col-span-8'
          : 'lg:col-span-9'
  }
}

export function useFootballPresetLayout() {
  const { config } = useFootballDashboardPreset()

  return {
    // Visibility classes
    liveMatchesClass: config.showLiveMatches ? '' : 'hidden',
    standingsClass: config.showStandings ? '' : 'hidden',
    playerStatsClass: config.showPlayerStats ? '' : 'hidden',
    matchStatsClass: config.showMatchStats ? '' : 'hidden',
    lineupsClass: config.showLineups ? '' : 'hidden',

    // Grid distribution
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
