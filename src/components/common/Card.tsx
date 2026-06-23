'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
}

export const Card = ({ title, children, className, headerAction }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-card-bg border border-card-border rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:border-brand-primary/50 transition-all duration-300',
        className
      )}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-card-border flex justify-between items-center bg-bg-secondary/50">
          {title && <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  )
}
