'use client'

import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Sun, Moon, Type, Zap } from 'lucide-react'

type Theme = 'dark' | 'light' | 'auto'
type FontSize = 'sm' | 'md' | 'lg'
type AnimationSpeed = 'reduced' | 'normal' | 'fast'

export function AppearanceSettings() {
  const { preferences, updatePreferences } = useUserPreferences()
  const [saveMessage, setSaveMessage] = useState('')

  const showSave = (msg: string) => {
    setSaveMessage(msg)
    setTimeout(() => setSaveMessage(''), 2500)
  }

  const handleThemeChange = async (theme: Theme) => {
    await updatePreferences({ theme })
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
    showSave('✓ Theme updated')
  }

  const handleFontSizeChange = async (size: FontSize) => {
    await updatePreferences({ font_size: size })
    showSave('✓ Font size updated')
  }

  const handleAnimationChange = async (speed: AnimationSpeed) => {
    await updatePreferences({ animation_speed: speed })
    showSave('✓ Animation speed updated')
  }

  const themeOptions: { label: string; value: Theme; description: string; icon: React.ReactNode }[] = [
    { label: 'Dark', value: 'dark', description: 'Optimal for low-light environments', icon: <Moon className="w-6 h-6" /> },
    { label: 'Light', value: 'light', description: 'High-visibility mode', icon: <Sun className="w-6 h-6" /> },
    { label: 'Auto', value: 'auto', description: 'Follows your system preference', icon: <Monitor className="w-6 h-6" /> }
  ]

  const fontSizes: { label: string; value: FontSize; preview: string }[] = [
    { label: 'Small', value: 'sm', preview: 'Aa' },
    { label: 'Normal', value: 'md', preview: 'Aa' },
    { label: 'Large', value: 'lg', preview: 'Aa' }
  ]

  const animationSpeeds: { label: string; value: AnimationSpeed; description: string }[] = [
    { label: 'Reduced', value: 'reduced', description: 'Less motion' },
    { label: 'Normal', value: 'normal', description: 'Standard' },
    { label: 'Fast', value: 'fast', description: 'Quick transitions' }
  ]

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Appearance
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Customize the look and feel of your dashboard.
        </p>
      </div>

      {/* Theme Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: 'var(--color-primary)' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
            Theme
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map(option => {
            const isActive = preferences?.theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className="relative p-5 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  color: isActive ? 'var(--color-background)' : 'var(--color-text-primary)',
                  boxShadow: isActive ? '0 0 20px rgba(251, 191, 36, 0.15)' : 'none'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ opacity: isActive ? 1 : 0.6 }}>{option.icon}</span>
                  <span className="font-bold text-base">{option.label}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ opacity: 0.8 }}>{option.description}</p>
                {isActive && (
                  <motion.span
                    layoutId="theme-check"
                    className="absolute top-3 right-3 text-sm font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    ✓
                  </motion.span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Font Size Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: 'var(--color-primary)' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
            Font Size
          </h3>
        </div>
        <div className="flex gap-3">
          {fontSizes.map(size => {
            const isActive = preferences?.font_size === size.value
            return (
              <button
                key={size.value}
                onClick={() => handleFontSizeChange(size.value)}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-w-[90px]"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isActive ? 'var(--color-background)' : 'var(--color-text-primary)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: isActive ? '0 0 20px rgba(251, 191, 36, 0.15)' : 'none'
                }}
              >
                <span className={`font-serif ${size.value === 'sm' ? 'text-base' : size.value === 'md' ? 'text-xl' : 'text-2xl'}`}>
                  {size.preview}
                </span>
                <span className="text-xs uppercase tracking-wider">{size.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Animation Speed Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: 'var(--color-primary)' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
            Animation Speed
          </h3>
        </div>
        <div className="flex gap-3">
          {animationSpeeds.map(speed => {
            const isActive = preferences?.animation_speed === speed.value
            return (
              <button
                key={speed.value}
                onClick={() => handleAnimationChange(speed.value)}
                className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl border-2 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-w-[100px]"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isActive ? 'var(--color-background)' : 'var(--color-text-primary)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: isActive ? '0 0 20px rgba(251, 191, 36, 0.15)' : 'none'
                }}
              >
                <Zap className={`w-4 h-4 ${speed.value === 'fast' ? 'animate-pulse' : ''}`} style={{ opacity: isActive ? 1 : 0.5 }} />
                <span className="text-sm">{speed.label}</span>
                <span className="text-[10px] font-normal uppercase tracking-wider" style={{ opacity: 0.6 }}>{speed.description}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Save Toast */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              borderColor: 'var(--color-primary)'
            }}
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
