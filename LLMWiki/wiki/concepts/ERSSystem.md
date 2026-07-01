# Energy Recovery System (ERS)

Tags: #gameplay #ers #f1 #game

## Overview
Battery-based speed boost system in [[PaddockSimulator]].
Mirrors real F1 ERS mechanics.

## Rules
- Battery: 0-100% capacity
- Overtake key (Shift): boosts motor force × multiplier, drains battery
- Braking: regenerative charging (battery fills)
- Battery depleted: boost disabled until recharged

## Controls
- `Shift` = Deploy ERS (overtake mode)
- Braking auto-recharges
- HUD: yellow battery bar (bottom left of [[GameHUD]])

## Implementation
Managed in `apps/game/src/store/telemetry.ts`

## Related
- [[DRSSystem]]
- [[RaycastVehicleController]]
- [[TireDegradation]]
