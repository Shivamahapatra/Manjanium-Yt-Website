import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useTelemetryStore } from '../../store/telemetry'

export const PHYSICS_CONFIG = {
  gravity: -9.81,
  car_mass: 798,
  max_speed_kmh: 300,
  throttle_force: 800,
  brake_force: 2000,
  friction: 1.2,
  wheel_radius: 0.35,
  linear_damping: 0.5,
  angular_damping: 0.8,
}

export function VehicleController() {
  const chassisRef = useRef<RapierRigidBody>(null)
  const [, getKeys] = useKeyboardControls()
  
  // Reusable vectors for calculations
  const forwardVector = new THREE.Vector3()
  const cameraOffset = new THREE.Vector3(0, 8, 18) // behind and above car
  const desiredCameraPos = new THREE.Vector3()
  
  const TURN_SPEED = 8000;

  useFrame((state, delta) => {
    if (!chassisRef.current) return
    
    const { forward, backward, left, right, ers, drs } = getKeys()
    const body = chassisRef.current
    const telemetryStore = useTelemetryStore.getState()
    
    // Get current rotation to determine forward direction
    const rotation = body.rotation()
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    
    // Assuming +Z is forward
    forwardVector.set(0, 0, 1).applyQuaternion(quaternion)

    // Physics tuning
    body.setLinearDamping(PHYSICS_CONFIG.linear_damping)
    body.setAngularDamping(PHYSICS_CONFIG.angular_damping)

    // Steering
    const velocity = body.linvel()
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
    const currentSpeedKmh = speed * 3.6
    
    // Update telemetry
    telemetryStore.setTelemetry(Math.round(currentSpeedKmh), 1)

    // ERS & DRS Logic
    let baseForce = PHYSICS_CONFIG.throttle_force
    const isErsActive = ers && telemetryStore.ersBattery > 0
    const isDrsActive = drs

    if (isErsActive) {
      baseForce *= 1.5 // 50% boost
      telemetryStore.setSystems(Math.max(0, telemetryStore.ersBattery - 20 * delta), true, isDrsActive, true)
    } else {
      // Recharge ERS slowly
      telemetryStore.setSystems(Math.min(100, telemetryStore.ersBattery + 5 * delta), false, isDrsActive, true)
    }

    if (isDrsActive) {
      baseForce *= 1.2 // 20% boost from less drag
    }

    // Acceleration & Braking with Speed Cap
    const maxSpeedMs = PHYSICS_CONFIG.max_speed_kmh / 3.6
    
    let engineForce = 0
    if (forward) {
       // Only apply throttle force if under max speed
       if (currentSpeedKmh < PHYSICS_CONFIG.max_speed_kmh) {
          const speedRatio = currentSpeedKmh / PHYSICS_CONFIG.max_speed_kmh
          // Scale force down as we approach max speed (prevents runaway)
          engineForce = baseForce * (1 - speedRatio * 0.8)
       }
    }
    if (backward) {
       // Braking force or reverse
       engineForce = -PHYSICS_CONFIG.brake_force
    }
    
    if (engineForce !== 0) {
      body.applyImpulse({
        x: forwardVector.x * engineForce * delta,
        y: 0,
        z: forwardVector.z * engineForce * delta
      }, true)
    }

    // Hard velocity cap
    if (speed > maxSpeedMs) {
      const scale = maxSpeedMs / speed
      const currentVel = body.linvel()
      body.setLinvel(
        { x: currentVel.x * scale, y: currentVel.y, z: currentVel.z * scale },
        true
      )
    }
    
    // Broadcast to multiplayer
    import('../../lib/multiplayer').then(m => {
      m.broadcastPosition(
        [body.translation().x, body.translation().y, body.translation().z],
        [body.rotation().x, body.rotation().y, body.rotation().z, body.rotation().w]
      );
    });

    if (speed > 1) { // Only allow turning if moving
      let turnDirection = 0
      const sensitivity = telemetryStore.steeringSensitivity || 1.0
      
      if (left) turnDirection += TURN_SPEED * sensitivity
      if (right) turnDirection -= TURN_SPEED * sensitivity
      
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

    // Camera follow
    const pos = body.translation()
    // Calculate camera position (behind car, relative to car's rotation)
    const offset = cameraOffset.clone().applyQuaternion(quaternion)
    desiredCameraPos.set(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z)
    
    // Smooth camera movement (lerp)
    state.camera.position.lerp(desiredCameraPos, 0.08)
    
    // Camera looks at car
    state.camera.lookAt(pos.x, pos.y + 1, pos.z)
  })

  return (
    <RigidBody 
      ref={chassisRef} 
      position={[0, 2, 0]} 
      mass={PHYSICS_CONFIG.car_mass} 
      colliders="cuboid" 
      type="dynamic"
      linearDamping={PHYSICS_CONFIG.linear_damping}
      angularDamping={PHYSICS_CONFIG.angular_damping}
    >
      <mesh>
        <boxGeometry args={[1.8, 1, 4.5]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>
    </RigidBody>
  )
}
