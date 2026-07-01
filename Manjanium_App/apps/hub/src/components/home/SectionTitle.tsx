'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SectionTitleProps {
  title: string
  subtitle?: string
}

export const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-2 mb-8"
    >
      <div className="flex items-center gap-4">
        <h2 className="font-heading font-bold text-on-surface text-3xl tracking-tight">
          {title}
        </h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="h-1 bg-accent rounded"
        />
      </div>
      {subtitle && (
        <p className="text-muted text-sm max-w-2xl">{subtitle}</p>
      )}
    </motion.div>
  )
}
