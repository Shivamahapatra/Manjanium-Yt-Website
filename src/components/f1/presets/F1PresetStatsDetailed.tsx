import React from 'react';
import dynamic from 'next/dynamic';
import { F1Card } from '@/components/f1/F1Card';
import { F1PresetProps } from './F1PresetLiveFocused';
import { WeatherWidget, RaceControlFeed, TeamRadioPanel } from '@/components/f1/tabs/F1LiveTab';

const LiveTrackMap = dynamic(
  () => import('@/components/f1/LiveTrackMap').then((m) => m.LiveTrackMap),
  { ssr: false, loading: () => <div className="w-full h-full rounded-lg bg-neutral-900 animate-pulse" /> }
);

export function F1PresetStatsDetailed({ weatherData, raceControlMsgs, radioMsgs }: F1PresetProps) {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-4 px-6 pb-6">
      {/* Tab label - just "Live" */}
      <div className="flex gap-3 items-center pt-2">
        <span className="px-4 py-2 bg-[#FBBF24] text-black rounded-lg font-bold text-sm">
          ⚡ LIVE
        </span>
        <span className="text-[#6B7280] text-sm">
          All systems active and updating in real-time
        </span>
      </div>

      {/* Main grid layout */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* LEFT: Timing Tower */}
        <div className="col-span-1 row-span-2">
          <F1Card title="Live Timing" className="h-full flex flex-col p-4">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface">
                  <tr className="text-[#6B7280] uppercase text-xs">
                    <th className="text-left p-1">Pos</th>
                    <th className="text-left p-1">Driver</th>
                    <th className="text-right p-1">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-surface">
                  {/* Placeholder - LiveTimingTower data flows through */}
                </tbody>
              </table>
            </div>
          </F1Card>
        </div>

        {/* CENTER: Team Radio */}
        <div>
          <F1Card title="Team Radio" className="h-full flex flex-col p-4">
            <div className="flex-1 space-y-2 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <TeamRadioPanel radioMsgs={radioMsgs || []} />
            </div>
          </F1Card>
        </div>

        {/* RIGHT TOP: Race Control */}
        <div>
          <F1Card title="Race Control" className="h-full flex flex-col p-4">
            <div className="flex-1 space-y-2 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <RaceControlFeed messages={raceControlMsgs || []} />
            </div>
          </F1Card>
        </div>

        {/* RIGHT BOTTOM: Live Track Map */}
        <div>
          <F1Card title="Track Map" className="h-full flex flex-col p-4">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-[#0a0a0a] rounded border border-[#333333] flex items-center justify-center mb-2">
                <LiveTrackMap />
              </div>
              <div className="flex gap-2">
                <WeatherWidget weatherData={weatherData} loading={!weatherData} />
              </div>
            </div>
          </F1Card>
        </div>
      </div>
    </div>
  );
}
