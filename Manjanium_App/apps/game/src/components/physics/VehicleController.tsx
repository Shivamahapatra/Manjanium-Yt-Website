'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useGamePhysics, calculateTireFriction, WEATHER_FRICTION_MULTIPLIER, DEGRADATION_RATE } from '@/store/telemetry'
import { useMouseSteering } from '@/hooks/useMouseSteering'
import { GhostPlayer } from '../../lib/ghostPlayer'
import { GhostRecorder, saveBestGhost, loadBestGhost } from '../../lib/ghostRecorder'

export const ghostPlayer = new GhostPlayer()
export const ghostRecorder = new GhostRecorder()

const WHEEL_POSITIONS: [number, number, number][] = [
  [-0.85, -0.3, 1.5],  // front left
  [0.85, -0.3, 1.5],   // front right
  [-0.85, -0.3, -1.5], // rear left
  [0.85, -0.3, -1.5],  // rear right
]

const PHYSICS = {
  car_mass: 798,
  max_speed_kmh: 300,
  throttle_force: 1200,
  brake_force: 3000,
  suspension_rest: 0.5,
  suspension_stiffness: 30,
  suspension_damping: 4,
  wheel_radius: 0.35,
  linear_damping: 0.4,
  angular_damping: 0.9,
}

// Define sector positions (customize per track)
const SECTOR_ZONES = {
  sector1: { center: [80, 0, 0] as [number, number, number], radius: 15 },
  sector2: { center: [-80, 0, 0] as [number, number, number], radius: 15 },
  startFinish: { center: [0, 0, -50] as [number, number, number], radius: 10 },
}

