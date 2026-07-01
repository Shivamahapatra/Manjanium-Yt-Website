'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Zap, Trophy, Settings, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
}

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  const items: SidebarItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-6 h-6" /> },
    { label: 'F1 Hub', href: '/f1', icon: <Zap className="w-6 h-6" /> },
    { label: 'Football', href: '/football', icon: <Trophy className="w-6 h-6" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="w-6 h-6" /> },
  ]

  return (
    <motion.aside
      initial={{ width: 80 }}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] bg-surface border-r border-border z-40"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 hover:bg-surface-alt transition-standard text-muted hover:text-accent"
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2 p-3">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-standard border-l-4 relative',
                isActive
                  ? 'border-l-accent bg-surface-alt text-accent'
                  : 'border-l-transparent text-muted hover:text-accent hover:bg-surface-alt'
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-3 border-t border-border text-xs text-muted space-y-1"
        >
          <p className="font-semibold">Manjanium</p>
          <p>v1.0.0</p>
        </motion.div>
      )}
    </motion.aside>
  )
}
