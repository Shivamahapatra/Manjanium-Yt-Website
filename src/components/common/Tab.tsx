'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export const Tab = ({ tabs, activeTab, onChange, className }: TabProps) => {
  return (
    <div className={cn('flex p-1 bg-bg-tertiary/50 backdrop-blur-sm rounded-xl border border-border-primary/50', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg',
            activeTab === tab.id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span className="relative z-10">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 bg-card-bg shadow-sm rounded-lg border border-border-primary/50"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
