# Monorepo Architecture

Tags: #architecture #monorepo #pnpm

## Overview
The Manjanium project uses a [[pnpm Workspaces]] monorepo structure to separate
the sports dashboard from the 3D game simulator while sharing UI components.

## Structure
```
apps/
├── hub/       → Sports dashboard (F1 + Football)
├── game/      → Paddock Simulator (3D racing game)
└── telemetry/ → Python FastAPI backend (FastF1 + Football multi-API)
packages/
└── ui/        → Shared Stitch Design System tokens
```
Key Decisions

[[apps/hub]] runs on Next.js 14 (original version - do not upgrade)
[[apps/game]] runs on same Next.js version as hub (avoid version conflicts)
[[FastF1TelemetryBackend]] (`apps/telemetry`) runs as an independent Python FastAPI service on port 8000
Shared deps go in packages/ui, not duplicated in each app
Both frontend apps share same Clerk + Supabase credentials via .env.local
Orphaned simulator files and 3D dependencies were purged from `apps/hub` during [[DeadCodeAndDependencyHygiene]]

Known Gotchas

pnpm interactive prompts crash readline in Windows PowerShell → use --force flag
EPERM errors on .node binaries → kill Node processes before deleting node_modules
"type": "module" in package.json breaks Next.js 14 → never add this
Next.js version drift: Agent migrations can silently upgrade versions → always pin exact versions

Related

[[StitchDesignSystem]]
[[VercelMultiZones]]
[[PaddockSimulator]]
[[apps/hub]]
