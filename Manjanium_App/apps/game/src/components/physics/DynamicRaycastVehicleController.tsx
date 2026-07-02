'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRapier, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

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

export function DynamicRaycastVehicleController({ children }: VehicleControllerProps) {
  const chassisRef = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();
  
  // Physics tuning
  const suspensionStiffness = 35.0;
  const suspensionDamping = 4.0;
  const suspensionRestLength = 0.4;
  
  // State for velocity tracking to calculate G-Forces
  const lastVelocity = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Damage states
  const [carState, setCarState] = useState<'OK' | 'DNF'>('OK');
  const engineTorqueMultiplier = useRef(1.0);

  useFrame((state, delta) => {
    if (!chassisRef.current || carState === 'DNF') return;

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

    // TODO: Apply driving forces modified by engineTorqueMultiplier.current
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
      <mesh>
        <boxGeometry args={[1.8, 0.8, 4.5]} />
        <meshStandardMaterial color={carState === 'DNF' ? 'red' : 'blue'} wireframe />
      </mesh>
      {children}
    </RigidBody>
  );
}
