'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGamePhysics } from '@/hooks/useGamePhysics'
import { PHYSICS_CONFIG } from '@/lib/gamePhysicsConfig'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GameCar() {
  const rigidBodyRef = useRef<any>(null)
  const meshRef = useRef<THREE.Group>(null)
  const { carState, setCarState, throttle, brake, steering } = useGamePhysics()

  useFrame(() => {
    if (!rigidBodyRef.current) return

    // Get current velocity and position
    const vel = rigidBodyRef.current.linvel()
    const pos = rigidBodyRef.current.translation()
    const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2)
    const speed_kmh = speed * 3.6

    // Apply forces based on input
    if (throttle > 0) {
      const forceStrength = PHYSICS_CONFIG.throttle_force * throttle
      rigidBodyRef.current.applyForce(
        { x: 0, y: 0, z: -forceStrength * 0.01 },
        true
      )
    }

    if (brake > 0) {
      const newVel = {
        x: vel.x * (1 - brake * 0.05),
        y: vel.y,
        z: vel.z * (1 - brake * 0.05),
      }
      rigidBodyRef.current.setLinvel(newVel, true)
    }

    // Steering (rotate around Y axis)
    if (steering !== 0) {
      const rotation = rigidBodyRef.current.rotation()
      const newRotation = {
        x: rotation.x,
        y: rotation.y + steering * 0.05,
        z: rotation.z,
        w: rotation.w,
      }
      rigidBodyRef.current.setRotation(newRotation, true)
    }

    // Auto gear shifting
    const gear = Math.floor((speed_kmh / PHYSICS_CONFIG.max_speed_kmh) * 8) + 1
    const rpm = ((speed_kmh / PHYSICS_CONFIG.max_speed_kmh) * 12000) + 3000

    // Update game state with physics
    setCarState({
      position: [pos.x, pos.y, pos.z],
      velocity: [vel.x, vel.y, vel.z],
      speed_kmh: Math.round(speed_kmh * 10) / 10,
      gear: Math.min(gear, 8),
      rpm: Math.min(rpm, 15000),
    })
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="cuboid"
      mass={PHYSICS_CONFIG.car_mass}
      position={[0, 0.5, 0]}
      linearDamping={0.3}
      angularDamping={0.3}
      restitution={0.2}
      friction={PHYSICS_CONFIG.friction}
    >
      <group ref={meshRef}>
        {/* Car body - red box (placeholder) */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.8, 1.2, 4.5]} />
          <meshStandardMaterial color="#EF4444" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Cockpit - dark box */}
        <mesh position={[0, 0.8, 0.5]} castShadow>
          <boxGeometry args={[1.6, 0.6, 1]} />
          <meshStandardMaterial color="#1F2937" metalness={0.2} roughness={0.5} />
        </mesh>

        {/* Wheels - cylinders (placeholder) */}
        {[
          [-0.8, -0.3, 1.2],
          [0.8, -0.3, 1.2],
          [-0.8, -0.3, -1.2],
          [0.8, -0.3, -1.2],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[PHYSICS_CONFIG.wheel_radius, PHYSICS_CONFIG.wheel_radius, 0.3, 16]} />
            <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}
