import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { F1Card } from '@/components/f1/F1Card';
import { F1PresetProps } from './F1PresetLiveFocused';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';

const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  { ssr: false, loading: () => <div className="w-full h-full rounded-2xl bg-neutral-900 animate-pulse" /> }
);

export function F1PresetCompactOverview({ session, currentVenue, globeArcs, globeConfig }: F1PresetProps) {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-6 pb-6">
      {/* TOP: Session Status */}
      <div className="flex-[0.25]">
        <F1Card className="h-full flex flex-col justify-center p-4 lg:p-8">
          <div className="text-center space-y-4">
            <p className="text-[#6B7280] text-sm font-bold uppercase tracking-widest">CURRENT SESSION</p>
            <h2 
              className="text-3xl lg:text-5xl font-bold text-white uppercase"
              style={{ fontFamily: 'var(--f1-font-heading)' }}
            >
              {currentVenue?.raceName || session?.session_name || "AWAITING"}
            </h2>
            <div className="flex gap-8 justify-center pt-4">
              <div>
                <p className="text-[#6B7280] text-sm font-bold tracking-widest">CIRCUIT</p>
                <p className="text-xl lg:text-3xl font-bold text-[#FBBF24]">{currentVenue?.circuitName || "TBC"}</p>
              </div>
              <div>
                <p className="text-[#6B7280] text-sm font-bold tracking-widest">STATUS</p>
                <p className="text-xl lg:text-3xl font-bold text-[#0EA5E9] uppercase">
                  {session?.session_type || "Practice"}
                </p>
              </div>
            </div>
          </div>
        </F1Card>
      </div>

      {/* CENTER: Race Tracker */}
      <div className="flex-[0.35]">
        <F1Card title="Race Progress" className="h-full flex flex-col p-4 lg:p-8">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full min-h-[250px] space-y-6">
              <Globe globeConfig={globeConfig} data={globeArcs} />
            </div>
          </div>
        </F1Card>
      </div>

      {/* BOTTOM: Top 10 / Timing */}
      <div className="flex-[0.4]">
        <F1Card title="Compact Timing" className="h-full flex flex-col p-4 lg:p-8">
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <LiveTimingTower />
          </div>
        </F1Card>
      </div>
    </div>
  );
}
