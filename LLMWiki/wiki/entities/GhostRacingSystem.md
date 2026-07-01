# Ghost Racing System

The Ghost Racing system allows players to race against their own best lap times in the [[PaddockSimulator]].

## Components
- **GhostRecorder**: Records the player's telemetry (position, rotation, speed, gear) frame-by-frame during a lap and saves it to `localStorage` per track.
- **GhostPlayer**: Handles the playback of the recorded ghost lap. It uses `lerp` for position and `slerp` for rotation (quaternions) to smoothly interpolate between the recorded frames based on elapsed time.
- **GhostCar**: A 3D component rendered in the scene using a translucent `#0EA5E9` material to represent the ghost visually without obstructing the player's view.

## Related Concepts
- [[GhostTelemetryRecording]]
- [[RapierPhysics]]
