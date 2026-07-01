# Drag Reduction System (DRS)

Tags: #gameplay #drs #f1 #game

## Overview
Aerodynamic aid system in [[PaddockSimulator]].
Mirrors real F1 DRS rules.

## Rules
- Available from Lap 2 onwards
- Detection point: specific track location (per track config)
- Enabled if: gap to car ahead < 1.0 second at detection point
- Effect: reduces chassis drag coefficient
- Deactivated by: braking OR leaving DRS straight boundary

## Controls
- `Space` = Activate DRS (if available)
- HUD: shows OPEN/READY/DISABLED status ([[GameHUD]])

## Implementation
Uses bounding box check on designated straights per track.
Distance vector calculation between cars every frame.

## Related
- [[ERSSystem]]
- [[RaycastVehicleController]]
- [[TrackSectorSystem]]
