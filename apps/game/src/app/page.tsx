'use client'
import React, { useState } from 'react'
import { GameCanvas } from '@/components/GameCanvas'
import { GameHUD } from '@/components/ui/GameHUD'
import { SelectionScreen } from '@/components/ui/SelectionScreen'

export default function SimulatorPage() {
  const [inGame, setInGame] = useState(false);

  return (
    <main className="w-full h-screen overflow-hidden relative bg-black font-sans text-white">
      {!inGame && <SelectionScreen onStart={() => setInGame(true)} />}
      
      {inGame && (
        <>
          <GameCanvas />
          <GameHUD />
        </>
      )}
    </main>
  )
}
