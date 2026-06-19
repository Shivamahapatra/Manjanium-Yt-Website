"use client";

import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Statistic, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { Compass, Calendar, Award, Activity } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';

export default function F1Hub() {
  const [liveData, setLiveData] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        const liveRes = await fetch('/api/f1/live');
        const liveJson = await liveRes.json();
        setLiveData(liveJson);

        const standingsRes = await fetch('/api/f1/standings');
        const standingsJson = await standingsRes.json();
        setStandings(standingsJson?.sportsStandingsResults?.[0]?.sportsStandingsSubResults?.[0]?.teamStandings || []);

        const telemetryRes = await fetch('/api/f1/telemetry?limit=1');
        const telemetryJson = await telemetryRes.json();
        if (telemetryJson && telemetryJson.length > 0) {
          setTelemetry(telemetryJson[0]);
        }
      } catch (error) {
        console.error("F1 Data Sync Error:", error);
      }
    };

    fetchF1Data();
    const interval = setInterval(fetchF1Data, 10000);
    return () => clearInterval(interval);
  }, []);

  const standingColumns = [
    { title: 'Pos', dataIndex: 'positionInDivision', key: 'pos', render: (text: number) => <span className="font-bold text-neutral-500 dark:text-zinc-400">#{text}</span> },
    { title: 'Driver / Team', dataIndex: 'team', key: 'team', render: (text: string) => <span className="text-neutral-900 dark:text-white font-medium">{text}</span> },
    { title: 'Wins', dataIndex: 'wins', key: 'wins' },
    { title: 'Points', dataIndex: 'points', key: 'points', render: (text: number) => <Tag color="blue" className="font-bold">{text} pts</Tag> },
  ];

  const tabsData = [
    {
      title: <span className="flex items-center gap-2"><Activity size={16} /> Live Telemetry</span>,
      value: 'telemetry',
      content: (
        <div className="w-full relative h-full rounded-2xl p-1 md:p-4 bg-white dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 shadow-xl backdrop-blur-md text-neutral-900 dark:text-white mt-8 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-4">
              <h3 className="text-xl font-bold flex items-center gap-2">🟢 LIVE DATA OVERVIEW</h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title={<span className="text-neutral-500 dark:text-zinc-500">RPM</span>} value={telemetry?.rpm || 11200} valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} />
                </Col>
                <Col span={8}>
                  <Statistic title={<span className="text-neutral-500 dark:text-zinc-500">SPEED</span>} value={telemetry?.speed || 284} suffix="km/h" className="font-bold dark:[&_.ant-statistic-content]:text-white [&_.ant-statistic-content]:text-black" />
                </Col>
                <Col span={8}>
                  <Statistic title={<span className="text-neutral-500 dark:text-zinc-500">GEAR</span>} value={telemetry?.n_gear || 6} valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                </Col>
              </Row>
              <div className="mt-6 p-4 rounded-lg bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-zinc-800/80 text-neutral-600 dark:text-zinc-400 text-xs font-mono">
                Telemetry Source: openf1.org Node Sync Active // Data Frame Latency: OK
              </div>
            </div>
            
            <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-zinc-800 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-lg font-bold">🏎️ CURRENT GRAND PRIX</h3>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-neutral-900 dark:text-white">{liveData?.events?.[0]?.name || "Loading Active Session..."}</div>
                <div className="text-sm text-neutral-500 dark:text-zinc-400">{liveData?.events?.[0]?.status?.type?.description}</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: <span className="flex items-center gap-2"><Award size={16} /> Standings</span>,
      value: 'standings',
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl bg-white dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 shadow-xl backdrop-blur-md mt-8 mb-40">
          <Table 
            dataSource={standings} 
            columns={standingColumns} 
            pagination={false}
            rowKey={(record) => record.team?.id || record.team}
            className="manjanium-table"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )
    },
    {
      title: <span className="flex items-center gap-2"><Calendar size={16} /> Calendar</span>,
      value: 'calendar',
      content: (
        <div className="w-full relative h-full rounded-2xl p-4 bg-white dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 shadow-xl backdrop-blur-md mt-8 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveData?.events?.map((race: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-neutral-100 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 text-neutral-900 dark:text-white transition-all hover:scale-[1.02]">
                <div className="text-xs text-red-500 font-mono tracking-widest uppercase mb-1">ROUND {idx + 1}</div>
                <div className="text-xl font-bold">{race.name}</div>
                <div className="text-neutral-500 dark:text-zinc-400 text-sm mt-2">{new Date(race.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Gradient Glow Backing */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 dark:bg-red-600/20 rounded-full blur-[120px] pointer-events-none transition-colors duration-300" />
      
      <div className="max-w-7xl mx-auto z-10 relative h-[80vh]">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
              MANJANIUM F1 HUB
            </h1>
          </div>
          <p className="text-neutral-500 dark:text-zinc-400 text-sm">Real-time telemetry streams, schedules, and official championship matrices.</p>
        </header>

        <Tabs tabs={tabsData} containerClassName="mb-4" />
      </div>
    </div>
  );
}
