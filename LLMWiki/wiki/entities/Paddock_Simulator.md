---
tags: [entity, feature, game]
source_count: 1
---

# Paddock Simulator

The [[Paddock_Simulator]] is a 3D racing game built directly into [[Manjanium_On_Softs]] as part of the [[Monorepo_Architecture]] (in `apps/game`).

## Technology Stack
- **Engine**: `@react-three/rapier` and `three.js`.
- **State Management**: Zustand (for `GameHUD`, laps, ERS, DRS, telemetry).
- **Multiplayer**: Supabase Realtime Sync for ghost cars and multiplayer states.

## Mechanics
Includes adjustable Steering Sensitivity, Transmission controls, ERS/DRS physics multipliers, and a fully functional game loop (Start, Drive, Finish line detection, Post-Race Podium).

---
**Sources:**
- [[context]]
