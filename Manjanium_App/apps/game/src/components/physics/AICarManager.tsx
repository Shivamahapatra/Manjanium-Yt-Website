'use client'

import AICar from './AICar'
import { TRACK_WAYPOINTS } from '@/lib/aiConfig'

interface AICarManagerProps {
  trackId: string
  difficulty?: 'easy' | 'medium' | 'hard' | 'pro'
  numberOfCars?: number
}

const AI_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6']

const AI_START_OFFSETS = [
  [-4, 0.5, 4],
  [4, 0.5, 4],
  [-4, 0.5, 8],
  [4, 0.5, 8],
  [0, 0.5, 12],
] as [number, number, number][]

export default function AICarManager({
  trackId,
  difficulty = 'medium',
  numberOfCars = 3,
}: AICarManagerProps) {
  const waypoints = TRACK_WAYPOINTS[trackId] || TRACK_WAYPOINTS.monza
  const count = Math.min(numberOfCars, 5)

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <AICar
          key={`ai-car-${i}`}
          id={`ai-${i}`}
          color={AI_COLORS[i]}
          startPosition={AI_START_OFFSETS[i]}
          waypoints={waypoints}
          difficulty={difficulty}
          startOffset={i * 2}
        />
      ))}
    </>
  )
}
