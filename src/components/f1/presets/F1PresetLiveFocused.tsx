import React from 'react';
import dynamic from 'next/dynamic';
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
}

export function F1PresetLiveFocused({ session, localTime, currentVenue, globeArcs, globeConfig }: F1PresetProps) {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-6">
      {/* TOP: Session Status - Compact */}
      <div className="flex gap-4">
        <F1Card className="w-full lg:w-[400px]">
          <div className="flex items-center justify-between p-2">
            <div>
              <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">SESSION</p>
              <p className="text-xl font-bold text-white uppercase">
                {currentVenue?.sessionName || session?.session_name || "LIVE"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">LOCAL TIME</p>
              <p className="text-2xl font-bold text-[#FBBF24] font-mono">
                {localTime || "--:--:--"}
              </p>
            </div>
          </div>
        </F1Card>
      </div>

      {/* MAIN CONTENT: Timing + Globe */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-6 h-full">
        {/* LEFT: Timing Tower (70%) */}
        <div className="flex-[0.7] h-full">
          <F1Card title="Live Timing Tower" className="h-full flex flex-col p-4 lg:p-8">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <LiveTimingTower />
            </div>
          </F1Card>
        </div>

        {/* RIGHT: Globe (30%) */}
        <div className="flex-[0.3] h-full">
          <F1Card title="Global Tracker" className="h-full flex flex-col p-4 lg:p-8">
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <Globe globeConfig={globeConfig} data={globeArcs} />
            </div>
            
            <div className="mt-4 pt-6 border-t border-[#333333] space-y-4">
              <div>
                <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">CIRCUIT</p>
                <p className="text-lg font-bold text-white">
                  {currentVenue?.circuitName || "TBC"}
                </p>
              </div>
              <div>
                <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">STATUS</p>
                <p className="text-lg font-bold text-[#FBBF24] uppercase">
                  {session?.session_type || "PRACTICE"}
                </p>
              </div>
            </div>
          </F1Card>
        </div>
      </div>
    </div>
  );
}
