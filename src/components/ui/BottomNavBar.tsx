'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface BottomNavBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { label: 'Home', href: '/', icon: 'home', value: 'Home' },
  { label: 'F1 Hub', href: '/f1', icon: 'speed', value: 'F1 Hub' },
  { label: 'Football', href: '/football', icon: 'sports_soccer', value: 'Football' },
  { label: 'Settings', href: '/settings', icon: 'settings', value: 'Settings' }
]

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === '/') return pathname === '/'
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-surface-container)',
        borderTopColor: 'var(--color-border)',
      }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-stretch h-16 border-t"
    >
      {navItems.map(item => {
        const active = isActive(item)
        return (
          <button
            key={item.href}
            onClick={() => {
              onTabChange(item.value)
              router.push(item.href)
            }}
            style={{
              color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-center font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-[10px] uppercase tracking-wider">{item.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </nav>
  )
}
