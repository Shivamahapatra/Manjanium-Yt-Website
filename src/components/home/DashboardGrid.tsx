'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
}

export const DashboardGrid = ({ children, className }: DashboardGridProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
