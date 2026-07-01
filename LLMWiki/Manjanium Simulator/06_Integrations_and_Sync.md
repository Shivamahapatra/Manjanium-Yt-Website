# 🔗 06. Multi-Zone System & Deployment Sync

## Monorepo Configuration
- Divide the root directory configuration using pnpm workspaces.
- Isolate components cleanly into `apps/hub`, `apps/game`, and shared asset buckets under `packages/ui`.

## Workspace Integration Tasks
- [ ] Implement standard asset route mapping inside the primary hub setup file:
```js
// Inside apps/hub/next.config.ts rewrites
{
  source: "/simulator/:path*",
  destination: process.env.NODE_ENV === "production"
    ? "[https://manjanium-game-engine.vercel.app/:path](https://manjanium-game-engine.vercel.app/:path)*"
    : "http://localhost:3001/:path*"
}
- [ ] Ensure shared cookie storage carries across applications seamlessly on identical domains.
    
- [ ] Maintain consistent active Supabase login states as users jump into the game.
    
- [ ] Add a prominent escape navigation link inside the game layout tracking back to the central analytics hub.
    