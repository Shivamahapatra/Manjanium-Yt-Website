"use client";

import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Clock, Zap, Timer } from 'lucide-react';
import { Table, Tag, Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { formatGap, formatLapTime, getTeamColor } from '@/lib/f1-helpers';

type SessionTab = 'race' | 'qualifying' | 'sprint' | 'fastest';

export default function ResultsPage() {
  const [year, setYear] = useState('2025');
  const [round, setRound] = useState('latest');
  const [sessionTab, setSessionTab] = useState<SessionTab>('race');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const years = ['2026', '2025', '2024', '2023'];
  const rounds = Array.from({ length: 24 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const roundParam = round === 'latest' ? 'last' : round;
        const yearParam = year;
        const res = await fetch(`/api/f1/results?year=${yearParam}&round=${roundParam}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [year, round]);

  const raceResults = data?.race?.Results || [];
  const qualiResults = data?.qualifying?.QualifyingResults || [];
  const sprintResults = data?.sprint?.SprintResults || [];
  const fastestLaps = data?.fastestLaps || [];

  const isDNF = (status: string) => {
    if (!status) return false;
    const finished = status === 'Finished' || status.startsWith('+');
    return !finished;
  };

  const tabs: { key: SessionTab; label: string; icon: React.ReactNode }[] = [
    { key: 'race', label: 'RACE', icon: <Flag className="w-4 h-4" /> },
    { key: 'qualifying', label: 'QUALIFYING', icon: <Clock className="w-4 h-4" /> },
    { key: 'sprint', label: 'SPRINT', icon: <Zap className="w-4 h-4" /> },
    { key: 'fastest', label: 'FASTEST LAPS', icon: <Timer className="w-4 h-4" /> },
  ];

  const raceColumns = [
    {
      title: 'POS',
      dataIndex: 'position',
      key: 'pos',
      width: 60,
      render: (text: string) => (
        <span className="font-bold text-zinc-400">P{text}</span>
      ),
    },
    {
      title: 'DRIVER',
      key: 'driver',
      render: (_: any, record: any) => {
        const teamColor = getTeamColor(record.Constructor?.name);
        const hasFastestLap = record.FastestLap?.rank === '1';
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-4 rounded-sm"
              style={{ backgroundColor: teamColor }}
            />
            <span className="font-medium text-white">
              {record.Driver?.givenName} {record.Driver?.familyName}
            </span>
            {hasFastestLap && (
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            )}
          </div>
        );
      },
    },
    {
      title: 'TEAM',
      key: 'team',
      render: (_: any, record: any) => (
        <span className="text-neutral-500 text-xs">{record.Constructor?.name}</span>
      ),
    },
    {
      title: 'GRID',
      dataIndex: 'grid',
      key: 'grid',
      width: 60,
      render: (text: string) => (
        <span className="font-mono text-sm text-neutral-400">{text}</span>
      ),
    },
    {
      title: 'LAPS',
      dataIndex: 'laps',
      key: 'laps',
      width: 60,
      render: (text: string) => (
        <span className="font-mono text-sm text-neutral-400">{text}</span>
      ),
    },
    {
      title: 'TIME/GAP',
      key: 'time',
      render: (_: any, record: any) => {
        const dnf = isDNF(record.status);
        return (
          <span className={`font-mono text-sm ${dnf ? 'text-red-500' : 'text-neutral-300'}`}>
            {record.Time?.time || record.status}
          </span>
        );
      },
    },
    {
      title: 'POINTS',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points: string) => (
        <Tag
          color={Number(points) > 0 ? 'blue' : 'default'}
          className={`font-bold border-none ${Number(points) > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-500'}`}
        >
          {points}
        </Tag>
      ),
    },
  ];

  const qualiColumns = [
    {
      title: 'POS',
      dataIndex: 'position',
      key: 'pos',
      width: 60,
      render: (text: string) => (
        <span className="font-bold text-zinc-400">P{text}</span>
      ),
    },
    {
      title: 'DRIVER',
      key: 'driver',
      render: (_: any, record: any) => {
        const teamColor = getTeamColor(record.Constructor?.name);
        const pos = Number(record.position);
        const eliminated = pos > 10;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-4 rounded-sm"
              style={{ backgroundColor: teamColor }}
            />
            <span className={`font-medium ${eliminated ? 'text-neutral-600' : 'text-white'}`}>
              {record.Driver?.givenName} {record.Driver?.familyName}
            </span>
          </div>
        );
      },
    },
    {
      title: 'TEAM',
      key: 'team',
      render: (_: any, record: any) => (
        <span className="text-neutral-500 text-xs">{record.Constructor?.name}</span>
      ),
    },
    {
      title: 'Q1',
      dataIndex: 'Q1',
      key: 'q1',
      render: (time: string, record: any) => {
        const pos = Number(record.position);
        const eliminatedQ1 = pos > 15;
        return (
          <span className={`font-mono text-sm ${eliminatedQ1 ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {time || '-'}
          </span>
        );
      },
    },
    {
      title: 'Q2',
      dataIndex: 'Q2',
      key: 'q2',
      render: (time: string, record: any) => {
        const pos = Number(record.position);
        const eliminatedQ2 = pos > 10;
        return (
          <span className={`font-mono text-sm ${eliminatedQ2 ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {time || '-'}
          </span>
        );
      },
    },
    {
      title: 'Q3',
      dataIndex: 'Q3',
      key: 'q3',
      render: (time: string) => (
        <span className="font-mono text-sm font-bold text-white">
          {time || '-'}
        </span>
      ),
    },
  ];

  const sprintColumns = [
    {
      title: 'POS',
      dataIndex: 'position',
      key: 'pos',
      width: 60,
      render: (text: string) => (
        <span className="font-bold text-zinc-400">P{text}</span>
      ),
    },
    {
      title: 'DRIVER',
      key: 'driver',
      render: (_: any, record: any) => {
        const teamColor = getTeamColor(record.Constructor?.name);
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-4 rounded-sm"
              style={{ backgroundColor: teamColor }}
            />
            <span className="font-medium text-white">
              {record.Driver?.givenName} {record.Driver?.familyName}
            </span>
          </div>
        );
      },
    },
    {
      title: 'TEAM',
      key: 'team',
      render: (_: any, record: any) => (
        <span className="text-neutral-500 text-xs">{record.Constructor?.name}</span>
      ),
    },
    {
      title: 'GRID',
      dataIndex: 'grid',
      key: 'grid',
      width: 60,
      render: (text: string) => (
        <span className="font-mono text-sm text-neutral-400">{text}</span>
      ),
    },
    {
      title: 'LAPS',
      dataIndex: 'laps',
      key: 'laps',
      width: 60,
      render: (text: string) => (
        <span className="font-mono text-sm text-neutral-400">{text}</span>
      ),
    },
    {
      title: 'TIME/GAP',
      key: 'time',
      render: (_: any, record: any) => {
        const dnf = isDNF(record.status);
        return (
          <span className={`font-mono text-sm ${dnf ? 'text-red-500' : 'text-neutral-300'}`}>
            {record.Time?.time || record.status}
          </span>
        );
      },
    },
    {
      title: 'POINTS',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points: string) => (
        <Tag
          color={Number(points) > 0 ? 'blue' : 'default'}
          className={`font-bold border-none ${Number(points) > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-500'}`}
        >
          {points}
        </Tag>
      ),
    },
  ];

  const fastestLapColumns = [
    {
      title: 'POS',
      key: 'pos',
      width: 60,
      render: (_: any, record: any) => (
        <span className="font-bold text-zinc-400">{record.rank || record.FastestLap?.rank || '-'}</span>
      ),
    },
    {
      title: 'DRIVER',
      key: 'driver',
      render: (_: any, record: any) => {
        const teamColor = getTeamColor(record.Constructor?.name);
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-4 rounded-sm"
              style={{ backgroundColor: teamColor }}
            />
            <span className="font-medium text-white">
              {record.Driver?.givenName} {record.Driver?.familyName}
            </span>
          </div>
        );
      },
    },
    {
      title: 'TEAM',
      key: 'team',
      render: (_: any, record: any) => (
        <span className="text-neutral-500 text-xs">{record.Constructor?.name}</span>
      ),
    },
    {
      title: 'LAP',
      key: 'lap',
      width: 60,
      render: (_: any, record: any) => (
        <span className="font-mono text-sm text-neutral-400">
          {record.lap || record.FastestLap?.lap || '-'}
        </span>
      ),
    },
    {
      title: 'TIME',
      key: 'time',
      render: (_: any, record: any) => (
        <span className="font-mono text-sm text-white font-bold">
          {record.time || record.FastestLap?.Time?.time || '-'}
        </span>
      ),
    },
    {
      title: 'AVG SPEED',
      key: 'speed',
      render: (_: any, record: any) => (
        <span className="font-mono text-sm text-neutral-400">
          {record.averageSpeed || record.FastestLap?.AverageSpeed?.speed || '-'} {(record.averageSpeed || record.FastestLap?.AverageSpeed?.speed) ? 'kph' : ''}
        </span>
      ),
    },
  ];

  const tabTitle = {
    race: 'Race Classification',
    qualifying: 'Qualifying Classification',
    sprint: 'Sprint Classification',
    fastest: 'Fastest Laps',
  };

  const tabIcon = {
    race: <Flag className="w-5 h-5 text-blue-500" />,
    qualifying: <Clock className="w-5 h-5 text-purple-500" />,
    sprint: <Zap className="w-5 h-5 text-amber-500" />,
    fastest: <Timer className="w-5 h-5 text-green-500" />,
  };

  const renderTable = () => {
    switch (sessionTab) {
      case 'race':
        return (
          <motion.div
            key="race"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Table
              dataSource={raceResults}
              columns={raceColumns}
              pagination={false}
              loading={loading}
              rowKey="position"
              className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
              scroll={{ x: 'max-content' }}
            />
          </motion.div>
        );
      case 'qualifying':
        return (
          <motion.div
            key="qualifying"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {qualiResults.length > 0 ? (
              <Table
                dataSource={qualiResults}
                columns={qualiColumns}
                pagination={false}
                loading={loading}
                rowKey="position"
                className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <div className="text-center py-16 text-neutral-500">
                Qualifying data not available for this round yet.
              </div>
            )}
          </motion.div>
        );
      case 'sprint':
        return (
          <motion.div
            key="sprint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {sprintResults.length > 0 ? (
              <Table
                dataSource={sprintResults}
                columns={sprintColumns}
                pagination={false}
                loading={loading}
                rowKey="position"
                className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <div className="text-center py-16 text-neutral-500">
                No sprint data for this round.
              </div>
            )}
          </motion.div>
        );
      case 'fastest':
        return (
          <motion.div
            key="fastest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {fastestLaps.length > 0 || raceResults.length > 0 ? (
              <Table
                dataSource={
                  fastestLaps.length > 0
                    ? fastestLaps
                    : raceResults
                        .filter((r: any) => r.FastestLap)
                        .sort((a: any, b: any) => Number(a.FastestLap.rank) - Number(b.FastestLap.rank))
                }
                columns={fastestLapColumns}
                pagination={false}
                loading={loading}
                rowKey={(record: any) => record.Driver?.driverId || record.position}
                rowClassName={(record: any) => {
                  const rank = record.rank || record.FastestLap?.rank;
                  return rank === '1' ? 'bg-purple-500/10' : '';
                }}
                className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50"
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <div className="text-center py-16 text-neutral-500">
                Fastest lap data not available for this round.
              </div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2 flex items-center gap-3">
              <Flag className="w-8 h-8 text-white" />
              RESULTS EXPLORER
            </h1>
            <p className="text-neutral-500">
              Historical race classifications and qualifying sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-xl border border-[#1f1f1f]">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
            >
              <option value="latest">Latest Round</option>
              {rounds.map((r) => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </select>
          </div>
        </header>

        {data?.race && (
          <div className="mb-6 p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{data.race.raceName}</h2>
              <div className="text-sm text-neutral-500">
                {data.race.Circuit?.circuitName} • Round {data.race.round} •{' '}
                {data.race.season}
              </div>
            </div>
          </div>
        )}

        <div className="w-full overflow-hidden relative rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-[#1f1f1f] pb-4 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              {tabIcon[sessionTab]}
              {tabTitle[sessionTab]}
            </h2>
            <div className="flex bg-black rounded-lg p-1 border border-[#1f1f1f] flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSessionTab(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-1.5 ${
                    sessionTab === tab.key
                      ? 'bg-[#1f1f1f] text-white'
                      : 'text-[#737373] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">{renderTable()}</AnimatePresence>
        </div>
      </div>
    </div>
  );
}
