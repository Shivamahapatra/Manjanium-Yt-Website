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

    if (preferences?.fontSize) {
      document.documentElement.style.fontSize = preferences.fontSize === 'lg' ? '18px' : preferences.fontSize === 'sm' ? '12px' : '14px';
    }

    if (preferences?.animationSpeed) {
      const speed = preferences.animationSpeed === 'fast' ? '0.3s' : preferences.animationSpeed === 'reduced' ? '0.8s' : '0.5s'
      document.documentElement.style.setProperty('--transition-normal', speed)
    }
  }, [preferences])

  return <>{children}</>
}
