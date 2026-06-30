'use client';

import { useState } from 'react';
import { PresetSidebar } from './PresetSidebar';
import { useDashboardPreset, F1NewPresetType as F1PresetType } from '@/hooks/useDashboardPreset';
import { motion } from 'framer-motion';

export function F1DashboardPresets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { preset, setPreset, loading } = useDashboardPreset();

  if (loading) {
    return (
      <div className="p-6 bg-[#131313] rounded-lg border border-[#333333]">
        <p className="text-[#6B7280]">Loading preset...</p>
      </div>
    );
  }

  const currentPresetName = {
    'live-focused': 'Live Focused',
    'stats-detailed': 'Stats Detailed',
    'compact-overview': 'Compact Overview'
  }[preset] || 'Live Focused';

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--f1-font-heading)' }}
        >
          Dashboard Presets
        </h3>
        <p className="text-[#6B7280]">
          Customize your F1 Hub layout to match your viewing style
        </p>
      </div>

      {/* Current Preset Display */}
      <motion.div
        className="p-6 bg-gradient-to-r from-[#1F2937] to-[#131313] rounded-lg border border-[#FBBF24]/30"
        whileHover={{ borderColor: '#FBBF24' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6B7280] text-sm mb-1">CURRENT PRESET</p>
            <h2 className="text-2xl font-bold text-white">
              {currentPresetName}
            </h2>
            <p className="text-[#6B7280] text-sm mt-2">
              Applied to your F1 Hub. Click button below to change.
            </p>
          </div>
          <div className="text-4xl">
            {preset === 'live-focused' && '⚡'}
            {preset === 'stats-detailed' && '📊'}
            {preset === 'compact-overview' && '🎯'}
          </div>
        </div>
      </motion.div>

      {/* Preset Description */}
      <div className="p-6 bg-[#131313] rounded-lg border border-[#333333]">
        <p className="text-[#6B7280] leading-relaxed">
          {preset === 'live-focused' && (
            'Designed for live race viewing. Shows timing tower and global race tracker side-by-side with real-time lap updates, position changes, and live speed data.'
          )}
          {preset === 'stats-detailed' && (
            'Perfect for deep analysis. Displays championship standings, telemetry analysis, pit strategy, and weather data in a detailed comparative layout.'
          )}
          {preset === 'compact-overview' && (
            'Balanced overview for quick insights. Shows session status, race tracker, quick stats, and top 10 drivers in an efficient compact layout.'
          )}
        </p>
      </div>

      {/* Open Presets Button */}
      <motion.button
        onClick={() => setSidebarOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-4 bg-[#FBBF24] text-black font-bold rounded-lg hover:bg-[#FBBF24]/90 transition-colors flex items-center justify-center gap-2"
      >
        <span>⚙️ Customize Dashboard Preset</span>
        <span className="text-lg">→</span>
      </motion.button>

      {/* Preset Sidebar */}
      <PresetSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPreset={preset}
        onSelectPreset={setPreset}
      />
    </div>
  );
}
