# Ghost Telemetry Recording

Telemetry recording for the [[GhostRacingSystem]] is handled on a per-frame basis within the `useFrame` loop of the [[PaddockSimulator]]. 

## Mechanism
- At each frame, the current position `[x, y, z]` and rotation `[x, y, z, w]` are extracted from the rigid body physics simulation ([[RapierPhysics]]).
- The data, along with current speed and gear, is stored in a `frames` array with a relative timestamp.
- Upon crossing the finish line, the lap is saved if the `lapTime` is lower than the previously stored best lap in `localStorage`. 

## Playback Interpolation
Because frame rates fluctuate, playback cannot just read frames index-by-index. Instead, it finds the two frames surrounding the current elapsed time and interpolates the position and rotation using Three.js `lerp` and `slerp`.
