# Manjanium Status Audit
# Development Roadmap
## 1. Physics [#physics]
- [ ] Integrate `@react-three/rapier` (WASM physics engine)
- [ ] Implement Raycast Vehicle Controller
- [ ] Write crash physics (G-Force threshold detection)
- [ ] Write tire degradation logic (Friction coefficient formula)

## 2. Settings [#settings]
- [ ] Create ESC-triggered Modal
- [ ] Implement control bindings (W/A/S/D + Shift/Space/Ctrl)
- [ ] Create "Mouse Steering" toggle
- [ ] Add Transmission (Manual/Auto) logic

## 3. Track [#track]
- [ ] Model Monza
- [ ] Model Monaco
- [ ] Model Spa
- [ ] Model Austin
- [ ] Model [Fifth Track]
- [ ] Set up collision boxes for Lap counting

## 4. UI & Aesthetics [#ui]
- [ ] Integrate Stitch Design System tokens
- [ ] Build Layer 1: Home/Selection Screen
- [ ] Build Layer 2: In-Game HUD (Speed, Lap, Gear)
- [ ] Build Layer 3: Podium Screen

## 5. Navigation & Channel Sync [#nav]
- [ ] Sync `apps/hub` to `apps/game` (Vercel Rewrites)
- [ ] Create "Return to Channel" button in game HUD

## 6. Verification [#qa]
- [ ] Run Lighthouse Audit for 3D FPS stability
- [ ] Test Auth consistency across domains