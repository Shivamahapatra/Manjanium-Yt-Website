import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { F1Card } from '@/components/f1/F1Card';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';

const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  { ssr: false, loading: () => <div className="w-full h-full rounded-2xl bg-neutral-900 animate-pulse" /> }
);

export interface F1PresetProps {
  sessionKey: string;
  session: any;
  localTime: string;
  currentVenue: any;
  globeArcs: any;
  globeConfig: any;
  weatherData?: any;
  raceControlMsgs?: any[];
  radioMsgs?: any[];
  drivers?: any[];
}

export function F1PresetLiveFocused({ session, localTime, currentVenue, globeArcs, globeConfig, drivers }: F1PresetProps) {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-4 px-6 pb-6">
      {/* Session status - minimal */}
      <div className="flex gap-3 items-center">
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-[#1F2937] rounded-lg">
            <p className="text-[#6B7280] text-xs">SESSION</p>
            <p className="text-sm font-bold text-white">{currentVenue?.sessionName || session?.session_name || 'LIVE'}</p>
          </div>
          <div className="px-3 py-1.5 bg-[#1F2937] rounded-lg">
            <p className="text-[#6B7280] text-xs">TIME</p>
            <p className="text-sm font-bold text-[#FBBF24]">{localTime || '--:--:--'}</p>
          </div>
          <div className="px-3 py-1.5 bg-[#1F2937] rounded-lg">
            <p className="text-[#6B7280] text-xs">CIRCUIT</p>
            <p className="text-sm font-bold text-white">{currentVenue?.circuitName || 'TBC'}</p>
          </div>
        </div>
      </div>

      {/* Main content: Use available space */}
      <div className="flex-1 flex gap-4">
        {/* TIMING TOWER - 65% (expanded) */}
        <div className="flex-[0.65]">
          <F1Card title="Live Timing Tower" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <LiveTimingTower drivers={drivers} sessionInfo={session} />
            </div>
          </F1Card>
        </div>

        {/* GLOBE + Stats - 35% */}
        <div className="flex-[0.35] flex flex-col gap-4">
          {/* Globe */}
          <div className="flex-1 min-h-0">
            <F1Card className="h-full flex flex-col p-4">
              <div className="flex-1 flex items-center justify-center">
                <Globe globeConfig={globeConfig} data={globeArcs} />
              </div>
            </F1Card>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-[#1F2937] rounded-lg border border-[#333333]">
              <p className="text-[#6B7280] text-xs">STATUS</p>
              <p className="text-lg font-bold text-[#FBBF24]">
                {session?.session_type || 'PRACTICE'}
              </p>
            </div>
            <div className="flex-1 p-3 bg-[#1F2937] rounded-lg border border-[#333333]">
              <p className="text-[#6B7280] text-xs">CIRCUIT</p>
              <p className="text-lg font-bold text-white">
                {currentVenue?.circuitName || 'TBC'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
