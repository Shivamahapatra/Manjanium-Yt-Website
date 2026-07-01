---
tags: [concept, architecture]
source_count: 1
---

# Monorepo Architecture

The [[Monorepo_Architecture]] is the code structure used by [[Manjanium_On_Softs]] to scale efficiently across multiple applications.

## Workspaces
- `apps/hub`: The main application containing the [[F1_Hub]] and [[Football_Center]].
- `apps/game`: Contains the [[Paddock_Simulator]].
- `packages/ui`: Shared UI components that are utilized across the entire monorepo using Tailwind CSS `@source` directives.

## Benefits
Allows seamless sharing of components, unified design tokens from the [[Stitch_Design_System]], and a single unified lockfile for streamlined Vercel deployments.

---
**Sources:**
- [[context]]
