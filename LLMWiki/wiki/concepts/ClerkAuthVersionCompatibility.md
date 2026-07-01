# Clerk Auth Version Compatibility

Tags: #auth #clerk #nextjs #compatibility

## Overview
During the monorepo migration of [[ManjaniumSportsHub]], we encountered critical version compatibility issues with `@clerk/nextjs` when paired with Next.js 14 vs 16.

## The Issue
Agents may silently upgrade Next.js to the latest version (e.g. v16) during migrations, which causes `@clerk/nextjs` to throw server errors if the Clerk version was originally designed for Next.js 14.

## Best Practices
1. **Always Pin Versions:** Use exact version pins (e.g., `"14.2.35"`) instead of ranges (`"^14.2.0"`) to prevent silent upgrades.
2. **Sync Auth + Framework:** Keep `@clerk/nextjs` and `next` versions locked to the original working build from before the migration.
3. **Cross-App Consistency:** Ensure both `apps/hub` and `apps/game` share the exact same Next.js and Clerk version in their respective `package.json` files to prevent cookie/session incompatibility across [[VercelMultiZones]].

## Related
- [[MonorepoArchitecture]]
- [[session-monorepo-migration]]
