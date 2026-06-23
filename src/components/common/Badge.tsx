'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'alert' | 'success' | 'outline'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
  pulse?: boolean
}

export const Badge = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  pulse = false
}: BadgeProps) => {
  const variants = {
    primary: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30',
    secondary: 'bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30',
    alert: 'bg-semantic-red/20 text-semantic-red border-semantic-red/30',
    success: 'bg-semantic-green/20 text-semantic-green border-semantic-green/30',
    outline: 'bg-transparent text-text-secondary border-border-primary',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
    md: 'px-3 py-1 text-xs font-bold uppercase tracking-wide',
  }

  return (
    <div className="relative inline-flex">
      <span
        className={cn(
          'inline-flex items-center rounded-full border transition-all duration-200',
          variants[variant],
          sizes[size],
          className
        )}
      >
        {children}
      </span>
      {pulse && (
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            'absolute inset-0 rounded-full border pointer-events-none',
            variants[variant]
          )}
        />
      )}
    </div>
  )
}
