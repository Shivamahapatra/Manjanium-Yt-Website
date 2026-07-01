"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AppSettings } from "@/lib/settings-context";

export function useUserSettings() {
  const { isLoaded, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Sync settings with Supabase
  const syncSettings = async (settings: Partial<AppSettings>) => {
    if (!isLoaded || !userId) return; // Only sync if logged in

    try {
      setIsLoading(true);
      
      // Flatten settings for Supabase columns if necessary
      const payload = {
        theme: settings.appearance?.theme,
        font_size: settings.appearance?.fontSize,
        animation_speed: settings.appearance?.animationSpeed,
        sidebar_state: settings.appearance?.sidebarAlwaysExpanded ? 'expanded' : 'collapsed',
        f1_dashboard_preset: settings.dashboard?.f1Preset,
        football_dashboard_preset: settings.dashboard?.footballPreset,
      };

      await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
    } catch (error) {
      console.error("Failed to sync settings to Supabase", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial settings from Supabase
  const fetchSettings = async () => {
    if (!isLoaded || !userId) return null;
    
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/settings');
      if (!res.ok) return null;
      
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch settings from Supabase", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncSettings,
    fetchSettings,
    isLoading
  };
}
