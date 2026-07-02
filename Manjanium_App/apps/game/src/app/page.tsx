'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@clerk/nextjs'
import GameHUD from '@/components/ui/GameHUD'
import { SelectionScreen } from '@/components/ui/SelectionScreen'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { PostRacePodium } from '@/components/ui/PostRacePodium'
import { useGamePhysics } from '@/store/telemetry'

const GameCanvas = dynamic(() => import('@/components/GameCanvas').then(mod => mod.GameCanvas), { ssr: false })

export default function SimulatorPage() {
  const [inGame, setInGame] = useState(false);
  const { userId, isLoaded } = useAuth();
  const { currentLap, totalLaps } = useGamePhysics();
  const isRaceFinished = currentLap > totalLaps;

  return (
    <main className="w-full h-screen overflow-hidden relative bg-black font-sans text-white">
      {!inGame && <SelectionScreen onStart={() => setInGame(true)} userId={userId} />}
      
      {inGame && (
        <>
          <GameCanvas />
          {!isRaceFinished && <GameHUD />}
          <SettingsPanel />
          {isRaceFinished && <PostRacePodium />}
        </>
      )}
    </main>
  )
}
