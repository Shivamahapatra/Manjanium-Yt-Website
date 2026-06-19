"use client";

import React, { useState, useEffect } from 'react';
import { Activity, CloudRain, AlertTriangle, RadioReceiver, Map as MapIcon, Clock } from 'lucide-react';
import { Table, Tag } from 'antd';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { motion } from 'framer-motion';

export default function LiveDashboardPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [weather, setWeather] = useState<any>(null);
  const [raceControl, setRaceControl] = useState<any[]>([]);
  const [teamRadio, setTeamRadio] = useState<any[]>([]);
  
  const fetchLiveData = async () => {
    try {
      // 1. Timing Tower
      const liveRes = await fetch('/api/f1/live');
      const liveJson = await liveRes.json();
      
      if (liveJson.drivers && Array.isArray(liveJson.drivers)) {
        const map: Record<string, any> = {};
        liveJson.drivers.forEach((d: any) => map[d.driver_number] = d);
        setDriversMap(map);
      }

      if (Array.isArray(liveJson.positions) && Array.isArray(liveJson.intervals)) {
        const latestPositions = new Map();
        liveJson.positions.forEach((p: any) => {
          if (!latestPositions.has(p.driver_number) || new Date(p.date) > new Date(latestPositions.get(p.driver_number).date)) {
            latestPositions.set(p.driver_number, p);
          }
        });

        const latestIntervals = new Map();
        liveJson.intervals.forEach((i: any) => {
          if (!latestIntervals.has(i.driver_number) || new Date(i.date) > new Date(latestIntervals.get(i.driver_number).date)) {
            latestIntervals.set(i.driver_number, i);
          }
        });
        
        const merged = Array.from(latestPositions.values()).map(pos => {
          const intv = latestIntervals.get(pos.driver_number);
          return {
            ...pos,
            gap_to_leader: intv?.gap_to_leader || '+0.000',
            interval: intv?.interval || '+0.000',
          };
        }).sort((a, b) => a.position - b.position);
        setPositions(merged);
      }

      // 2. Weather
      const weatherRes = await fetch('/api/f1/weather');
      const weatherJson = await weatherRes.json();
      if (Array.isArray(weatherJson.weather) && weatherJson.weather.length > 0) {
        setWeather(weatherJson.weather[weatherJson.weather.length - 1]);
      }

      // 3. Race Control
      const controlRes = await fetch('/api/f1/racecontrol');
      const controlJson = await controlRes.json();
      if (Array.isArray(controlJson.racecontrol)) {
        // Last 10 messages
        setRaceControl(controlJson.racecontrol.slice(-10).reverse());
      }

      // 4. Team Radio
      const radioRes = await fetch('/api/f1/radio');
      const radioJson = await radioRes.json();
      if (Array.isArray(radioJson.radio)) {
        // Last 10 radio calls
        setTeamRadio(radioJson.radio.slice(-10).reverse());
      }

    } catch (error) {
      console.error("Failed to fetch live data", error);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, []);

  const MotionRow = (props: any) => (
    <motion.tr layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} {...props} />
  );

  const timingColumns = [
    { title: 'POS', dataIndex: 'position', key: 'position', width: 60, render: (text: number) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'DRIVER', dataIndex: 'driver_number', key: 'driver', render: (text: number) => {
      const driver = driversMap[text.toString()];
      return (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: `#${driver?.team_colour || '3b82f6'}` }} />
          <span className="font-bold font-mono text-neutral-900 dark:text-white">{driver?.name_acronym || text}</span>
        </div>
      );
    }},
    { title: 'GAP', dataIndex: 'gap_to_leader', key: 'gap', align: 'right' as const, render: (text: number) => <span className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300">{text}</span> },
    { title: 'INT', dataIndex: 'interval', key: 'int', align: 'right' as const, render: (text: number) => <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">{text}</span> },
  ];

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 flex items-center gap-3">
            <Activity className="w-8 h-8 text-neutral-800 dark:text-white" />
            LIVE DASHBOARD
          </h1>
          <p className="text-neutral-500 mt-2">Real-time session data, weather, and race control.</p>
        </header>

        <BentoGrid className="max-w-full auto-rows-[250px]">
          {/* TIMING TOWER */}
          <BentoGridItem
            title="Live Timing Tower"
            description="Real-time intervals and gaps"
            icon={<Clock className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-1 md:row-span-2 overflow-hidden bg-[#111111] border-[#1f1f1f] shadow-xl"
            header={
              <div className="h-full overflow-hidden flex flex-col w-full relative pt-2">
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar pr-2">
                  <Table 
                    dataSource={positions} 
                    columns={timingColumns} 
                    pagination={false}
                    rowKey="driver_number"
                    className="manjanium-table w-full dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                    components={{ body: { row: MotionRow } }}
                    size="small"
                  />
                </div>
              </div>
            }
          />

          {/* WEATHER */}
          <BentoGridItem
            title="Live Weather"
            description="Track conditions"
            icon={<CloudRain className="h-4 w-4 text-blue-400" />}
            className="md:col-span-1 md:row-span-1 bg-[#111111] border-[#1f1f1f] shadow-xl"
            header={
              <div className="flex flex-col justify-center h-full pt-4">
                {weather ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-4 rounded-xl border border-[#222]">
                      <div className="text-xs text-neutral-500 mb-1">Air Temp</div>
                      <div className="text-2xl font-bold text-white">{weather.air_temperature}°C</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-[#222]">
                      <div className="text-xs text-neutral-500 mb-1">Track Temp</div>
                      <div className="text-2xl font-bold text-white">{weather.track_temperature}°C</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-[#222]">
                      <div className="text-xs text-neutral-500 mb-1">Wind</div>
                      <div className="text-xl font-bold text-white">{weather.wind_speed} m/s</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-[#222]">
                      <div className="text-xs text-neutral-500 mb-1">Rain</div>
                      <div className="text-xl font-bold text-white">{weather.rainfall ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">Waiting for weather data...</div>
                )}
              </div>
            }
          />

          {/* RACE CONTROL */}
          <BentoGridItem
            title="Race Control"
            description="FIA official messages"
            icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
            className="md:col-span-1 md:row-span-1 overflow-hidden bg-[#111111] border-[#1f1f1f] shadow-xl"
            header={
              <div className="h-full overflow-hidden flex flex-col w-full relative pt-4">
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar pr-2 space-y-2">
                  {raceControl.map((msg, idx) => (
                    <div key={idx} className="p-3 bg-black/50 border border-yellow-500/20 rounded-lg text-sm">
                      <div className="text-yellow-500/70 text-xs font-mono mb-1">
                        {new Date(msg.date).toLocaleTimeString('en-US', { hour12: false })}
                      </div>
                      <div className="text-white font-medium">{msg.message}</div>
                    </div>
                  ))}
                  {raceControl.length === 0 && <div className="text-neutral-500 text-center mt-10">No messages.</div>}
                </div>
              </div>
            }
          />

          {/* TEAM RADIO */}
          <BentoGridItem
            title="Team Radio"
            description="Latest broadcasts"
            icon={<RadioReceiver className="h-4 w-4 text-green-400" />}
            className="md:col-span-2 md:row-span-1 bg-[#111111] border-[#1f1f1f] shadow-xl overflow-hidden"
            header={
              <div className="h-full overflow-hidden flex flex-col w-full relative pt-4">
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar pr-2 grid grid-cols-2 gap-3">
                  {teamRadio.map((radio, idx) => {
                    const driver = driversMap[radio.driver_number?.toString()];
                    return (
                      <div key={idx} className="p-3 bg-black/50 border border-[#222] rounded-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex flex-col items-center justify-center shrink-0 border border-[#333]">
                          <span className="text-xs font-bold text-white">{radio.driver_number}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `#${driver?.team_colour || '3b82f6'}` }} />
                            <span className="text-sm font-bold text-white">{driver?.name_acronym || 'DRV'}</span>
                          </div>
                          <div className="text-xs text-neutral-400">Audio available on F1 TV</div>
                        </div>
                      </div>
                    );
                  })}
                  {teamRadio.length === 0 && <div className="text-neutral-500 col-span-2 text-center mt-10">No recent radio calls.</div>}
                </div>
              </div>
            }
          />
        </BentoGrid>
      </div>
    </div>
  );
}
