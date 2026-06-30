'use client'

import React, { useEffect } from 'react'
import { useUserPreferences } from '@/hooks/useUserPreferences'

export default function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useUserPreferences()

  useEffect(() => {
    if (preferences?.theme) {
      document.documentElement.setAttribute('data-theme', preferences.theme)
      document.documentElement.classList.toggle('light', preferences.theme === 'light')
      document.documentElement.classList.toggle('dark', preferences.theme === 'dark')
    }

    if (preferences?.font_size) {
      document.documentElement.style.fontSize = preferences.font_size === 'lg' ? '18px' : preferences.font_size === 'sm' ? '12px' : '14px';
    }

    if (preferences?.animation_speed) {
      const speed = preferences.animation_speed === 'fast' ? '0.3s' : preferences.animation_speed === 'reduced' ? '0.8s' : '0.5s'
      document.documentElement.style.setProperty('--transition-normal', speed)
    }
  }, [preferences])

  return <>{children}</>
}
