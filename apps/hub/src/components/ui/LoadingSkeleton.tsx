'use client'

import { motion } from 'framer-motion'

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-16 bg-[#1F2937] rounded-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  )
}

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
