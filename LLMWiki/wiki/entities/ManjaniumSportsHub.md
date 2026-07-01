# Manjanium Sports Hub

Tags: #entity #hub #sports

## Overview
The primary sports telemetry and fan engagement platform.
Covers F1 racing and FIFA World Cup 2026.
Lives in [[apps/hub]], deployed at manjanium-yt-website.vercel.app.

## Tech Stack
- Framework: Next.js 14 (pinned - do not upgrade)
- Auth: Clerk (@clerk/nextjs - match version from git history)
- Database: Supabase (real-time + REST)
- UI: [[StitchDesignSystem]]
- Animation: Framer Motion

## Features
- F1 Hub: Live Timing Tower, Telemetry, Standings, Calendar, Replay
- Football Hub: Live Matches, Group Standings, Top Scorers
- Manjanium OS Terminal Chat (F1 + Football only)
- Dashboard Presets (3 layouts each for F1 and Football)
- Settings page with preset customization

## Critical Architecture Rules
1. Terminal Chat only in F1 + Football layouts (NOT global)
2. All real-time data hoisted to parent components (not in presets)
3. Globe/Canvas uses CSS display:none not conditional rendering
4. Supabase subscriptions managed via realtimeManager.ts singleton

## Known Issues (Active)
- OpenF1 API returns null during no active session → shows error state (expected)
- user_customization table needs SQL migration before presets persist to DB

## Related
- [[MonorepoArchitecture]]
- [[StitchDesignSystem]]
- [[TerminalChat]]
- [[PaddockSimulator]]
