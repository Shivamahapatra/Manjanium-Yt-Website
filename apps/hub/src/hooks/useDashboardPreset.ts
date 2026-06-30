'use client'

import { useUserPreferences } from './useUserPreferences'
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
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
    showCircuitFocus: true,
    showWeather: true,
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
    showCircuitFocus: true,
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

export type F1NewPresetType = 'live-focused' | 'stats-detailed' | 'compact-overview';

export function useDashboardPreset() {
  const [preset, setPreset] = useState<F1NewPresetType>('live-focused');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const { userId: authUserId } = useAuth();

  useEffect(() => {
    const loadPreset = async () => {
      try {
        const saved = localStorage.getItem('f1-dashboard-preset');
        if (saved && ['live-focused', 'stats-detailed', 'compact-overview'].includes(saved)) {
          setPreset(saved as F1NewPresetType);
          setLoading(false);
          
          if (authUserId) {
            setUserId(authUserId);
            const { data } = await supabase
              .from('user_customization')
              .select('f1_dashboard_preset')
              .eq('user_id', authUserId)
              .single();
            
            if (data?.f1_dashboard_preset) {
              setPreset(data.f1_dashboard_preset as F1NewPresetType);
            }
          }
          return;
        }

        if (authUserId) {
          setUserId(authUserId);
          const { data } = await supabase
            .from('user_customization')
            .select('f1_dashboard_preset')
            .eq('user_id', authUserId)
            .single();
          
          if (data?.f1_dashboard_preset) {
            setPreset(data.f1_dashboard_preset as F1NewPresetType);
            localStorage.setItem('f1-dashboard-preset', data.f1_dashboard_preset);
          }
        }
      } catch (error) {
        console.error('Failed to load preset:', error);
        setPreset('live-focused');
      } finally {
        setLoading(false);
      }
    };

    loadPreset();
  }, [authUserId]);

  const updatePreset = async (newPreset: F1NewPresetType) => {
    try {
      setPreset(newPreset);
      localStorage.setItem('f1-dashboard-preset', newPreset);

      if (userId) {
        await supabase
          .from('user_customization')
          .update({ f1_dashboard_preset: newPreset })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Failed to update preset:', error);
      const saved = localStorage.getItem('f1-dashboard-preset') || 'live-focused';
      setPreset(saved as F1NewPresetType);
    }
  };

  return {
    preset,
    setPreset: updatePreset,
    loading
  };
}
