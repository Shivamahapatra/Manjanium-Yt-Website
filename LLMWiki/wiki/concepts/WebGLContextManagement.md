# WebGL Context Management

Tags: #three-js #performance #webgl #react-three-fiber

## The Problem
Browsers limit active WebGL contexts to 8-16 per page.
Mounting/unmounting Three.js Canvas components during preset switches
exhausts this limit → black screen or hard crash.

## The Fix: CSS Hiding Over Unmounting
Instead of conditionally rendering Canvas:
```tsx
// ❌ WRONG - destroys WebGL context
{showGlobe && <Globe />}

// ✅ CORRECT - keeps context alive
<div style={{ display: showGlobe ? 'block' : 'none' }}>
  <Globe />
</div>
```

## GlobeProvider Pattern
Created [[GlobeProvider]] context to manage globe visibility
across preset switches without unmounting the Canvas.

## Related Files
- `apps/hub/src/components/providers/GlobeProvider.tsx`
- `apps/hub/src/hooks/useGlobeKeepAlive.ts`
- `apps/hub/src/components/f1/Globe.tsx`

## Related
- [[MonorepoArchitecture]]
- [[PaddockSimulator]]
- [[RapierPhysics]]
