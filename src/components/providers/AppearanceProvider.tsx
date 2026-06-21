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

    if (preferences?.fontsize) {
      document.documentElement.style.fontSize = preferences.fontsize === 'large' ? '18px' : preferences.fontsize === 'small' ? '14px' : '16px'
    }

    if (preferences?.animationspeed) {
      const speed = preferences.animationspeed === 'fast' ? '0.3s' : preferences.animationspeed === 'reduced' ? '0.8s' : '0.5s'
      document.documentElement.style.setProperty('--transition-normal', speed)
    }
  }, [preferences])

  return <>{children}</>
}
