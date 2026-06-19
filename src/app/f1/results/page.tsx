"use client";

import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Clock, Search } from 'lucide-react';
import { Table, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultsPage() {
  const [year, setYear] = useState('current');
  const [round, setRound] = useState('last');
  const [sessionTab, setSessionTab] = useState('race');
  const [raceData, setRaceData] = useState<any>(null);
  const [qualiData, setQualiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Example rounds 1 to 24 for the dropdowns
  const rounds = Array.from({ length: 24 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/f1/results?year=${year}&round=${round}`);
        const data = await res.json();
        setRaceData(data.race);
        setQualiData(data.qualifying);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [year, round]);

  const raceColumns = [
    { title: 'POS', dataIndex: 'position', key: 'pos', render: (text: string) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'DRIVER', key: 'driver', render: (record: any) => (
      <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium">
        {record.Driver.givenName} {record.Driver.familyName}
      </div>
    )},
    { title: 'TEAM', key: 'team', render: (record: any) => <span className="text-neutral-500 text-xs">{record.Constructor.name}</span> },
    { title: 'GRID', dataIndex: 'grid', key: 'grid' },
    { title: 'TIME/STATUS', key: 'time', render: (record: any) => (
      <span className={record.status !== 'Finished' && !record.status.includes('+') ? 'text-red-500' : 'text-neutral-300'}>
        {record.Time?.time || record.status}
      </span>
    )},
    { title: 'PTS', dataIndex: 'points', key: 'points', render: (points: string) => (
      <Tag color={Number(points) > 0 ? "blue" : "default"} className={`font-bold border-none ${Number(points) > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-500'}`}>
        {points}
      </Tag>
    )}
  ];

  const qualiColumns = [
    { title: 'POS', dataIndex: 'position', key: 'pos', render: (text: string) => <span className="font-bold text-neutral-500 dark:text-zinc-400">P{text}</span> },
    { title: 'DRIVER', key: 'driver', render: (record: any) => (
      <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium">
        {record.Driver.givenName} {record.Driver.familyName}
      </div>
    )},
    { title: 'TEAM', key: 'team', render: (record: any) => <span className="text-neutral-500 text-xs">{record.Constructor.name}</span> },
    { title: 'Q1', dataIndex: 'Q1', key: 'q1', render: (time: string) => <span className="font-mono text-sm text-neutral-400">{time || '-'}</span> },
    { title: 'Q2', dataIndex: 'Q2', key: 'q2', render: (time: string) => <span className="font-mono text-sm text-neutral-400">{time || '-'}</span> },
    { title: 'Q3', dataIndex: 'Q3', key: 'q3', render: (time: string) => <span className="font-mono text-sm font-bold text-white">{time || '-'}</span> },
  ];

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-2 flex items-center gap-3">
              <Flag className="w-8 h-8 text-neutral-800 dark:text-white" />
              RESULTS EXPLORER
            </h1>
            <p className="text-neutral-500">Historical race classifications and qualifying sessions.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-xl border border-[#1f1f1f]">
            <select 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
            >
              <option value="current">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <select 
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
            >
              <option value="last">Latest Round</option>
              {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
            </select>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
              <Search className="w-4 h-4" /> Load
            </button>
          </div>
        </header>

        {raceData && (
          <div className="mb-6 p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{raceData.raceName}</h2>
              <div className="text-sm text-neutral-500">{raceData.Circuit.circuitName} • Round {raceData.round} • {raceData.season}</div>
            </div>
          </div>
        )}

        <div className="w-full overflow-hidden relative rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
          <div className="flex items-center justify-between mb-6 border-b border-[#1f1f1f] pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              {sessionTab === 'race' ? <Flag className="w-5 h-5 text-blue-500" /> : <Clock className="w-5 h-5 text-purple-500" />}
              {sessionTab === 'race' ? 'Race Classification' : 'Qualifying Classification'}
            </h2>
            <div className="flex bg-black rounded-lg p-1 border border-[#1f1f1f]">
              <button 
                onClick={() => setSessionTab('race')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${sessionTab === 'race' ? 'bg-[#1f1f1f] text-white' : 'text-[#737373] hover:text-white'}`}
              >
                RACE
              </button>
              <button 
                onClick={() => setSessionTab('quali')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${sessionTab === 'quali' ? 'bg-[#1f1f1f] text-white' : 'text-[#737373] hover:text-white'}`}
              >
                QUALIFYING
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {sessionTab === 'race' ? (
              <motion.div key="race" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Table 
                  dataSource={raceData?.Results || []} 
                  columns={raceColumns} 
                  pagination={false}
                  loading={loading}
                  rowKey="position"
                  className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                  scroll={{ x: 'max-content' }}
                />
              </motion.div>
            ) : (
              <motion.div key="quali" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {qualiData ? (
                  <Table 
                    dataSource={qualiData?.QualifyingResults || []} 
                    columns={qualiColumns} 
                    pagination={false}
                    loading={loading}
                    rowKey="position"
                    className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                    scroll={{ x: 'max-content' }}
                  />
                ) : (
                  <div className="text-center py-10 text-neutral-500">Qualifying data not available for this round yet.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
