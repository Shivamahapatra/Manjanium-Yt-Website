# Architectural Rebuild: Unified Multi-API Football Architecture

**Timestamp:** 2026-09-19T15:40:00+05:30  
**Tags:** [[Football Data]], [[FastAPI]], [[Next.js 14]], [[Framer Motion]], [[Understat]], [[API-Football]], [[Football-Data.org]]

## Executive Summary
Rebuilding the [[Manjanium On Softs]] `/football` platform and telemetry pipeline from the ground up to provide a FotMob-style 3-column interactive experience backed by a multi-API aggregation engine.

## Core Pillars
1. **API-Football (REST)**:
   - Exclusively responsible for real-time live match scores, match event timelines (goals, VAR, bookings, substitutions), and tactical lineups (formations, starting XI, benches).
   - Guarded by a 30s–60s in-memory [[TTL Cache]] to preserve the 100 req/day free-tier budget.

2. **Football-Data.org (REST)**:
   - Dedicated engine for fetching authoritative league standings and team schedules.
   - Explicit pinned tracking for [[FC Barcelona]] across [[La Liga]] (`PD`) and [[Champions League]] (`CL`).
   - Guarded by 15-minute (`900s`) standings cache and 30-minute (`1800s`) team schedule cache to stay within 10 req/min limits.

3. **Understat (Async Python)**:
   - Asynchronous shotmap scraping pulling raw `X`, `Y` normalized pitch coordinates, `xG` values, and minute-by-minute momentum curves for interactive SVG pitch visualizations.
   - Guarded by 1-hour (`3600s`) shot cache.

4. **FotMob 3-Column UI (`page.tsx`)**:
   - Built with [[Next.js 14]], [[Tailwind CSS]] grid, and [[Framer Motion]] `<motion.div>` accordion animations.
   - **Left Column**: Pinned Teams ([[FC Barcelona]]) + Top Leagues navigation.
   - **Center Column**: Date navigator, status pills, and collapsible league match groups with Framer Motion layout transitions.
   - **Right Column**: Interactive match context, Understat SVG shotmap, API-Football timeline & lineups, and Football-Data.org standings.
