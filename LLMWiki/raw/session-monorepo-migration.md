# Session: Monorepo Migration & Game Setup

Date: 2026-06-29 to 2026-07-01
Status: In Progress

## What Was Done
- Converted single Next.js app to pnpm monorepo (apps/hub, apps/game, packages/ui)
- Moved existing sports dashboard to apps/hub
- Created apps/game for Paddock Simulator
- Created packages/ui for shared Stitch tokens
- Configured pnpm-workspace.yaml

## Key Decisions
- Pin Next.js to 14.2.35 (not 16 - Agent migration upgraded it silently)
- Use exact version pins, not ^ ranges for core deps
- Keep Clerk + Supabase versions from original working build

## Gotchas Encountered
- Agent upgraded Next.js from 14 → 16 silently during migration
- EPERM errors on Windows when deleting native .node binaries (kill node processes first)
- pnpm readline crashes on Windows with interactive prompts → use --force flag
- Root src/ and apps/hub/src/ both existed after migration → verified identical (184 files each) before deleting root
- mcp-remote and prisma need global npm install (not just npx)
- WebFetch MCP used uvx instead of npx → broke on Windows

## Current Status
- apps/hub: Next.js version being corrected
- apps/game: Game features built (physics, multiplayer, HUD, podium)
- Vercel Multi Zones: Not yet configured
- Both apps: Need clean build verification

## Next Steps
1. Confirm apps/hub runs on correct Next.js 14 version
2. Confirm apps/game renders (fix black screen)
3. Set up Vercel Multi Zones
4. Add global leaderboard
5. Add ghost racing
