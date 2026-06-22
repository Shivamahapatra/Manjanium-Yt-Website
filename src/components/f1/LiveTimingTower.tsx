"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  RotateCcw,
  BarChart2,
  Trophy,
  Calendar as CalendarIcon,
  Flag,
  Rss,
  Gauge,
  Activity,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { getTeamColor, formatGap } from '@/lib/f1-helpers';

// Helper to format lap time in seconds (e.g. 82.105) to m:ss.xxx
function formatLapTimeSecs(secs: number | null | undefined): string {
  if (secs === null || secs === undefined || isNaN(secs)) return "-";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs % 1) * 1000);
  if (m > 0) {
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
  return `${s}.${ms.toString().padStart(3, '0')}`;
}

function formatSectorTime(secs: number | null | undefined): string {
  if (secs === null || secs === undefined || isNaN(secs)) return "-";
  return secs.toFixed(3);
}

const TOTAL_LAPS_MAP: Record<string, number> = {
  'Bahrain': 57, 'Saudi Arabia': 50, 'Australia': 58, 'Japan': 53,
  'China': 56, 'Miami': 57, 'Emilia Romagna': 63, 'Monaco': 78,
  'Canada': 70, 'Spain': 66, 'Austria': 71, 'Great Britain': 52,
  'Hungary': 70, 'Belgium': 44, 'Netherlands': 72, 'Monza': 53,
  'Azerbaijan': 51, 'Singapore': 62, 'USA': 56, 'United States': 56,
  'Mexico': 71, 'Brazil': 71, 'Las Vegas': 50, 'Qatar': 57,
  'Abu Dhabi': 58
};

// Stint visualization timeline component
function StintBar({ stints, currentLap, totalLaps }: { stints: any[]; currentLap: number; totalLaps: number }) {
  const displayTotalLaps = totalLaps > 0 ? totalLaps : 70;

  return (
    <div className="relative w-full h-8 flex items-center">
      {/* Timeline background track */}
      <div className="absolute left-0 right-0 h-1.5 bg-neutral-800 rounded-2xl" />
      
      {/* Stints segments */}
      {stints.map((st, idx) => {
        const startLap = st.lapStart || 1;
        const endLap = st.lapEnd || currentLap;
        const leftPercent = ((startLap - 1) / displayTotalLaps) * 100;
        const widthPercent = ((endLap - startLap + 1) / displayTotalLaps) * 100;
        
        let colorClass = 'bg-neutral-500';
        const comp = st.compound?.toUpperCase() || '';
        if (comp.includes('SOFT')) colorClass = 'bg-red-600';
        else if (comp.includes('MEDIUM')) colorClass = 'bg-yellow-500';
        else if (comp.includes('HARD')) colorClass = 'bg-neutral-300';
        else if (comp.includes('INTER')) colorClass = 'bg-green-600';
        else if (comp.includes('WET')) colorClass = 'bg-blue-600';
        
        return (
          <div
            key={idx}
            className={`absolute h-2.5 rounded-sm ${colorClass}`}
            style={{
              left: `${Math.max(0, Math.min(100, leftPercent))}%`,
              width: `${Math.max(1, Math.min(100, widthPercent))}%`,
            }}
            title={`${st.compound || 'Unknown'}: Lap ${startLap} - ${endLap}`}
          />
        );
      })}
      
      {/* Stint change/pit markers & lap numbers */}
      {stints.map((st, idx) => {
        if (idx === 0) return null;
        const startLap = st.lapStart || 1;
        const leftPercent = ((startLap - 1) / displayTotalLaps) * 100;
        
        return (
          <React.Fragment key={`mark-${idx}`}>
            <div
              className="absolute w-[2px] h-4 bg-white z-10"
              style={{ left: `${Math.max(0, Math.min(100, leftPercent))}%` }}
            />
            <span
              className="absolute text-[8px] text-neutral-400 font-mono -top-1.5 -translate-x-1/2"
              style={{ left: `${Math.max(0, Math.min(100, leftPercent))}%` }}
            >
              L{startLap}
            </span>
          </React.Fragment>
        );
      })}
      
      {/* Current lap indicator */}
      {currentLap > 0 && (
        <div
          className="absolute w-2.5 h-2.5 rounded-2xl bg-white border border-black shadow-[0_0_4px_rgba(255,255,255,0.8)] z-20"
          style={{ left: `${Math.max(0, Math.min(100, (currentLap / displayTotalLaps) * 100))}%` }}
          title={`Current Lap: ${currentLap}`}
        />
      )}
    </div>
  );
}

