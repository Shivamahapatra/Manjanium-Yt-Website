# 🏎️ 01. Physics Engine Setup

## Core Stack
- **Engine:** `@react-three/rapier` (WASM-based physics layer)
- **Controller:** `DynamicRaycastVehicleController`

## Implementation Tasks
- [ ] Initialize Rapier `<Physics>` world wrapper with accurate gravity constraints.
- [ ] Implement a single rigid body to act as the chassis mesh container.
- [ ] Configure 4 independent raycast suspension points mapped to the chassis coordinate space.
- [ ] Set suspension variables: chassis mass (1800 kg), tuning stiffness, and rebound dampening.

## Logic Specifications
- **Impact G-Force Calculation:** Track velocity changes between sequential physics frames. If an impact exceeds the 45G limit, flag the vehicle state immediately as a DNF. For minor impacts between 15G and 44G, scale down maximum engine torque by 25% to simulate hardware damage.
- **Tire Wear & Grip Reduction:** Decrement tire grip coefficients at the completion of every lap step. Soft compounds degrade faster but provide high structural traction out of the gate, while weather conditions scale base friction boundaries.