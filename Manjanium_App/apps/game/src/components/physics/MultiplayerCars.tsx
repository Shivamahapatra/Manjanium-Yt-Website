import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMultiplayerStore } from '../../store/multiplayer';

function RemoteCar({ id }: { id: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!meshRef.current) return;
    const player = useMultiplayerStore.getState().players[id];
    if (!player) return;
    
    // Smooth interpolation (lerp/slerp) to hide network latency
    const targetPos = new THREE.Vector3(...player.position);
    const targetRot = new THREE.Quaternion(...player.rotation);
    
    meshRef.current.position.lerp(targetPos, 0.2);
    meshRef.current.quaternion.slerp(targetRot, 0.2);
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="blue" transparent opacity={0.5} />
    </mesh>
  );
}

export function MultiplayerCars() {
  const players = useMultiplayerStore((state) => state.players);
  
  // Cleanup stale players (not updated in last 5 seconds)
  useFrame(() => {
    const now = Date.now();
    Object.values(players).forEach(p => {
      if (now - p.lastUpdate > 5000) {
        useMultiplayerStore.getState().removePlayer(p.id);
      }
    });
  });

  return (
    <>
      {Object.keys(players).map((id) => (
        <RemoteCar key={id} id={id} />
      ))}
    </>
  );
}
