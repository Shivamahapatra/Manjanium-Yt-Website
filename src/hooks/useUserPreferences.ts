'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  fontSize: "sm" | "md" | "lg";
  animationSpeed: "normal" | "reduced" | "fast";
  sidebarExpanded: boolean;
  favoriteTeams: string[];
  f1DashboardPreset: string;
  footballDashboardPreset: string;
  notifications: {
    email: boolean;
    push: boolean;
    alerts: boolean;
  };
  language: string;
  timezone: string;
}

export function useUserPreferences() {
  const { userId, isLoaded } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences on mount or when userId changes
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      setLoading(false);
      setPreferences(null);
      return;
    }

    async function fetchPreferences() {
      try {
        const { data, error: queryError } = await supabase
          .from("users_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (queryError) {
          if (queryError.code === "PGRST116") {
            // Row doesn't exist, that's okay
            setPreferences(null);
          } else {
            setError(queryError.message);
            console.error("Error fetching preferences:", queryError);
          }
        } else if (data) {
          setPreferences({
            theme: data.theme,
            fontSize: data.font_size,
            animationSpeed: data.animation_speed,
            sidebarExpanded: data.sidebar_expanded,
            favoriteTeams: data.favorite_teams || [],
            f1DashboardPreset: data.f1_dashboard_preset,
            footballDashboardPreset: data.football_dashboard_preset,
            notifications: data.notifications,
            language: data.language,
            timezone: data.timezone,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [userId, isLoaded]);

  async function updatePreferences(updates: Partial<UserPreferences>) {
    if (!userId) {
      setError("Not authenticated");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("users_preferences")
        .update({
          theme: updates.theme,
          font_size: updates.fontSize,
          animation_speed: updates.animationSpeed,
          sidebar_expanded: updates.sidebarExpanded,
          favorite_teams: updates.favoriteTeams,
          f1_dashboard_preset: updates.f1DashboardPreset,
          football_dashboard_preset: updates.footballDashboardPreset,
          notifications: updates.notifications,
          language: updates.language,
          timezone: updates.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message);
        console.error("Error updating preferences:", updateError);
        throw updateError;
      } else {
        setPreferences((prev) =>
          prev ? { ...prev, ...updates } : null
        );
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error:", err);
      throw err;
    }
  }

  return { preferences, loading, error, updatePreferences };
}
