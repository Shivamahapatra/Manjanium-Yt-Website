'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Layout, Columns2, Columns3, Monitor } from 'lucide-react'
import { F1DashboardPresets } from './F1DashboardPresets'

interface Preset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
}

// F1 presets are handled in F1DashboardPresets component

const FOOTBALL_PRESETS: Preset[] = [
  {
    id: 'fb_live_matches',
    name: 'Live Matches',
    description: 'Match cards front and center. Ideal for match days.',
    icon: <Monitor className="w-5 h-5" />,
    features: ['Match Cards', 'Live Scores']
  },
  {
    id: 'fb_standings_focused',
    name: 'Standings Focused',
    description: 'Split view with matches and standings side by side.',
    icon: <Columns2 className="w-5 h-5" />,
    features: ['Match Cards', 'Standings Table']
  },
  {
    id: 'fb_stats_heavy',
    name: 'Stats Heavy',
    description: 'Full three-column layout with all stats, lineups, and scorers.',
    icon: <Columns3 className="w-5 h-5" />,
    features: ['Matches', 'Standings', 'Top Scorers', 'Lineups', 'Stats']
  }
]

export function DashboardPresets() {
  const { preferences, updatePreferences } = useUserPreferences()
  const [saveMessage, setSaveMessage] = useState('')
  const [selectedFootballPreset, setSelectedFootballPreset] = useState(preferences?.football_dashboard_preset || 'fb_live_matches')

  useEffect(() => {
    if (preferences?.football_dashboard_preset) {
      setSelectedFootballPreset(preferences.football_dashboard_preset)
    }
  }, [preferences])

  const showSave = (msg: string) => {
    setSaveMessage(msg)
    setTimeout(() => setSaveMessage(''), 2500)
  }

  const handleFootballPresetChange = async (presetId: string) => {
    setSelectedFootballPreset(presetId)
    try {
      await updatePreferences({ football_dashboard_preset: presetId })
      showSave('✓ Football preset applied')
    } catch (error) {
      console.error('Failed to save Football preset:', error)
      showSave('✗ Failed to save')
    }
  }

  const renderPresetCard = (preset: Preset, isActive: boolean, onClick: () => void, accentColor: string) => (
    <button
      key={preset.id}
      onClick={onClick}
      className="relative rounded-xl p-5 border-2 transition-all duration-300 text-left hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
      style={{
        backgroundColor: isActive ? accentColor : 'var(--color-surface)',
        borderColor: isActive ? accentColor : 'var(--color-border)',
        color: isActive ? '#fff' : 'var(--color-text-primary)',
        boxShadow: isActive ? `0 0 24px ${accentColor}25` : 'none'
      }}
    >
      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${accentColor}15`,
            color: isActive ? '#fff' : accentColor
          }}
        >
          {preset.icon}
        </div>
        <h4 className="font-bold text-base">{preset.name}</h4>
        {isActive && (
          <motion.span
            layoutId={`preset-check-${preset.id}`}
            className="ml-auto text-sm font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            ✓
          </motion.span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-4" style={{ opacity: 0.75 }}>
        {preset.description}
      </p>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-1.5">
        {preset.features.map(feature => (
          <span
            key={feature}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : `${accentColor}10`,
              color: isActive ? 'rgba(255,255,255,0.9)' : accentColor
            }}
          >
            {feature}
          </span>
        ))}
      </div>
    </button>
  )

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Dashboard Presets
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Choose a layout preset to control what widgets appear on each hub page.
        </p>
      </div>

      {/* F1 Presets */}
      <section className="space-y-5">
        <F1DashboardPresets />
      </section>

      {/* Football Presets */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: '#3b82f6' }}>
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#3b82f6' }}>
            Football Hub Layout
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FOOTBALL_PRESETS.map(preset =>
            renderPresetCard(
              preset,
              selectedFootballPreset === preset.id,
              () => handleFootballPresetChange(preset.id),
              '#3b82f6'
            )
          )}
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
              color: saveMessage.includes('✓') ? 'var(--color-primary)' : '#ef4444',
              borderColor: saveMessage.includes('✓') ? 'var(--color-primary)' : '#ef4444'
            }}
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardPresets
