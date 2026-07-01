# Session: Ghost Racing and Vercel Multi Zones (2026-07-01)

## What was built
- Added Ghost Racing feature to the Paddock Simulator (`apps/game`).
  - Recorded telemetry data frame-by-frame.
  - Implemented ghost playback with smooth `lerp` and `slerp` interpolation.
  - Built `<GhostCar />` component using a translucent `#0EA5E9` material.
  - Added delta time vs ghost to the HUD.
- Configured Vercel Multi Zones routing.
  - Set `basePath: '/simulator'` and `assetPrefix: '/simulator'` in `apps/game/next.config.mjs`.
  - Added `rewrites` in `apps/hub/next.config.mjs` to proxy `/simulator` to the `NEXT_PUBLIC_GAME_APP_URL`.
  - Added a build fallback for `NEXT_PUBLIC_GAME_APP_URL` to prevent Vercel deployment failures.

## Key Decisions & Fixes
- **Vercel Deployments**: Diagnosed the `supabaseUrl is required` build error on Vercel, isolated it to missing environment variables for the Game App, and guided the user to configure the Vercel Dashboard correctly.
- **Fallback URL**: Modified the `hub`'s rewrite rules to fallback to `http://localhost:3001` during the build phase if the env variable isn't injected yet.

## Files Changed
- `apps/game/src/lib/ghostRecorder.ts`
- `apps/game/src/lib/ghostPlayer.ts`
- `apps/game/src/components/physics/GhostCar.tsx`
- `apps/game/src/components/physics/VehicleController.tsx`
- `apps/game/src/components/GameCanvas.tsx`
- `apps/game/src/components/ui/GameHUD.tsx`
- `apps/hub/next.config.mjs`
- `ping.txt`

## Next Steps
- Implement global leaderboards pulling from Supabase.
- Finalize the Track selection architecture.
- Add Ghost Race multiplayer matchmaking.
