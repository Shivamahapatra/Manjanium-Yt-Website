# Rapier Physics Engine

Tags: #physics #three-js #game #rapier

## Overview
@react-three/rapier is a WASM-based physics engine used in [[PaddockSimulator]].
Significantly faster than Cannon.js for browser-based vehicle simulation.

## Key Learnings

### planeGeometry Must Be Rotated
Three.js planeGeometry lies in XY plane by default (vertical wall).
For a floor, always add rotation:
```tsx
// ❌ WRONG - creates invisible vertical wall blocking camera
<mesh>
  <planeGeometry args={[400, 400]} />
</mesh>

// ✅ CORRECT - horizontal floor
<mesh rotation={[-Math.PI / 2, 0, 0]}>
  <planeGeometry args={[400, 400]} />
</mesh>
```

### RigidBody + planeGeometry = Degenerate Collider
Using `colliders="cuboid"` with planeGeometry creates zero-thickness
bounding box → Rapier behaves unpredictably.
Fix: Use explicit CuboidCollider instead:
```tsx
<RigidBody type="fixed" colliders={false}>
  <CuboidCollider args={[200, 0.1, 200]} position={[0, -0.1, 0]} />
  <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[400, 400]} />
  </mesh>
</RigidBody>
```

### bufferAttribute JSX Syntax
Different @react-three/fiber versions require different syntax.
Use Drei's `<Line>` component to avoid TypeScript type mismatches:
```tsx
// ✅ Stable across versions
import { Line } from '@react-three/drei'
<Line points={points} color="#FBBF24" lineWidth={2} />
```

## Related Files
- `apps/game/src/components/physics/VehicleController.tsx`
- `apps/game/src/components/GameCanvas.tsx`
- `apps/game/src/components/GameTrack.tsx`

## Related
- [[PaddockSimulator]]
- [[WebGLContextManagement]]
