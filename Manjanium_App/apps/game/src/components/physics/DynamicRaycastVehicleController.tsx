'use client';

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, useRapier, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGamePhysics, calculateTireFriction, WEATHER_FRICTION_MULTIPLIER, DEGRADATION_RATE } from '@/store/telemetry'
import { ghostPlayer, ghostRecorder } from './VehicleController'
import { saveBestGhost, loadBestGhost } from '../../lib/ghostRecorder'
import { getSimulatorInputs, useSimulatorInputs } from '../../hooks/useSimulatorInputs';

interface VehicleControllerProps {
  children?: React.ReactNode;
}

const GRAVITY = 9.81;

// Define suspension raycast positions (relative to chassis center)
const SUSPENSION_POINTS = [
  new THREE.Vector3(-0.8, -0.3, 1.5),  // Front Left
  new THREE.Vector3(0.8, -0.3, 1.5),   // Front Right
  new THREE.Vector3(-0.8, -0.3, -1.5), // Rear Left
  new THREE.Vector3(0.8, -0.3, -1.5),  // Rear Right
];

const SECTOR_ZONES = {
  sector1: { center: [80, 0, 0] as [number, number, number], radius: 15 },
  sector2: { center: [-80, 0, 0] as [number, number, number], radius: 15 },
  startFinish: { center: [0, 0, -50] as [number, number, number], radius: 10 },
}

