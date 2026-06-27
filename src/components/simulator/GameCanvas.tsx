'use client'

import { Canvas } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/rapier'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import GameCar from './GameCar'
import GameTrack from './GameTrack'

export default function GameCanvas() {
  return (
    <Canvas shadows>
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 25]}
        fov={60}
      />

      <Physics gravity={[0, -9.81, 0]} debug={false}>
        {/* Car */}
        <GameCar />

        {/* Track */}
        <GameTrack />
      </Physics>

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        minDistance={10}
        maxDistance={100}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </Canvas>
  )
}
