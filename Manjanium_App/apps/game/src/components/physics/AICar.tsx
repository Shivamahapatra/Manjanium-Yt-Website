'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Waypoint, AI_DIFFICULTY } from '@/lib/aiConfig'

interface AICarProps {
  id: string
  color: string
  startPosition: [number, number, number]
  waypoints: Waypoint[]
  difficulty?: 'easy' | 'medium' | 'hard' | 'pro'
  startOffset?: number // seconds offset to stagger AI start
}

export default function AICar({
  id,
  color,
  startPosition,
  waypoints,
  difficulty = 'medium',
  startOffset = 0,
}: AICarProps) {
  const rigidBodyRef = useRef<any>(null)
  const [currentWaypoint, setCurrentWaypoint] = useState(0)
  const config = AI_DIFFICULTY[difficulty]

  useFrame((_, delta) => {
    if (!rigidBodyRef.current || waypoints.length === 0) return

    const pos = rigidBodyRef.current.translation()
    const target = waypoints[currentWaypoint]

    // Direction to target waypoint
    const targetVec = new THREE.Vector3(...target.position)
    const currentVec = new THREE.Vector3(pos.x, pos.y, pos.z)
    const direction = targetVec.sub(currentVec)
    const distance = direction.length()

    // Move to next waypoint if close enough
    if (distance < 8) {
      setCurrentWaypoint((prev) => (prev + 1) % waypoints.length)
      return
    }

    // Calculate target speed
    const targetSpeedKmh = target.speed_limit * config.speed_multiplier
    const targetSpeedMs = targetSpeedKmh / 3.6

    // Get current velocity
    const vel = rigidBodyRef.current.linvel()
    const currentSpeed = Math.sqrt(vel.x ** 2 + vel.z ** 2)

    // Apply force toward waypoint
    const normalizedDir = direction.normalize()
    const forceMagnitude = Math.max(0, (targetSpeedMs - currentSpeed) * 500)

    rigidBodyRef.current.applyForce(
      {
        x: normalizedDir.x * forceMagnitude * delta,
        y: 0,
        z: normalizedDir.z * forceMagnitude * delta,
      },
      true
    )

    // Speed cap
    if (currentSpeed > targetSpeedMs) {
      const scale = targetSpeedMs / currentSpeed
      rigidBodyRef.current.setLinvel(
        { x: vel.x * scale, y: vel.y, z: vel.z * scale },
        true
      )
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="cuboid"
      mass={798}
      position={startPosition}
      linearDamping={0.5}
      angularDamping={0.8}
    >
      <group>
        {/* AI Car body */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 1.2, 4.5]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 0.8, 0.5]}>
          <boxGeometry args={[1.6, 0.6, 1]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
        {/* Number plate */}
        <mesh position={[0, 1.1, -2.2]}>
          <planeGeometry args={[0.8, 0.4]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </RigidBody>
  )
}
