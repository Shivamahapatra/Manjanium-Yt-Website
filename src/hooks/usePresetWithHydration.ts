/**
 * usePresetWithHydration.ts
 *
 * Hydration-safe wrapper for preset state.
 *
 * Problem: useDashboardPreset reads localStorage inside a useEffect, but on
 * the first render both server and client start with the default value
 * ('live-focused'). The moment the useEffect fires on the client the value
 * may change, causing a visible flash.
 *
 * Solution: Track a separate `isMounted` flag and render a skeleton until the
 * flag is true. This guarantees the displayed preset always matches localStorage.
 *
 * This hook is intentionally thin – it delegates actual Supabase persistence
 * to useDashboardPreset so there is a single source of truth.
 */

import { useEffect, useState } from "react";

export type PresetKey = "live-focused" | "stats-detailed" | "compact-overview";

const VALID_PRESETS: PresetKey[] = [
  "live-focused",
  "stats-detailed",
  "compact-overview",
];

function isValidPreset(value: string | null): value is PresetKey {
  return VALID_PRESETS.includes(value as PresetKey);
}

export function usePresetWithHydration(defaultPreset: PresetKey = "live-focused") {
  /**
   * Start with the defaultPreset so SSR and the initial client render match.
   * isMounted starts false so the skeleton is shown instead of content.
   */
  const [isMounted, setIsMounted] = useState(false);
  const [preset, setPresetState] = useState<PresetKey>(defaultPreset);

  useEffect(() => {
    // Only runs on the client, after hydration is complete
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("f1-dashboard-preset")
        : null;

    if (isValidPreset(saved)) {
      setPresetState(saved);
    }

    setIsMounted(true);
  }, []);

  /** Persist to localStorage and update state. */
  const setPreset = (next: PresetKey) => {
    setPresetState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("f1-dashboard-preset", next);
    }
  };

  return { preset, setPreset, isMounted };
}
