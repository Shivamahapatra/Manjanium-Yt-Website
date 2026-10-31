'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

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
