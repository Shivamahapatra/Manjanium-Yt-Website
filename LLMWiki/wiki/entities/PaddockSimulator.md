# Paddock Simulator

Tags: #entity #game #simulator

## Overview
A browser-based 3D F1 racing game integrated into the Manjanium platform.
Accessible at `/simulator` via [[VercelMultiZones]] rewrite from [[apps/hub]].

## Tech Stack
- Renderer: React Three Fiber
- Physics: @react-three/rapier ([[RapierPhysics]])
- State: Zustand (telemetry + multiplayer stores)
- Networking: Supabase Realtime (position broadcast ~20Hz)
- UI: [[StitchDesignSystem]] tokens

## Features Built ✅
- WASD vehicle controls with Rapier physics
- Dynamic follow camera
- Live telemetry HUD (speed, gear, lap, ERS, DRS)
- ERS battery system (speed boost)
- DRS zones
- Multiplayer ghost cars (lerp/slerp interpolation)
- Selection screen (mode, track, settings)
- Settings modal (manual/auto transmission, mouse steering)
- Post-race podium screen

## Features Pending ⏳
- Global leaderboard (Supabase DB)
- Ghost racing (best lap replay)
- AI opponent cars
- Additional tracks / car models
- Vercel Multi Zones connection to hub

## Key Files
```
apps/game/src/
├── components/
│   ├── GameCanvas.tsx        ← R3F Canvas wrapper
│   ├── GameHUD.tsx           ← Live telemetry overlay
│   ├── SelectionScreen.tsx   ← Pre-race menu
│   ├── SettingsModal.tsx     ← Control configuration
│   ├── PostRacePodium.tsx    ← Victory screen
│   ├── Track.tsx             ← Track environments
│   ├── physics/
│   │   └── VehicleController.tsx ← Rapier vehicle
│   └── ui/
│       └── MultiplayerCars.tsx   ← Ghost/remote cars
├── store/
│   ├── telemetry.ts          ← Speed, gear, ERS, DRS
│   └── multiplayer.ts        ← Remote player positions
└── lib/
    ├── supabase.ts           ← Realtime client
    └── multiplayer.ts        ← Position broadcasting
```

## Related
- [[MonorepoArchitecture]]
- [[RapierPhysics]]
- [[WebGLContextManagement]]
- [[VercelMultiZones]]
