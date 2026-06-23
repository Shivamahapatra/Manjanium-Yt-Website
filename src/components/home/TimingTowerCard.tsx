'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { motion } from 'framer-motion'

interface Driver {
  pos: number
  acronym: string
  gap: string
  color: string
}

export const TimingTowerCard = () => {
  const initialDrivers: Driver[] = [
    { pos: 1, acronym: 'VER', gap: 'LEADER', color: '#0EA5E9' },
    { pos: 2, acronym: 'NOR', gap: '+1.432', color: '#FBBF24' },
    { pos: 3, acronym: 'LEC', gap: '+4.201', color: '#EF4444' },
    { pos: 4, acronym: 'HAM', gap: '+8.911', color: '#10B981' },
    { pos: 5, acronym: 'RUS', gap: '+11.003', color: '#0EA5E9' },
  ]

  const [drivers, setDrivers] = useState(initialDrivers)

  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prev) =>
        prev.map((d, i) => {
          if (i === 0) return d
          const currentGap = parseFloat(d.gap.replace('+', ''))
          const newGap = (currentGap + (Math.random() * 0.2 - 0.05)).toFixed(3)
          return { ...d, gap: `+${newGap}` }
        })
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card title="Live Timing Tower" headerAction={<Badge variant="alert" pulse>LIVE</Badge>}>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs text-muted font-semibold mb-3 pb-2 border-b border-border">
          <div className="col-span-1">POS</div>
          <div className="col-span-5">DRIVER</div>
          <div className="col-span-6 text-right">GAP</div>
        </div>
        {drivers.map((driver, idx) => (
          <motion.div
            key={driver.acronym}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-surface-alt rounded-lg hover:border-l-4 hover:border-l-accent transition-standard"
          >
            <div className="col-span-1 font-bold text-on-surface">{driver.pos}</div>
            <div className="col-span-5 flex items-center gap-2">
              <div
                className="w-2 h-4 rounded-full"
                style={{ backgroundColor: driver.color }}
              />
              <span className="font-semibold text-on-surface text-sm">{driver.acronym}</span>
            </div>
            <div className={`col-span-6 text-right font-bold ${driver.pos === 1 ? 'text-accent' : 'text-muted'}`}>
              {driver.gap}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
