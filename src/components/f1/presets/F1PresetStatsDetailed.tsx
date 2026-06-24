import React from 'react';
import { F1Card } from '@/components/f1/F1Card';
import { F1PresetProps } from './F1PresetLiveFocused';
import { F1StandingsTab } from '@/components/f1/tabs/F1StandingsTab';
import { F1TelemetryTab } from '@/components/f1/tabs/F1TelemetryTab';
import { WeatherWidget, RaceControlFeed } from '@/components/f1/tabs/F1LiveTab';

export function F1PresetStatsDetailed({ sessionKey }: F1PresetProps) {
  return (
    <div className="grid grid-cols-12 gap-6 min-h-[700px]">
      {/* Top-Left: Standings - 5 cols */}
      <div className="col-span-12 lg:col-span-5 lg:row-span-2 h-[800px]">
        <F1Card title="Championship Standings" className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <F1StandingsTab />
          </div>
        </F1Card>
      </div>

      {/* Top-Right: Telemetry - 7 cols */}
      <div className="col-span-12 lg:col-span-7 h-[400px]">
        <F1Card title="Telemetry Analysis" className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <F1TelemetryTab />
          </div>
        </F1Card>
      </div>

      {/* Bottom-Left: Race Control - 4 cols */}
      <div className="col-span-12 lg:col-span-4 h-[375px] mt-6 lg:mt-0">
        <RaceControlFeed sessionKey={sessionKey} />
      </div>

      {/* Bottom-Right: Weather - 3 cols */}
      <div className="col-span-12 lg:col-span-3 h-[375px] mt-6 lg:mt-0">
        <WeatherWidget sessionKey={sessionKey} />
      </div>
    </div>
  );
}
