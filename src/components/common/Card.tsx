'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  glass?: boolean
  headerAction?: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    title,
    subtitle,
    children,
    className,
    onClick,
    hoverable = true,
    glass = false,
    headerAction,
    ...props
  }, ref) => {
    return (
      <motion.div
        ref={ref as any}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        whileHover={hoverable ? { y: -4 } : {}}
        onClick={onClick}
        className={cn(
          'rounded-lg border transition-standard overflow-hidden',
          glass
            ? 'glass border-accent/20'
            : 'bg-surface border-border hover:border-accent',
          hoverable && 'cursor-pointer hover:shadow-md',
          onClick && 'cursor-pointer',
          className
        )}
        {...(props as any)}
      >
        {/* Header */}
        {(title || subtitle || headerAction) && (
          <div className="border-b border-border px-6 py-4 flex justify-between items-start">
            <div className="flex-1">
              {title && (
                <h3 className="font-heading font-bold text-on-surface text-lg tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-muted text-sm mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && <div className="ml-4">{headerAction}</div>}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
