"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Table, Slider, Timeline, Badge, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Flag, Radio, Settings2, BarChart2 } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function F1Hub() {
  const [delayOffset, setDelayOffset] = useState(0); // in seconds
  const [positions, setPositions] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [raceControl, setRaceControl] = useState<any[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // Poll OpenF1 endpoints via Next.js Proxy Rewrites
  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        const timeNow = new Date();
        setLastFetchTime(timeNow);

        // Fetching latest race control messages
        const rcRes = await fetch('/api/openf1/race_control?session_key=latest');
        const rcJson = await rcRes.json();
        if (Array.isArray(rcJson)) {
          // Take last 10 messages, reverse for timeline
          setRaceControl(rcJson.slice(-10).reverse());
        }

        // Fetching latest telemetry for Max Verstappen (Driver 1)
        const telRes = await fetch('/api/openf1/car_data?driver_number=1&session_key=latest');
        const telJson = await telRes.json();
        if (Array.isArray(telJson)) {
          // Keep last 40 data frames for smooth sliding window chart
          setTelemetry(telJson.slice(-40));
        }

        // Fetching positions for Timing Tower
        const posRes = await fetch('/api/openf1/position?session_key=latest');
        const posJson = await posRes.json();
        
        if (Array.isArray(posJson)) {
          // Group by driver_number to find their latest absolute position
          const latestPositions = new Map();
          posJson.forEach((p: any) => {
            if (!latestPositions.has(p.driver_number) || new Date(p.date) > new Date(latestPositions.get(p.driver_number).date)) {
              latestPositions.set(p.driver_number, p);
            }
          });
          
          const sortedPositions = Array.from(latestPositions.values()).sort((a, b) => a.position - b.position);
          setPositions(sortedPositions);
        }
      } catch (error) {
        console.error("OpenF1 Data Sync Error:", error);
      }
    };

    fetchF1Data();
    // Re-fetch every 3.5 seconds
    const interval = setInterval(fetchF1Data, 3500); 
    return () => clearInterval(interval);
  }, []);

  // Framer Motion custom Table Row wrapper to glide overtakes
  const MotionRow = (props: any) => {
    return (
      <motion.tr
        {...props}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    );
  };

  const timingColumns = [
    { title: 'Pos', dataIndex: 'position', key: 'position', render: (text: number) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'Driver', dataIndex: 'driver_number', key: 'driver', render: (text: number) => <Tag color="blue" className="font-bold font-mono border-none bg-blue-500/20 text-blue-400">{text}</Tag> },
    { title: 'Latest Time', dataIndex: 'date', key: 'date', render: (text: string) => <span className="text-xs text-neutral-400 font-mono">{new Date(text).toLocaleTimeString()}</span> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white p-4 md:p-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 dark:bg-red-600/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-300" />
      
      <div className="max-w-7xl mx-auto z-10 relative">
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                COSMOS HUB
              </h1>
            </div>
            <p className="text-neutral-500 dark:text-zinc-400 text-sm flex items-center gap-2">
              <Activity size={14} /> OpenF1 High-Performance Telemetry Stream
            </p>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 p-4 rounded-xl border border-neutral-200 dark:border-zinc-800 backdrop-blur-md min-w-[300px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-neutral-500 flex items-center gap-2"><Settings2 size={12}/> SYNC DELAY</span>
              <span className="text-xs font-mono font-bold text-red-500">-{delayOffset}s</span>
            </div>
            <Slider 
              min={0} 
              max={60} 
              defaultValue={0} 
              onChange={setDelayOffset} 
              className="m-0"
              tooltip={{ formatter: (val) => `-${val}s` }}
            />
          </div>
        </header>

        <BentoGrid className="max-w-full">
          {/* TIMING TOWER */}
          <BentoGridItem
            title="Live Timing Tower"
            description="Dynamic position tracking."
            icon={<Clock className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-1 md:row-span-2 overflow-hidden"
            header={
              <div className="h-full overflow-hidden flex flex-col w-full relative">
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar pr-2">
                  <Table 
                    dataSource={positions} 
                    columns={timingColumns} 
                    pagination={false}
                    rowKey="driver_number"
                    className="manjanium-table w-full"
                    components={{
                      body: {
                        row: MotionRow,
                      },
                    }}
                    size="small"
                  />
                </div>
              </div>
            }
          />

          {/* TELEMETRY VECTORS */}
          <BentoGridItem
            title="Max Verstappen (1) - Live Telemetry"
            description="Real-time speed and RPM vectors."
            icon={<BarChart2 className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-2 md:row-span-1 min-h-[300px]"
            header={
              <div className="w-full h-[200px] flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={() => ''} stroke="#666" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      labelFormatter={(val) => new Date(val).toLocaleTimeString()}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="speed" name="Speed (km/h)" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="rpm" name="RPM" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            }
          />

          {/* RACE CONTROL */}
          <BentoGridItem
            title="FIA Race Control"
            description="Live marshaling and incident reports."
            icon={<Radio className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-2 md:row-span-1 overflow-hidden"
            header={
              <div className="h-full overflow-hidden w-full relative pt-2">
                <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar pr-4">
                  <Timeline
                    className="dark:text-white"
                    items={raceControl.map((rc, i) => {
                      let color = "blue";
                      if (rc.category === "Flag" && rc.message.includes("YELLOW")) color = "orange";
                      if (rc.category === "Flag" && rc.message.includes("RED")) color = "red";
                      if (rc.category === "Flag" && rc.message.includes("GREEN")) color = "green";
                      
                      return {
                        color,
                        children: (
                          <div className="text-sm">
                            <span className="font-mono text-xs text-neutral-500 mr-2">{new Date(rc.date).toLocaleTimeString()}</span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{rc.category}:</span> {rc.message}
                          </div>
                        ),
                      };
                    })}
                  />
                  {raceControl.length === 0 && (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                      Awaiting Race Control messages...
                    </div>
                  )}
                </div>
              </div>
            }
          />
        </BentoGrid>
      </div>
    </div>
  );
}
