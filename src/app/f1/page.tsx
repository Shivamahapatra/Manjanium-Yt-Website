"use client";

import React, { useState, useEffect } from 'react';
import { Table, Tabs as AntTabs, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Activity, Trophy, Clock, BarChart2 } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function F1Hub() {
  const [activeTab, setActiveTab] = useState('live');
  const [session, setSession] = useState<any>(null);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [positions, setPositions] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [standingsTab, setStandingsTab] = useState('drivers');
  const [topDrivers, setTopDrivers] = useState<number[]>([1, 16]); // Fallback

  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        // 1. Session Type (Fallback since we don't have a dedicated session route yet, 
        // using the old OpenF1 for just the header for now, or just hardcode if needed.
        // Actually, the user asked to not call external APIs directly from client components.
        // So I'll just set a mock active session or use layout's session)
        setSession({ session_type: 'Race', session_name: 'Race', country_name: 'Spain' });

        // 2. Live Data (Positions, Intervals, Drivers)
        const liveRes = await fetch('/api/f1/live');
        const liveJson = await liveRes.json();
        
        if (liveJson.drivers && Array.isArray(liveJson.drivers)) {
          const map: Record<string, any> = {};
          liveJson.drivers.forEach((d: any) => {
            map[d.driver_number] = d;
          });
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

          if (merged.length >= 2) {
            setTopDrivers([merged[0].driver_number, merged[1].driver_number]);
          }
        }

        // 3. Standings
        const standingsRes = await fetch('/api/f1/standings');
        const standingsJson = await standingsRes.json();
        setStandings(standingsJson.drivers || []);
        setConstructors(standingsJson.constructors || []);

        // 4. Head-to-Head Telemetry
        if (topDrivers.length === 2) {
          const telRes = await fetch(`/api/f1/telemetry?d1=${topDrivers[0]}&d2=${topDrivers[1]}`);
          const telJson = await telRes.json();
          if (telJson.telemetry && telJson.telemetry.length === 2) {
            const p1Data = telJson.telemetry[0].slice(-30);
            const p2Data = telJson.telemetry[1].slice(-30);
            
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
        console.error("F1 Data Sync Error:", error);
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
    { title: 'POS', dataIndex: 'position', key: 'position', render: (text: number) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'DRIVER', dataIndex: 'driver_number', key: 'driver', render: (text: number) => {
      const driver = driversMap[text.toString()];
      return (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: `#${driver?.team_colour || 'fff'}` }} />
          <span className="font-bold font-mono text-neutral-900 dark:text-white">{driver?.name_acronym || text}</span>
        </div>
      );
    }},
    { title: 'GAP', dataIndex: 'gap_to_leader', key: 'gap', render: (text: number) => <span className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300">{text}</span> },
    { title: 'INT', dataIndex: 'interval', key: 'int', render: (text: number) => <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">{text}</span> },
  ];

  const standingColumns = [
    { title: 'POS', dataIndex: 'position', key: 'pos', render: (text: string) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'DRIVER', key: 'athlete', render: (record: any) => {
      const isLeader = record.position === '1';
      // Fallback for team color lookup via last name or standard color if we build a proper dictionary
      const color = driversMap[record.Driver.permanentNumber]?.team_colour || '3b82f6';
      return (
        <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `#${color}` }} />
          {record.Driver.givenName} {record.Driver.familyName}
          {isLeader && <Trophy className="w-3 h-3 text-yellow-500 ml-1" />}
        </div>
      );
    }},
    { title: 'TEAM', key: 'team', render: (record: any) => <span className="text-neutral-500 text-xs">{record.Constructors[0]?.name}</span> },
    { title: 'WINS', dataIndex: 'wins', key: 'wins', render: (wins: string) => <span>{wins}</span> },
    { title: 'POINTS', dataIndex: 'points', key: 'points', render: (points: string) => <Tag color="blue" className="font-bold bg-blue-500/20 text-blue-400 border-none">{points} pts</Tag> },
  ];

  const constructorColumns = [
    { title: 'POS', dataIndex: 'position', key: 'pos', render: (text: string) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'TEAM', key: 'team', render: (record: any) => (
      <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium">
        <div className="w-1.5 h-4 rounded-sm bg-blue-500" />
        {record.Constructor.name}
      </div>
    )},
    { title: 'WINS', dataIndex: 'wins', key: 'wins', render: (wins: string) => <span>{wins}</span> },
    { title: 'POINTS', dataIndex: 'points', key: 'points', render: (points: string) => <Tag color="blue" className="font-bold bg-blue-500/20 text-blue-400 border-none">{points} pts</Tag> },
  ];

  const isQuali = session?.session_type === 'Qualifying';
  const isRace = session?.session_type === 'Race';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white p-4 md:p-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 dark:bg-red-600/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-300" />
      
      <div className="max-w-7xl mx-auto z-10 relative">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
              MANJANIUM F1 HUB
            </h1>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={session?.session_type || 'default'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 text-xl font-medium tracking-wide text-neutral-600 dark:text-zinc-300">
                <Radio className="text-red-500" size={18} />
                {session ? `${session.session_name} - ${session.country_name}` : 'Awaiting Active Session...'}
              </div>
              
              <div className="flex gap-4">
                {isQuali && <Tag color="purple" className="border-none font-bold">SECTOR TIMES PRIORITIZED</Tag>}
                {isRace && <Tag color="green" className="border-none font-bold">INTERVAL GAPS PRIORITIZED</Tag>}
              </div>
            </motion.div>
          </AnimatePresence>
        </header>

        <AntTabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="dark:[&_.ant-tabs-tab-btn]:text-zinc-400 dark:[&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-white mb-6"
          items={[
            {
              key: 'live',
              label: <span className="flex items-center gap-2 font-bold"><Activity size={16}/> LIVE DASHBOARD</span>,
              children: (
                <BentoGrid className="max-w-full">
                  {/* TIMING TOWER */}
                  <BentoGridItem
                    title="Live Timing Tower"
                    description={isQuali ? "Q1 / Q2 / Q3 Knockouts" : "Live Interval Gaps"}
                    icon={<Clock className="h-4 w-4 text-neutral-500" />}
                    className="md:col-span-1 md:row-span-2 overflow-hidden bg-white/50 dark:bg-zinc-900/40"
                    header={
                      <div className="h-full overflow-hidden flex flex-col w-full relative">
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

                  {/* TELEMETRY VECTORS */}
                  <BentoGridItem
                    title={`Head-to-Head Telemetry (P1 vs P2)`}
                    description={`Speed & Gear Vectors: ${driversMap[topDrivers[0]]?.name_acronym || topDrivers[0]} vs ${driversMap[topDrivers[1]]?.name_acronym || topDrivers[1]}`}
                    icon={<BarChart2 className="h-4 w-4 text-neutral-500" />}
                    className="md:col-span-2 md:row-span-2 min-h-[400px] bg-white/50 dark:bg-zinc-900/40"
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
                            
                            {/* P1 Lines */}
                            <Line yAxisId="left" type="monotone" dataKey="p1Speed" name={`${driversMap[topDrivers[0]]?.name_acronym || topDrivers[0]} Speed`} stroke={`#${driversMap[topDrivers[0]]?.team_colour || '3b82f6'}`} strokeWidth={2} dot={false} isAnimationActive={false} />
                            
                            {/* P2 Lines */}
                            <Line yAxisId="left" type="monotone" dataKey="p2Speed" name={`${driversMap[topDrivers[1]]?.name_acronym || topDrivers[1]} Speed`} stroke={`#${driversMap[topDrivers[1]]?.team_colour || 'ef4444'}`} strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    }
                  />
                </BentoGrid>
              )
            },
            {
              key: 'standings',
              label: <span className="flex items-center gap-2 font-bold"><Trophy size={16}/> CHAMPIONSHIP</span>,
              children: (
                <div className="w-full overflow-hidden relative rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                      <Trophy className="text-yellow-500"/> {standingsTab === 'drivers' ? 'Driver Championship' : 'Constructor Championship'}
                    </h2>
                    <div className="flex bg-black rounded-lg p-1 border border-[#1f1f1f]">
                      <button 
                        onClick={() => setStandingsTab('drivers')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${standingsTab === 'drivers' ? 'bg-[#1f1f1f] text-white' : 'text-[#737373] hover:text-white'}`}
                      >
                        DRIVERS
                      </button>
                      <button 
                        onClick={() => setStandingsTab('constructors')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${standingsTab === 'constructors' ? 'bg-[#1f1f1f] text-white' : 'text-[#737373] hover:text-white'}`}
                      >
                        CONSTRUCTORS
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {standingsTab === 'drivers' ? (
                      <motion.div key="drivers" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <Table 
                          dataSource={standings} 
                          columns={standingColumns} 
                          pagination={false}
                          rowKey={(record) => record.Driver?.driverId}
                          className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                          scroll={{ x: 'max-content' }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="constructors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Table 
                          dataSource={constructors} 
                          columns={constructorColumns} 
                          pagination={false}
                          rowKey={(record) => record.Constructor?.constructorId}
                          className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                          scroll={{ x: 'max-content' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
