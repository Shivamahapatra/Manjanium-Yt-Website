# Pointer Lock Mouse Steering

Tags: #controls #input #game

## Overview
Optional mouse steering mode in [[PaddockSimulator]].
Uses browser Pointer Lock API for immersive control.

## How It Works
1. Player clicks canvas → Pointer Lock API locks cursor to viewport
2. `mousemove` event fires with `movementX` (relative delta, not absolute)
3. `movementX` maps to steering angle
4. Sensitivity slider scales the mapping ratio
5. Pressing ESC releases pointer lock

## Implementation
```typescript
document.addEventListener('mousemove', (e) => {
  if (!document.pointerLockElement) return
  const steeringDelta = e.movementX * sensitivity
  setSteering(Math.max(-1, Math.min(1, currentSteering + steeringDelta)))
})
```

## Settings
- Toggle: Settings modal checkbox
- Sensitivity: 0.001 - 0.01 (slider in [[SettingsModal]])

## Related
- [[PaddockSimulator]]
- [[TrackSectorSystem]]
