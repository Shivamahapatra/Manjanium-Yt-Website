'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GhostPlayer } from '@/lib/ghostPlayer'

interface GhostCarProps {
  ghostPlayer: GhostPlayer
}

export default function GhostCar({ ghostPlayer }: GhostCarProps) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!meshRef.current || !ghostPlayer.isActive()) return

    const frame = ghostPlayer.getCurrentFrame()
    if (!frame) return

    // Update ghost car position
    meshRef.current.position.set(...frame.position)

    // Update ghost car rotation
    const quat = new THREE.Quaternion(...frame.rotation)
    meshRef.current.setRotationFromQuaternion(quat)
  })

  if (!ghostPlayer.hasGhost()) return null

  return (
    <group ref={meshRef}>
      {/* Ghost car - translucent blue box */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 1.2, 4.5]} />
        <meshStandardMaterial
          color="#0EA5E9"
          transparent
          opacity={0.4}
          wireframe={false}
        />
      </mesh>
      {/* Ghost cockpit */}
      <mesh position={[0, 0.8, 0.5]}>
        <boxGeometry args={[1.6, 0.6, 1]} />
        <meshStandardMaterial
          color="#0EA5E9"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
