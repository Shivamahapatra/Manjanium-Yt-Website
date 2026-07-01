# Raycast Vehicle Controller

Tags: #physics #rapier #vehicle #game

## Overview
Advanced vehicle simulation technique used in [[PaddockSimulator]].
More realistic than box colliders — uses raycasts to simulate suspension.

## How It Works
- Single rigid body acts as the chassis
- 4 raycasts (one per wheel) fire downward every frame
- Each raycast measures suspension compression
- Spring force + dampening force calculated per wheel independently
- Net forces applied to chassis rigid body

## Why Not Box Colliders?
Box colliders are static — they can't simulate suspension travel,
weight transfer during braking, or cornering forces independently.
Raycast approach gives each wheel its own physics response.

## Implementation
Uses `@react-three/rapier` dynamic rigid body.
File: `apps/game/src/components/physics/VehicleController.tsx`

## Related
- [[RapierPhysics]]
- [[TireDegradation]]
- [[PaddockSimulator]]
