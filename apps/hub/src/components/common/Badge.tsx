'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'alert' | 'success' | 'default'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
  pulse?: boolean
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({
    variant = 'default',
    size = 'md',
    children,
    className,
    pulse = false,
    ...props
  }, ref) => {
    const variants = {
      primary: 'bg-accent/20 text-accent border-accent/30',
      secondary: 'bg-secondary/20 text-secondary border-secondary/30',
      alert: 'bg-alert/20 text-alert border-alert/30',
      success: 'bg-success/20 text-success border-success/30',
      default: 'bg-muted/20 text-muted border-muted/30',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
      md: 'px-3 py-1 text-xs font-semibold uppercase tracking-wide',
    }

    return (
      <div ref={ref} className="relative inline-flex" {...props}>
        <span
          className={cn(
            'inline-flex items-center rounded-full border transition-standard',
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
)

Badge.displayName = 'Badge'
