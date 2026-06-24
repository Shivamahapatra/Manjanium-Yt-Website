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
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[700px]">
      {/* Left: Timing Tower - 50% width, FULL HEIGHT, stretched */}
      <div className="col-span-12 lg:col-span-6 h-full">
        <F1Card title="Live Timing Tower" className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <LiveTimingTower />
          </div>
        </F1Card>
      </div>

      {/* Center-Right: Globe - 50% width, FULL HEIGHT, stretched */}
      <div className="col-span-12 lg:col-span-6 h-full">
        <F1Card title="Global Race Tracker" className="h-full flex flex-col relative overflow-hidden">
          <div className="flex-1 w-full h-full min-h-[400px]">
            <Globe globeConfig={globeConfig} data={globeArcs} />
          </div>
          
          {/* Live indicators overlay */}
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#0a0a0a]/80 rounded-xl backdrop-blur-md border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">CURRENT SESSION</p>
                <p className="text-2xl lg:text-3xl font-bold text-white uppercase">
                  {currentVenue?.sessionName || session?.session_name || "LIVE"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#6B7280] text-xs font-bold tracking-widest mb-1">LOCAL TIME</p>
                <p className="text-2xl lg:text-3xl font-bold text-[#FBBF24] font-mono">
                  {localTime || "--:--:--"}
                </p>
              </div>
            </div>
          </div>
        </F1Card>
      </div>
    </div>
  );
}
