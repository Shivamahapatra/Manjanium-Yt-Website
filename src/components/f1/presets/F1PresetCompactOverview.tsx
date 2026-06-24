import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { F1Card } from '@/components/f1/F1Card';
import { F1PresetProps } from './F1PresetLiveFocused';

const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  { ssr: false, loading: () => <div className="w-full h-full rounded-2xl bg-neutral-900 animate-pulse" /> }
);

export function F1PresetCompactOverview({ session, currentVenue, globeArcs, globeConfig }: F1PresetProps) {
  return (
    <div className="h-[calc(100vh-200px)] grid grid-cols-3 gap-4 px-6 pb-6">
      {/* LEFT: Session Status + Top 10 Timing */}
      <div className="flex flex-col gap-4">
        {/* Top Session Card */}
        <div className="flex-[0.3]">
          <F1Card className="h-full flex flex-col justify-center p-6">
            <div className="space-y-3">
              <p className="text-[#6B7280] text-xs uppercase tracking-widest">Session</p>
              <h2 className="text-2xl font-bold text-white">
                {currentVenue?.raceName || session?.session_name || 'AWAITING'}
              </h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[#6B7280] text-xs">Status</p>
                  <p className="text-lg font-bold text-[#FBBF24]">
                    {session?.session_type || 'Practice'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[#6B7280] text-xs">Circuit</p>
                  <p className="text-lg font-bold text-[#0EA5E9]">
                    {currentVenue?.circuitName || 'TBC'}
                  </p>
                </div>
              </div>
            </div>
          </F1Card>
        </div>

        {/* Top 10 Timing */}
        <div className="flex-[0.7]">
          <F1Card title="Top 10" className="h-full flex flex-col p-4">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#131313]">
                  <tr className="text-[#6B7280] text-xs">
                    <th className="text-left p-1">Pos</th>
                    <th className="text-left p-1">Driver</th>
                    <th className="text-right p-1">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {/* LiveTimingTower data flows through */}
                </tbody>
              </table>
            </div>
          </F1Card>
        </div>
      </div>

      {/* CENTER: Race Progress */}
      <div className="flex flex-col gap-4">
        <F1Card title="Race Progress" className="h-full flex flex-col p-6">
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            {/* Lap counter */}
            <div className="text-center">
              <p className="text-[#6B7280] text-sm">Current Lap</p>
              <p className="text-5xl font-bold text-[#FBBF24]">
                {session?.lap || '--'}
              </p>
              <p className="text-[#6B7280] text-xs mt-1">
                of {session?.totalLaps || '--'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="bg-[#0a0a0a] rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-[#FBBF24] h-full rounded-full"
                  animate={{
                    width: `${session?.lap && session?.totalLaps ? (session.lap / session.totalLaps) * 100 : 0}%`
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <span className="px-4 py-2 bg-[#1F2937] text-[#FBBF24] rounded-lg text-sm font-bold uppercase tracking-wider">
                {session?.session_type || 'RUNNING'}
              </span>
            </div>
          </div>
        </F1Card>
      </div>

      {/* RIGHT: Globe */}
      <div>
        <F1Card title="Global Tracker" className="h-full flex flex-col p-4">
          <div className="flex-1 flex items-center justify-center">
            <Globe globeConfig={globeConfig} data={globeArcs} />
          </div>
        </F1Card>
      </div>
    </div>
  );
}
