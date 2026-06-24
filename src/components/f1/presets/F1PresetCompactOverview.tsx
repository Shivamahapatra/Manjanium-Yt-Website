import React from 'react';
import dynamic from 'next/dynamic';
import { F1Card } from '@/components/f1/F1Card';
import { F1PresetProps } from './F1PresetLiveFocused';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';
import { TeamRadioPanel } from '@/components/f1/tabs/F1LiveTab';

const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  { ssr: false, loading: () => <div className="w-full h-full rounded-2xl bg-neutral-900 animate-pulse" /> }
);

export function F1PresetCompactOverview({ session, sessionKey, currentVenue, globeArcs, globeConfig }: F1PresetProps) {
  return (
    <div className="grid grid-cols-12 gap-6 min-h-[700px]">
      {/* Top-Left: Session Status - 4 cols */}
      <div className="col-span-12 lg:col-span-4 h-[350px]">
        <F1Card title="Session Status" className="h-full flex flex-col">
          <div className="flex-1 space-y-6 flex flex-col justify-center px-4">
            <div>
              <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">SESSION</p>
              <p className="text-2xl font-bold text-white uppercase">
                {currentVenue?.raceName || session?.session_name || "AWAITING"}
              </p>
              <p className="text-sm text-[#FBBF24] font-medium">{session?.session_type || "Practice"}</p>
            </div>
            <div className="p-4 bg-[#1F2937] rounded-xl border-l-4 border-[#0EA5E9]">
              <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">CIRCUIT</p>
              <p className="text-xl font-bold text-white">{currentVenue?.circuitName || "TBC"}</p>
            </div>
          </div>
        </F1Card>
      </div>

      {/* Top-Center: Race Tracker - 4 cols */}
      <div className="col-span-12 lg:col-span-4 h-[350px]">
        <F1Card title="Race Tracker" className="h-full flex flex-col relative overflow-hidden p-0">
          <div className="flex-1 w-full h-full min-h-[250px]">
            <Globe globeConfig={globeConfig} data={globeArcs} />
          </div>
        </F1Card>
      </div>

      {/* Top-Right: Quick Stats / Radio - 4 cols */}
      <div className="col-span-12 lg:col-span-4 h-[350px] flex flex-col gap-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <h3 className="text-xs font-bold uppercase text-[#FBBF24] mb-2 px-1 tracking-widest">TEAM RADIO</h3>
        <TeamRadioPanel sessionKey={sessionKey} />
      </div>

      {/* Bottom: Live Timing - Full width */}
      <div className="col-span-12 h-[500px] mt-6 lg:mt-0">
        <F1Card title="Compact Timing Tower" className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <LiveTimingTower />
          </div>
        </F1Card>
      </div>
    </div>
  );
}
