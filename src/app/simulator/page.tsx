'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import GameModeSelector from '@/components/simulator/GameModeSelector'
import TrackCard from '@/components/simulator/TrackCard'
import GameSettings from '@/components/simulator/GameSettings'
import { SIMULATOR_TRACKS } from '@/lib/tracks'
import { useSimulatorGame } from '@/hooks/useSimulatorGame'
import { GameMode, WeatherType, DifficultyLevel, Track } from '@/types/simulator'

export default function SimulatorPage() {
  const router = useRouter()
  const { createSession, setCurrentTrack } = useSimulatorGame()

  // Game selection state
  const [gameMode, setGameMode] = useState<GameMode>('single-player')
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(SIMULATOR_TRACKS[0])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [weather, setWeather] = useState<WeatherType>('clear')
  const [numberOfLaps, setNumberOfLaps] = useState(5)
  const [step, setStep] = useState(1) // 1: mode, 2: track, 3: settings, 4: confirm

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track)
  }

  const handleStartRace = () => {
    if (!selectedTrack) return

    const session = {
      id: `session_${Date.now()}`,
      mode: gameMode,
      track: selectedTrack,
      weather,
      difficulty,
      numberOfLaps,
      aiDifficulty: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : difficulty === 'hard' ? 8 : 10,
      isMultiplayer: gameMode === 'multiplayer',
    }

    createSession(session)
    setCurrentTrack(selectedTrack)

    // Navigate to game (will create in Phase 3)
    router.push('/simulator/game')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-surface to-[#0a0a0a] pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold text-[#FBBF24] font-heading mb-2">
            PADDOCK SIMULATOR
          </h1>
          <p className="text-[#6B7280] text-lg">
            Experience F1 racing at your fingertips
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step >= s ? 'bg-[#FBBF24] w-8' : 'bg-[#333333] w-4'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Game Mode Selection */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Select Game Mode</h2>
              <GameModeSelector selected={gameMode} onSelect={setGameMode} />
              <div className="flex justify-end">
                <motion.button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-[#FBBF24] text-black font-bold rounded-lg hover:bg-[#FCD34D] transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  Next: Select Track
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Track Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Choose Your Track</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {SIMULATOR_TRACKS.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onSelect={handleTrackSelect}
                    isSelected={selectedTrack?.id === track.id}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <motion.button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-[#1F2937] text-white font-bold rounded-lg hover:bg-[#374151] transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-[#FBBF24] text-black font-bold rounded-lg hover:bg-[#FCD34D] transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  Next: Settings
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Game Settings */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Game Settings</h2>
              <GameSettings
                difficulty={difficulty}
                weather={weather}
                laps={numberOfLaps}
                onDifficultyChange={setDifficulty}
                onWeatherChange={setWeather}
                onLapsChange={setNumberOfLaps}
              />
              <div className="flex justify-between">
                <motion.button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-[#1F2937] text-white font-bold rounded-lg hover:bg-[#374151] transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleStartRace}
                  className="px-6 py-3 bg-success text-white font-bold rounded-lg hover:bg-[#059669] transition-colors text-lg"
                  whileTap={{ scale: 0.95 }}
                >
                  🏁 START RACE
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
