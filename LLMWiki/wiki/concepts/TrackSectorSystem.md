# Track Sector System

Tags: #gameplay #anti-cheat #tracks #game

## Overview
Invisible sensor volumes that verify valid lap completion
in [[PaddockSimulator]]. Prevents corner-cutting exploits.

## How It Works
- 3 sensor volumes per track: Sector 1, Sector 2, Start/Finish
- Each sector sets a boolean flag when entered
- Lap increment ONLY fires if all 3 flags are true in sequence
- Flags reset on each lap start

## Implementation
```typescript
const sectorFlags = { s1: false, s2: false, sf: false }

// Only complete lap if all sectors hit in order
if (sectorFlags.s1 && sectorFlags.s2 && sectorFlags.sf) {
  completeLap()
  resetSectorFlags()
}
```

## Anti-Cheat
Without sectors, players could reverse to S/F line and
farm laps. Sequential sector check prevents this entirely.

## Related
- [[RaycastVehicleController]]
- [[DRSSystem]]
- [[PaddockSimulator]]
