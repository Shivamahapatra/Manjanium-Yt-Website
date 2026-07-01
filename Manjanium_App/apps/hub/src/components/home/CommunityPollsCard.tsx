'use client'

import React, { useState } from 'react'
import { Card } from '@/components/common/Card'
import { motion } from 'framer-motion'

interface Poll {
  id: number
  question: string
  options: Array<{
    id: number
    label: string
    percentage: number
  }>
}

export const CommunityPollsCard = () => {
  const [polls] = useState<Poll[]>([
    {
      id: 1,
      question: 'Who will win the World Cup 2026?',
      options: [
        { id: 1, label: 'Argentina', percentage: 35 },
        { id: 2, label: 'France', percentage: 28 },
        { id: 3, label: 'Germany', percentage: 22 },
        { id: 4, label: 'Other', percentage: 15 },
      ],
    },
    {
      id: 2,
      question: 'Best F1 Driver 2026?',
      options: [
        { id: 1, label: 'Verstappen', percentage: 42 },
        { id: 2, label: 'Norris', percentage: 31 },
        { id: 3, label: 'Leclerc', percentage: 27 },
      ],
    },
  ])

  return (
    <Card title="Community Polls" className="lg:col-span-3">
      <div className="space-y-8">
        {polls.map((poll, pollIdx) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: pollIdx * 0.1 }}
            className="space-y-3"
          >
            <p className="font-semibold text-on-surface">{poll.question}</p>
            <div className="space-y-2">
              {poll.options.map((option, optIdx) => (
                <motion.div
                  key={option.id}
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ delay: optIdx * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 bg-surface-alt rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${option.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: optIdx * 0.15, duration: 0.7 }}
                      className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted font-semibold w-12 text-right">
                    {option.percentage}%
                  </span>
                  <span className="text-sm text-muted w-20 text-right">{option.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
