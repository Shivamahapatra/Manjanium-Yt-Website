# 🧠 05. Core Race & Systems Logic

## Grid Construction Workflow
- [ ] On game load, fetch previous best qualifying times from the active database records.
- [ ] Sort player lists cleanly by their performance deltas to create the starting grid.
- [ ] Instantiate the 3D car objects step-by-step backward from the primary pole position marker.

## ERS Deployment Framework
- [ ] Maintain an energy capacity state restricted tightly to a 100% cap.
- [ ] Pressing the overtake key must apply a 1.4x factor to the max motor force while actively draining the state.
- [ ] Wire up brake application inputs to trigger small energy replenishment spikes (Regenerative Braking).

## DRS Activation Rules
- [ ] Enforce a strict restriction blocking DRS activation until Lap 2 begins.
- [ ] If a trailing car checks in at under 1.0 second behind the leading car at detection zones, enable the DRS trigger flag.
- [ ] Adjust the chassis drag component down by 40% when DRS is active, resetting immediately when brakes are touched.