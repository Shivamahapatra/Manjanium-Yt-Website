import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { F1Card } from '@/components/f1/F1Card';
import { F1PresetProps } from './F1PresetLiveFocused';
import { F1StandingsTab } from '@/components/f1/tabs/F1StandingsTab';
import { F1TelemetryTab } from '@/components/f1/tabs/F1TelemetryTab';
import { WeatherWidget, RaceControlFeed } from '@/components/f1/tabs/F1LiveTab';

export function F1PresetStatsDetailed({ sessionKey }: F1PresetProps) {
  const [view, setView] = useState<'standings' | 'telemetry' | 'weather' | 'race-log'>('standings');

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-6 pb-6">
      {/* View Switcher */}
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'standings', label: '📊 Standings' },
          { id: 'telemetry', label: '📈 Telemetry' },
          { id: 'weather', label: '⛅ Weather' },
          { id: 'race-log', label: '📋 Race Log' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-lg font-bold tracking-wide transition-all whitespace-nowrap ${
              view === tab.id
                ? 'bg-[#FBBF24] text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-[#1F2937] text-white hover:border-[#FBBF24] border border-[#333333]'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content Area - Large & Spacious */}
      <div className="flex-1 min-h-[600px]">
        {view === 'standings' && (
          <F1Card title="Championship Standings" className="h-full flex flex-col p-4 lg:p-8">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <F1StandingsTab />
            </div>
          </F1Card>
        )}

        {view === 'telemetry' && (
          <F1Card title="Telemetry Analysis" className="h-full flex flex-col p-4 lg:p-8">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <F1TelemetryTab />
            </div>
          </F1Card>
        )}

        {view === 'weather' && (
          <div className="h-full max-w-4xl">
            <WeatherWidget sessionKey={sessionKey} />
          </div>
        )}

        {view === 'race-log' && (
          <div className="h-full">
            <RaceControlFeed sessionKey={sessionKey} />
          </div>
        )}
      </div>
    </div>
  );
}
