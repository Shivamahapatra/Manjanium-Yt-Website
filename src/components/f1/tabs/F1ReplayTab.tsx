"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Table, Tag, Spin, Slider, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Activity,
  Clock,
  RotateCcw,
  Trophy,
  FastForward,
  Loader2
} from 'lucide-react';
import { getTeamColor, formatGap } from '@/lib/f1-helpers';

const OPENF1_COUNTRIES: Record<string, string> = {
  'USA': 'United States',
  'United States': 'United States',
  'UK': 'Great Britain',
  'Great Britain': 'Great Britain',
  'UAE': 'Abu Dhabi',
  'Abu Dhabi': 'Abu Dhabi',
  'Saudi Arabia': 'Saudi Arabia',
  'Monaco': 'Monaco',
  'Spain': 'Spain',
  'Austria': 'Austria',
  'Hungary': 'Hungary',
  'Belgium': 'Belgium',
  'Netherlands': 'Netherlands',
  'Italy': 'Italy',
  'Singapore': 'Singapore',
  'Japan': 'Japan',
  'Qatar': 'Qatar',
  'Azerbaijan': 'Azerbaijan',
  'Mexico': 'Mexico',
  'Brazil': 'Brazil',
  'Bahrain': 'Bahrain',
  'Australia': 'Australia',
  'China': 'China',
  'Canada': 'Canada',
};

const SESSION_MAP: Record<string, string> = {
  'FP1': 'Practice 1',
  'FP2': 'Practice 2',
  'FP3': 'Practice 3',
  'Q': 'Qualifying',
  'Race': 'Race',
  'Sprint': 'Sprint',
};

// MotionRow for layout animation
const MotionRow = (props: any) => (
  <motion.tr
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    {...props}
  />
);

