"use client";

import React, { useEffect } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTheme } from "next-themes";
import { MotionConfig } from "framer-motion";

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { preferences, loading } = useUserPreferences();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!preferences || loading) return;

    const root = document.documentElement;

    // Set theme
    if (preferences.theme) {
      setTheme(preferences.theme);
      root.setAttribute("data-theme", preferences.theme);
    }

    // Set font size
    if (preferences.fontSize) {
      const fontSizeMap = {
        sm: "12px",
        md: "14px",
        lg: "16px",
      };
      root.style.setProperty("--font-size", fontSizeMap[preferences.fontSize]);
    }

    // Set animation duration
    if (preferences.animationSpeed) {
      const animSpeedMap = {
        reduced: "0.1s",
        fast: "0.15s",
        normal: "0.3s",
      };
      root.style.setProperty("--animation-duration", animSpeedMap[preferences.animationSpeed]);
    }
  }, [preferences, loading, setTheme]);

  // Map speed to numeric duration for Framer Motion
  let motionDuration = 0.3;
  if (preferences?.animationSpeed === "reduced") motionDuration = 0.1;
  else if (preferences?.animationSpeed === "fast") motionDuration = 0.15;

  return (
    <MotionConfig transition={{ duration: motionDuration }}>
      {children}
    </MotionConfig>
  );
}
