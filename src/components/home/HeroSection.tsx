'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { useRouter } from 'next/navigation'
import { IconArrowRight } from '@tabler/icons-react'

export const HeroSection = () => {
  const router = useRouter()

  return (
    <div className="relative pt-32 pb-16 lg:pt-48 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          Live 2026 Season Coverage
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-8 font-serif"
        >
          MANJANIUM <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary">
            ON SOFTS
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed"
        >
          The ultimate engineering-first hub for F1 telemetry and football analytics. 
          Track every millisecond and every goal in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button 
            size="lg" 
            className="group"
            onClick={() => router.push('/f1')}
          >
            Enter F1 Hub
            <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="group"
            onClick={() => router.push('/football')}
          >
            Football Center
            <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
