"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { TEAM_COLORS } from '@/lib/f1-types';
import { getTeamColor } from '@/lib/f1-helpers';

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
        console.error('Failed to fetch standings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [year]);

  // Mock sparkline data generator (last 5 races progression)
  const sparklineCache = useMemo(() => {
    const cache: Record<string, { race: string; pts: number }[]> = {};
    standings.forEach((s) => {
      const id = s.Driver?.driverId || s.position;
      if (!cache[id]) {
        let pts = Math.max(0, Number(s.points) - 50);
        cache[id] = Array.from({ length: 5 }).map((_, i) => {
          pts += Math.floor(Math.random() * 15);
          return { race: `R${i + 1}`, pts };
        });
      }
    });
    return cache;
  }, [standings]);

  const standingColumns = [
    {
      title: <span className="text-[#737373] text-xs">POS</span>,
      dataIndex: 'position',
      key: 'pos',
      width: 55,
      render: (text: string) => (
        <span className="font-bold text-zinc-400">P{text}</span>
      ),
    },
    {
      title: <span className="text-[#737373] text-xs">DRIVER</span>,
      key: 'athlete',
      render: (_: any, record: any) => {
        const isLeader = record.position === '1';
        const teamName = record.Constructors?.[0]?.name || '';
        const teamColor = getTeamColor(teamName);
        return (
          <div className="flex items-center gap-2 text-white font-medium">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: teamColor }}
            />
            {record.Driver.givenName} {record.Driver.familyName}
            {isLeader && <Trophy className="w-3.5 h-3.5 text-yellow-500 ml-1" />}
          </div>
        );
      },
    },
    {
      title: <span className="text-[#737373] text-xs">TEAM</span>,
      key: 'team',
      render: (_: any, record: any) => (
        <span className="text-neutral-500 text-xs">
          {record.Constructors?.[0]?.name}
        </span>
      ),
    },
    {
      title: <span className="text-[#737373] text-xs">WINS</span>,
      dataIndex: 'wins',
      key: 'wins',
      width: 60,
      render: (wins: string) => <span className="text-white">{wins}</span>,
    },
    {
      title: <span className="text-[#737373] text-xs">FORM (Last 5)</span>,
      key: 'form',
      width: 120,
      render: (_: any, record: any) => {
        const id = record.Driver?.driverId || record.position;
        const data = sparklineCache[id] || [];
        return (
          <div className="w-24 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="pts"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      },
    },
    {
      title: <span className="text-[#737373] text-xs">POINTS</span>,
      dataIndex: 'points',
      key: 'points',
      render: (points: string) => (
        <Tag
          color="blue"
          className="font-bold bg-blue-500/20 text-blue-400 border-none"
        >
          {points} pts
        </Tag>
      ),
    },
    {
      title: <span className="text-[#737373] text-xs">GAP</span>,
      key: 'gap',
      width: 70,
      render: (_: any, record: any, index: number) => {
        if (index === 0)
          return <span className="text-neutral-500">—</span>;
        const leaderPts = Number(standings[0]?.points || 0);
        const gap = leaderPts - Number(record.points);
        return (
          <span className="text-red-400 text-xs font-mono font-semibold">
            −{gap}
          </span>
        );
      },
    },
  ];

  /* --------- Constructor bar chart data with team colors --------- */
  const constructorBarData = useMemo(() => {
    return constructors.map((c) => {
      const name = c.Constructor?.name || 'Unknown';
      return {
        name,
        points: Number(c.points),
        fill: getTeamColor(name),
      };
    });
  }, [constructors]);

  return (
    <div className="p-4 md:p-8 min-h-full bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2">
              STANDINGS
            </h1>
            <p className="text-neutral-500">
              Official FIA World Championship points.
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { label: '2024', value: '2024' },
              { label: '2025', value: 'current' },
              { label: '2026', value: '2026' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setYear(s.value)}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${
                  year === s.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#111111] text-[#737373] hover:text-white border border-[#1f1f1f]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </header>

        {/* ===== CONTENT CARD ===== */}
        <div className="w-full overflow-hidden relative rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
          {/* Tab toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Trophy className="text-yellow-500" />
              {standingsTab === 'drivers'
                ? 'Driver Championship'
                : 'Constructor Championship'}
            </h2>
            <div className="flex bg-black rounded-lg p-1 border border-[#1f1f1f]">
              <button
                onClick={() => setStandingsTab('drivers')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                  standingsTab === 'drivers'
                    ? 'bg-[#1f1f1f] text-white'
                    : 'text-[#737373] hover:text-white'
                }`}
              >
                DRIVERS
              </button>
              <button
                onClick={() => setStandingsTab('constructors')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                  standingsTab === 'constructors'
                    ? 'bg-[#1f1f1f] text-white'
                    : 'text-[#737373] hover:text-white'
                }`}
              >
                CONSTRUCTORS
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {standingsTab === 'drivers' ? (
                <motion.div
                  key="drivers"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <Table
                    dataSource={standings}
                    columns={standingColumns}
                    pagination={false}
                    rowKey={(record) => record.Driver?.driverId}
                    className="manjanium-table [&_.ant-table]:!bg-transparent [&_.ant-table-thead_th]:!bg-[#0a0a0a] [&_.ant-table-thead_th]:!border-b-[#1f1f1f]"
                    scroll={{ x: 'max-content' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="constructors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="w-full h-[450px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={constructorBarData}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                      >
                        <XAxis
                          type="number"
                          hide
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={160}
                          tick={{ fill: '#fff', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#1f1f1f' }}
                          contentStyle={{
                            backgroundColor: '#111111',
                            border: '1px solid #1f1f1f',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                          formatter={(value: any) => [`${value} pts`, 'Points']}
                        />
                        <Bar dataKey="points" radius={[0, 4, 4, 0]}>
                          {constructorBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
