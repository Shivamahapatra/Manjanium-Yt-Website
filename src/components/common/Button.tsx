'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

import { HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-brand-primary text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]',
    secondary: 'bg-brand-secondary text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]',
    outline: 'border-2 border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary/10',
    ghost: 'bg-transparent text-text-secondary hover:bg-interactive-hover hover:text-text-primary',
    danger: 'bg-semantic-red text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-6 py-2.5 text-sm font-bold',
    lg: 'px-8 py-3.5 text-base font-bold',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cn(
        'rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