export function F1ReplayTab() {
  const [year, setYear] = useState('2025');
  const [gpRounds, setGpRounds] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [sessionType, setSessionType] = useState('Race');
  const [loading, setLoading] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Replay playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 5x, 15x, 30x, 60x
  const [playbackTime, setPlaybackTime] = useState(0); // Current playback time in seconds
  const [sessionDuration, setSessionDuration] = useState(0); // Total session duration in seconds

  // Raw fetched replay data
  const [rawPositions, setRawPositions] = useState<any[]>([]);
  const [rawIntervals, setRawIntervals] = useState<any[]>([]);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimeRef = useRef(0);

  const years = ['2026', '2025', '2024', '2023'];
  const sessionOptions = [
    { value: 'FP1', label: 'FP1' },
    { value: 'FP2', label: 'FP2' },
    { value: 'FP3', label: 'FP3' },
    { value: 'Q', label: 'Qualifying' },
    { value: 'Race', label: 'Race' },
    { value: 'Sprint', label: 'Sprint' },
  ];

  // Fetch GP rounds when year changes
  useEffect(() => {
    const fetchGpCalendar = async () => {
      try {
        const res = await fetch(`/api/f1/calendar?year=${year}`);
        const json = await res.json();
        if (json.calendar && Array.isArray(json.calendar)) {
          setGpRounds(json.calendar);
          if (json.calendar.length > 0) {
            setSelectedRound(json.calendar[json.calendar.length - 1].round);
          }
        }
      } catch (err) {
        console.error('Failed to fetch calendar:', err);
      }
    };
    fetchGpCalendar();
  }, [year]);

  // Clean up playback timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync ref with state to prevent closure issues in interval
  useEffect(() => {
    playbackTimeRef.current = playbackTime;
  }, [playbackTime]);

  const loadSessionReplay = async () => {
    const roundData = gpRounds.find((r) => r.round === selectedRound);
    if (!roundData) return;

    setLoading(true);
    setSessionLoaded(false);
    setErrorMsg('');
    setIsPlaying(false);
    setPlaybackTime(0);
    playbackTimeRef.current = 0;

    try {
      // 1. Resolve country name to OpenF1 standard
      const calendarCountry = roundData.Circuit?.Location?.country || '';
      const openF1Country = OPENF1_COUNTRIES[calendarCountry] || calendarCountry;

      // 2. Query sessions endpoint for session key
      const mappedSessionType = SESSION_MAP[sessionType] || sessionType;
      const sessionRes = await fetch(
        `/api/f1/sessions?year=${year}&country_name=${encodeURIComponent(openF1Country)}&session_type=${encodeURIComponent(mappedSessionType)}`
      );
      const sessionJson = await sessionRes.json();
      const sessions = sessionJson.sessions || [];

      if (sessions.length === 0) {
        throw new Error(`No matching ${sessionType} session found for this GP.`);
      }

      const activeSession = sessions[0];
      setSessionInfo(activeSession);
      const sKey = activeSession.session_key;

      // 3. Fetch all positions, intervals, and drivers for this session
      const liveRes = await fetch(`/api/f1/live?session_key=${sKey}`);
      const liveJson = await liveRes.json();

      if (!liveJson.positions || liveJson.positions.length === 0) {
        throw new Error('No historical timing logs found for this session.');
      }

      // 4. Map drivers for metadata lookup
      if (liveJson.drivers && Array.isArray(liveJson.drivers)) {
        const dMap: Record<string, any> = {};
        liveJson.drivers.forEach((d: any) => {
          dMap[d.driver_number] = d;
        });
        setDriversMap(dMap);
      }

      // 5. Store logs and calculate session length
      const positionsData = Array.isArray(liveJson.positions) ? liveJson.positions : [];
      const intervalsData = Array.isArray(liveJson.intervals) ? liveJson.intervals : [];

      // Sort by date to find bounds
      positionsData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      intervalsData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setRawPositions(positionsData);
      setRawIntervals(intervalsData);

      const sessionStart = new Date(activeSession.date_start || positionsData[0].date).getTime();
      const sessionEnd = new Date(activeSession.date_end || positionsData[positionsData.length - 1].date).getTime();
      const totalSeconds = Math.max(60, Math.floor((sessionEnd - sessionStart) / 1000));

      setSessionDuration(totalSeconds);
      setSessionLoaded(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load session replay data.');
    } finally {
      setLoading(false);
    }
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying && sessionLoaded) {
      timerRef.current = setInterval(() => {
        const nextTime = playbackTimeRef.current + playbackSpeed * 0.1;
        if (nextTime >= sessionDuration) {
          setPlaybackTime(sessionDuration);
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setPlaybackTime(nextTime);
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, sessionDuration, sessionLoaded]);

  // Compute timing tower rows for the current playback time
  const currentTimingRows = useMemo(() => {
    if (!sessionLoaded || !sessionInfo || rawPositions.length === 0) return [];

    const sessionStart = new Date(sessionInfo.date_start || rawPositions[0].date).getTime();
    const currentTargetTimestamp = sessionStart + playbackTime * 1000;

    // 1. Get latest position of each driver at current timestamp
    const latestPositions = new Map<number, any>();
    rawPositions.forEach((pos) => {
      const posTime = new Date(pos.date).getTime();
      if (posTime <= currentTargetTimestamp) {
        latestPositions.set(pos.driver_number, pos);
      }
    });

    // 2. Get latest interval of each driver at current timestamp
    const latestIntervals = new Map<number, any>();
    rawIntervals.forEach((intv) => {
      const intvTime = new Date(intv.date).getTime();
      if (intvTime <= currentTargetTimestamp) {
        latestIntervals.set(intv.driver_number, intv);
      }
    });

    // 3. Merge data
    const rows = Array.from(latestPositions.values()).map((pos) => {
      const intv = latestIntervals.get(pos.driver_number);
      return {
        ...pos,
        gap_to_leader: intv?.gap_to_leader ?? '-',
        interval: intv?.interval ?? '-',
      };
    });

    // Sort by position
    rows.sort((a, b) => a.position - b.position);
    return rows;
  }, [sessionLoaded, sessionInfo, rawPositions, rawIntervals, playbackTime]);

  const formatPlaybackLabel = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: <span className="text-[#737373] text-xs font-bold font-sans">POS</span>,
      dataIndex: 'position',
      key: 'position',
      width: 80,
      render: (pos: number) => (
        <span className="font-bold text-white font-mono">P{pos}</span>
      ),
    },
    {
      title: <span className="text-[#737373] text-xs font-bold font-sans">DRIVER</span>,
      key: 'driver',
      render: (_: any, record: any) => {
        const driver = driversMap[record.driver_number];
        return (
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-base font-mono">
              {driver?.name_acronym || record.driver_number}
            </span>
            <span className="text-xs text-neutral-500 font-sans hidden sm:inline">
              {driver?.broadcast_name || driver?.full_name}
            </span>
          </div>
        );
      },
    },
    {
      title: <span className="text-[#737373] text-xs font-bold font-sans">TEAM</span>,
      key: 'team',
      render: (_: any, record: any) => {
        const driver = driversMap[record.driver_number];
        return (
          <span className="text-neutral-400 text-sm font-sans">
            {driver?.team_name || '-'}
          </span>
        );
      },
    },
    {
      title: <span className="text-[#737373] text-xs font-bold font-sans">GAP TO LEADER</span>,
      dataIndex: 'gap_to_leader',
      key: 'gap',
      align: 'right' as const,
      render: (gap: any) => (
        <span className="font-mono text-sm font-bold text-white">
          {formatGap(gap)}
        </span>
      ),
    },
    {
      title: <span className="text-[#737373] text-xs font-bold font-sans">INTERVAL</span>,
      dataIndex: 'interval',
      key: 'interval',
      align: 'right' as const,
      render: (interval: any) => (
        <span className="font-mono text-sm text-neutral-400">
          {formatGap(interval)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 min-h-full bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-white" />
            SESSION REPLAY
          </h1>
          <p className="text-neutral-500">
            Select a previous Grand Prix weekend session and play back the full timing sheet.
          </p>
        </header>

        {/* Configurations Bar */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4 mb-8">
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

            {/* Session Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Session
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="bg-black text-white border border-[#333] rounded-md px-3 py-1.5 outline-none focus:border-blue-500"
              >
                {sessionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Load Button */}
            <button
              onClick={loadSessionReplay}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-1.5 rounded-md font-bold transition-colors flex items-center gap-2 self-end"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Session'
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Main Content Pane */}
        {!sessionLoaded ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-500 bg-[#111111]/30 border border-[#1f1f1f] border-dashed rounded-2xl">
            <RotateCcw className="w-16 h-16 mb-4 text-neutral-700" />
            <p className="text-lg font-medium">
              Configure parameters above and click "Load Session" to prepare replay timeline.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Playback HUD controls */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                {/* Control buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white translate-x-[1px]" />}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-blue-600 border-none hover:!bg-blue-500 flex items-center justify-center"
                  />
                  <Button
                    shape="circle"
                    size="large"
                    icon={<Square className="w-4 h-4" />}
                    onClick={() => {
                      setIsPlaying(false);
                      setPlaybackTime(0);
                    }}
                    className="bg-[#1f1f1f] border-none text-white hover:!bg-[#2a2a2a] flex items-center justify-center"
                  />

                  {/* Playback speed buttons */}
                  <div className="ml-3 flex items-center bg-black/60 rounded-lg p-1 border border-[#1f1f1f]">
                    {[1, 5, 15, 30, 60].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-3 py-1 text-xs font-bold font-mono rounded transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-[#1f1f1f] text-white'
                            : 'text-[#737373] hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Display */}
                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
                      Timeline
                    </span>
                    <span className="text-xl font-bold font-mono text-white">
                      {formatPlaybackLabel(playbackTime)} / {formatPlaybackLabel(sessionDuration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="px-2">
                <Slider
                  min={0}
                  max={sessionDuration}
                  value={Math.floor(playbackTime)}
                  onChange={(val) => setPlaybackTime(val)}
                  tooltip={{ formatter: (val) => formatPlaybackLabel(val || 0) }}
                  className="m-0"
                />
              </div>
            </div>

            {/* Timing Sheet Tower */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Timing Tower</h2>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="text-xs text-neutral-400 font-mono">
                    Replaying telemetry
                  </span>
                </div>
              </div>

              <Table
                components={{ body: { row: MotionRow } }}
                dataSource={currentTimingRows}
                columns={columns}
                pagination={false}
                rowKey="driver_number"
                onRow={(record: any) => {
                  const driver = driversMap[record.driver_number];
                  const color = getTeamColor(driver?.team_name || '', driver?.team_colour);
                  return {
                    style: { borderLeft: `3px solid ${color}` },
                    className: record.position === 1
                      ? '!bg-[#1a1a1a] hover:!bg-[#222] transition-colors'
                      : '!bg-[#111111] hover:!bg-[#1a1a1a] transition-colors',
                  } as any;
                }}
                className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50 dark:[&_.ant-table-row]:!border-b dark:[&_.ant-table-row]:!border-zinc-800/50 [&_.ant-table-cell]:!border-none"
                scroll={{ x: 'max-content' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