export default function VehicleController({ trackId = 'monza' }) {
  const chassisRef = useRef<any>(null)
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const { rapier, world } = useRapier()
  const cameraOffset = new THREE.Vector3(0, 6, 14)
  const lapStartTime = useRef(Date.now())

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _trackId = trackId // used for future tracks

  const {
    setSpeed, setGear, setRPM,
    throttle, brake, steering,
    setERSActive, setBattery, battery, ersActive,
    drsActive, drsAvailable, setDRSActive,
    completeLap,
    tireWear, setTireWear, setTireFriction, weather, tireFriction,
    sector1Cleared, sector2Cleared,
    setSector1, setSector2, clearSectors,
    mouseSteeringEnabled, mouseSensitivity
  } = useGamePhysics()

  useMouseSteering(mouseSteeringEnabled, mouseSensitivity)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ERS - Shift key
      if (e.key === 'Shift' && battery > 0) {
        setERSActive(true)
      }
      // DRS - Space key (only if available)
      if (e.key === ' ' && drsAvailable) {
        setDRSActive(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setERSActive(false)
      if (e.key === ' ') setDRSActive(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // Load existing ghost on mount
    const bestGhost = loadBestGhost(_trackId)
    if (bestGhost) {
      ghostPlayer.loadGhost(bestGhost)
    }
    ghostRecorder.startRecording()
    ghostPlayer.startPlayback()
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      ghostPlayer.stopPlayback()
    }
  }, [battery, drsAvailable, setERSActive, setDRSActive, _trackId])

  useFrame((_, delta) => {
    if (!chassisRef.current) return

    const pos = chassisRef.current.translation()
    const rot = chassisRef.current.rotation()
    const vel = chassisRef.current.linvel()

    // Speed calculation
    const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2)
    const speed_kmh = speed * 3.6

    // Update tire wear every frame
    const distanceDelta = speed * delta // meters this frame
    const weatherMultiplier = WEATHER_FRICTION_MULTIPLIER[weather]
    const newWear = Math.max(0, tireWear - distanceDelta * DEGRADATION_RATE * weatherMultiplier)
    setTireWear(newWear)
    setTireFriction(calculateTireFriction(newWear, weather))

    // Car direction from rotation quaternion
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat)

    // ERS boost
    let forceMultiplier = 1.0
    if (ersActive && battery > 0) {
      forceMultiplier = 1.35  // 35% boost
      setBattery(Math.max(0, battery - 0.5 * delta * 60)) // drain
    }

    // DRS drag reduction
    let dragMultiplier = 1.0
    if (drsActive && drsAvailable) {
      dragMultiplier = 0.85  // 15% less drag = higher top speed
    }

    // === THROTTLE ===
    const maxSpeedMs = PHYSICS.max_speed_kmh / 3.6
    if (throttle > 0 && speed < maxSpeedMs) {
      const speedRatio = speed / maxSpeedMs
      const force = PHYSICS.throttle_force * throttle * forceMultiplier * dragMultiplier * (1 - speedRatio * 0.7)
      chassisRef.current.applyForce(
        {
          x: forwardDir.x * force,
          y: 0,
          z: forwardDir.z * force,
        },
        true
      )
    }

    // === BRAKE ===
    if (brake > 0) {
      const currentVel = chassisRef.current.linvel()
      chassisRef.current.setLinvel(
        {
          x: currentVel.x * (1 - brake * 0.08),
          y: currentVel.y,
          z: currentVel.z * (1 - brake * 0.08),
        },
        true
      )
      // ERS regenerative charging
      setBattery(Math.min(100, battery + brake * 0.3))
    }

    // Hard speed cap
    if (speed > maxSpeedMs) {
      const scale = maxSpeedMs / speed
      chassisRef.current.setLinvel(
        { x: vel.x * scale, y: vel.y, z: vel.z * scale },
        true
      )
    }

    // === STEERING ===
    if (steering !== 0 && speed > 0.5) {
      const steerStrength = Math.min(1, 10 / speed_kmh) * 0.06
      const currentRot = chassisRef.current.rotation()
      const euler = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion(currentRot.x, currentRot.y, currentRot.z, currentRot.w)
      )
      euler.y += steering * steerStrength
      const newQuat = new THREE.Quaternion().setFromEuler(euler)
      chassisRef.current.setRotation(
        { x: newQuat.x, y: newQuat.y, z: newQuat.z, w: newQuat.w },
        true
      )
    }

    // === GEAR + RPM ===
    const gear = Math.max(1, Math.min(8, Math.floor((speed_kmh / PHYSICS.max_speed_kmh) * 8) + 1))
    const rpm = 3000 + ((speed_kmh / PHYSICS.max_speed_kmh) * 12000)
    setSpeed(Math.round(speed_kmh * 10) / 10)
    setGear(gear)
    setRPM(Math.round(rpm))

    // === SECTORS ===
    const carPos = new THREE.Vector3(pos.x, 0, pos.z)
    
    // Sector 1
    const s1 = new THREE.Vector3(...SECTOR_ZONES.sector1.center)
    if (!sector1Cleared && carPos.distanceTo(s1) < SECTOR_ZONES.sector1.radius) {
      setSector1() // set sector1Cleared = true
    }

    // Sector 2 (only after S1)
    const s2 = new THREE.Vector3(...SECTOR_ZONES.sector2.center)
    if (sector1Cleared && !sector2Cleared && carPos.distanceTo(s2) < SECTOR_ZONES.sector2.radius) {
      setSector2() // set sector2Cleared = true
    }

    // Start/Finish (only after S1 + S2)
    const sf = new THREE.Vector3(...SECTOR_ZONES.startFinish.center)
    if (sector1Cleared && sector2Cleared && carPos.distanceTo(sf) < SECTOR_ZONES.startFinish.radius) {
      // Valid lap!
      const lapTime = Date.now() - lapStartTime.current
      completeLap(lapTime)
      
      const ghost = ghostRecorder.stopRecording(lapTime, _trackId)
      if (ghost) {
        saveBestGhost(ghost)
        ghostPlayer.loadGhost(ghost)
      }
      ghostRecorder.startRecording()
      ghostPlayer.startPlayback()

      lapStartTime.current = Date.now()
      clearSectors() // reset both sector flags
    }

    ghostRecorder.recordFrame(
      [pos.x, pos.y, pos.z],
      [rot.x, rot.y, rot.z, rot.w],
      speed_kmh,
      gear
    )

    // === FOLLOW CAMERA ===
    const carQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const offset = cameraOffset.clone().applyQuaternion(carQuat)
    const targetPos = new THREE.Vector3(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z)
    camera.position.lerp(targetPos, 0.06)
    camera.lookAt(pos.x, pos.y + 1, pos.z)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _rapier = rapier
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _world = world

  return (
    <RigidBody
      ref={chassisRef}
      colliders="cuboid"
      mass={PHYSICS.car_mass}
      position={[0, 1, 0]}
      linearDamping={PHYSICS.linear_damping}
      angularDamping={PHYSICS.angular_damping}
      restitution={0.1}
      friction={tireFriction}
    >
      <group ref={meshRef}>
        {/* Body */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.8, 0.8, 4.5]} />
          <meshStandardMaterial color="#EF4444" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 0.3, 2.8]} castShadow>
          <boxGeometry args={[1.2, 0.4, 1.2]} />
          <meshStandardMaterial color="#CC0000" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 0.85, 0.3]} castShadow>
          <boxGeometry args={[0.9, 0.5, 1.2]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Rear wing */}
        <mesh position={[0, 1.0, -2.2]} castShadow>
          <boxGeometry args={[2.0, 0.08, 0.5]} />
          <meshStandardMaterial color="#CC0000" metalness={0.6} />
        </mesh>
        {/* Front wing */}
        <mesh position={[0, 0.1, 2.5]} castShadow>
          <boxGeometry args={[2.2, 0.06, 0.3]} />
          <meshStandardMaterial color="#CC0000" metalness={0.6} />
        </mesh>
        {/* Wheels */}
        {WHEEL_POSITIONS.map((pos, i) => (
          <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[PHYSICS.wheel_radius, PHYSICS.wheel_radius, 0.35, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}
