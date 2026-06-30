import { RigidBody } from '@react-three/rapier'
import { useTelemetryStore } from '../../store/telemetry'
import { useRef } from 'react'

export function Track() {
  const { lap, totalLaps, setLap, setRaceFinished } = useTelemetryStore();
  const lastCrossTime = useRef(0);

  const handleFinishLine = () => {
    const now = Date.now();
    // 5 seconds cooldown to prevent multiple triggers
    if (now - lastCrossTime.current > 5000) {
      lastCrossTime.current = now;
      if (lap < totalLaps) {
        setLap(lap + 1);
      } else {
        setRaceFinished(true);
      }
    }
  };

  return (
    <group>
      {/* Ground Plane */}
      <RigidBody type="fixed" friction={1}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[500, 1, 500]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </RigidBody>
      
      {/* Start/Finish Line Collider for Laps */}
      <RigidBody type="fixed" sensor onIntersectionEnter={handleFinishLine}>
        <mesh position={[0, 0, -10]}>
          <boxGeometry args={[15, 5, 1]} />
          <meshBasicMaterial transparent opacity={0.3} color="#10B981" />
        </mesh>
      </RigidBody>
    </group>
  )
}
