"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, PieChart, Pie, Sector, ResponsiveContainer
} from 'recharts';

const PieAny = Pie as any;

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

const CustomLabel = (props: any) => {
  const { x, y, index, code, color, dataLength } = props;
  if (index === dataLength - 1) {
    return (
      <text
        x={x + 6}
        y={y + 3}
        fill={color}
        fontSize={10}
        fontWeight="black"
        fontFamily="monospace"
        textAnchor="start"
      >
        {code}
      </text>
    );
  }
  return null;
};

export function F1StandingsTab() {
  const [standingsTab, setStandingsTab] = useState<'drivers' | 'constructors'>('drivers');
  const [year, setYear] = useState<string>('2026');
  const [listData, setListData] = useState<any>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [listLoading, setListLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Fetch list first for quick loading, then fetch heavy charts round-by-round data
  const fetchData = async (selectedYear: string) => {
    setListLoading(true);
    setChartsLoading(true);
    setError(false);

    // Initial simple list fetch (very fast)
    try {
      const listRes = await fetch(`/api/f1/standings?year=${selectedYear}`);
      const listJson = await listRes.json();
      if (listJson.error) throw new Error(listJson.error);

      setListData({
        driverStandings: listJson.driverStandings || [],
        constructorStandings: listJson.constructorStandings || [],
        totalPoints: listJson.totalPoints || 0
      });
      setListLoading(false);

      // Subsequent full charts fetch (heavy round-by-round processing)
      const chartsRes = await fetch(`/api/f1/standings?year=${selectedYear}&charts=true`);
      const chartsJson = await chartsRes.json();
      if (chartsJson.error) throw new Error(chartsJson.error);

      setChartsData({
        driverRankingEvo: chartsJson.driverRankingEvo || [],
        constructorRankingEvo: chartsJson.constructorRankingEvo || [],
        driverStats: chartsJson.driverStats || [],
        constructorStats: chartsJson.constructorStats || []
      });
    } catch (err) {
      console.error("Failed to load standings data", err);
      setError(true);
    } finally {
      setListLoading(false);
      setChartsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(year);
  }, [year]);

  const activeStandings = useMemo(() => {
    if (!listData) return [];
    return standingsTab === 'drivers' 
      ? listData.driverStandings 
      : listData.constructorStandings;
  }, [listData, standingsTab]);

  const totalPoints = listData?.totalPoints || 0;

  // Max points used to calculate the proportional background rectangle width
  const maxPoints = useMemo(() => {
    if (activeStandings.length === 0) return 1;
    return activeStandings[0].points || 1;
  }, [activeStandings]);

  // Motion variants for stagger fade/slide-in animations
  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  // Build flatted ranking evolution bump chart data
  const rankingEvoData = useMemo(() => {
    if (!chartsData) return [];
    const rawEvo = standingsTab === 'drivers' 
      ? chartsData.driverRankingEvo 
      : chartsData.constructorRankingEvo;
    
    return rawEvo.map((r: any) => {
      const item: any = {
        round: r.round,
        raceAbbr: r.raceAbbr,
        raceName: r.raceName
      };
      Object.entries(r.positions).forEach(([key, val]) => {
        item[key] = val;
      });
      return item;
    });
  }, [chartsData, standingsTab]);

  // Get active entities list for plot lines
  const activeEntities = useMemo(() => {
    if (activeStandings.length === 0) return [];
    return standingsTab === 'drivers'
      ? activeStandings.map((d: any) => ({ key: d.driverCode, label: d.driverCode, color: d.teamColor }))
      : activeStandings.map((c: any) => ({ key: c.name, label: c.name, color: c.teamColor }));
  }, [activeStandings, standingsTab]);

  // Stats bar chart data mapping (DNF is negative value for downward bar)
  const statsData = useMemo(() => {
    if (!chartsData) return [];
    const rawStats = standingsTab === 'drivers'
      ? chartsData.driverStats
      : chartsData.constructorStats;

    return rawStats.map((s: any) => ({
      name: s.driverCode || s.name,
      wins: s.wins,
      podiums: s.podiums,
      pointFinishes: s.pointFinishes,
      dnfs: -s.dnfs, // Negate for downward representation
      poles: s.poles
    }));
  }, [chartsData, standingsTab]);

  // Donut Pie chart data
  const pieData = useMemo(() => {
    if (activeStandings.length === 0) return [];
    return activeStandings.map((item: any) => ({
      name: item.driverCode || item.name,
      value: item.points,
      color: item.teamColor
    }));
  }, [activeStandings]);

  // Custom tooltips
  const CustomRankingTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const roundData = payload[0].payload;
      const sortedPositions = Object.entries(roundData)
        .filter(([key]) => key !== 'round' && key !== 'raceAbbr' && key !== 'raceName')
        .map(([key, val]) => ({ name: key, pos: Number(val) }))
        .filter(item => !isNaN(item.pos))
        .sort((a, b) => a.pos - b.pos);

      return (
        <div className="bg-[#111] border border-[#1f1f1f] p-3 rounded-lg shadow-xl max-h-[300px] overflow-y-auto custom-scrollbar font-mono text-xs select-none">
          <div className="font-bold text-white mb-2 border-b border-[#1f1f1f] pb-1">
            {roundData.raceName} (Round {roundData.round})
          </div>
          <div className="space-y-1">
            {sortedPositions.map((item) => {
              const color = standingsTab === 'drivers'
                ? activeStandings.find((d: any) => d.driverCode === item.name)?.teamColor || '#fff'
                : activeStandings.find((c: any) => c.name === item.name)?.teamColor || '#fff';
              return (
                <div key={item.name} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5" style={{ color }}>
                    <span className="w-1.5 h-1.5 rounded-2xl" style={{ backgroundColor: color }} />
                    {item.name}
                  </span>
                  <span className="text-neutral-400 font-bold">P{item.pos}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomStatsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111] border border-[#1f1f1f] p-3 rounded-lg shadow-xl font-mono text-xs select-none">
          <div className="font-bold text-white mb-2">{data.name}</div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-blue-400">Wins:</span>
              <span className="text-white font-bold">{data.wins}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-indigo-400">Podiums:</span>
              <span className="text-white font-bold">{data.podiums}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#6366f1]">Point Finishes:</span>
              <span className="text-white font-bold">{data.pointFinishes}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-pink-400">DNFs:</span>
              <span className="text-white font-bold">{Math.abs(data.dnfs)}</span>
            </div>
            {data.poles !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-amber-400">Poles:</span>
                <span className="text-white font-bold">{data.poles}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const percentage = totalPoints > 0 ? ((data.value / totalPoints) * 100).toFixed(1) : '0.0';
      return (
        <div className="bg-[#111] border border-[#1f1f1f] p-2 rounded shadow-xl font-mono text-xs text-white select-none">
          <span className="font-bold" style={{ color: data.color }}>{data.name}</span>: {data.value} Pts ({percentage}%)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2">
              CHAMPIONSHIP STANDINGS
            </h1>
            <p className="text-neutral-500 font-medium">
              Official FIA Formula 1 World Championship standings and performance analysis.
            </p>
          </div>

          {/* Year selector pills */}
          <div className="flex bg-[#111] p-1 border border-[#1f1f1f] rounded-lg">
            {['2024', '2025', '2026'].map((yr) => (
              <button
                key={yr}
                onClick={() => setYear(yr)}
                className={`px-4 py-1.5 rounded-md text-xs font-black tracking-widest transition-colors ${
                  year === yr
                    ? 'bg-blue-600 text-white'
                    : 'text-[#737373] hover:text-white bg-neutral-800'
                }`}
                style={{ marginRight: yr !== '2026' ? '4px' : '0px' }}
              >
                {yr}
              </button>
            ))}
          </div>
        </header>

        {/* Tab Toggle: Drivers ↔ Constructors */}
        <div className="flex bg-[#111]/80 rounded-xl p-1 border border-[#1f1f1f] mb-8 max-w-xs">
          {(['drivers', 'constructors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStandingsTab(tab)}
              className={`flex-1 text-center py-2 text-xs font-black tracking-widest rounded-lg transition-colors uppercase ${
                standingsTab === tab 
                  ? 'bg-neutral-800 text-white shadow-md' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error Handling */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Could not load standings data</h3>
            <p className="text-neutral-500 text-sm mb-4">Please verify internet connection or try again.</p>
            <button
              onClick={() => fetchData(year)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors font-mono text-xs uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        ) : (
          /* ===== DASHBOARD LAYOUT ===== */
          <div className="grid grid-cols-1 lg:grid-cols-[27%_43%_30%] gap-6 items-stretch">
            
            {/* COLUMN 1: STANDINGS LIST */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 shadow-xl flex flex-col h-[780px] overflow-hidden">
              <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4 border-b border-[#1f1f1f] pb-3 flex items-center gap-2">
                <Trophy className="text-yellow-500 w-4 h-4" />
                {standingsTab === 'drivers' ? 'Driver Standings' : 'Constructor Standings'}
              </h2>

              {listLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <Spin size="large" />
                </div>
              ) : activeStandings.length === 0 ? (
                <div className="flex items-center justify-center flex-1 font-mono text-xs text-neutral-600">
                  Season data not yet available for {year}
                </div>
              ) : (
                <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar space-y-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${standingsTab}-${year}`}
                      variants={listContainerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-1.5"
                    >
                      {activeStandings.map((item: any, idx: number) => {
                        const isP1 = item.position === 1;
                        const isP2 = item.position === 2;
                        const isP3 = item.position === 3;
                        const isTop3 = isP1 || isP2 || isP3;
                        const opacity = isP1 ? 0.9 : isP2 ? 0.6 : 0.3;

                        // Width proportional to leader points (from 60px to 200px)
                        const bgWidth = maxPoints > 0 
                          ? 60 + (item.points / maxPoints) * (200 - 60) 
                          : 60;

                        return (
                          <motion.div
                            key={item.driverCode || item.name}
                            variants={listItemVariants}
                            className="flex items-center justify-between py-2 px-3 rounded-lg relative overflow-hidden h-[46px] bg-transparent border-b border-zinc-900/50"
                          >
                            {/* Proportional background pill for top 3 */}
                            {isTop3 ? (
                              <div
                                className="absolute top-1 bottom-1 left-12 rounded-lg z-0 pointer-events-none"
                                style={{
                                  width: `${bgWidth}px`,
                                  background: `linear-gradient(90deg, ${item.teamColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, rgba(17,17,17,0) 100%)`,
                                }}
                              />
                            ) : (
                              // Left border line for P4+
                              <div 
                                className="absolute left-1 top-2.5 bottom-2.5 w-[3px] rounded"
                                style={{ backgroundColor: item.teamColor }}
                              />
                            )}

                            {/* Position & Name */}
                            <div className="flex items-center gap-3 z-10">
                              <span className="font-mono font-black text-white text-xs w-6 text-center">
                                {item.position}
                              </span>
                              <div className="flex flex-col">
                                {standingsTab === 'drivers' ? (
                                  <span className="text-white text-xs font-semibold leading-tight">
                                    {item.firstName}{' '}
                                    <span className="font-black uppercase tracking-wide">
                                      {item.lastName}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-white text-xs font-black uppercase tracking-wide leading-tight">
                                    {item.name}
                                  </span>
                                )}
                                {standingsTab === 'drivers' && (
                                  <span className="text-[9px] text-neutral-500 font-bold uppercase mt-0.5" style={{ color: item.teamColor }}>
                                    {item.teamName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Points */}
                            <div className="text-right z-10">
                              <span className="font-mono font-black text-xs text-white">
                                {item.points} <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Pts</span>
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* COLUMN 2: CHARTS */}
            <div className="flex flex-col justify-between h-[780px] gap-6">
              
              {/* TOP: RANKING EVOLUTION (BUMP CHART) */}
              <div className="flex-1 flex flex-col min-h-[350px] relative">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4">
                  {standingsTab === 'drivers' ? 'Driver Ranking Evo' : 'Constructor Ranking Evo'}
                </h3>

                {chartsLoading ? (
                  <div className="flex items-center justify-center flex-1 bg-black/10 rounded-2xl border border-[#1f1f1f]/50">
                    <Spin size="default" />
                  </div>
                ) : rankingEvoData.length <= 1 ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-black/15 rounded-2xl border border-[#1f1f1f]/50 p-6 text-center select-none">
                    <span className="text-neutral-500 font-mono text-xs">
                      More data available after Round 2
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={rankingEvoData}
                        margin={{ top: 15, right: 35, left: -25, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="raceAbbr"
                          stroke="none"
                          tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="number"
                          domain={[1, standingsTab === 'drivers' ? 22 : 10]}
                          reversed
                          ticks={Array.from({ length: standingsTab === 'drivers' ? 22 : 10 }).map((_, i) => i + 1)}
                          stroke="none"
                          tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomRankingTooltip />} />
                        {activeEntities.map((ent: any) => (
                          <Line
                            key={ent.key}
                            type="monotone"
                            dataKey={ent.key}
                            stroke={ent.color}
                            strokeWidth={2}
                            dot={{ r: 4, fill: ent.color, stroke: ent.color, strokeWidth: 1 }}
                            activeDot={{ r: 6 }}
                            label={(props: any) => <CustomLabel {...props} code={ent.label} color={ent.color} dataLength={rankingEvoData.length} />}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* BOTTOM: STATS BAR CHART */}
              <div className="flex-1 flex flex-col min-h-[350px] relative">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-4">
                  {standingsTab === 'drivers' ? 'Driver Stats' : 'Constructor Stats'}
                </h3>

                {chartsLoading ? (
                  <div className="flex items-center justify-center flex-1 bg-black/10 rounded-2xl border border-[#1f1f1f]/50">
                    <Spin size="default" />
                  </div>
                ) : statsData.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-black/15 rounded-2xl border border-[#1f1f1f]/50 p-6 text-center select-none">
                    <span className="text-neutral-500 font-mono text-xs">No statistics available</span>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statsData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 25 }}
                        barSize={8}
                        barGap={2}
                      >
                        <XAxis
                          dataKey="name"
                          stroke="none"
                          tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace', angle: -45, textAnchor: 'end', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="none"
                          tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomStatsTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <ReferenceLine y={0} stroke="#222" strokeWidth={1} />
                        
                        <Bar dataKey="wins" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="podiums" fill="#818cf8" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="pointFinishes" fill="#6366f1" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="dnfs" fill="#ec4899" radius={[0, 0, 2, 2]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: POINT SHARE PIE CHART & LEGEND */}
            <div className="flex flex-col justify-between h-[780px] select-none">
              
              {/* POINT SHARE */}
              <div className="flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-6">
                  Point Share
                </h3>

                {listLoading ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <Spin size="default" />
                  </div>
                ) : pieData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center font-mono text-xs text-neutral-600">
                    No points distributed
                  </div>
                ) : (
                  <div className="relative w-full h-[220px]">
                    {/* Donut hole overlays */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none">Total Pts</span>
                      <span className="text-xl font-black text-white font-mono mt-1">{totalPoints}</span>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                        {activeStandings.length} {standingsTab === 'drivers' ? 'Drivers' : 'Teams'}
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomPieTooltip />} />
                        <PieAny
                          activeIndex={activePieIndex !== null ? activePieIndex : undefined}
                          activeShape={renderActiveShape}
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          dataKey="value"
                          onMouseEnter={(_: any, idx: number) => setActivePieIndex(idx)}
                          onMouseLeave={() => setActivePieIndex(null)}
                          stroke="#0a0a0a"
                          strokeWidth={1.5}
                          isAnimationActive={false}
                        >
                          {pieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </PieAny>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* LEGEND (Bottom of Column 3) */}
              <div className="mt-auto pt-6 border-t border-[#1f1f1f] flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">
                  Stats Legend
                </span>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-2xl bg-[#3b82f6] shrink-0" />
                    <span>Win</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-2xl bg-[#818cf8] shrink-0" />
                    <span>Podium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-2xl bg-[#6366f1] shrink-0" />
                    <span>Points Finish</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-2xl bg-[#ec4899] shrink-0" />
                    <span>DNFs</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
