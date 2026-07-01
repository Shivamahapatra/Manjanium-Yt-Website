# 🎨 02. UI & Stitch Aesthetics

## Styling Framework
- Use tokens from the shared Stitch Design System (`bg-background/40`, `backdrop-blur-md`, text modifications).
- Ensure zero-latency HTML scaling over the 3D canvas viewport context.

## UI Layer Checklists

### Layer 1: The Paddock Hub
- [ ] Build a sleek Bento Grid menu layout matching the primary sports platform theme.
- [ ] Integrate a live lobbies browser feeding off the `simulator_rooms` real-time database state.
- [ ] Add a track selection interface showing 3D structural outline previews.

### Layer 2: Real-Time HUD Overlay
- [ ] Create an absolute-positioned HTML container resting directly over the WebGL viewport.
- [ ] Implement a dynamic radial speedometer using SVG stroke animations.
- [ ] Add real-time linear meters tracing current ERS battery storage and tire wear percentages.

### Layer 3: Post-Race Podium Screen
- [ ] Program a slow cinematic camera pan around the top 3 finishing cars.
- [ ] Display an analytical leaderboard pulling final lap records from Supabase.
- [ ] Embed action targets for immediate "Rematch" requests or clean exits back to the Hub.