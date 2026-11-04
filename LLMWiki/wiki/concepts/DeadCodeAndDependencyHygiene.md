# Dead Code and Dependency Hygiene

Tags: #architecture #cleanup #typescript #fastapi #monorepo

## Overview
Because [[Manjanium_On_Softs]] evolved rapidly across [[ManjaniumSportsHub]] (`apps/hub`), [[PaddockSimulator]] (`apps/game`), and [[FastF1TelemetryBackend]] (`apps/telemetry`), a structured two-phase audit and cleanup was executed on branch `chore/phase2-dead-code-cleanup` (`session-2026-10-31-phase2-dead-code-cleanup.md`).

## Core Cleanup Patterns
1. **Strict Compiler Enforcement (`F-10`)**:
   - Cleaned 53 files across `apps/hub` and `apps/game` so `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` passes with zero errors.
2. **Orphaned Cross-App Migration Cleanup (`F-01`, `F-05`)**:
   - Removed 14 legacy 3D simulator files from `apps/hub` that had been superseded when [[PaddockSimulator]] moved into `apps/game` under [[MonorepoArchitecture]].
   - Extracted active [[GhostRacingSystem]] singletons (`ghostPlayer` and `ghostRecorder`) into dedicated modules (`apps/game/src/lib/ghostPlayer.ts` and `apps/game/src/lib/ghostRecorder.ts`) before deleting the legacy `VehicleController.tsx` and `Track.tsx` (which were superseded by `[[RaycastVehicleController]]` in `ProVehicleController.tsx` and modular `components/tracks/*`).
3. **API Route & Component Pruning (`F-02`, `F-04`)**:
   - Removed 53 unreferenced React components, hooks, libs, and unused CSS files in `apps/hub`, while retaining `src/types/football.ts` (imported by `src/types/match.ts`) and `src/styles/football-design-tokens.css` (imported by `src/app/layout.tsx`).
   - Removed 13 uncalled Next.js API routes and `fallbackData.ts`, while explicitly preserving external webhook and health endpoints (`/api/auth/webhook`, `/api/f1/ping`).
4. **Workspace Dependency Pruning (`F-09`)**:
   - Removed 11 unused npm packages from `apps/hub/package.json` (including orphaned Three.js/Rapier packages left over from pre-monorepo simulator code) and `lucide-react` from `apps/game/package.json`.
5. **Backend Route Preservation (`F-06`)**:
   - Pruned unused Python imports, dead helper functions, and scratch test scripts in [[FastF1TelemetryBackend]] while verifying all 18 FastAPI routes load cleanly.

## Related
- [[MonorepoArchitecture]]
- [[ManjaniumSportsHub]]
- [[PaddockSimulator]]
- [[GhostRacingSystem]]
- [[FastF1TelemetryBackend]]

