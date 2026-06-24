'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export type FootballNewPresetType = 'live-matches' | 'standings-focus' | 'compact-stats';

export function useFootballDashboardPreset() {
  const [preset, setPreset] = useState<FootballNewPresetType>('live-matches');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const { userId: authUserId } = useAuth();

  useEffect(() => {
    const loadPreset = async () => {
      try {
        const saved = localStorage.getItem('football-dashboard-preset');
        if (saved && ['live-matches', 'standings-focus', 'compact-stats'].includes(saved)) {
          setPreset(saved as FootballNewPresetType);
          setLoading(false);

          if (authUserId) {
            setUserId(authUserId);
            const { data } = await supabase
              .from('user_customization')
              .select('football_dashboard_preset')
              .eq('user_id', authUserId)
              .single();

            if (data?.football_dashboard_preset) {
              setPreset(data.football_dashboard_preset as FootballNewPresetType);
            }
          }
          return;
        }

        if (authUserId) {
          setUserId(authUserId);
          const { data } = await supabase
            .from('user_customization')
            .select('football_dashboard_preset')
            .eq('user_id', authUserId)
            .single();

          if (data?.football_dashboard_preset) {
            setPreset(data.football_dashboard_preset as FootballNewPresetType);
            localStorage.setItem('football-dashboard-preset', data.football_dashboard_preset);
          }
        }
      } catch (error) {
        console.error('Failed to load football preset:', error);
        setPreset('live-matches');
      } finally {
        setLoading(false);
      }
    };

    loadPreset();
  }, [authUserId]);

  const updatePreset = async (newPreset: FootballNewPresetType) => {
    try {
      setPreset(newPreset);
      localStorage.setItem('football-dashboard-preset', newPreset);

      if (userId) {
        await supabase
          .from('user_customization')
          .update({ football_dashboard_preset: newPreset })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Failed to update football preset:', error);
      const saved = localStorage.getItem('football-dashboard-preset') || 'live-matches';
      setPreset(saved as FootballNewPresetType);
    }
  };

  return {
    preset,
    setPreset: updatePreset,
    loading
  };
}
