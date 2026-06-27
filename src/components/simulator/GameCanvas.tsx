'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import GameCar from './GameCar'
import GameTrack from './GameTrack'

export default function GameCanvas() {
  return (
    <Canvas 
      shadows
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ position: [0, 15, 25], fov: 60 }}
    >
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

      {/* Lighting - BRIGHT */}
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-50, 50, 50]} intensity={0.8} />
    </Canvas>
  )
}
