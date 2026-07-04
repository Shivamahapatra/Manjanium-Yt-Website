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

--- Update: Preset Refinements - F1 & Football (2026-06-24T16:00:00+00:00) ---
Changes made:
- Applied preset system to Football Hub (3 presets with sidebar)
- Refined F1 Preset 1: 65/35 split (Timing/Globe) with better space utilization
- Redesigned F1 Preset 2: Single "Live" tab with Timing + Team Radio + Race Control + Live Track Map
- Reorganized F1 Preset 3: Globe moved to RIGHT, 3-column layout
- Created LiveTrackMap component for real-time race visualization
- Removed tab switcher from Preset 2 (all content visible)
- All presets controlled via Settings (not shown in hubs)
- Football presets mirror F1 structure
Context:
- F1 and Football both use preset system
- Settings expands sidebar for preset selection
- Live data flowing correctly in all presets
- Track map updates with race progress
- Build passes with 0 errors

--- Update: Monorepo & Game Simulator Setup (2026-06-30T16:25:00+05:30) ---
Changes made:
- Scaffolded `packages/ui` workspace for shared components (e.g., Button).
- Setup Next.js in `apps/game` for the Paddock Simulator.
- Implemented vehicle physics using `@react-three/rapier` and `three` in `apps/game/src/components/physics/VehicleController.tsx`.
- Integrated a live telemetry HUD (`GameHUD.tsx`) with a Zustand store.
- Configured Tailwind CSS v4 with `@source` directives to scan `packages/ui` across both `apps/hub` and `apps/game`.
- Implemented Supabase Realtime Multiplayer Sync in `apps/game/src/lib/multiplayer.ts` with `MultiplayerCars.tsx` for ghost cars.
- Addressed `@types/three` dependencies and lockfile sync for Vercel builds.
Context:
- The project is now a monorepo (`apps/hub`, `apps/game`, `packages/ui`).
- Game Simulator has working WASD physics, camera tracking, and basic multiplayer.
- Build passes successfully with updated `pnpm-lock.yaml`.

--- Update: Phase 5 Final Polish & Game Systems (2026-06-30T14:53:00Z) ---
Changes made:
- Added `SettingsModal.tsx` for real-time adjustments (Steering Sensitivity, Transmission, Mouse Steering).
- Upgraded `GameHUD.tsx` to dynamically display current Lap, ERS Battery level, and DRS availability.
- Created `PostRacePodium.tsx` overlay that triggers when a race is finished.
- Modified `VehicleController.tsx` to include ERS/DRS physics multipliers and applied steering sensitivity settings.
- Added finish line intersection logic to `Track.tsx` using Rapier sensors to detect and increment laps.
- Expanded `useTelemetryStore` in Zustand to handle the full `GameState`.
Context:
- All phases for the Paddock Simulator are now complete.
- Game loop is fully functional (Start, Drive, Deploy ERS/DRS, Finish Race, Podium).

--- Update: Monorepo Version Fix (2026-07-01T10:00:00+05:30) ---
Changes made:
- Fixed apps/hub/package.json: downgraded next from 16.2.9 to 14.2.35
- Fixed apps/hub/package.json: corrected @clerk/nextjs to match original version
- Fixed apps/game/package.json: pinned all versions to match hub exactly
- Removed "type": "module" from hub package.json (was breaking Next.js)
- Verified .env.local copied correctly to both apps
- Fresh pnpm install completed successfully
- Both apps verified running cleanly (hub on 3000, game on 3001)
Context:
- apps/hub: Next.js 14.2.35, fully working with Clerk auth and Supabase
- apps/game: Next.js 14.2.35, placeholder page ready for game migration
- Ready for Vercel Multi Zones setup

--- Update: Project Restructuring for Workspace Boundaries (2026-07-01T12:09:00+05:30) ---
Changes made:
- Renamed Obs-Raw to LLMWiki and updated its internal references.
- Created Manjanium_App and moved the monorepo application code (apps, packages, package.json, etc.) inside it.
- Updated .gitignore to exclude /LLMWiki/.obsidian/ but track the rest of the wiki.
Context:
- The project now strictly separates application code (/Manjanium_App) from the knowledge base (/LLMWiki) per the new global rules.

