"use client";

import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BarChart2 } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function LiveDashboard() {
  const [session, setSession] = useState<any>(null);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [positions, setPositions] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<number[]>([1, 16]); // Fallback P1 and P2

  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        // 1. Session Type
        const sessRes = await fetch('/api/openf1/sessions');
        const sessJson = await sessRes.json();
        let currentSession = null;
        if (Array.isArray(sessJson) && sessJson.length > 0) {
          currentSession = sessJson[sessJson.length - 1];
          setSession(currentSession);
        }

        // 2. Drivers Map
        const drvRes = await fetch('/api/openf1/drivers');
        const drvJson = await drvRes.json();
        if (Array.isArray(drvJson)) {
          const map: Record<string, any> = {};
          drvJson.forEach((d: any) => {
            map[d.driver_number] = d;
          });
          setDriversMap(map);
        }

        // 3. Timing Tower (Merged Position & Intervals)
        const posRes = await fetch('/api/openf1/position');
        const posJson = await posRes.json();
        
        const intRes = await fetch('/api/openf1/intervals');
        const intJson = await intRes.json();
        
        if (Array.isArray(posJson) && Array.isArray(intJson)) {
          const latestPositions = new Map();
          posJson.forEach((p: any) => {
            if (!latestPositions.has(p.driver_number) || new Date(p.date) > new Date(latestPositions.get(p.driver_number).date)) {
              latestPositions.set(p.driver_number, p);
            }
          });

          const latestIntervals = new Map();
          intJson.forEach((i: any) => {
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

          if (merged.length >= 2) {
            setTopDrivers([merged[0].driver_number, merged[1].driver_number]);
          }
        }

        // 4. Head-to-Head Telemetry
        if (topDrivers.length === 2) {
          const telRes = await fetch(`/api/openf1/car_data?driver_number=${topDrivers[0]}&driver_number=${topDrivers[1]}`);
          const telJson = await telRes.json();
          if (Array.isArray(telJson)) {
            const p1Data = telJson.filter((d: any) => d.driver_number === topDrivers[0]).slice(-30);
            const p2Data = telJson.filter((d: any) => d.driver_number === topDrivers[1]).slice(-30);
            
            const mergedTelemetry = p1Data.map((d1: any, index: number) => {
              const d2 = p2Data[index] || {};
              return {
                date: d1.date,
                p1Speed: d1.speed,
                p1Gear: d1.n_gear,
                p2Speed: d2.speed,
                p2Gear: d2.n_gear,
              };
            });
            setTelemetry(mergedTelemetry);
          }
        }

      } catch (error) {
        console.error("OpenF1 Data Sync Error:", error);
      }
    };

    fetchF1Data();
    const interval = setInterval(fetchF1Data, 5000); 
    return () => clearInterval(interval);
  }, [topDrivers]);

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
    { title: 'POS', dataIndex: 'position', key: 'position', render: (text: number) => <span className="font-bold text-zinc-500 dark:text-zinc-400">{text}</span> },
    { title: 'DRIVER', dataIndex: 'driver_number', key: 'driver', render: (text: number) => {
      const driver = driversMap[text.toString()];
      return (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: `#${driver?.team_colour || 'fff'}` }} />
          <span className="font-bold font-mono text-zinc-900 dark:text-white">{driver?.name_acronym || text}</span>
        </div>
      );
    }},
    { title: 'GAP', dataIndex: 'gap_to_leader', key: 'gap', render: (text: number) => <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">{text}</span> },
    { title: 'INT', dataIndex: 'interval', key: 'int', render: (text: number) => <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{text}</span> },
  ];

  const isQuali = session?.session_type === 'Qualifying';

  return (
    <div className="p-4 md:p-8 w-full min-h-full">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">LIVE TIMING</h2>
        <p className="text-zinc-400 text-sm">Real-time intervals and telemetry streaming via OpenF1.</p>
      </div>

      <BentoGrid className="max-w-full h-full">
        <BentoGridItem
          title="Live Timing Tower"
          description={isQuali ? "Q1 / Q2 / Q3 Knockouts" : "Live Interval Gaps"}
          icon={<Clock className="h-4 w-4 text-zinc-500" />}
          className="md:col-span-1 md:row-span-2 overflow-hidden bg-zinc-950/80 border-zinc-800"
          header={
            <div className="h-full overflow-hidden flex flex-col w-full relative">
              <div className="overflow-y-auto h-full absolute inset-0 custom-scrollbar pr-2">
                <Table 
                  dataSource={positions} 
                  columns={timingColumns} 
                  pagination={false}
                  rowKey="driver_number"
                  className="manjanium-table w-full dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-900"
                  components={{ body: { row: MotionRow } }}
                  size="small"
                />
              </div>
            </div>
          }
        />

        <BentoGridItem
          title={`Head-to-Head Telemetry (P1 vs P2)`}
          description={`Speed Vectors: ${driversMap[topDrivers[0]]?.name_acronym || topDrivers[0]} vs ${driversMap[topDrivers[1]]?.name_acronym || topDrivers[1]}`}
          icon={<BarChart2 className="h-4 w-4 text-zinc-500" />}
          className="md:col-span-2 md:row-span-2 min-h-[500px] bg-zinc-950/80 border-zinc-800"
          header={
            <div className="w-full h-full flex-grow pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={() => ''} stroke="#666" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#888" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                    labelFormatter={() => ''}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  
                  {/* P1 Lines (Uses Team Color) */}
                  <Line yAxisId="left" type="monotone" dataKey="p1Speed" name={`${driversMap[topDrivers[0]]?.name_acronym || topDrivers[0]} Speed`} stroke={`#${driversMap[topDrivers[0]]?.team_colour || '3b82f6'}`} strokeWidth={2} dot={false} isAnimationActive={false} />
                  
                  {/* P2 Lines (Uses Team Color) */}
                  <Line yAxisId="left" type="monotone" dataKey="p2Speed" name={`${driversMap[topDrivers[1]]?.name_acronym || topDrivers[1]} Speed`} stroke={`#${driversMap[topDrivers[1]]?.team_colour || 'ef4444'}`} strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        />
      </BentoGrid>
    </div>
  );
}
