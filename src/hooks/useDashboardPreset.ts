'use client'

import { useUserPreferences } from './useUserPreferences'

export type F1PresetType = 'f1_live_focused' | 'f1_data_heavy' | 'f1_minimal'
export type FootballPresetType = 'fb_live_matches' | 'fb_standings_focused' | 'fb_stats_heavy'

export interface PresetConfig {
  showLiveTimingTower: boolean
  showTelemetryCharts: boolean
  showStandings: boolean
  showCircuitFocus: boolean
  showWeather: boolean
  showStrategy: boolean
  timingTowerSize: 'large' | 'medium' | 'small'
  mainContentWidth: 'full' | 'wide' | 'normal'
  sidebarVisible: boolean
}

export interface FootballPresetConfig {
  showLiveMatches: boolean
  showStandings: boolean
  showPlayerStats: boolean
  showMatchStats: boolean
  showLineups: boolean
  layout: 'main-only' | 'split' | 'three-column'
  matchCardSize: 'large' | 'medium' | 'small'
}

const F1_PRESET_CONFIGS: Record<F1PresetType, PresetConfig> = {
  f1_live_focused: {
    showLiveTimingTower: true,
    showTelemetryCharts: false,
    showStandings: false,
    showCircuitFocus: false,
    showWeather: false,
    showStrategy: false,
    timingTowerSize: 'large',
    mainContentWidth: 'full',
    sidebarVisible: true
  },
  f1_data_heavy: {
    showLiveTimingTower: true,
    showTelemetryCharts: true,
    showStandings: true,
    showCircuitFocus: true,
    showWeather: true,
    showStrategy: true,
    timingTowerSize: 'medium',
    mainContentWidth: 'wide',
    sidebarVisible: true
  },
  f1_minimal: {
    showLiveTimingTower: true,
    showTelemetryCharts: false,
    showStandings: false,
    showCircuitFocus: false,
    showWeather: false,
    showStrategy: false,
    timingTowerSize: 'small',
    mainContentWidth: 'normal',
    sidebarVisible: true
  }
}

const FOOTBALL_PRESET_CONFIGS: Record<FootballPresetType, FootballPresetConfig> = {
  fb_live_matches: {
    showLiveMatches: true,
    showStandings: false,
    showPlayerStats: false,
    showMatchStats: false,
    showLineups: false,
    layout: 'main-only',
    matchCardSize: 'large'
  },
  fb_standings_focused: {
    showLiveMatches: true,
    showStandings: true,
    showPlayerStats: false,
    showMatchStats: false,
    showLineups: false,
    layout: 'split',
    matchCardSize: 'medium'
  },
  fb_stats_heavy: {
    showLiveMatches: true,
    showStandings: true,
    showPlayerStats: true,
    showMatchStats: true,
    showLineups: true,
    layout: 'three-column',
    matchCardSize: 'small'
  }
}

export function useF1DashboardPreset() {
  const { preferences } = useUserPreferences()
  const presetId = (preferences?.f1_dashboard_preset || 'f1_live_focused') as F1PresetType
  const config = F1_PRESET_CONFIGS[presetId] || F1_PRESET_CONFIGS['f1_live_focused']

  return {
    presetId,
    config,
    isLiveFocused: presetId === 'f1_live_focused',
    isDataHeavy: presetId === 'f1_data_heavy',
    isMinimal: presetId === 'f1_minimal'
  }
}

export function useFootballDashboardPreset() {
  const { preferences } = useUserPreferences()
  const presetId = (preferences?.football_dashboard_preset || 'fb_live_matches') as FootballPresetType
  const config = FOOTBALL_PRESET_CONFIGS[presetId] || FOOTBALL_PRESET_CONFIGS['fb_live_matches']

  return {
    presetId,
    config,
    isLiveMatches: presetId === 'fb_live_matches',
    isStandingsFocused: presetId === 'fb_standings_focused',
    isStatsHeavy: presetId === 'fb_stats_heavy'
  }
}