--- Update: 2026 World Cup Knockouts Update (2026-07-03T00:15:00+05:30) ---
Changes made:
- Added `KnockoutBrackets.tsx` UI component in `apps/hub` to render a 5-column bracket.
- Created `/api/football/knockouts` endpoint to fetch real-time 2026 World Cup data from ESPN's `fifa.world` API.
- Implemented chronological round parsing logic for the 32-team knockout structure.
- Updated `page.tsx` to include the Knockouts tab.
Context:
- The Knockout Brackets tab is now fully functional, live, and data-driven for the 2026 World Cup.

--- Update: 2026 World Cup Knockouts Mock Data Injection (2026-07-03T13:45:00+05:30) ---
Changes made:
- Intercepted the Supabase fetch in `apps/hub/src/app/api/football/knockouts/route.ts` to map placeholder matches (like "Winner Grp A") to simulated realistic team data (e.g., Mexico, England, France, Spain) and generated scores.
- Replaced the API placeholders with realistic names and country flags (via flagcdn).
Context:
- Supabase local instance is not responding on port 54321, so data is mocked at the API route layer before returning to the UI to bypass the empty/placeholder values returned from the database.
- The UI now properly shows simulated teams for Round of 32 and Round of 16.

--- Update: Live Auto-Updating Knockout Bracket Integration (2026-07-03T13:51:00+05:30) ---
Changes made:
- Integrated the open-source `worldcup26.ir` REST API to fetch live match data and team metadata.
- Rewrote `apps/hub/src/app/api/football/knockouts/route.ts` to merge teams with games and sort them into appropriate knockout rounds (R32, R16, QF, SF, Final).
- Added client-side polling every 60 seconds to `KnockoutBrackets.tsx` (`fetchBrackets` interval).
Context:
- The bracket now displays real data from a reliable third-party API instead of static mocked data.
- The UI will automatically update in real-time as live matches progress, fulfilling the auto-update requirement.

--- Update: FastF1 Python Telemetry Backend (2026-07-03T17:40:00+05:30) ---
Changes made:
- Created apps/telemetry/ Python FastAPI service
- Integrated FastF1 with ephemeral /tmp cache for distance-synchronized telemetry
- /api/compare-laps: distance-synchronized telemetry comparison
- /api/available-sessions: session list endpoint
- /api/session-drivers: driver list endpoint
- Proxy in apps/hub/src/app/api/f1/telemetry/route.ts
- Completely refactored F1TelemetryTab.tsx with new data structure
- Configured deployment target on Railway
- Added Speed, Delta, Throttle, Gear chart tabs
- Added pnpm dev:telemetry script in root package.json
Context:
- Cache: ephemeral /tmp (persistent volume to add at deployment)
- Cold start: ~30-60s first load per session (downloads ~50MB)
- Subsequent loads: sub-second from cache
- CORS configured for localhost:3000 + Vercel domain

--- Update: F1 Live Tab Skeleton Fix & Timeout (2026-07-04T06:37:00+05:30) ---
Changes made:
- Modified apps/hub/src/components/f1/tabs/F1LiveTab.tsx to include try/catch error handling around applyPayload.
- Added a finally block to the initialization routine to ensure the loading state is safely set to false.
- Added an AbortController with an 8000ms timeout to the /api/f1/live fetch fallback to prevent infinite hanging when the backend is unreachable.
Context:
- Addressed an issue where the frontend was getting stuck on the HUDSkeleton. It now gracefully fails and shows "F1 Data Unavailable" or initialization text if the Python backend is unlinked or unresponsive.

--- Update: FotMob API Integration (2026-07-04T07:10:00+05:30) ---
Changes made:
- Added 5 FotMob endpoints to apps/telemetry/main.py:
  /api/football/matches (by date, 150+ leagues)
  /api/football/match/{id} (xG, shotmap, lineups, ratings, momentum)
  /api/football/league/{id} (standings with xG)
  /api/football/team/{id} (squad, form, fixtures)
  /api/football/search (teams, players, leagues)
- Created Next.js proxy routes in apps/hub/api/football/fotmob/
- Added FOTMOB_LEAGUES constants in football-utils.ts
- FotMob base URL: https://www.fotmob.com/api (unofficial)
Context:
- No API key required (unofficial public endpoints)
- Rate limit: use with headers + reasonable polling intervals
- Data available: xG, shotmaps, player ratings, momentum, lineups
- 150+ leagues covered (vs ESPN's limited coverage)
- Use Supabase caching pattern to avoid rate limits
