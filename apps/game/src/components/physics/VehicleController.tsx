import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useTelemetryStore } from '../../store/telemetry'

export function VehicleController() {
  const chassisRef = useRef<RapierRigidBody>(null)
  const [, getKeys] = useKeyboardControls()
  
  // Reusable vectors for calculations
  const forwardVector = new THREE.Vector3()
  const cameraOffset = new THREE.Vector3()
  const desiredCameraPos = new THREE.Vector3()
  
  const ACCELERATION = 15000;
  const TURN_SPEED = 8000;

  useFrame((state, delta) => {
    if (!chassisRef.current) return
    
    const { forward, backward, left, right, brake } = getKeys()
    const body = chassisRef.current
    
    // Get current rotation to determine forward direction
    const rotation = body.rotation()
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    
    // Assuming +Z is forward
    forwardVector.set(0, 0, 1).applyQuaternion(quaternion)

    // Physics tuning
    body.setLinearDamping(1.5)
    body.setAngularDamping(2.0)

    // Acceleration & Braking
    let engineForce = 0
    if (forward) engineForce += ACCELERATION
    if (backward) engineForce -= ACCELERATION
    
    if (engineForce !== 0) {
      body.applyImpulse({
        x: forwardVector.x * engineForce * delta,
        y: 0,
        z: forwardVector.z * engineForce * delta
      }, true)
    }
    
    // Steering
    const velocity = body.linvel()
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
    
    // Update telemetry (approximate km/h)
    useTelemetryStore.getState().setTelemetry(Math.round(speed * 3.6), 1)

    if (speed > 1) { // Only allow turning if moving
      let turnDirection = 0
      if (left) turnDirection += TURN_SPEED
      if (right) turnDirection -= TURN_SPEED
      
      // Invert steering when reversing
      const dot = velocity.x * forwardVector.x + velocity.z * forwardVector.z
      if (dot < 0) {
        turnDirection *= -1
      }

      if (turnDirection !== 0) {
        body.applyTorqueImpulse({
          x: 0,
          y: turnDirection * delta,
          z: 0
        }, true)
      }
    }

    // Camera Follow (Trailing behind the car)
    const position = body.translation()
    // Offset camera behind (-Z) and above (+Y)
    cameraOffset.set(0, 3, -10).applyQuaternion(quaternion)
    desiredCameraPos.set(position.x, position.y, position.z).add(cameraOffset)
    
    state.camera.position.lerp(desiredCameraPos, 0.1)
    state.camera.lookAt(position.x, position.y + 1, position.z)
  })

  return (
    <RigidBody ref={chassisRef} position={[0, 2, 0]} mass={800} colliders="cuboid" type="dynamic">
      <mesh>
        <boxGeometry args={[1.8, 1, 4.5]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>
    </RigidBody>
  )
}
