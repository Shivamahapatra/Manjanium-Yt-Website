'use client'

import React, { useState, useEffect } from 'react'
import { useUserPreferences } from '@/hooks/useUserPreferences'

interface Preset {
  id: string
  name: string
  description: string
  size: string
  tags: string[]
}

const F1_PRESETS: Preset[] = [
  {
    id: 'f1_live_focused',
    name: 'Live Focused',
    description: 'Large live timing tower, minimal side panels.',
    size: 'Large',
    tags: ['Live Timing']
  },
  {
    id: 'f1_data_heavy',
    name: 'Data Heavy',
    description: 'Live timing + full telemetry charts + standings.',
    size: 'Medium',
    tags: ['Live Timing', 'Standings']
  },
  {
    id: 'f1_minimal',
    name: 'Minimal',
    description: 'Compact live timing, hide unnecessary panels.',
    size: 'Small',
    tags: []
  }
]

const FOOTBALL_PRESETS: Preset[] = [
  {
    id: 'fb_live_matches',
    name: 'Live Matches',
    description: 'Live match cards prominent, minimal stats.',
    size: 'Main-Only',
    tags: []
  },
  {
    id: 'fb_standings_focused',
    name: 'Standings Focused',
    description: 'Standings table large, matches secondary.',
    size: 'Split',
    tags: ['Standings']
  },
  {
    id: 'fb_stats_heavy',
    name: 'Stats Heavy',
    description: 'Player stats, match stats, lineups all visible.',
    size: 'Three-Column',
    tags: ['Standings']
  }
]

export function DashboardPresets() {
  const { preferences, updatePreferences } = useUserPreferences()
  const [saveMessage, setSaveMessage] = useState('')
  const [selectedF1Preset, setSelectedF1Preset] = useState(preferences?.f1_dashboard_preset || 'f1_live_focused')
  const [selectedFootballPreset, setSelectedFootballPreset] = useState(preferences?.football_dashboard_preset || 'fb_live_matches')

  // Load saved preferences on mount
  useEffect(() => {
    if (preferences?.f1_dashboard_preset) {
      setSelectedF1Preset(preferences.f1_dashboard_preset)
    }
    if (preferences?.football_dashboard_preset) {
      setSelectedFootballPreset(preferences.football_dashboard_preset)
    }
  }, [preferences])

  const handleF1PresetChange = async (presetId: string) => {
    setSelectedF1Preset(presetId)
    try {
      await updatePreferences({ f1_dashboard_preset: presetId })
      setSaveMessage('✓ F1 preset saved')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (error) {
      console.error('Failed to save F1 preset:', error)
      setSaveMessage('✗ Failed to save')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  const handleFootballPresetChange = async (presetId: string) => {
    setSelectedFootballPreset(presetId)
    try {
      await updatePreferences({ football_dashboard_preset: presetId })
      setSaveMessage('✓ Football preset saved')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (error) {
      console.error('Failed to save Football preset:', error)
      setSaveMessage('✗ Failed to save')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  return (
    <div className="space-y-12">
      {/* F1 Presets */}
      <section>
        <h3
          style={{ color: 'var(--color-primary)' }}
          className="font-headline-md text-2xl mb-6 uppercase tracking-wider border-l-4 border-l-red-500 pl-4"
        >
          F1 Hub Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {F1_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleF1PresetChange(preset.id)}
              style={{
                backgroundColor: selectedF1Preset === preset.id ? 'var(--color-primary)' : 'var(--color-surface)',
                borderColor: selectedF1Preset === preset.id ? 'var(--color-primary)' : 'var(--color-border)',
                color: selectedF1Preset === preset.id ? 'var(--color-text-primary)' : 'var(--color-text-primary)'
              }}
              className="rounded-lg p-6 border-2 transition-all duration-300 text-left hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg">{preset.name}</h4>
                {selectedF1Preset === preset.id && (
                  <span style={{ color: selectedF1Preset === preset.id ? 'var(--color-text-primary)' : 'var(--color-primary)' }}>
                    ✓
                  </span>
                )}
              </div>
              <p style={{ color: selectedF1Preset === preset.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }} className="text-sm mb-4">
                {preset.description}
              </p>
              <div className="flex items-center justify-between">
                {preset.tags.length > 0 && (
                  <div className="flex gap-2">
                    {preset.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: 'rgba(139, 92, 246, 0.2)',
                          color: '#a78bfa'
                        }}
                        className="text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span style={{ color: selectedF1Preset === preset.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }} className="text-xs font-bold">
                  Size: {preset.size}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Football Presets */}
      <section>
        <h3
          style={{ color: 'var(--color-secondary)' }}
          className="font-headline-md text-2xl mb-6 uppercase tracking-wider border-l-4 border-l-blue-500 pl-4"
        >
          Football Hub Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FOOTBALL_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleFootballPresetChange(preset.id)}
              style={{
                backgroundColor: selectedFootballPreset === preset.id ? 'var(--color-secondary)' : 'var(--color-surface)',
                borderColor: selectedFootballPreset === preset.id ? 'var(--color-secondary)' : 'var(--color-border)',
                color: selectedFootballPreset === preset.id ? 'var(--color-text-primary)' : 'var(--color-text-primary)'
              }}
              className="rounded-lg p-6 border-2 transition-all duration-300 text-left hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg">{preset.name}</h4>
                {selectedFootballPreset === preset.id && (
                  <span style={{ color: selectedFootballPreset === preset.id ? 'var(--color-text-primary)' : 'var(--color-secondary)' }}>
                    ✓
                  </span>
                )}
              </div>
              <p style={{ color: selectedFootballPreset === preset.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }} className="text-sm mb-4">
                {preset.description}
              </p>
              <div className="flex items-center justify-between">
                {preset.tags.length > 0 && (
                  <div className="flex gap-2">
                    {preset.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: 'rgba(139, 92, 246, 0.2)',
                          color: '#a78bfa'
                        }}
                        className="text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span style={{ color: selectedFootballPreset === preset.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }} className="text-xs font-bold">
                  Size: {preset.size}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Save Feedback */}
      {saveMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-surface-container)',
            color: 'var(--color-text-primary)',
            borderColor: saveMessage.includes('✓') ? 'var(--color-primary)' : 'var(--color-error)'
          }}
          className="p-4 rounded-lg border-l-4 font-bold"
        >
          {saveMessage}
        </div>
      )}
    </div>
  )
}

export default DashboardPresets;
