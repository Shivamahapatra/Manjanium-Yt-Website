'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationDrawerProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { label: 'Home', href: '/', icon: 'home', value: 'Home' },
  { label: 'F1 Hub', href: '/f1', icon: 'speed', value: 'F1 Hub' },
  { label: 'Football', href: '/football', icon: 'sports_soccer', value: 'Football' },
  { label: 'Settings', href: '/settings', icon: 'settings', value: 'Settings' }
]

export function NavigationDrawer({ activeTab, onTabChange }: NavigationDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === '/') return pathname === '/'
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <aside
      style={{
        backgroundColor: 'var(--color-surface-container)',
        borderRightColor: 'var(--color-border)',
      }}
      className="hidden md:flex flex-col gap-2 py-4 overflow-hidden h-[calc(100vh-64px)] w-[72px] hover:w-[220px] transition-all duration-300 ease-in-out border-r shrink-0 sticky top-16 group z-20"
    >
      <div className="px-5 mb-4 whitespace-nowrap overflow-hidden">
        <span
          style={{ color: 'var(--color-primary)' }}
          className="font-black text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          CHAMPIONSHIP
        </span>
      </div>

      <nav className="flex flex-col gap-1 w-full">
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
                backgroundColor: active ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderLeftColor: active ? 'var(--color-primary)' : 'transparent',
              }}
              className="flex items-center gap-4 px-5 py-3.5 border-l-4 font-bold transition-all duration-200 hover:opacity-90 whitespace-nowrap overflow-hidden text-left w-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl shrink-0 w-6 text-center">
                {item.icon}
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
