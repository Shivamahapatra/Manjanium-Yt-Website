# Project Preview
**Manjanium On Softs** is a high-performance, multi-sport telemetry and fan engagement platform. It delivers real-time data, news, and interactive experiences for Formula 1 and Football (Soccer) fans, characterized by a premium "telemetry" aesthetic, advanced motion layers, and dual-mode accessibility.

# Features
- **F1 Hub (Racing Telemetry)**: Live Timing Tower, Race Tracker, Pit Wall Simulation, Interactive Track Guides.
- **Football Center**: Score Center, League Standings, Top Scorers, Latest Updates.
- **Control Center**: Dual-Theme Toggle, Telemetry Settings, Profile Management.
- **Manjanium OS Terminal Chat**: Inline CLI Interface, Blended Data Stream, Clerk Authentication, Slash Commands, Real-Time Supabase Synchronization.

---

This is a placeholder file added to allow pushing to origin.
Revert 1
Revert 2

--- Update: Terminal Chat Integration (2026-06-23T15:02:14+05:30) ---
Changes made:
- Created TerminalChat.tsx in src/components/chat/TerminalChat.tsx with Clerk user integration and Supabase real-time subscriptions for the 'terminal_chats' table.
- Added a command palette accessible via '/' featuring /predict, /stats, /compare, /help.
- Integrated the TerminalChat inline into F1LiveTab.tsx.
- Integrated the TerminalChat inline into Football page.tsx.
- Updated PRD (Stitch UIUX/V2/project_prd_manjanium_on_softs.md) to include Manjanium OS Terminal Chat feature.
Context:
- The Manjanium OS Terminal Chat feature is now live on both F1 and Football Live tabs.
- Ready for active testing with Supabase table 'terminal_chats'.

--- Update: Terminal Sidebar Design (2026-06-23T15:43:43+05:30) ---
Changes made:
- CONVERTED Terminal Chat into a permanent, vertical right sidebar (`fixed top-24 right-4 h-[calc(100vh-110px)]`).
- Styled the chat to be sleek, glassmorphic (`bg-[#0a0a0a]/95`), with no fake macOS buttons (pure text header).
- Removed all fake/mock System Data generating intervals.
- Used React Portal `createPortal` to break the sidebar out of all CSS transform containers.
Context:
- The Manjanium OS Terminal Chat feature is live as a dedicated vertical sidebar on the right side.

--- Update: F1 Hub UI Stitch Design System Upgrade (2026-06-23T21:04:00+05:30) ---
Changes made:
- Created src/styles/f1-design-tokens.css to define design tokens (colors, typography, spacing).
- Created wrapper components F1Card.tsx and F1Badge.tsx in src/components/f1/.
- Upgraded src/app/f1/page.tsx (F1 Hub main page) to use Stitch styling and new badges.
- Upgraded src/components/f1/tabs/F1LiveTab.tsx by wrapping components in F1Card.
- Upgraded src/components/f1/tabs/F1TelemetryTab.tsx and src/components/f1/tabs/F1StandingsTab.tsx to use F1Card wrappers, preserving all Recharts and data logic.
- Upgraded src/components/f1/LiveTimingTower.tsx container.
- Updated src/components/f1/F1SubNav.tsx to use framer-motion indicator and new accent colors.
Context:
- The entire F1 Hub UI now incorporates the premium Stitch design system aesthetics while keeping all backend data logic, websockets, and API calls fully intact.

--- Update: Align Design Tokens with Stitch Spec (2026-06-23T21:30:00+05:30) ---
Changes made:
- Updated src/styles/f1-design-tokens.css: switched to --f1-* prefixed CSS variables matching the Stitch spec (--f1-accent, --f1-surface, --f1-border, etc.)
- Updated src/components/f1/F1Card.tsx: added inline style references to CSS vars (backgroundColor: var(--f1-surface), borderColor: var(--f1-border)), heading now uses var(--f1-font-heading); kept cn utility for class merging
- Updated src/components/f1/F1Badge.tsx: added 'info' variant (bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/50); kept 'live' variant for backwards compatibility; aligned all variant border styles to use /50 opacity
Context:
- All data logic (useEffect hooks, API calls, Clerk auth, Supabase subscriptions, Terminal Chat sidebar) preserved
- Build passes with 0 errors
- Ready for visual QA of F1 Hub tabs on live/preview

--- Update: Football Hub UI Stitch Design System Upgrade (2026-06-23T23:15:14) ---
Changes made:
- Created src/styles/football-design-tokens.css and imported it to football/page.tsx.
- Created FootballCard, FootballBadge, MatchTeamBadge, and LiveMatchCard wrappers.
- Upgraded Football Live matches inline mapping to use LiveMatchCard.
- Upgraded GroupStandingsCard, TopScorersWidget, MatchDetailsModal, and PlayerStatsModal to use FootballCard and Stitch design tokens.
Context:
- The Football Hub UI now incorporates the premium Stitch design system aesthetics while keeping all backend data logic, websockets, and API calls fully intact.
- Verified build with 0 errors.

--- Update: F1 Hub Preset Layouts (2026-06-24T09:00:00+05:30) ---
Changes made:
- Created F1PresetLiveFocused.tsx with real-time focus layout
- Created F1PresetStatsDetailed.tsx with analytical focus layout
- Created F1PresetCompactOverview.tsx with balanced overview layout
- Updated F1LiveTab.tsx with preset selector
- All components stretched to fill available space
- Each preset shows different data/insights
- Terminal Chat sidebar preserved and fixed
Context:
- Users can now switch between 3 different preset layouts
- Each preset optimized for different use cases
- All data fetching preserved
- Build passes with 0 errors
- Ready for visual testing and refinement

--- Update: Move F1 Preset Selector to Settings (2026-06-24T05:50:00Z) ---
Changes made:
- Updated src/hooks/useDashboardPreset.ts to support persisting new presets to Supabase/localStorage.
- Created src/lib/preset-utils.ts for utility functions.
- Created src/components/settings/PresetSidebar.tsx for an expanding sidebar preset selector.
- Created src/components/settings/F1DashboardPresets.tsx to display F1 preset options.
- Updated src/components/settings/DashboardPresets.tsx to embed F1DashboardPresets while keeping football presets.
- Updated src/components/f1/tabs/F1LiveTab.tsx to use the hook and removed local selector buttons.
Context:
- The preset selection is now successfully moved to the Settings page.
- Selection is persisted and automatically applies to F1 Hub.
- Next.js build passes with 0 errors.

--- Update: F1 Dashboard Presets Redesign - Clean & Spacious (2026-06-24T11:49:00+05:30) ---
Changes made:
- Redesigned F1PresetLiveFocused: 70% Timing Tower + 30% Globe (2 components)
- Redesigned F1PresetStatsDetailed: Tab-switched view (Standings/Telemetry/Weather/Race Log)
- Redesigned F1PresetCompactOverview: 3 sections (Session/Globe/Top10) with better spacing
- Increased padding (p-8) and gaps (gap-6) for whitespace
- Removed clutter by showing fewer components at once
- Added tab switcher to Stats Detailed for focused viewing
- Larger fonts and more breathing room
- Full-width layouts instead of cramped side-by-side
Context:
- Presets are now cleaner and less overwhelming
- Users can focus on one metric at a time (especially Stats Detailed)
- More professional, spacious appearance
- Build passes with 0 errors
- Settings control still intact
