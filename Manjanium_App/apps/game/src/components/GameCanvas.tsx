'use client'
import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Environment, KeyboardControls } from '@react-three/drei'
import { Track } from './physics/Track'
import { VehicleController } from './physics/VehicleController'
import { MultiplayerCars } from './physics/MultiplayerCars'
import { initMultiplayer, leaveMultiplayer } from '../lib/multiplayer'

export function GameCanvas() {
  useEffect(() => {
    // In a real app we'd pass the room ID and mode from the SelectionScreen
    initMultiplayer('global-track');
    return () => leaveMultiplayer();
  }, []);

  return (
    <div className="w-full h-screen absolute inset-0 z-0">
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
          { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
          { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
          { name: 'right', keys: ['ArrowRight', 'KeyD'] },
          { name: 'ers', keys: ['ShiftLeft', 'ShiftRight'] },
          { name: 'drs', keys: ['Space'] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 5, -10], fov: 60 }}>
          <color attach="background" args={['#87CEEB']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <Physics>
            <Track />
            <VehicleController />
            <MultiplayerCars />
          </Physics>
          <Environment preset="sunset" />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}
