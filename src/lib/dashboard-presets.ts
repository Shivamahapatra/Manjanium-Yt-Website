export type WidgetSize = "small" | "medium" | "large";

export interface WidgetDefinition {
  id: string;
  size: WidgetSize;
  position: [number, number]; // [x, y]
}

export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  widgets: WidgetDefinition[];
  gridCols: number;
}

export const F1_PRESETS: Record<string, PresetDefinition> = {
  live_focused: {
    id: "live_focused",
    name: "Live Focused",
    description: "Perfect for watching live races",
    gridCols: 2,
    widgets: [
      { id: "live_dashboard", size: "large", position: [0, 0] },
      { id: "timing_tower", size: "medium", position: [0, 1] },
      { id: "telemetry", size: "medium", position: [1, 1] },
      { id: "messages", size: "small", position: [0, 2] },
    ],
  },
  stats_detailed: {
    id: "stats_detailed",
    name: "Stats Detailed",
    description: "Deep dive into championship analytics",
    gridCols: 3,
    widgets: [
      { id: "championship_standings", size: "large", position: [0, 0] },
      { id: "driver_ranking_chart", size: "large", position: [0, 1] },
      { id: "point_share", size: "medium", position: [0, 2] },
      { id: "driver_stats_bar", size: "medium", position: [1, 2] },
      { id: "upcoming_races_calendar", size: "small", position: [2, 2] },
    ],
  },
  compact_overview: {
    id: "compact_overview",
    name: "Compact Overview",
    description: "Quick summary of the current season",
    gridCols: 2,
    widgets: [
      { id: "current_standings_condensed", size: "medium", position: [0, 0] },
      { id: "next_race_countdown", size: "medium", position: [1, 0] },
      { id: "recent_results", size: "small", position: [0, 1] },
      { id: "upcoming_races_small", size: "small", position: [1, 1] },
      { id: "top_driver", size: "small", position: [0, 2] },
    ],
  },
};

export const FOOTBALL_PRESETS: Record<string, PresetDefinition> = {
  live_matches: {
    id: "live_matches",
    name: "Live Matches",
    description: "Best for during match days",
    gridCols: 2,
    widgets: [
      { id: "live_match_cards", size: "large", position: [0, 0] },
      { id: "live_chat_marquee", size: "large", position: [0, 1] },
      { id: "upcoming_matches", size: "medium", position: [0, 2] },
      { id: "match_status_counts", size: "small", position: [1, 2] },
    ],
  },
  standings_focus: {
    id: "standings_focus",
    name: "Standings Focus",
    description: "Track competition progression",
    gridCols: 3,
    widgets: [
      { id: "group_standings_all", size: "large", position: [0, 0] },
      { id: "top_scorers_leaderboard", size: "medium", position: [0, 1] },
      { id: "team_standings_by_group", size: "medium", position: [1, 1] },
      { id: "qualified_teams_list", size: "small", position: [2, 1] },
    ],
  },
  compact_stats: {
    id: "compact_stats",
    name: "Compact Stats",
    description: "Quick mobile-friendly overview",
    gridCols: 2,
    widgets: [
      { id: "live_matches_condensed", size: "medium", position: [0, 0] },
      { id: "standings_quick_view", size: "medium", position: [1, 0] },
      { id: "top_scorers_small", size: "small", position: [0, 1] },
      { id: "next_match_small", size: "small", position: [1, 1] },
    ],
  },
};
