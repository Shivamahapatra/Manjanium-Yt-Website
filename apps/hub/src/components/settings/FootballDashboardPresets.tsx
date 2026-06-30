'use client';

import { useState } from 'react';
import { FootballPresetSidebar } from './FootballPresetSidebar';
import { useFootballDashboardPreset, FootballNewPresetType } from '@/hooks/useFootballDashboardPreset';
import { motion } from 'framer-motion';

export function FootballDashboardPresets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { preset, setPreset, loading } = useFootballDashboardPreset();

  if (loading) {
    return (
      <div className="p-6 bg-[#131313] rounded-lg border border-[#333333]">
        <p className="text-[#6B7280]">Loading preset...</p>
      </div>
    );
  }

  const currentPresetName = {
    'live-matches': 'Live Matches Focus',
    'standings-focus': 'Standings Focus',
    'compact-stats': 'Compact Stats'
  }[preset] || 'Live Matches Focus';

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--football-font-heading)' }}
        >
          Dashboard Presets
        </h3>
        <p className="text-[#6B7280]">
          Customize your Football Center layout
        </p>
      </div>

      {/* Current Preset Display */}
      <motion.div
        className="p-6 bg-gradient-to-r from-[#1F2937] to-[#131313] rounded-lg border border-[#10B981]/30"
        whileHover={{ borderColor: '#10B981' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6B7280] text-sm mb-1">CURRENT PRESET</p>
            <h2 className="text-2xl font-bold text-white">
              {currentPresetName}
            </h2>
            <p className="text-[#6B7280] text-sm mt-2">
              Applied to your Football Center.
            </p>
          </div>
          <div className="text-4xl">
            {preset === 'live-matches' && '⚽'}
            {preset === 'standings-focus' && '📊'}
            {preset === 'compact-stats' && '🎯'}
          </div>
        </div>
      </motion.div>

      {/* Preset Description */}
      <div className="p-6 bg-[#131313] rounded-lg border border-[#333333]">
        <p className="text-[#6B7280] leading-relaxed">
          {preset === 'live-matches' && (
            'Designed for match days. Shows live match cards in a grid with real-time scores, match status badges, and team radio/chat for the selected match.'
          )}
          {preset === 'standings-focus' && (
            'Perfect for standings analysis. Shows group selector tabs (A-F), a full-width standings table with qualified teams highlighted, and a top scorers sidebar.'
          )}
          {preset === 'compact-stats' && (
            'Balanced overview for quick insights. Three-column layout with compact match cards, group standings, top scorers, and quick stats all visible at once.'
          )}
        </p>
      </div>

      {/* Open Presets Button */}
      <motion.button
        onClick={() => setSidebarOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-4 bg-[#10B981] text-white font-bold rounded-lg hover:bg-[#10B981]/90 transition-colors flex items-center justify-center gap-2"
      >
        <span>⚙️ Customize Football Preset</span>
        <span className="text-lg">→</span>
      </motion.button>

      {/* Preset Sidebar */}
      <FootballPresetSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPreset={preset}
        onSelectPreset={setPreset}
      />
    </div>
  );
}
