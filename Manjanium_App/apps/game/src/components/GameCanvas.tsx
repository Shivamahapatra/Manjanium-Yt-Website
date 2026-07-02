'use client'
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Environment } from '@react-three/drei'

import { DynamicRaycastVehicleController } from './physics/DynamicRaycastVehicleController'
import { ghostPlayer } from './physics/VehicleController'
import { MultiplayerCars } from './physics/MultiplayerCars'
import { initMultiplayer, leaveMultiplayer } from '../lib/multiplayer'
import GhostCar from './physics/GhostCar'
import GameTrack from './physics/GameTrack'

import AICarManager from './physics/AICarManager'

export function GameCanvas() {
  const [trackLoaded, setTrackLoaded] = useState(false);

  useEffect(() => {
    // In a real app we'd pass the room ID and mode from the SelectionScreen
    initMultiplayer('global-track');
    return () => leaveMultiplayer();
  }, []);

  return (
    <div
      className="w-full h-screen absolute inset-0 z-0"
      style={{ outline: 'none' }}
      tabIndex={0}
      onFocus={() => console.log('Game canvas focused')}
      onClick={(e) => e.currentTarget.focus()}
    >
      <Canvas
        shadows
        camera={{ position: [0, 5, -10], fov: 60 }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onCreated={({ gl }) => {
          // Ensure canvas doesn't steal keyboard focus
          gl.domElement.setAttribute('tabIndex', '-1')
          gl.domElement.style.outline = 'none'
        }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#131313', 50, 500]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <Physics gravity={[0, -9.81, 0]} debug={false}>
          <GameTrack trackId="monza" onLoaded={() => setTrackLoaded(true)} />
          <DynamicRaycastVehicleController trackId="monza" trackLoaded={trackLoaded} />
          <GhostCar ghostPlayer={ghostPlayer} />
          <MultiplayerCars />
          <AICarManager trackId="monza" difficulty="medium" numberOfCars={3} />
        </Physics>
        <Environment preset="sunset" />
      </Canvas>
    </div>
  )
}
