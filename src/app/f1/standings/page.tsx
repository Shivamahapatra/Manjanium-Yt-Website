"use client";

import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function StandingsPage() {
  const [standingsTab, setStandingsTab] = useState('drivers');
  const [year, setYear] = useState('current');
  const [standings, setStandings] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/f1/standings?year=${year}`);
        const data = await res.json();
        setStandings(data.drivers || []);
        setConstructors(data.constructors || []);
      } catch (error) {
        console.error("Failed to fetch standings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [year]);

  // Mock data generator for sparklines (last 5 races progression)
  const generateSparkline = (currentPoints: number) => {
    let pts = Math.max(0, currentPoints - 50);
    return Array.from({ length: 5 }).map((_, i) => {
      pts += Math.floor(Math.random() * 15);
      return { race: `R${i + 1}`, pts };
    });
  };

  const standingColumns = [
    { title: 'POS', dataIndex: 'position', key: 'pos', render: (text: string) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'DRIVER', key: 'athlete', render: (record: any) => {
      const isLeader = record.position === '1';
      return (
        <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium">
          {record.Driver.givenName} {record.Driver.familyName}
          {isLeader && <Trophy className="w-3 h-3 text-yellow-500 ml-1" />}
        </div>
      );
    }},
    { title: 'TEAM', key: 'team', render: (record: any) => <span className="text-neutral-500 text-xs">{record.Constructors[0]?.name}</span> },
    { title: 'WINS', dataIndex: 'wins', key: 'wins', render: (wins: string) => <span>{wins}</span> },
    { title: 'FORM (Last 5)', key: 'form', width: 120, render: (record: any) => (
      <div className="w-24 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={generateSparkline(Number(record.points))}>
            <Line type="monotone" dataKey="pts" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )},
    { title: 'POINTS', dataIndex: 'points', key: 'points', render: (points: string) => <Tag color="blue" className="font-bold bg-blue-500/20 text-blue-400 border-none">{points} pts</Tag> },
    { title: 'GAP', key: 'gap', render: (record: any, _: any, index: number) => {
      if (index === 0) return <span className="text-neutral-500">-</span>;
      const leaderPts = Number(standings[0]?.points || 0);
      const gap = leaderPts - Number(record.points);
      return <span className="text-red-400 text-xs font-mono">-{gap}</span>;
    }}
  ];

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-2">
              STANDINGS
            </h1>
            <p className="text-neutral-500">Official FIA World Championship points.</p>
          </div>
          <div className="flex gap-2">
            {[ '2023', '2024', 'current'].map((y) => (
              <button 
                key={y}
                onClick={() => setYear(y)}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${year === y ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-[#111111] text-neutral-600 dark:text-[#737373] hover:text-white'}`}
              >
                {y === 'current' ? '2025' : y}
              </button>
            ))}
          </div>
        </header>

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
                  loading={loading}
                  rowKey={(record) => record.Driver?.driverId}
                  className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                  scroll={{ x: 'max-content' }}
                />
              </motion.div>
            ) : (
              <motion.div key="constructors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="w-full h-[400px] mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={constructors} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="Constructor.name" type="category" width={150} tick={{ fill: '#fff' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#1f1f1f' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                      <Bar dataKey="points" radius={[0, 4, 4, 0]}>
                        {constructors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#333'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
