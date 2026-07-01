# Multi-Zone Deployment Configuration

In a [[MonorepoArchitecture]], specifically using Next.js, Vercel Multi Zones allow multiple distinct applications to be deployed on the same domain. 

## Configuration
For the [[ManjaniumSportsHub]]:
1. **Game App (`apps/game`)**: Configured with `basePath: '/simulator'` and `assetPrefix: '/simulator'` to ensure all internal Next.js assets are loaded from the correct subpath.
2. **Hub App (`apps/hub`)**: Configured with a `rewrites` rule targeting `/simulator/:path*` to proxy traffic to the `NEXT_PUBLIC_GAME_APP_URL`.

## Build Fallbacks
When the Hub is building on Vercel, it requires the Game App URL to configure the rewrites. If the environment variable isn't set, the build will crash with an invalid destination URL error. Providing a fallback like `${process.env.NEXT_PUBLIC_GAME_APP_URL || 'http://localhost:3001'}` prevents these build-time crashes.
