# Tire Degradation System

Tags: #physics #gameplay #tires #game

## Overview
Dynamic grip simulation for [[PaddockSimulator]].
Friction coefficient degrades over race distance.

## Formula
grip = base_friction - (distance_covered * degradation_rate * weather_multiplier)

## Weather Multipliers
| Condition | Multiplier | Effect |
|-----------|------------|--------|
| Dry | 1.0 | Normal degradation |
| Mixed | 1.4 | 40% faster wear |
| Rain | 1.8 | 80% faster wear |

## Values
- base_friction: 1.2
- degradation_rate: 0.0001 per meter
- Minimum grip: 0.4 (car still drivable, very slippery)
- Updated: start of each lap

## HUD Display
Shown as percentage bar in [[GameHUD]] (green → yellow → red)

## Related
- [[RaycastVehicleController]]
- [[ERSSystem]]
- [[DRSSystem]]
