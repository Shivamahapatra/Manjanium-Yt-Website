# Paddock Simulator — Full Engineering Spec

## 1. Physics Engine Strategy
- Raycast Vehicle Controller (not box colliders)
- Four raycasts per chassis for suspension spring/dampen forces
- Tire grip: friction coefficient decreases linearly per lap distance
- Weather multiplier affects friction (dry vs wet surface values)
- Impact force: compare velocity vector delta per tick
- G-force threshold: 45G+ = DNF state
- Sub-threshold impacts: permanent motor torque dampening multiplier

## 2. UI & Aesthetics Pipeline
- Layer 1: Paddock Hub (CSS grid, lobby stream, track grid, liveries editor)
- Layer 2: HUD (absolute HTML over Canvas, SVG speedometer arcs, ERS/tire gauges)
- Layer 3: Post-Race Podium (freeze controls, tracking camera, performance sheet)

## 3. Tracks & Circuit Architecture
- Draco-compressed low-poly meshes for all 5 tracks
- Collision barriers separate from decorative models
- 3 sector sensor volumes per track (anti-cheat)
- Lap increment only fires if all 3 sectors verified sequentially
- Weather: dynamic lighting + roughness maps + physics coefficient changes

## 4. Settings & Controls Mapping
- Centralized input hook (no React re-renders)
- Manual: Space = upshift, L-Shift = downshift, RPM-matched impulse
- Auto: velocity + axle speed thresholds trigger gear changes
- Mouse steering: Pointer Lock API, cursor offset → steering angle
- Sensitivity: configurable via settings sliders

## 5. Game Logic & Systems Engine
- Grid: query qualifying times, sort by lap time, stagger start positions
- ERS: battery capped 100%, overtake key boosts motor force + drains battery
- Braking: regenerative recharge simulation
- DRS: from Lap 2 onwards, enabled if <1.0s behind car ahead at detection point
- DRS effect: reduces drag coefficient until braking or leaving straight

## 6. Multi-Zone Integration & Deployment
- Monorepo: apps/hub + apps/game via pnpm workspaces
- Next.js rewrites: /simulator/* → apps/game endpoint
- Same domain = shared cookies (Clerk + Supabase auto-shared)
- Navigation return: cleanup WebGL contexts + terminate listeners before routing back
