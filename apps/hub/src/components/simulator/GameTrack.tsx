'use client'

import { useMemo, useRef, useEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useGamePhysics } from '@/hooks/useGamePhysics'
import { useSimulatorGame } from '@/hooks/useSimulatorGame'
import { TRACK_CHECKPOINTS } from '@/lib/gamePhysicsConfig'

export default function GameTrack() {
  const { session } = useSimulatorGame()
  const { completeLap } = useGamePhysics()
  const lastCheckpointRef = useRef<string | null>(null)
  const lapStartTimeRef = useRef<number>(0)

  const trackId = session?.track.id || 'monza'
  const checkpoints = useMemo(() => TRACK_CHECKPOINTS[trackId as keyof typeof TRACK_CHECKPOINTS] || [], [trackId])

  // Initialize lap start time after mount (Date.now is impure during render)
  useEffect(() => {
    lapStartTimeRef.current = Date.now()
  }, [])

  // Lap detection - check if car crosses start/finish line
  useEffect(() => {
    const interval = setInterval(() => {
      const startFinish = checkpoints.find((cp) => cp.type === 'start-finish')
      if (!startFinish) return

      // Simple distance-based checkpoint detection
      // In a real game, use raycasts for accurate detection
      const now = Date.now()
      const currentLapTime = now - lapStartTimeRef.current

      // Complete lap if time > minimum lap time (30 seconds for testing)
      if (currentLapTime > 30000 && lastCheckpointRef.current === 'sf') {
        completeLap(currentLapTime)
        lapStartTimeRef.current = now
      }
    }, 100)

    return () => clearInterval(interval)
  }, [checkpoints, completeLap])

  return (
    <>
      {/* Ground/Asphalt */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[200, 0.1, 200]} position={[0, -0.1, 0]} />
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Grass/Pit area */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0a4d0a" transparent opacity={0.3} />
      </mesh>

      {/* Track centerline (visual only) */}
      {checkpoints.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  checkpoints.flatMap((cp) => [cp.position[0], cp.position[1] + 0.1, cp.position[2]])
                ),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FBBF24" linewidth={2} />
        </lineSegments>
      )}

      {/* Start/Finish Line */}
      {checkpoints.map((cp) => (
        <group key={cp.id}>
          {cp.type === 'start-finish' && (
            <RigidBody type="fixed" colliders={false}>
              <mesh position={cp.position} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[30, 0.1, 2]} />
                <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" />
              </mesh>
            </RigidBody>
          )}

          {/* Sector markers */}
          {cp.type === 'sector' && (
            <mesh position={cp.position}>
              <boxGeometry args={[0.5, 1, 0.5]} />
              <meshStandardMaterial color="#0EA5E9" />
            </mesh>
          )}
        </group>
      ))}

      {/* Pit lane walls (simple colliders) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.5, 180]}>
          <boxGeometry args={[200, 1, 2]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.5, -180]}>
          <boxGeometry args={[200, 1, 2]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
      </RigidBody>

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[100, 100, 50]} intensity={1.2} castShadow />
      <pointLight position={[-50, 50, 50]} intensity={0.5} />
    </>
  )
}
