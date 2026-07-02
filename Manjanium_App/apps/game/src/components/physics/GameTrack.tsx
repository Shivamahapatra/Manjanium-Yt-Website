'use client'

import { useMemo, useRef, useEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGamePhysics } from '@/store/telemetry'
import { getInputState } from '@/hooks/useKeyboardControls'

// Define oval track shape
function createOvalTrackShape(
  radiusX: number,
  radiusZ: number,
  segments: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radiusX,
        0,
        Math.sin(angle) * radiusZ
      )
    )
  }
  return points
}

// Track configuration per track type
const TRACK_CONFIG = {
  monza: { radiusX: 120, radiusZ: 80, trackWidth: 16, wallHeight: 2 },
  monaco: { radiusX: 70, radiusZ: 50, trackWidth: 10, wallHeight: 3 },
  spa: { radiusX: 150, radiusZ: 100, trackWidth: 18, wallHeight: 2 },
  austin: { radiusX: 110, radiusZ: 75, trackWidth: 16, wallHeight: 2 },
  silverstone: { radiusX: 130, radiusZ: 85, trackWidth: 17, wallHeight: 2 },
}

interface GameTrackProps {
  trackId?: string
}

export default function GameTrack({ trackId = 'monza' }: GameTrackProps) {
  const config = TRACK_CONFIG[trackId as keyof typeof TRACK_CONFIG] || TRACK_CONFIG.monza
  
  const { 
    setSector1, 
    setSector2,
    setCrossedStartFinish, 
    completeLap,
    setDRSAvailable,
    weather 
  } = useGamePhysics()
  
  // Track surface properties based on weather
  const trackRoughness = weather === 'rain' ? 0.3 : 0.9;
  const trackColor = weather === 'rain' ? '#1a1a1a' : '#2a2a2a';

  // Outer track boundary
  const outerPoints = useMemo(
    () => createOvalTrackShape(
      config.radiusX + config.trackWidth / 2,
      config.radiusZ + config.trackWidth / 2,
      64
    ),
    [config]
  )

  // Inner track boundary
  const innerPoints = useMemo(
    () => createOvalTrackShape(
      config.radiusX - config.trackWidth / 2,
      config.radiusZ - config.trackWidth / 2,
      64
    ),
    [config]
  )

  // Track surface shape (for visual)
  const trackShape = useMemo(() => {
    const shape = new THREE.Shape()
    const outerCurve = new THREE.CatmullRomCurve3(outerPoints, true)
    const outerPts = outerCurve.getPoints(128)
    
    shape.moveTo(outerPts[0].x, outerPts[0].z)
    outerPts.forEach(p => shape.lineTo(p.x, p.z))

    const hole = new THREE.Path()
    const innerCurve = new THREE.CatmullRomCurve3(innerPoints, true)
    const innerPts = innerCurve.getPoints(128)
    
    hole.moveTo(innerPts[0].x, innerPts[0].z)
    innerPts.forEach(p => hole.lineTo(p.x, p.z))
    shape.holes.push(hole)

    return shape
  }, [outerPoints, innerPoints])

  // Wall segments (outer and inner barriers)
  const wallSegments = useMemo(() => {
    const walls: { position: [number, number, number]; size: [number, number, number]; rotation: number }[] = []
    const numWalls = 32

    for (let i = 0; i < numWalls; i++) {
      const angle = (i / numWalls) * Math.PI * 2
      const nextAngle = ((i + 1) / numWalls) * Math.PI * 2

      // Outer wall
      const outerR = config.radiusX + config.trackWidth / 2 + 1
      const ox = Math.cos((angle + nextAngle) / 2) * outerR
      const oz = Math.sin((angle + nextAngle) / 2) * outerR
      walls.push({
        position: [ox, config.wallHeight / 2, oz],
        size: [8, config.wallHeight, 1],
        rotation: (angle + nextAngle) / 2,
      })

      // Inner wall
      const innerR = config.radiusX - config.trackWidth / 2 - 1
      const ix = Math.cos((angle + nextAngle) / 2) * innerR
      const iz = Math.sin((angle + nextAngle) / 2) * innerR
      walls.push({
        position: [ix, config.wallHeight / 2, iz],
        size: [8, config.wallHeight, 1],
        rotation: (angle + nextAngle) / 2,
      })
    }

    return walls
  }, [config])

  return (
    <>
      {/* Sky */}
      <color attach="background" args={['#1a1a2e']} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#1a1a2e', 100, 600]} />

      {/* --- PHYSICS LAYER --- */}
      <RigidBody type="fixed" colliders={false}>
        {/* Ground Collision Plane */}
        <CuboidCollider args={[500, 0.1, 500]} position={[0, -0.1, 0]} />

        {/* Track Walls Colliders */}
        {wallSegments.map((wall, i) => (
          <CuboidCollider
            key={`wall-col-${i}`}
            args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]}
            position={wall.position}
            rotation={[0, wall.rotation, 0]}
          />
        ))}

        {/* SENSORS */}
        {/* Sector 1 Sensor */}
        <CuboidCollider 
          sensor 
          args={[config.trackWidth / 2, 2, 0.5]} 
          position={[config.radiusX, 0, 0]} 
          onIntersectionEnter={() => setSector1()}
        />

        {/* Sector 2 Sensor */}
        <CuboidCollider 
          sensor 
          args={[config.trackWidth / 2, 2, 0.5]} 
          position={[-config.radiusX, 0, 0]} 
          onIntersectionEnter={() => setSector2()}
        />

        {/* Start/Finish Sensor */}
        <CuboidCollider 
          sensor 
          args={[config.trackWidth / 2, 2, 0.5]} 
          position={[0, 0, -(config.radiusZ)]} 
          onIntersectionEnter={() => setCrossedStartFinish(true)}
        />

        {/* DRS Zone Sensor (Main Straight) */}
        <CuboidCollider 
          sensor
          args={[30, 5, config.trackWidth / 2]} 
          position={[0, 0, -(config.radiusZ)]} 
          onIntersectionEnter={() => setDRSAvailable(true)}
          onIntersectionExit={() => setDRSAvailable(false)}
        />
      </RigidBody>

      {/* --- VISUAL LAYER --- */}
      {/* Ground plane visuals */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color={weather === 'rain' ? '#102010' : '#1a3a1a'} roughness={1} />
      </mesh>

      {/* TRACK SURFACE */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <shapeGeometry args={[trackShape]} />
        <meshStandardMaterial
          color={trackColor}
          roughness={trackRoughness}
          metalness={weather === 'rain' ? 0.3 : 0.0}
        />
      </mesh>

      {/* TRACK MARKINGS - start/finish line */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, -(config.radiusZ)]}
      >
        <planeGeometry args={[config.trackWidth, 2]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>

      {/* Sector 1 marker - right side */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[config.radiusX, 0.04, 0]}
      >
        <planeGeometry args={[config.trackWidth, 1]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.8} />
      </mesh>

      {/* Sector 2 marker - left side */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-config.radiusX, 0.04, 0]}
      >
        <planeGeometry args={[config.trackWidth, 1]} />
        <meshStandardMaterial color="#8B5CF6" transparent opacity={0.8} />
      </mesh>

      {/* TRACK WALLS (Visuals only) */}
      {wallSegments.map((wall, i) => (
        <mesh
          key={`wall-mesh-${i}`}
          position={wall.position}
          rotation={[0, wall.rotation, 0]}
          castShadow
        >
          <boxGeometry args={wall.size} />
          <meshStandardMaterial
            color="#EF4444"
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* KERBS (visual only) - at corners */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => {
        const x = Math.cos(angle) * config.radiusX
        const z = Math.sin(angle) * config.radiusZ
        return (
          <mesh
            key={`kerb-${i}`}
            rotation={[-Math.PI / 2, angle, 0]}
            position={[x, 0.03, z]}
          >
            <planeGeometry args={[config.trackWidth, 4]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#EF4444' : '#FFFFFF'}
              roughness={0.8}
            />
          </mesh>
        )
      })}

      {/* PIT LANE BUILDING */}
      <mesh position={[0, 2, -(config.radiusZ - config.trackWidth / 2 - 8)]} castShadow>
        <boxGeometry args={[30, 4, 8]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>

      {/* GRANDSTANDS */}
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((angle, i) => {
        const x = Math.cos(angle) * (config.radiusX + config.trackWidth / 2 + 15)
        const z = Math.sin(angle) * (config.radiusZ + config.trackWidth / 2 + 15)
        return (
          <mesh key={`stand-${i}`} position={[x, 3, z]} castShadow>
            <boxGeometry args={[25, 6, 8]} />
            <meshStandardMaterial color="#374151" roughness={0.9} />
          </mesh>
        )
      })}

      {/* LIGHTING - track-specific lights */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[100, 150, 100]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={600}
        shadow-camera-left={-300}
        shadow-camera-right={300}
        shadow-camera-top={300}
        shadow-camera-bottom={-300}
      />
      <pointLight position={[0, 50, 0]} intensity={0.5} distance={300} />
    </>
  )
}
