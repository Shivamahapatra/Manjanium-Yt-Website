'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DashboardGridProps {
  children: React.ReactNode
}

export const DashboardGrid = ({ children }: DashboardGridProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {children}
    </motion.div>
  )
}
