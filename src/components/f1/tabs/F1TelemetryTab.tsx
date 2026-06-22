"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart2, TrendingUp, Settings, Gauge, GitCompareArrows, Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { getTeamColor } from '@/lib/f1-helpers';

interface CalendarRound {
  round: string;
  raceName: string;
  Circuit?: { circuitName: string };
}

interface DriverEntry {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
}

export function F1TelemetryTab() {
  const [year, setYear] = useState('2025');
  const [gpRounds, setGpRounds] = useState<CalendarRound[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [session, setSession] = useState('R');
  const [driver1, setDriver1] = useState<string>('');
  const [driver2, setDriver2] = useState<string>('');
  const [drivers, setDrivers] = useState<DriverEntry[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const years = ['2026', '2025', '2024', '2023'];
  const sessions = [
    { value: 'FP1', label: 'FP1' },
    { value: 'FP2', label: 'FP2' },
    { value: 'FP3', label: 'FP3' },
    { value: 'Q', label: 'Qualifying' },
    { value: 'R', label: 'Race' },
  ];

  // Fetch calendar rounds when year changes
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(`/api/f1/calendar?year=${year}`);
        const data = await res.json();
        if (data.races && Array.isArray(data.races)) {
          setGpRounds(data.races);
          if (data.races.length > 0) {
            setSelectedRound(data.races[data.races.length - 1].round);
          }
        }
      } catch (err) {
        console.error('Failed to fetch calendar:', err);
      }
    };
    fetchCalendar();
  }, [year]);

  // Fetch drivers list on mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/f1/live');
        const data = await res.json();
        if (data.drivers && Array.isArray(data.drivers)) {
          setDrivers(data.drivers);
          if (data.drivers.length >= 2) {
            setDriver1(data.drivers[0].driver_number.toString());
            setDriver2(data.drivers[1].driver_number.toString());
          }
        }
      } catch (err) {
        console.error('Failed to fetch drivers:', err);
      }
    };
    fetchDrivers();
  }, []);

  const fetchTelemetry = useCallback(async () => {
    if (!driver1 || !driver2 || !selectedRound) return;
    setLoading(true);
    setHasFetched(true);
    try {
      const res = await fetch(
        `/api/f1/telemetry?year=${year}&round=${selectedRound}&session=${session}&d1=${driver1}&d2=${driver2}`
      );
      const data = await res.json();

      if (data.telemetry && data.telemetry.length === 2) {
        const p1Data = data.telemetry[0];
        const p2Data = data.telemetry[1];
        const maxLen = Math.max(p1Data.length, p2Data.length);

        const merged = [];
        for (let i = 0; i < maxLen; i++) {
          const d1 = p1Data[i] || {};
          const d2 = p2Data[i] || {};
          merged.push({
            distance: i,
            p1Speed: d1.speed ?? null,
            p1Throttle: d1.throttle ?? null,
            p1Brake: d1.brake ?? null,
            p1Gear: d1.n_gear ?? null,
            p2Speed: d2.speed ?? null,
            p2Throttle: d2.throttle ?? null,
            p2Brake: d2.brake ?? null,
            p2Gear: d2.n_gear ?? null,
            delta:
              d1.speed != null && d2.speed != null
                ? d1.speed - d2.speed
                : null,
          });
        }
        setTelemetry(merged);
      } else {
        setTelemetry([]);
      }
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
      setTelemetry([]);
    } finally {
      setLoading(false);
    }
  }, [year, selectedRound, session, driver1, driver2]);

  const d1Info = drivers.find((d) => d.driver_number.toString() === driver1);
  const d2Info = drivers.find((d) => d.driver_number.toString() === driver2);

  const d1Color = d1Info ? `#${d1Info.team_colour}` : '#3b82f6';
  const d2Color = d2Info ? `#${d2Info.team_colour}` : '#ef4444';
  const d1Name = d1Info?.name_acronym || 'D1';
  const d2Name = d2Info?.name_acronym || 'D2';

  const tooltipStyle = {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
  };

  const chartConfigs = [
    {
      title: 'Speed (km/h)',
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      height: 'h-64',
      lines: [
        { key: 'p1Speed', name: d1Name, color: d1Color, type: 'monotone' as const },
        { key: 'p2Speed', name: d2Name, color: d2Color, type: 'monotone' as const },
      ],
      domain: ['auto', 'auto'] as [string, string],
    },
    {
      title: 'Throttle (%)',
      icon: <Gauge className="w-5 h-5 text-green-400" />,
      height: 'h-48',
      lines: [
        { key: 'p1Throttle', name: d1Name, color: d1Color, type: 'stepAfter' as const },
        { key: 'p2Throttle', name: d2Name, color: d2Color, type: 'stepAfter' as const },
      ],
      domain: [0, 100] as [number, number],
    },
    {
      title: 'Brake',
      icon: <Settings className="w-5 h-5 text-red-500" />,
      height: 'h-40',
      lines: [
        { key: 'p1Brake', name: d1Name, color: d1Color, type: 'stepAfter' as const },
        { key: 'p2Brake', name: d2Name, color: d2Color, type: 'stepAfter' as const },
      ],
      domain: [0, 100] as [number, number],
    },
    {
      title: 'Gear',
      icon: <Settings className="w-5 h-5 text-amber-400" />,
      height: 'h-40',
      lines: [
        { key: 'p1Gear', name: d1Name, color: d1Color, type: 'stepAfter' as const },
        { key: 'p2Gear', name: d2Name, color: d2Color, type: 'stepAfter' as const },
      ],
      domain: [0, 8] as [number, number],
    },
  ];

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-white" />
            TELEMETRY ANALYSIS
          </h1>
          <p className="text-neutral-500">
            Head-to-head driver comparison with full telemetry traces.
          </p>
        </header>

        {/* Controls Bar */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 mb-8">
          <div className="flex flex-wrap items-end gap-4">
            {/* Year */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Year
              </label>
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
            </div>

            {/* Grand Prix */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Grand Prix
              </label>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500 min-w-[180px]"
              >
                {gpRounds.map((gp) => (
                  <option key={gp.round} value={gp.round}>
                    R{gp.round} — {gp.raceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
              >
                {sessions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver A */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Driver A
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-2xl shrink-0"
                  style={{ backgroundColor: d1Color }}
                />
                <select
                  value={driver1}
                  onChange={(e) => setDriver1(e.target.value)}
                  className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
                >
                  {drivers.map((d) => (
                    <option
                      key={`d1-${d.driver_number}`}
                      value={d.driver_number.toString()}
                    >
                      {d.full_name} ({d.name_acronym})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Driver B */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Driver B
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-2xl shrink-0"
                  style={{ backgroundColor: d2Color }}
                />
                <select
                  value={driver2}
                  onChange={(e) => setDriver2(e.target.value)}
                  className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
                >
                  {drivers.map((d) => (
                    <option
                      key={`d2-${d.driver_number}`}
                      value={d.driver_number.toString()}
                    >
                      {d.full_name} ({d.name_acronym})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compare Button */}
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-1.5 rounded-md font-bold transition-colors flex items-center gap-2 self-end"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitCompareArrows className="w-4 h-4" />
              )}
              Compare
            </button>
          </div>
        </div>

        {/* Charts */}
        {!hasFetched && telemetry.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <BarChart2 className="w-16 h-16 mb-4 text-neutral-700" />
            <p className="text-lg font-medium">
              Select drivers and session, then press Compare
            </p>
          </div>
        )}

        {hasFetched && telemetry.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <p className="text-lg font-medium">
              No telemetry data available for this combination.
            </p>
          </div>
        )}

        {telemetry.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Speed, Throttle, Brake, Gear charts */}
            {chartConfigs.map((chart, idx) => (
              <motion.div
                key={chart.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="w-full rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {chart.icon} {chart.title}
                </h3>
                <div className={`w-full ${chart.height}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={telemetry}
                      syncId="telemetry"
                      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#222"
                        vertical={false}
                      />
                      <XAxis dataKey="distance" hide />
                      <YAxis
                        domain={chart.domain}
                        stroke="#666"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      {chart.lines.map((line) => (
                        <Line
                          key={line.key}
                          type={line.type}
                          dataKey={line.key}
                          name={line.name}
                          stroke={line.color}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}

            {/* Delta Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GitCompareArrows className="w-5 h-5 text-cyan-400" /> Speed
                Delta ({d1Name} - {d2Name})
              </h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={telemetry}
                    syncId="telemetry"
                    margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#222"
                      vertical={false}
                    />
                    <XAxis dataKey="distance" hide />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke="#666"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="delta"
                      name="Speed Delta"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