export function LiveTimingTower() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'LAP'|'SECTOR'|'TIRE'|'CAR'|'GRID'>('LAP');
  const [sessionType, setSessionType] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [totalLaps, setTotalLaps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  // Fallback states when no active session
  const [nextRace, setNextRace] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Refs for change tracking / overtaking animations
  const prevPositionsRef = useRef<Record<number, number>>({});
  const [positionChanges, setPositionChanges] = useState<Record<number, boolean>>({});

  const fetchLiveTiming = async () => {
    try {
      const res = await fetch('/api/f1/live');
      const json = await res.json();

      if (json.drivers && Array.isArray(json.drivers) && json.drivers.length > 0) {
        // Track position changes for animation flash
        const newChanges: Record<number, boolean> = {};
        json.drivers.forEach((drv: any) => {
          const dNum = drv.driverNumber;
          const newPos = drv.position;
          const oldPos = prevPositionsRef.current[dNum];
          if (oldPos !== undefined && oldPos !== newPos) {
            newChanges[dNum] = true;
          }
          prevPositionsRef.current[dNum] = newPos;
        });

        if (Object.keys(newChanges).length > 0) {
          setPositionChanges(newChanges);
          // Clear animation after 1s
          setTimeout(() => {
            setPositionChanges({});
          }, 1000);
        }

        setDrivers(json.drivers);
        setErrorState(false);
      }

      if (json.session) {
        setSessionInfo(json.session);
        setSessionType(json.session.session_type || '');
        setSessionName(json.session.session_name || '');
        
        const trackName = json.session.circuit_short_name || json.session.country_name || '';
        const limitLaps = TOTAL_LAPS_MAP[trackName] || 70;
        setTotalLaps(limitLaps);
      }
    } catch (err) {
      console.error("Failed to fetch live timing tower data", err);
    } finally {
      setLoading(false);
    }
  };

  const [errorState, setErrorState] = useState(false);

  // Initial fetch and session type tab selection
  useEffect(() => {
    const initFetch = async () => {
      await fetchLiveTiming();
    };
    initFetch();

    const interval = setInterval(fetchLiveTiming, 3000);
    return () => clearInterval(interval);
  }, []);

  // Set default tab based on session type once loaded
  useEffect(() => {
    if (sessionType) {
      if (sessionType.toLowerCase().includes('race') || sessionType.toLowerCase().includes('sprint')) {
        setActiveTab('LAP');
      } else {
        setActiveTab('SECTOR');
      }
    }
  }, [sessionType]);

  // Fallback next session fetching
  useEffect(() => {
    if (!loading && drivers.length === 0) {
      const fetchNextSession = async () => {
        try {
          const res = await fetch('/api/f1/calendar');
          const data = await res.json();
          if (data.calendar && Array.isArray(data.calendar)) {
            const now = new Date();
            const upcoming = data.calendar.find(
              (r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now
            );
            setNextRace(upcoming || null);
          }
        } catch (err) {
          console.error("Failed to fetch calendar for fallback", err);
        }
      };
      fetchNextSession();
    }
  }, [drivers, loading]);

  // Countdown timer for next session fallback
  useEffect(() => {
    if (!nextRace) return;
    const targetDate = new Date(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`);
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('LIVE NOW');
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  // Speed limits for styling speed traps
  const maxSpeeds = useMemo(() => {
    return {
      s1: Math.max(...drivers.map(d => d.speed1 || 0)),
      s2: Math.max(...drivers.map(d => d.speed2 || 0)),
      s3: Math.max(...drivers.map(d => d.speed3 || 0)),
    };
  }, [drivers]);

  // Overall session fastest lap holder
  const overallFastestLapTime = useMemo(() => {
    const times = drivers.map(d => d.bestLapTime).filter(t => t !== null && t > 0);
    return times.length > 0 ? Math.min(...times) : null;
  }, [drivers]);

  // Session pill styling
  const isPractice = sessionType.toLowerCase().includes('practice') || sessionType.toLowerCase().includes('test');
  const isQuali = sessionType.toLowerCase().includes('qualifying') || sessionType.toLowerCase().includes('shootout');
  const isRace = sessionType.toLowerCase().includes('race') || sessionType.toLowerCase().includes('sprint');

  const currentLap = useMemo(() => {
    if (drivers.length === 0) return 0;
    // Estimate current lap based on leader's lap sequence
    const stints = drivers[0]?.stints || [];
    if (stints.length > 0) {
      return stints[stints.length - 1].lapEnd || 1;
    }
    return 1;
  }, [drivers]);

  // Grid layout helper
  const parsedLastName = (fullName: string) => {
    const parts = fullName.split(' ');
    const capsPart = parts.find(p => p === p.toUpperCase() && p.length > 2);
    return capsPart || parts[parts.length - 1] || 'driver';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-[#0d0d0d] min-h-[400px] border border-[#1f1f1f] rounded-2xl">
        <Spin size="large" />
        <span className="text-neutral-500 font-mono text-xs mt-4">FETCHING OPENF1 LIVE FEED...</span>
      </div>
    );
  }

  // Fallback: No Active Session empty state
  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl text-center">
        <Activity className="w-16 h-16 text-neutral-700 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Active Session</h3>
        {nextRace ? (
          <div className="space-y-2">
            <p className="text-neutral-400">Next F1 Session:</p>
            <div className="text-lg font-bold text-blue-500 font-mono">
              {nextRace.raceName}
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-widest mt-2">
              {countdown}
            </div>
            <div className="text-xs text-neutral-600 font-mono mt-1">
              {new Date(nextRace.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        ) : (
          <p className="text-neutral-500 font-mono text-sm">Please wait for the next scheduled Grand Prix session.</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl shadow-2xl p-6 overflow-hidden select-none">
      {/* Session Pill & Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1f1f1f] pb-4">
        <div className="flex items-center gap-3">
          {/* Header pill indicator */}
          <span className={`px-3 py-1 text-xs font-black font-mono uppercase tracking-widest rounded-md flex items-center gap-1.5 ${
            isPractice ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
            isQuali ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' :
            'bg-red-600/20 text-red-400 border border-red-500/30 font-bold'
          }`}>
            {isRace && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-2xl h-2 w-2 bg-red-500"></span>
              </span>
            )}
            {sessionName} — {sessionInfo?.circuit_short_name || sessionInfo?.country_name}
          </span>
        </div>
        
        {/* Race Laps or Timing indicator */}
        <div className="text-right">
          {isRace ? (
            <div className="flex flex-col font-mono">
              <span className="text-[10px] text-neutral-500 font-sans uppercase font-bold tracking-wider">Race Laps</span>
              <span className="text-lg font-black text-white">LAP {currentLap} / {totalLaps}</span>
            </div>
          ) : isQuali ? (
            <div className="flex flex-col font-mono text-right">
              <span className="text-[10px] text-neutral-500 font-sans uppercase font-bold tracking-wider">Knockouts</span>
              <span className="text-xs font-bold text-amber-500">{currentLap > 10 ? 'Q1 OUT: P16-20' : 'Q2 OUT: P11-15'}</span>
            </div>
          ) : (
            <div className="flex flex-col font-mono">
              <span className="text-[10px] text-neutral-500 font-sans uppercase font-bold tracking-wider">Session Status</span>
              <span className="text-sm font-bold text-blue-400">ACTIVE TIMING</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="flex bg-black/60 rounded-xl p-1 border border-[#1f1f1f] mb-6 max-w-lg">
        {(['LAP', 'SECTOR', 'TIRE', 'CAR', 'GRID'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-2 text-xs font-black tracking-widest rounded-lg transition-colors ${
              activeTab === tab 
                ? 'bg-neutral-800 text-white shadow-md' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table grid area */}
      <div className="overflow-x-auto scrollbar-hide max-h-[750px] overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-w-max w-full"
          >
            {/* Disclaimer for telemetry lag */}
            {activeTab === 'CAR' && (
              <span className="block text-right text-[10px] text-neutral-600 font-mono mb-2">
                * Values from last driver data points (approx. 240ms latency)
              </span>
            )}

            {activeTab !== 'GRID' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1f1f1f] h-10">
                    {/* Header Columns */}
                    <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase pl-4 w-16">Pos</th>
                    <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase pl-2 w-36">Driver</th>
                    
                    {activeTab === 'LAP' && (
                      <>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-32">Interval</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-36">Lap Time</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-56">Mini Sectors</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase pr-4 w-28">Tire</th>
                      </>
                    )}

                    {activeTab === 'SECTOR' && (
                      <>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-28">Interval</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-32">S1/BEST</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-32">S2/BEST</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-32">S3/BEST</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-20">SPD1</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-20">SPD2</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase pr-4 w-20">SPD3</th>
                      </>
                    )}

                    {activeTab === 'TIRE' && (
                      <>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-48">Compound + Pits</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase pr-4">Stint Timeline</th>
                      </>
                    )}

                    {activeTab === 'CAR' && (
                      <>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-36">Throttle</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-36">Brake</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-20">Gear</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase w-40">RPM</th>
                        <th className="text-neutral-500 text-[10px] font-black tracking-widest uppercase pr-4 w-24">DRS</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((drv: any, idx: number) => {
                    const isLeader = drv.position === 1;
                    const isLapped = typeof drv.gapToLeader === 'string' && drv.gapToLeader.includes('L');
                    const hasFastestLap = overallFastestLapTime && drv.bestLapTime === overallFastestLapTime;
                    const isFlashing = positionChanges[drv.driverNumber];

                    return (
                      <motion.tr
                        layoutId={`drv-row-${drv.driverNumber}`}
                        key={drv.driverNumber}
                        className={`h-[52px] border-b border-[#1f1f1f]/50 transition-colors duration-300 ${
                          isLeader ? 'bg-neutral-800/20' : idx % 2 === 0 ? 'bg-black/20' : 'bg-transparent'
                        } ${isLapped ? 'opacity-50' : ''}`}
                        animate={isFlashing ? { backgroundColor: ['rgba(234, 179, 8, 0.2)', 'rgba(0,0,0,0)'] } : {}}
                      >
                        {/* Position */}
                        <td className="pl-4 font-mono font-black text-white text-base">
                          {drv.position}
                        </td>

                        {/* Driver Code / Name block */}
                        <td className="pl-2">
                          <div className="flex items-center gap-2">
                            {/* Color bar */}
                            <div 
                              className="w-[3px] h-5 rounded-sm shrink-0"
                              style={{ backgroundColor: `#${drv.teamColor}` }}
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-white text-base tracking-wide">
                                {drv.nameAcronym}
                              </span>
                              {hasFastestLap && (
                                <span className="bg-purple-600/20 text-purple-400 text-[8px] font-black font-mono border border-purple-500/30 px-1 rounded">
                                  FL
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* LAP VIEW */}
                        {activeTab === 'LAP' && (
                          <>
                            {/* Gaps/Interval */}
                            <td className="font-mono text-xs">
                              <div className="text-white font-bold">{isLeader ? 'LEADER' : drv.gapToLeader}</div>
                              <div className="text-neutral-500 text-[10px] mt-0.5">{isLeader ? '– –' : drv.interval}</div>
                            </td>

                            {/* Laps durations */}
                            <td className="font-mono text-xs">
                              <div className="text-white">{formatLapTimeSecs(drv.lastLapTime)}</div>
                              <div className="text-green-500 text-[10px] mt-0.5">{formatLapTimeSecs(drv.bestLapTime)}</div>
                            </td>

                            {/* Mini sector blocks */}
                            <td>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  {drv.miniSectorColors.map((color: string, cIdx: number) => {
                                    let colClass = 'bg-neutral-800';
                                    if (color === 'purple') colClass = 'bg-purple-500';
                                    else if (color === 'green') colClass = 'bg-green-500';
                                    else if (color === 'red') colClass = 'bg-red-500';
                                    else if (color === 'yellow') colClass = 'bg-yellow-500';

                                    return (
                                      <span
                                        key={cIdx}
                                        className={`w-1.5 h-2 rounded-sm ${colClass}`}
                                        style={{ marginRight: cIdx === 4 || cIdx === 9 ? '4px' : '0px' }}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="flex text-[9px] text-neutral-500 font-mono gap-4 pl-0.5">
                                  <span>{formatSectorTime(drv.s1Last)}</span>
                                  <span>{formatSectorTime(drv.s2Last)}</span>
                                  <span>{formatSectorTime(drv.s3Last)}</span>
                                </div>
                              </div>
                            </td>

                            {/* Tire Info */}
                            <td className="pr-4">
                              <div className="flex items-center gap-2">
                                {/* Compound Icon */}
                                <span className={`w-6 h-6 rounded-2xl flex items-center justify-center text-xs font-black border ${
                                  drv.tireCompound === 'S' ? 'bg-red-600 text-white border-red-500' :
                                  drv.tireCompound === 'M' ? 'bg-yellow-500 text-black border-yellow-400' :
                                  drv.tireCompound === 'H' ? 'bg-neutral-100 text-black border-neutral-300' :
                                  drv.tireCompound === 'I' ? 'bg-green-600 text-white border-green-500' :
                                  'bg-blue-600 text-white border-blue-500'
                                }`}>
                                  {drv.tireCompound}
                                </span>
                                <div className="flex flex-col text-[10px] font-mono leading-none">
                                  <span className="text-white font-bold">{drv.tireLaps}L</span>
                                  <span className="text-neutral-500 text-[8px] mt-0.5">{drv.pitCount} PIT</span>
                                </div>
                              </div>
                            </td>
                          </>
                        )}

                        {/* SECTOR VIEW */}
                        {activeTab === 'SECTOR' && (
                          <>
                            {/* Interval */}
                            <td className="font-mono text-xs text-white font-bold">
                              {isLeader ? 'LEADER' : drv.gapToLeader}
                            </td>

                            {/* S1 */}
                            <td className="font-mono text-xs">
                              <div className={
                                drv.s1IsBest ? 'text-purple-500 font-black' :
                                drv.s1Last === drv.s1Best ? 'text-green-500 font-bold' : 'text-yellow-500'
                              }>
                                {formatSectorTime(drv.s1Last)}
                              </div>
                              <div className="text-neutral-500 text-[10px] mt-0.5">{formatSectorTime(drv.s1Best)}</div>
                            </td>

                            {/* S2 */}
                            <td className="font-mono text-xs">
                              <div className={
                                drv.s2IsBest ? 'text-purple-500 font-black' :
                                drv.s2Last === drv.s2Best ? 'text-green-500 font-bold' : 'text-yellow-500'
                              }>
                                {formatSectorTime(drv.s2Last)}
                              </div>
                              <div className="text-neutral-500 text-[10px] mt-0.5">{formatSectorTime(drv.s2Best)}</div>
                            </td>

                            {/* S3 */}
                            <td className="font-mono text-xs">
                              <div className={
                                drv.s3IsBest ? 'text-purple-500 font-black' :
                                drv.s3Last === drv.s3Best ? 'text-green-500 font-bold' : 'text-yellow-500'
                              }>
                                {formatSectorTime(drv.s3Last)}
                              </div>
                              <div className="text-neutral-500 text-[10px] mt-0.5">{formatSectorTime(drv.s3Best)}</div>
                            </td>

                            {/* Speeds traps */}
                            <td className={`font-mono text-xs ${drv.speed1 === maxSpeeds.s1 ? 'text-purple-400 font-bold' : 'text-white'}`}>
                              {drv.speed1 || '-'}
                            </td>
                            <td className={`font-mono text-xs ${drv.speed2 === maxSpeeds.s2 ? 'text-purple-400 font-bold' : 'text-white'}`}>
                              {drv.speed2 || '-'}
                            </td>
                            <td className={`font-mono text-xs pr-4 ${drv.speed3 === maxSpeeds.s3 ? 'text-purple-400 font-bold' : 'text-white'}`}>
                              {drv.speed3 || '-'}
                            </td>
                          </>
                        )}

                        {/* TIRE VIEW */}
                        {activeTab === 'TIRE' && (
                          <>
                            {/* Compound details */}
                            <td>
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-2xl flex items-center justify-center text-xs font-black border ${
                                  drv.tireCompound === 'S' ? 'bg-red-600 text-white border-red-500' :
                                  drv.tireCompound === 'M' ? 'bg-yellow-500 text-black border-yellow-400' :
                                  drv.tireCompound === 'H' ? 'bg-neutral-100 text-black border-neutral-300' :
                                  drv.tireCompound === 'I' ? 'bg-green-600 text-white border-green-500' :
                                  'bg-blue-600 text-white border-blue-500'
                                }`}>
                                  {drv.tireCompound}
                                </span>
                                <span className="font-mono text-xs text-white">
                                  {drv.tireLaps} Laps ({drv.pitCount} Stops)
                                </span>
                              </div>
                            </td>

                            {/* Stints timeline */}
                            <td className="pr-4 py-2">
                              <StintBar stints={drv.stints} currentLap={currentLap} totalLaps={totalLaps} />
                            </td>
                          </>
                        )}

                        {/* CAR telemetry VIEW */}
                        {activeTab === 'CAR' && (
                          <>
                            {/* Throttle */}
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-neutral-900 rounded overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${drv.throttle}%` }} />
                                </div>
                                <span className="font-mono text-xs text-white min-w-[28px] text-right">{drv.throttle}%</span>
                              </div>
                            </td>

                            {/* Brake */}
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-neutral-900 rounded overflow-hidden">
                                  <div className="h-full bg-red-500" style={{ width: `${drv.brake}%` }} />
                                </div>
                                <span className="font-mono text-xs text-white min-w-[28px] text-right">{drv.brake}%</span>
                              </div>
                            </td>

                            {/* Gear */}
                            <td className="font-mono font-bold text-white text-sm">
                              {drv.gear === 0 ? 'N' : drv.gear === -1 ? 'R' : drv.gear}
                            </td>

                            {/* RPM */}
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-neutral-900 rounded overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: `${(drv.rpm / 15000) * 100}%` }} />
                                </div>
                                <span className="font-mono text-xs text-white">{drv.rpm}</span>
                              </div>
                            </td>

                            {/* DRS */}
                            <td className={`font-mono text-xs pr-4 font-bold ${drv.drs === 1 || drv.drs >= 10 ? 'text-green-400' : 'text-neutral-600'}`}>
                              {drv.drs === 1 || drv.drs >= 10 ? 'ON' : 'OFF'}
                            </td>
                          </>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 max-w-5xl mx-auto py-8">
                {drivers.map((drv: any, idx: number) => {
                  const gridPos = drv.position;
                  const isLeftCol = gridPos % 2 !== 0; // Odd Grid Position on Left

                  return (
                    <motion.div
                      key={drv.driverNumber}
                      layoutId={`grid-cell-${drv.driverNumber}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative border border-neutral-900 bg-[#111] p-6 rounded-lg shadow-xl w-full max-w-md ${
                        isLeftCol ? 'justify-self-start md:translate-y-[-20px]' : 'justify-self-end md:translate-y-[20px]'
                      }`}
                    >
                      {/* Corner bracket decorators */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />

                      {/* Grid Position Number */}
                      <div className="absolute top-3 right-4 font-serif italic text-3xl font-black text-neutral-700">
                        P{gridPos}
                      </div>

                      <div className="flex gap-4">
                        {/* Driver Photo with Initials Fallback */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                          <img
                            src={`https://media.formula1.com/image/upload/f_auto/q_auto/v0/fom-website/drivers/2026/${parsedLastName(drv.fullName).toLowerCase()}`}
                            alt={drv.fullName}
                            onError={(e) => {
                              // Replace failing images with fallback placeholder
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = "w-full h-full flex items-center justify-center font-bold font-mono text-white text-lg rounded-xl";
                                placeholder.style.backgroundColor = `#${drv.teamColor}`;
                                placeholder.innerText = drv.nameAcronym;
                                parent.appendChild(placeholder);
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Driver details */}
                        <div className="flex flex-col justify-center">
                          <span className="font-mono text-neutral-400 text-xs font-bold uppercase tracking-wider">
                            NO. {drv.driverNumber}
                          </span>
                          <h3 className="text-xl font-bold text-white leading-tight mt-1">
                            {drv.fullName.split(' ')[0]}{' '}
                            <span className="font-black font-sans uppercase">
                              {parsedLastName(drv.fullName)}
                            </span>
                          </h3>
                          <span 
                            className="text-sm font-semibold mt-1"
                            style={{ color: `#${drv.teamColor}` }}
                          >
                            {drv.teamName}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
