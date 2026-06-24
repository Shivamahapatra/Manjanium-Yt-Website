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
