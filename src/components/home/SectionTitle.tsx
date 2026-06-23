'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SectionTitleProps {
  title: string
  subtitle?: string
}

export const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight font-serif">
          {title}
        </h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-1 bg-brand-accent rounded-full"
        />
        {subtitle && (
          <p className="text-text-secondary mt-2 max-w-2xl">
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  )
}
