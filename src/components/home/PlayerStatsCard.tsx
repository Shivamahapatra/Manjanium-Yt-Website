'use client'

import React from 'react'
import { Card } from '@/components/common/Card'
import { motion } from 'framer-motion'

interface Player {
  id: number
  name: string
  position: string
  goals: number
  assists: number
  flag: string
}

export const PlayerStatsCard = () => {
  const playerData: Player[] = [
    { id: 1, name: 'Messi, L.', position: 'FW', goals: 8, assists: 3, flag: '🇦🇷' },
    { id: 2, name: 'Mbappé, K.', position: 'FW', goals: 7, assists: 2, flag: '🇫🇷' },
    { id: 3, name: 'Haaland, E.', position: 'FW', goals: 6, assists: 1, flag: '🇳🇴' },
    { id: 4, name: 'Neymar Jr.', position: 'FW', goals: 5, assists: 4, flag: '🇧🇷' },
  ]

  return (
    <Card title="Football Player Stats">
      <div className="space-y-3">
        {playerData.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 bg-surface-alt rounded-lg hover:border-l-4 hover:border-l-secondary transition-standard"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-lg">{player.flag}</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">{player.name}</p>
                <p className="text-xs text-muted">{player.position}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-accent">{player.goals}G</p>
              <p className="text-xs text-muted">{player.assists}A</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
