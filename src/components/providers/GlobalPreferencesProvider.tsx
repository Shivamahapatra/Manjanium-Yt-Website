"use client";

import React, { useEffect } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTheme } from "next-themes";

export function GlobalPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { preferences, loading } = useUserPreferences();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!preferences || loading) return;

    // Apply Theme
    if (preferences.theme) {
      setTheme(preferences.theme);
    }

    // Apply Font Size to HTML element
    if (preferences.fontSize) {
      const html = document.documentElement;
      html.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
      html.classList.add(`font-size-${preferences.fontSize}`);
    }

    // Apply Animation Speed to HTML element
    if (preferences.animationSpeed) {
      const html = document.documentElement;
      html.classList.remove('animation-speed-fast', 'animation-speed-reduced', 'animation-speed-normal');
      html.classList.add(`animation-speed-${preferences.animationSpeed}`);
    }
  }, [preferences, loading, setTheme]);

  return <>{children}</>;
}
