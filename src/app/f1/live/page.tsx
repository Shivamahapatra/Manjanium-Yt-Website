"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Table, Tag, Spin, Slider } from 'antd';
import { motion } from 'framer-motion';
import {
  Wind,
  Thermometer,
  CloudRain,
  Radio,
  Volume2,
  AlertTriangle,
  Play,
  Activity
} from 'lucide-react';
import { getTeamColor, formatGap } from '@/lib/f1-helpers';

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

export default function LiveDashboardPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [weather, setWeather] = useState<any>(null);
  const [raceControl, setRaceControl] = useState<any[]>([]);
  const [teamRadio, setTeamRadio] = useState<any[]>([]);
  const [delay, setDelay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // History buffer for delay slider
  const historyRef = useRef<Array<{ timestamp: number; positions: any[]; intervals: any[] }>>([]);

  // Process raw position and interval data
  const processAndSetPositions = useCallback((rawPositions: any[], rawIntervals: any[]) => {
    if (!Array.isArray(rawPositions)) return;

    const latestPositions = new Map();
    rawPositions.forEach((p: any) => {
      if (!latestPositions.has(p.driver_number) || new Date(p.date) > new Date(latestPositions.get(p.driver_number).date)) {
        latestPositions.set(p.driver_number, p);
      }
    });

    const latestIntervals = new Map();
    if (Array.isArray(rawIntervals)) {
      rawIntervals.forEach((i: any) => {
        if (!latestIntervals.has(i.driver_number) || new Date(i.date) > new Date(latestIntervals.get(i.driver_number).date)) {
          latestIntervals.set(i.driver_number, i);
        }
      });
    }

    const merged = Array.from(latestPositions.values()).map(pos => {
      const intv = latestIntervals.get(pos.driver_number);
      return {
        ...pos,
        gap_to_leader: intv?.gap_to_leader ?? '-',
        interval: intv?.interval ?? '-',
      };
    }).sort((a, b) => a.position - b.position);

    setPositions(merged);
  }, []);

  // Fetch live timing data (positions, intervals, drivers) every 3 seconds
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch('/api/f1/live');
        const json = await res.json();

        if (json.drivers && Array.isArray(json.drivers)) {
          const map: Record<string, any> = {};
          json.drivers.forEach((d: any) => {
            map[d.driver_number] = d;
          });
          setDriversMap(map);
        }

        if (Array.isArray(json.positions)) {
          // Push to history buffer
          historyRef.current.push({
            timestamp: Date.now(),
            positions: json.positions,
            intervals: json.intervals || []
          });

          // Cap buffer size to avoid memory bloat (keep last 300 snapshots, i.e., ~15 mins)
          if (historyRef.current.length > 300) {
            historyRef.current.shift();
          }

          // If delay is 0, update display immediately
          if (delay === 0) {
            processAndSetPositions(json.positions, json.intervals || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch live data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [delay, processAndSetPositions]);

  // Periodic display update for delay buffer (runs every 1 second)
  useEffect(() => {
    const updateDisplay = () => {
      if (historyRef.current.length === 0 || delay === 0) return;

      const targetTime = Date.now() - delay * 1000;
      let selectedSnapshot = historyRef.current[0];

      // Find the latest snapshot that is older than targetTime
      for (let i = historyRef.current.length - 1; i >= 0; i--) {
        if (historyRef.current[i].timestamp <= targetTime) {
          selectedSnapshot = historyRef.current[i];
          break;
        }
      }

      processAndSetPositions(selectedSnapshot.positions, selectedSnapshot.intervals);
    };

    const interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [delay, processAndSetPositions]);

  // Fetch Weather every 30 seconds
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/f1/weather');
        const json = await res.json();
        if (Array.isArray(json.weather) && json.weather.length > 0) {
          setWeather(json.weather[json.weather.length - 1]);
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Race Control every 5 seconds
  useEffect(() => {
    const fetchRaceControl = async () => {
      try {
        const res = await fetch('/api/f1/racecontrol');
        const json = await res.json();
        if (Array.isArray(json.racecontrol)) {
          setRaceControl(json.racecontrol.slice(-15).reverse());
        }
      } catch (err) {
        console.error("Failed to fetch race control", err);
      }
    };
    fetchRaceControl();
    const interval = setInterval(fetchRaceControl, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Team Radio every 5 seconds
  useEffect(() => {
    const fetchRadio = async () => {
      try {
        const res = await fetch('/api/f1/radio');
        const json = await res.json();
        if (Array.isArray(json.radio)) {
          setTeamRadio(json.radio.slice(-15).reverse());
        }
      } catch (err) {
        console.error("Failed to fetch radio", err);
      }
    };
    fetchRadio();
    const interval = setInterval(fetchRadio, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayAudio = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingAudio(url);
      audioRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
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
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              LIVE TIMING
            </h1>
            <p className="text-neutral-500">
              Real-time telemetry and race control messages directly from the track.
            </p>
          </div>
          {delay > 0 && (
            <Tag color="orange" className="font-mono font-bold px-3 py-1 border-none bg-amber-500/20 text-amber-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              DELAYED BY {delay}s
            </Tag>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Timing Tower */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-4">Timing Tower</h2>
              
              <Table
                components={{ body: { row: MotionRow } }}
                dataSource={positions}
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
                      : '!bg-[#111111] hover:!bg-[#1a1a1a] transition-colors'
                  } as any;
                }}
                className="manjanium-table dark:[&_.ant-table]:!bg-transparent dark:[&_.ant-table-thead_th]:!bg-zinc-800/50 dark:[&_.ant-table-row]:!border-b dark:[&_.ant-table-row]:!border-zinc-800/50 [&_.ant-table-cell]:!border-none"
                scroll={{ x: 'max-content' }}
              />

              {/* Delay Slider */}
              <div className="mt-6 border-t border-[#1f1f1f] pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Broadcast Delay</span>
                  <span className="text-xs text-neutral-500 font-mono">
                    Delay: {delay}s {delay === 0 ? '(Real-time)' : ''}
                  </span>
                </div>
                <div className="flex-1 md:max-w-md">
                  <Slider
                    min={0}
                    max={60}
                    value={delay}
                    onChange={(val) => setDelay(val)}
                    tooltip={{ formatter: (val) => `${val}s` }}
                    className="m-0"
                  />
                </div>
              </div>
            </div>

            {/* Weather, Race Control, Team Radio Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weather Widget */}
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-400" />
                  Weather Station
                </h3>
                {weather ? (
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="bg-black/40 border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-red-400" /> Air Temp
                      </span>
                      <span className="text-2xl font-bold font-mono text-white">
                        {weather.air_temperature}°C
                      </span>
                    </div>
                    <div className="bg-black/40 border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Track Temp
                      </span>
                      <span className="text-2xl font-bold font-mono text-white">
                        {weather.track_temperature}°C
                      </span>
                    </div>
                    <div className="bg-black/40 border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" /> Wind Speed
                      </span>
                      <span className="text-2xl font-bold font-mono text-white">
                        {weather.wind_speed} m/s
                      </span>
                    </div>
                    <div className="bg-black/40 border border-[#1f1f1f] p-4 rounded-xl flex flex-col justify-center">
                      <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rainfall
                      </span>
                      <span className={`text-2xl font-bold font-mono ${weather.rainfall ? 'text-blue-400 animate-pulse' : 'text-neutral-400'}`}>
                        {weather.rainfall ? 'WET' : 'DRY'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 py-10 text-neutral-500">
                    No weather data active.
                  </div>
                )}
              </div>

              {/* Race Control Message Feed */}
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl flex flex-col h-[400px]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Race Control
                </h3>
                <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                  {raceControl.length > 0 ? (
                    raceControl.map((msg, idx) => {
                      const isWarning = /safety car|red flag|vsc|steward|investig/i.test(msg.message);
                      return (
                        <div
                          key={idx}
                          className={`p-3 bg-black/40 rounded-xl border transition-colors ${
                            isWarning 
                              ? 'border-amber-500/30 hover:border-amber-500/50' 
                              : 'border-[#1f1f1f] hover:border-[#333]'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              isWarning ? 'text-amber-400' : 'text-neutral-400'
                            }`}>
                              {msg.category || 'Message'}
                            </span>
                            <span className="text-[10px] text-neutral-600 font-mono">
                              {new Date(msg.date).toLocaleTimeString('en-US', { hour12: false })}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-200 leading-relaxed font-sans">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No current messages.
                    </div>
                  )}
                </div>
              </div>

              {/* Team Radio Widget */}
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-xl flex flex-col h-[400px]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-green-400" />
                  Team Radio
                </h3>
                <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                  {teamRadio.length > 0 ? (
                    teamRadio.map((rad, idx) => {
                      const driver = driversMap[rad.driver_number];
                      const color = getTeamColor(driver?.team_name || '', driver?.team_colour);
                      const hasAudio = !!rad.recording_url;

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-black/40 border border-[#1f1f1f] rounded-xl flex items-center justify-between gap-3 hover:border-[#333] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Driver Badge */}
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono font-bold text-sm text-white"
                              style={{ backgroundColor: color }}
                            >
                              {driver?.name_acronym || rad.driver_number}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">
                                {driver?.broadcast_name || `Driver ${rad.driver_number}`}
                              </span>
                              <span className="text-[10px] text-neutral-600 font-mono">
                                {new Date(rad.date).toLocaleTimeString('en-US', { hour12: false })}
                              </span>
                            </div>
                          </div>

                          {hasAudio && (
                            <button
                              onClick={() => handlePlayAudio(rad.recording_url)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                playingAudio === rad.recording_url
                                  ? 'bg-green-600 text-white animate-pulse'
                                  : 'bg-[#1f1f1f] text-neutral-300 hover:bg-[#2a2a2a]'
                              }`}
                            >
                              {playingAudio === rad.recording_url ? (
                                <Volume2 className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 translate-x-[1px]" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No team radio calls.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
