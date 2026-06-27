'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useSimulatorGame } from '@/hooks/useSimulatorGame'
import { useGamePhysics } from '@/hooks/useGamePhysics'
import { useCarControls } from '@/hooks/useCarControls'
import GameHUD from '@/components/simulator/GameHUD'

// Dynamic import to avoid SSR issues with Three.js
const GameCanvas = dynamic(
  () => import('@/components/simulator/GameCanvas'),
  { ssr: false }
)

export default function GamePage() {
  const router = useRouter()
  const { session } = useSimulatorGame()
  const { setRacing } = useGamePhysics()
  const [gameStarted, setGameStarted] = useState(false)

  // Initialize keyboard controls
  useCarControls()

  useEffect(() => {
    if (!session) {
      router.push('/simulator')
      return
    }

    setRacing(true)
    setGameStarted(true)

    return () => {
      setRacing(false)
    }
  }, [session, router, setRacing])

  if (!session || !gameStarted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[#FBBF24] text-2xl font-bold">Loading Game...</div>
          <div className="text-[#6B7280]">Initializing physics engine</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Three.js Canvas */}
      <GameCanvas />

      {/* HUD Overlay */}
      <GameHUD />

      {/* ESC to pause/exit */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => router.push('/simulator')}
          className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm font-bold hover:bg-[#DC2626] transition-colors"
        >
          Exit (ESC)
        </button>
      </div>
    </div>
  )
}
