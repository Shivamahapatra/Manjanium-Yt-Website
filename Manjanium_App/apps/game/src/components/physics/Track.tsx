import { RigidBody } from '@react-three/rapier'
export function Track() {
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
      <RigidBody type="fixed" sensor>
        <mesh position={[0, 0, -10]}>
          <boxGeometry args={[15, 5, 1]} />
          <meshBasicMaterial transparent opacity={0.3} color="#10B981" />
        </mesh>
      </RigidBody>
    </group>
  )
}
