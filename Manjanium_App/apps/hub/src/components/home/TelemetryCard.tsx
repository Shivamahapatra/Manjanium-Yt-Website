'use client'

import React from 'react'
import { Card } from '@/components/common/Card'
import { motion } from 'framer-motion'

export const TelemetryCard = () => {
  const telemetryData = [
    { time: '0:00', speed: 120, rpm: 5000, throttle: 80 },
    { time: '0:30', speed: 180, rpm: 7200, throttle: 95 },
    { time: '1:00', speed: 200, rpm: 8000, throttle: 100 },
    { time: '1:30', speed: 150, rpm: 6500, throttle: 70 },
    { time: '2:00', speed: 220, rpm: 8500, throttle: 100 },
  ]

  return (
    <Card title="Live Telemetry">
      <div className="space-y-4">
        {/* Chart Placeholder */}
        <div className="h-40 bg-surface-alt rounded-lg flex items-end justify-between px-4 py-4 gap-2">
          {telemetryData.map((data, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              whileInView={{ height: `${(data.speed / 220) * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-accent to-secondary rounded-t-lg hover:opacity-80 transition-standard"
              title={`Speed: ${data.speed}km/h`}
            />
          ))}
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-surface-alt rounded-lg p-3">
            <p className="text-xs text-muted mb-1">AVG SPEED</p>
            <p className="text-lg font-bold text-accent">178 km/h</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3">
            <p className="text-xs text-muted mb-1">MAX RPM</p>
            <p className="text-lg font-bold text-secondary">8500</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3">
            <p className="text-xs text-muted mb-1">THROTTLE</p>
            <p className="text-lg font-bold text-success">93%</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
