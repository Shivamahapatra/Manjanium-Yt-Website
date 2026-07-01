export const F1_PRESETS = {
  live_focused: {
    name: "Live Focused",
    description: "Large live timing tower, minimal side panels.",
    timingSize: "large",
    showTelemetry: false,
    showStandings: false,
    layout: "main-only",
  },
  data_heavy: {
    name: "Data Heavy",
    description: "Live timing + full telemetry charts + standings.",
    timingSize: "medium",
    showTelemetry: true,
    showStandings: true,
    layout: "three-column",
  },
  minimal: {
    name: "Minimal",
    description: "Compact live timing, hide unnecessary panels.",
    timingSize: "small",
    showTelemetry: false,
    showStandings: false,
    layout: "compact",
  },
} as const;

export type F1PresetKey = keyof typeof F1_PRESETS;

export const FOOTBALL_PRESETS = {
  live_matches: {
    name: "Live Matches",
    description: "Live match cards prominent, minimal stats.",
    showMatches: true,
    showStandings: false,
    showStats: false,
    layout: "main-only",
  },
  standings_focused: {
    name: "Standings Focused",
    description: "Standings table large, matches secondary.",
    showMatches: true,
    showStandings: true,
    showStats: false,
    layout: "split",
  },
  stats_heavy: {
    name: "Stats Heavy",
    description: "Player stats, match stats, lineups all visible.",
    showMatches: true,
    showStandings: true,
    showStats: true,
    layout: "three-column",
  },
} as const;

export type FootballPresetKey = keyof typeof FOOTBALL_PRESETS;
