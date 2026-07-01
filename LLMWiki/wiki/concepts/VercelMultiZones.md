# Vercel Multi Zones

Tags: #deployment #vercel #architecture

## Overview
Next.js Multi Zones allows multiple Next.js apps to serve from the same domain.
Used to connect [[ManjaniumSportsHub]] and [[PaddockSimulator]] seamlessly.

## How It Works
```
manjanium-yt-website.vercel.app/          → apps/hub (Vercel Project 1)
manjanium-yt-website.vercel.app/simulator → apps/game (Vercel Project 2)
```
The hub rewrites `/simulator/*` requests to the game app's Vercel URL.
Supabase sessions and Clerk auth cookies are shared automatically
(same domain = same cookie scope).

## Implementation (Pending)
In `apps/hub/next.config.ts`, add:
```typescript
async rewrites() {
  return {
    afterFiles: [
      {
        source: '/simulator',
        destination: `${process.env.GAME_APP_URL}/simulator`,
      },
      {
        source: '/simulator/:path*',
        destination: `${process.env.GAME_APP_URL}/simulator/:path*`,
      },
    ],
  }
},
```
In `apps/game/next.config.ts`:
```typescript
basePath: '/simulator',
```

## Environment Variables Needed
- `GAME_APP_URL` in `apps/hub` → URL of the deployed game Vercel project
- Both apps need identical CLERK + SUPABASE env vars

## Status
⏳ Not yet implemented — pending stable local builds of both apps.

## Related
- [[MonorepoArchitecture]]
- [[ManjaniumSportsHub]]
- [[PaddockSimulator]]
