'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'auto'
  font_size?: 'sm' | 'md' | 'lg'
  animation_speed?: 'reduced' | 'normal' | 'fast'
  f1_dashboard_preset?: string
  football_dashboard_preset?: string
  notifications?: {
    email: boolean
    push: boolean
    alerts: boolean
  }
}

export function useUserPreferences() {
  const { userId } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load preferences from Supabase
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          throw new Error('Failed to load preferences')
        }

        const data = await response.json()
        setPreferences(data.preferences)
      } catch (err) {
        console.error('Error loading preferences:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      const data = await response.json()
      setPreferences(data.preferences)
      return data.preferences
    } catch (err) {
      console.error('Error updating preferences:', err)
      throw err
    }
  }

  return {
    preferences,
    loading,
    error,
    updatePreferences
  }
}
