"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Tabs as AntTabs, Tag, Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Activity, Trophy, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TEAM_COLORS } from '@/lib/f1-types';
import { formatGap, getTeamColor } from '@/lib/f1-helpers';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';

/* ------------------------------------------------------------------ */
/*  MAIN F1 HUB PAGE                                                  */
/* ------------------------------------------------------------------ */
export default function F1Hub() {
  const [activeTab, setActiveTab] = useState('live');
  const [session, setSession] = useState<any>(null);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [positions, setPositions] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [standingsTab, setStandingsTab] = useState('drivers');
  const [liveLoading, setLiveLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);

  // Driver selectors for telemetry — stored as driver_number strings
  const [driver1, setDriver1] = useState<string>('');
  const [driver2, setDriver2] = useState<string>('');
  const initialDriversSet = useRef(false);

  /* --------- Fetch live data every 3 seconds --------- */
  const fetchLiveData = useCallback(async () => {
    try {
      const liveRes = await fetch('/api/f1/live');
      const liveJson = await liveRes.json();

      // Session
      if (liveJson.session) {
        setSession(liveJson.session);
      }

      // Drivers map
      if (liveJson.drivers && Array.isArray(liveJson.drivers)) {
        const map: Record<string, any> = {};
        liveJson.drivers.forEach((d: any) => {
          map[d.driver_number] = d;
        });
        setDriversMap(map);
      }

      // Positions + intervals
      if (Array.isArray(liveJson.positions) && Array.isArray(liveJson.intervals)) {
        const latestPositions = new Map<number, any>();
        liveJson.positions.forEach((p: any) => {
          if (!latestPositions.has(p.driver_number) ||
              new Date(p.date) > new Date(latestPositions.get(p.driver_number).date)) {
            latestPositions.set(p.driver_number, p);
          }
        });

        const latestIntervals = new Map<number, any>();
        liveJson.intervals.forEach((i: any) => {
          if (!latestIntervals.has(i.driver_number) ||
              new Date(i.date) > new Date(latestIntervals.get(i.driver_number).date)) {
            latestIntervals.set(i.driver_number, i);
          }
        });

        const merged = Array.from(latestPositions.values())
          .map((pos) => {
            const intv = latestIntervals.get(pos.driver_number);
            return {
              ...pos,
              gap_to_leader: intv?.gap_to_leader ?? '+0.000',
              interval: intv?.interval ?? '+0.000',
            };
          })
          .sort((a, b) => a.position - b.position);

        setPositions(merged);

        // Set initial telemetry drivers (P1 & P2) only once
        if (!initialDriversSet.current && merged.length >= 2) {
          setDriver1(String(merged[0].driver_number));
          setDriver2(String(merged[1].driver_number));
          initialDriversSet.current = true;
        }
      }
    } catch (error) {
      console.error('F1 Live Data Error:', error);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  /* --------- Fetch standings once on mount --------- */
  useEffect(() => {
    const fetchStandings = async () => {
      setStandingsLoading(true);
      try {
        const res = await fetch('/api/f1/standings');
        const data = await res.json();
        setStandings(data.drivers || []);
        setConstructors(data.constructors || []);
      } catch (error) {
        console.error('Standings Error:', error);
      } finally {
        setStandingsLoading(false);
      }
    };
    fetchStandings();
  }, []);

  /* --------- Fetch telemetry when driver selection changes --------- */
  useEffect(() => {
    if (!driver1 || !driver2) return;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`/api/f1/telemetry?d1=${driver1}&d2=${driver2}`);
        const data = await res.json();
        if (data.telemetry && data.telemetry.length === 2) {
          const p1Data = data.telemetry[0].slice(-30);
          const p2Data = data.telemetry[1].slice(-30);
          const merged = p1Data.map((d1: any, i: number) => {
            const d2 = p2Data[i] || {};
            return {
              idx: i,
              p1Speed: d1.speed,
              p2Speed: d2.speed,
            };
          });
          setTelemetry(merged);
        }
      } catch (error) {
        console.error('Telemetry Error:', error);
      }
    };
    fetchTelemetry();
  }, [driver1, driver2]);

  /* --------- Helpers --------- */
  const getDriverColor = (driverNumber: string | number): string => {
    const d = driversMap[String(driverNumber)];
    if (d?.team_colour) return `#${d.team_colour}`;
    return '#3b82f6';
  };

  const getDriverName = (driverNumber: string | number): string => {
    const d = driversMap[String(driverNumber)];
    return d?.name_acronym || String(driverNumber);
  };

  // Legacy Timing Columns and MotionRow removed as they are now handled by LiveTimingTower

  /* --------- Standing columns --------- */
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
            {isLeader && <Trophy className="w-3 h-3 text-yellow-500 ml-1" />}
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
      render: (wins: string) => <span className="text-white">{wins}</span>,
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
  ];

  /* --------- Constructor columns --------- */
  const constructorColumns = [
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
      title: <span className="text-[#737373] text-xs">TEAM</span>,
      key: 'team',
      render: (_: any, record: any) => {
        const teamColor = getTeamColor(record.Constructor?.name || '');
        return (
          <div className="flex items-center gap-2 text-white font-medium">
            <div
              className="w-1.5 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: teamColor }}
            />
            {record.Constructor?.name}
          </div>
        );
      },
    },
    {
      title: <span className="text-[#737373] text-xs">WINS</span>,
      dataIndex: 'wins',
      key: 'wins',
      render: (wins: string) => <span className="text-white">{wins}</span>,
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
  ];

  const isQuali = session?.session_type === 'Qualifying';
  const isRace = session?.session_type === 'Race';

  /* --------- Available drivers for dropdown --------- */
  const driverOptions = positions.map((p) => ({
    value: String(p.driver_number),
    label: `P${p.position} — ${getDriverName(p.driver_number)}`,
  }));

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* ===== HEADER ===== */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
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
              <div className="flex items-center gap-2 text-xl font-medium tracking-wide text-zinc-300">
                <Radio className="text-red-500" size={18} />
                {session
                  ? `${session.session_name} — ${session.country_name}`
                  : 'Awaiting Active Session...'}
              </div>

              <div className="flex gap-4">
                {isQuali && (
                  <Tag color="purple" className="border-none font-bold">
                    SECTOR TIMES PRIORITIZED
                  </Tag>
                )}
                {isRace && (
                  <Tag color="green" className="border-none font-bold">
                    INTERVAL GAPS PRIORITIZED
                  </Tag>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </header>

        {/* ===== TABS ===== */}
        <AntTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="[&_.ant-tabs-tab-btn]:text-zinc-400 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-white [&_.ant-tabs-ink-bar]:bg-blue-500 mb-6"
          items={[
            /* ---------- LIVE DASHBOARD ---------- */
            {
              key: 'live',
              label: (
                <span className="flex items-center gap-2 font-bold">
                  <Activity size={16} /> LIVE DASHBOARD
                </span>
              ),
              children: (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* TIMING TOWER — left 3 cols */}
                  <div className="lg:col-span-3">
                    <LiveTimingTower />
                  </div>

                  {/* TELEMETRY PANEL — right 2 cols */}
                  <div className="lg:col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f1f1f]">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm font-bold text-white tracking-wide">
                          Head-to-Head Telemetry
                        </span>
                      </div>
                    </div>

                    {/* Driver selectors */}
                    <div className="flex gap-3 px-5 py-3 border-b border-[#1f1f1f]">
                      <select
                        value={driver1}
                        onChange={(e) => setDriver1(e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-white text-xs font-mono rounded-md px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Driver 1</option>
                        {driverOptions.map((opt) => (
                          <option key={`d1-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-neutral-500 font-bold self-center text-xs">
                        VS
                      </span>
                      <select
                        value={driver2}
                        onChange={(e) => setDriver2(e.target.value)}
                        className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-white text-xs font-mono rounded-md px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Driver 2</option>
                        {driverOptions.map((opt) => (
                          <option key={`d2-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 min-h-[350px] p-4">
                      {telemetry.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={telemetry}
                            margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#1f1f1f"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="idx"
                              tickFormatter={() => ''}
                              stroke="#333"
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              yAxisId="left"
                              stroke="#555"
                              tick={{ fontSize: 10, fill: '#737373' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: '#111111',
                                border: '1px solid #1f1f1f',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12px',
                              }}
                              labelFormatter={() => ''}
                              formatter={(value: any, name: any) => {
                                const label =
                                  name === 'p1Speed'
                                    ? `${getDriverName(driver1)} Speed`
                                    : `${getDriverName(driver2)} Speed`;
                                return [`${value} km/h`, label];
                              }}
                            />
                            <Legend
                              iconType="circle"
                              wrapperStyle={{ fontSize: '11px' }}
                              formatter={(value) =>
                                value === 'p1Speed'
                                  ? `${getDriverName(driver1)} Speed`
                                  : `${getDriverName(driver2)} Speed`
                              }
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="p1Speed"
                              name="p1Speed"
                              stroke={getDriverColor(driver1)}
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="p2Speed"
                              name="p2Speed"
                              stroke={getDriverColor(driver2)}
                              strokeDasharray="5 5"
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-500 text-sm font-mono">
                          Select two drivers to compare telemetry
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },

            /* ---------- CHAMPIONSHIP ---------- */
            {
              key: 'standings',
              label: (
                <span className="flex items-center gap-2 font-bold">
                  <Trophy size={16} /> CHAMPIONSHIP
                </span>
              ),
              children: (
                <div className="w-full overflow-hidden relative rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6">
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

                  {standingsLoading ? (
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
                        >
                          <Table
                            dataSource={constructors}
                            columns={constructorColumns}
                            pagination={false}
                            rowKey={(record) =>
                              record.Constructor?.constructorId
                            }
                            className="manjanium-table [&_.ant-table]:!bg-transparent [&_.ant-table-thead_th]:!bg-[#0a0a0a] [&_.ant-table-thead_th]:!border-b-[#1f1f1f]"
                            scroll={{ x: 'max-content' }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
