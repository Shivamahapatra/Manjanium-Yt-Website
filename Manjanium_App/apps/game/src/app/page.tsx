'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@clerk/nextjs'
import GameHUD from '@/components/ui/GameHUD'
import { SelectionScreen } from '@/components/ui/SelectionScreen'

const GameCanvas = dynamic(() => import('@/components/GameCanvas').then(mod => mod.GameCanvas), { ssr: false })

export default function SimulatorPage() {
  const [inGame, setInGame] = useState(false);
  const { userId, isLoaded } = useAuth();

  return (
    <main className="w-full h-screen overflow-hidden relative bg-black font-sans text-white">
      {!inGame && <SelectionScreen onStart={() => setInGame(true)} userId={userId} />}
      
      {inGame && (
        <>
          <GameCanvas />
          <GameHUD />
        </>
      )}
    </main>
  )
}
