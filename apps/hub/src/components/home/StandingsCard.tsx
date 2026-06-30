'use client'

import React from 'react'
import { Card } from '@/components/common/Card'
import { motion } from 'framer-motion'

interface Team {
  rank: number
  name: string
  points: number
  flag: string
}

export const StandingsCard = () => {
  const standingsData: Team[] = [
    { rank: 1, name: 'Argentina', points: 12, flag: '🇦🇷' },
    { rank: 2, name: 'France', points: 9, flag: '🇫🇷' },
    { rank: 3, name: 'Germany', points: 6, flag: '🇩🇪' },
    { rank: 4, name: 'Spain', points: 3, flag: '🇪🇸' },
  ]

  return (
    <Card title="World Cup Standings">
      <div className="space-y-2">
        {standingsData.map((team, idx) => (
          <motion.div
            key={team.rank}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 bg-surface-alt rounded-lg hover:border-l-4 hover:border-l-accent transition-standard"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{team.flag}</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">{team.name}</p>
                <p className="text-xs text-muted">#{team.rank}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-accent">{team.points}pts</span>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
