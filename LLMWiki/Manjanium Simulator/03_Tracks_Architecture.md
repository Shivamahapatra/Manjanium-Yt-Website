# 🗺️ 03. Track Mapping & Triggers

## Circuit Optimization Assets
- Convert all tracks (Monza, Monaco, Spa, Austin, Track 5) into optimized low-poly meshes.
- Use Draco file compression to minimize Vercel compilation limits.
- Separate core visual meshes from invisible physics collision paths to conserve browser performance.

## Anti-Cheat Sector Logic
- [ ] Deploy three invisible, non-collidable checkpoint sensors across the track length.
- [ ] Sector 1 and Sector 2 must register true boolean values before the start/finish loop allows a valid lap increment.
- [ ] Map DRS validation triggers to bounding coordinate zones on designated straights.

## Environmental Configuration
- [ ] Connect dynamic lighting toggles to change circuit visibility values during rainfall simulation.
- [ ] Automatically alter global road friction baselines if a session wet-weather state changes to true.