export function DynamicRaycastVehicleController({ trackId = 'monza' }: { trackId?: string }) {
  const chassisRef = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();
  const { camera } = useThree();
  const cameraOffset = new THREE.Vector3(0, 6, 14);
  const lapStartTime = useRef(Date.now());
  
  // Physics tuning
  const suspensionStiffness = 35.0;
  const suspensionDamping = 4.0;
  const suspensionRestLength = 0.4;
  
  // State for velocity tracking to calculate G-Forces
  const lastVelocity = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Performance and damage states
  const [carState, setCarState] = useState<'OK' | 'DNF'>('OK');
  const engineTorqueMultiplier = useRef(1.0);
  const maxTorque = 2500;
  const optimalRpmVelocity = 80; // Example optimal shifting velocity

  const {
    setSpeed, setGear, setRPM,
    completeLap,
    tireWear, setTireWear, tireFriction, setTireFriction, weather,
    sector1Cleared, sector2Cleared, crossedStartFinish,
    currentLap, drsAvailable, setDRSActive, battery, setBattery,
    setSector1, setSector2, clearSectors, setCrossedStartFinish,
    setThrottle, setBrake, setSteering
  } = useGamePhysics();

  // Initialize inputs
  useSimulatorInputs();

  React.useEffect(() => {
    // Load existing ghost on mount
    const bestGhost = loadBestGhost(trackId)
    if (bestGhost) {
      ghostPlayer.loadGhost(bestGhost)
    }
    ghostRecorder.startRecording()
    ghostPlayer.startPlayback()
    
    return () => {
      ghostPlayer.stopPlayback()
    }
  }, [trackId])

  useFrame((state, delta) => {
    const inputs = getSimulatorInputs();
    
    if (!chassisRef.current || carState === 'DNF' || inputs.isPaused) return;

    const currentVelocity = chassisRef.current.linvel();
    const currentVelVec = new THREE.Vector3(currentVelocity.x, currentVelocity.y, currentVelocity.z);

    // Calculate Delta V and G-Force
    if (delta > 0) {
      const dv = currentVelVec.distanceTo(lastVelocity.current);
      const acceleration = dv / delta;
      const gForce = acceleration / GRAVITY;

      if (gForce > 45) {
        setCarState('DNF');
        console.log(`IMPACT DETECTED: ${gForce.toFixed(2)}G. State set to DNF.`);
      } else if (gForce >= 15 && gForce <= 44) {
        engineTorqueMultiplier.current = Math.min(engineTorqueMultiplier.current, 0.75);
        console.log(`IMPACT DETECTED: ${gForce.toFixed(2)}G. Engine torque throttled to 75%.`);
      }
    }
    
    // Update last velocity for next tick
    lastVelocity.current.copy(currentVelVec);

    // Apply Raycast Suspension Forces
    const chassisPosition = chassisRef.current.translation();
    const chassisRotation = chassisRef.current.rotation();
    const quaternion = new THREE.Quaternion(chassisRotation.x, chassisRotation.y, chassisRotation.z, chassisRotation.w);
    
    // Convert current velocity to local space for damping
    const velocity = new THREE.Vector3(currentVelocity.x, currentVelocity.y, currentVelocity.z);

    SUSPENSION_POINTS.forEach((point) => {
      // Get world position of suspension point
      const worldPoint = point.clone().applyQuaternion(quaternion).add(new THREE.Vector3(chassisPosition.x, chassisPosition.y, chassisPosition.z));
      
      // Raycast downwards
      const downDir = new THREE.Vector3(0, -1, 0).applyQuaternion(quaternion).normalize();
      const ray = new rapier.Ray(worldPoint, downDir);
      const maxToi = suspensionRestLength * 1.5;
      
      const hit = world.castRay(ray, maxToi, true, undefined, undefined, undefined, chassisRef.current || undefined);
      
      if (hit) {
        const compression = suspensionRestLength - (hit as any).toi;
        if (compression > 0) {
          // Point velocity calculation
          const pointVelocity = velocity.clone(); 
          // Note: for a more accurate model, angular velocity should be factored into pointVelocity
          
          const dampingForce = pointVelocity.dot(downDir) * suspensionDamping;
          const springForce = compression * suspensionStiffness;
          
          const totalForce = Math.max(0, springForce - dampingForce);
          const forceVector = downDir.clone().multiplyScalar(-totalForce);
          
          chassisRef.current?.addForceAtPoint(forceVector, worldPoint, true);
        }
      }
    });

    // 3. Transmission & Drivetrain
    const velocityMagnitude = currentVelVec.length();
    
    if (inputs.isAuto) {
      // Automatic Transmission
      const computedGear = Math.max(1, Math.min(8, Math.ceil(velocityMagnitude / 15)));
      inputs.gear = computedGear;
    } else {
      // Manual Transmission Impulse
      if (inputs.shiftUpTriggered) {
        inputs.shiftUpTriggered = false;
        // Check if velocity is within optimal RPM band roughly
        if (velocityMagnitude > 10 && velocityMagnitude % 15 > 10) {
           const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize();
           // Momentary linear impulse burst
           chassisRef.current.applyImpulse(forwardDir.multiplyScalar(10000), true);
           console.log('PERFECT SHIFT IMPULSE!');
        }
      }
      if (inputs.shiftDownTriggered) {
        inputs.shiftDownTriggered = false;
      }
    }

    // 4. ERS and DRS Calculations
    let ersMultiplier = 1.0;
    if (inputs.ersActive && battery > 0) {
      ersMultiplier = 1.4;
      setBattery(Math.max(0, battery - delta * 20)); // Drain battery
    } else if (inputs.brake > 0) {
      setBattery(Math.min(100, battery + delta * inputs.brake * 10)); // Regenerate
    }

    let isDRSAllowed = false;
    const ghostFrame = ghostPlayer.getCurrentFrame();
    if (currentLap >= 2 && drsAvailable && ghostFrame) {
      const ghostPos = new THREE.Vector3(...ghostFrame.position);
      const carPos = new THREE.Vector3(chassisPosition.x, chassisPosition.y, chassisPosition.z);
      const timeGap = carPos.distanceTo(ghostPos) / Math.max(velocityMagnitude, 1);
      
      if (timeGap < 1.0) {
        isDRSAllowed = true;
      }
    }

    let drsMultiplier = 1.0;
    if (inputs.drsActive && isDRSAllowed) {
      drsMultiplier = 1.4; // Simulates 40% drag reduction by boosting torque/speed
    } else {
      inputs.drsActive = false; // Force turn off if brake applied (handled in inputs) or not allowed
    }
    
    // Sync HUD
    setDRSActive(inputs.drsActive);

    // 5. Apply driving forces and steering (scaled by weather grip, ERS, and DRS)
    const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize();
    const gripMultiplier = tireFriction;
    
    if (inputs.throttle > 0) {
      const force = forwardDir.clone().multiplyScalar(inputs.throttle * maxTorque * engineTorqueMultiplier.current * gripMultiplier * ersMultiplier * drsMultiplier);
      chassisRef.current.addForceAtPoint(force, chassisPosition, true);
    }
    if (inputs.brake > 0) {
      const force = forwardDir.clone().multiplyScalar(-inputs.brake * maxTorque * 1.5 * gripMultiplier);
      chassisRef.current.addForceAtPoint(force, chassisPosition, true);
    }
    
    // Steering Torque mapping
    if (inputs.steering !== 0) {
      const turnForce = 8000 * -inputs.steering * gripMultiplier; 
      // Apply torque for steering
      chassisRef.current.applyTorqueImpulse(new THREE.Vector3(0, turnForce * delta, 0), true);
    }
    
    // Telemetry updates
    const speed_kmh = velocityMagnitude * 3.6;
    setSpeed(Math.round(speed_kmh * 10) / 10);
    setGear(inputs.gear);
    setRPM(Math.round(3000 + ((speed_kmh / 320) * 12000)));
    setThrottle(inputs.throttle);
    setBrake(inputs.brake);
    setSteering(inputs.steering);
    
    // Tire wear (simplified)
    const distanceDelta = velocityMagnitude * delta;
    const weatherMultiplier = WEATHER_FRICTION_MULTIPLIER[weather];
    const newWear = Math.max(0, tireWear - distanceDelta * DEGRADATION_RATE * weatherMultiplier);
    setTireWear(newWear);
    setTireFriction(calculateTireFriction(newWear, weather));

    // Sectors & Checkpoints
    if (crossedStartFinish) {
      // Validate lap
      if (sector1Cleared && sector2Cleared) {
        const lapTime = Date.now() - lapStartTime.current;
        completeLap(lapTime);
        
        const ghost = ghostRecorder.stopRecording(lapTime, trackId);
        if (ghost) {
          saveBestGhost(ghost);
          ghostPlayer.loadGhost(ghost);
        }
        ghostRecorder.startRecording();
        ghostPlayer.startPlayback();
      }

      // Reset lap state regardless of validation to start new lap checks
      lapStartTime.current = Date.now();
      clearSectors();
      setCrossedStartFinish(false);
    }

    // Ghost frame
    ghostRecorder.recordFrame(
      [chassisPosition.x, chassisPosition.y, chassisPosition.z],
      [chassisRotation.x, chassisRotation.y, chassisRotation.z, chassisRotation.w],
      speed_kmh,
      inputs.gear
    );

    // Follow Camera
    const offset = cameraOffset.clone().applyQuaternion(quaternion);
    const targetPos = new THREE.Vector3(chassisPosition.x + offset.x, chassisPosition.y + offset.y, chassisPosition.z + offset.z);
    camera.position.lerp(targetPos, 0.06);
    camera.lookAt(chassisPosition.x, chassisPosition.y + 1, chassisPosition.z);
  });

  return (
    <RigidBody
      ref={chassisRef}
      colliders="cuboid"
      mass={1800}
      position={[0, 1, 0]}
      friction={0.5}
      restitution={0.1}
      canSleep={false}
    >
      <group>
        {/* Body */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.8, 0.8, 4.5]} />
          <meshStandardMaterial color={carState === 'DNF' ? '#550000' : '#EF4444'} metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 0.3, 2.8]} castShadow>
          <boxGeometry args={[1.2, 0.4, 1.2]} />
          <meshStandardMaterial color={carState === 'DNF' ? '#550000' : '#CC0000'} metalness={0.4} roughness={0.3} />
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
        {SUSPENSION_POINTS.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.35, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}
