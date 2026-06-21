'use client'

import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useState } from 'react'

type Theme = 'dark' | 'light' | 'auto'
type FontSize = 'sm' | 'md' | 'lg'
type AnimationSpeed = 'reduced' | 'normal' | 'fast'

export default function AppearanceSettings() {
  const { preferences, updatePreferences } = useUserPreferences()
  const [saveMessage, setSaveMessage] = useState('')

  const handleThemeChange = async (theme: Theme) => {
    await updatePreferences({ theme })
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
    setSaveMessage('✓ Theme saved')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const handleFontSizeChange = async (size: FontSize) => {
    await updatePreferences({ fontSize: size })
    setSaveMessage('✓ Font size saved')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const handleAnimationChange = async (speed: AnimationSpeed) => {
    await updatePreferences({ animationSpeed: speed })
    setSaveMessage('✓ Animation speed saved')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const themeOptions: { label: string; value: Theme; description: string }[] = [
    { label: 'Dark', value: 'dark', description: 'Optimal for low-light viewing' },
    { label: 'Light', value: 'light', description: 'High visibility mode' },
    { label: 'Auto', value: 'auto', description: 'System preference' }
  ]

  const fontSizes: { label: string; value: FontSize }[] = [
    { label: 'Small', value: 'sm' },
    { label: 'Normal', value: 'md' },
    { label: 'Large', value: 'lg' }
  ]

  const animationSpeeds: { label: string; value: AnimationSpeed }[] = [
    { label: 'Reduced', value: 'reduced' },
    { label: 'Normal', value: 'normal' },
    { label: 'Fast', value: 'fast' }
  ]

  return (
    <div className="space-y-8">
      <section>
        <h3 style={{ color: 'var(--color-primary)' }} className="font-bold text-lg mb-4 uppercase">
          Theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              style={{
                backgroundColor: preferences?.theme === option.value ? 'var(--color-primary)' : 'var(--color-surface)',
                color: preferences?.theme === option.value ? 'var(--color-background)' : 'var(--color-text-secondary)',
                borderColor: 'var(--color-border)'
              }}
              className="p-4 rounded-lg border-2 transition-all hover:scale-105 text-center"
            >
              <div className="font-bold">{option.label}</div>
              <div className="text-xs">{option.description}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ color: 'var(--color-primary)' }} className="font-bold text-lg mb-4 uppercase">
          Font Size
        </h3>
        <div className="flex gap-4">
          {fontSizes.map(size => (
            <button
              key={size.value}
              onClick={() => handleFontSizeChange(size.value)}
              style={{
                backgroundColor: preferences?.fontSize === size.value ? 'var(--color-primary)' : 'var(--color-surface)',
                color: preferences?.fontSize === size.value ? 'var(--color-background)' : 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              className="px-6 py-2 rounded-lg border-2 font-bold transition-all hover:scale-105"
            >
              {size.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 style={{ color: 'var(--color-primary)' }} className="font-bold text-lg mb-4 uppercase">
          Animation Speed
        </h3>
        <div className="flex gap-4">
          {animationSpeeds.map(speed => (
            <button
              key={speed.value}
              onClick={() => handleAnimationChange(speed.value)}
              style={{
                backgroundColor: preferences?.animationSpeed === speed.value ? 'var(--color-primary)' : 'var(--color-surface)',
                color: preferences?.animationSpeed === speed.value ? 'var(--color-background)' : 'var(--color-text-primary)',
                borderColor: 'var(--color-border)'
              }}
              className="px-6 py-2 rounded-lg border-2 font-bold transition-all hover:scale-105"
            >
              {speed.label}
            </button>
          ))}
        </div>
      </section>

      {saveMessage && (
        <div className="p-4 rounded-lg font-bold" style={{ backgroundColor: 'var(--color-surface-container)', color: 'var(--color-text-primary)' }}>
          {saveMessage}
        </div>
      )}
    </div>
  )
}
