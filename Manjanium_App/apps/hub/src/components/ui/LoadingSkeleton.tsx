'use client'

import { motion } from 'framer-motion'

export function HUDSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        className="h-32 bg-[#1F2937] rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="h-32 bg-[#1F2937] rounded-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  )
}
