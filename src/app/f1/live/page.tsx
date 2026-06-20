"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, Tag, Spin, Dropdown } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Activity,
  Trophy,
  BarChart2,
  Clock,
  History,
  Calendar,
  Flag,
  Target,
  PlayCircle,
  Newspaper
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TEAM_COLORS } from '@/lib/f1-types';
import { formatGap, getTeamColor } from '@/lib/f1-helpers';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn-tabs';
import { cn } from '@/lib/utils';
import { ChannelsBanner } from '@/components/social/ChannelsBanner';
import { ChannelsGrid } from '@/components/social/ChannelsGrid';
import { IconBrandTwitch, IconBrandYoutube, IconBrandDiscord, IconBrandX } from "@tabler/icons-react";

/* ------------------------------------------------------------------ */
/*  MAIN F1 HUB PAGE CONTENT                                          */
/* ------------------------------------------------------------------ */
function F1HubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const defaultTab = searchParams.get('tab') || 'live';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/f1?tab=${value}`, { scroll: false });
  };

  const [session, setSession] = useState<any>(null);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [positions, setPositions] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);
  const [standingsTab, setStandingsTab] = useState('drivers');
  const [liveLoading, setLiveLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);

  // Telemetry drivers
  const [driver1, setDriver1] = useState<string>('');
  const [driver2, setDriver2] = useState<string>('');
  const initialDriversSet = useRef(false);

  /* --------- Fetch Live Data --------- */
  const fetchLiveData = useCallback(async () => {
    try {
      const liveRes = await fetch('/api/f1/live');
      const liveJson = await liveRes.json();

      if (liveJson.session) setSession(liveJson.session);

      if (liveJson.drivers && Array.isArray(liveJson.drivers)) {
        const map: Record<string, any> = {};
        liveJson.drivers.forEach((d: any) => {
          map[d.driver_number] = d;
        });
        setDriversMap(map);
      }

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

  /* --------- Fetch Standings --------- */
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

  /* --------- Fetch Telemetry --------- */
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

  const getDriverColor = (driverNumber: string | number): string => {
    const d = driversMap[String(driverNumber)];
    if (d?.team_colour) return `#${d.team_colour}`;
    return '#0ea5e9';
  };

  const getDriverName = (driverNumber: string | number): string => {
    const d = driversMap[String(driverNumber)];
    return d?.name_acronym || String(driverNumber);
  };

  /* --------- Columns --------- */
  const standingColumns = [
    {
      title: <span className="text-neutral-500 text-xs">POS</span>,
      dataIndex: 'position',
      key: 'pos',
      width: 55,
      render: (text: string) => <span className="font-bold text-neutral-400">P{text}</span>,
    },
    {
      title: <span className="text-neutral-500 text-xs">DRIVER</span>,
      key: 'athlete',
      render: (_: any, record: any) => {
        const isLeader = record.position === '1';
        const teamName = record.Constructors?.[0]?.name || '';
        const teamColor = getTeamColor(teamName);
        return (
          <div className="flex items-center gap-2 text-white font-medium">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
            {record.Driver.givenName} {record.Driver.familyName}
            {isLeader && <Trophy className="w-3 h-3 text-manjanium-gold ml-1" />}
          </div>
        );
      },
    },
    {
      title: <span className="text-neutral-500 text-xs">TEAM</span>,
      key: 'team',
      render: (_: any, record: any) => (
        <span className="text-neutral-500 text-xs">{record.Constructors?.[0]?.name}</span>
      ),
    },
    {
      title: <span className="text-neutral-500 text-xs">WINS</span>,
      dataIndex: 'wins',
      key: 'wins',
      render: (wins: string) => <span className="text-white">{wins}</span>,
    },
    {
      title: <span className="text-neutral-500 text-xs">POINTS</span>,
      dataIndex: 'points',
      key: 'points',
      render: (points: string) => (
        <span className="font-bold px-2 py-1 bg-manjanium-gold/10 text-manjanium-gold rounded border border-manjanium-gold/20">
          {points} pts
        </span>
      ),
    },
  ];

  const constructorColumns = [
    {
      title: <span className="text-neutral-500 text-xs">POS</span>,
      dataIndex: 'position',
      key: 'pos',
      width: 55,
      render: (text: string) => <span className="font-bold text-neutral-400">P{text}</span>,
    },
    {
      title: <span className="text-neutral-500 text-xs">TEAM</span>,
      key: 'team',
      render: (_: any, record: any) => {
        const teamColor = getTeamColor(record.Constructor?.name || '');
        return (
          <div className="flex items-center gap-2 text-white font-medium">
            <div className="w-1.5 h-4 rounded-sm shrink-0" style={{ backgroundColor: teamColor }} />
            {record.Constructor?.name}
          </div>
        );
      },
    },
    {
      title: <span className="text-neutral-500 text-xs">WINS</span>,
      dataIndex: 'wins',
      key: 'wins',
      render: (wins: string) => <span className="text-white">{wins}</span>,
    },
    {
      title: <span className="text-neutral-500 text-xs">POINTS</span>,
      dataIndex: 'points',
      key: 'points',
      render: (points: string) => (
        <span className="font-bold px-2 py-1 bg-manjanium-gold/10 text-manjanium-gold rounded border border-manjanium-gold/20">
          {points} pts
        </span>
      ),
    },
  ];

  const isQuali = session?.session_type === 'Qualifying';
  const isRace = session?.session_type === 'Race';
  const isSessionActive = session !== null;

  const driverOptions = positions.map((p) => ({
    value: String(p.driver_number),
    label: `P${p.position} — ${getDriverName(p.driver_number)}`,
  }));

  return (
    <div className="w-full flex flex-col pt-8 px-4 sm:px-8 max-w-7xl mx-auto z-10 relative pb-32">
      
      {/* Background glow tailored for F1 */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ===== HERO / HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4 relative z-10">
        <div className="flex flex-col gap-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-1.5 h-8 bg-manjanium-gold rounded-full" />
            <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white drop-shadow-md">
              Manjanium F1 Hub
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-2 mt-2">
            {isSessionActive ? (
               <motion.div
               animate={{ opacity: [1, 0.6, 1] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               className="bg-red-500/20 border border-red-500/50 text-red-500 px-3 py-1 rounded text-xs font-bold flex items-center gap-2"
             >
               <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
               LIVE: {session.session_name}
             </motion.div>
            ) : (
              <div className="bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 px-3 py-1 rounded text-xs font-bold flex items-center gap-2">
                <Clock className="w-3 h-3" /> NO ACTIVE SESSION
              </div>
            )}
            <p className="text-sm md:text-base text-neutral-400 font-medium pl-2 border-l border-white/10">
              {isSessionActive ? session.country_name : "Next: Austrian Grand Prix in 8d 5h 29m"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isQuali && (
             <span className="text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1.5 rounded-lg">
               SECTOR TIMES PRIORITIZED
             </span>
          )}
          {isRace && (
             <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg">
               INTERVAL GAPS PRIORITIZED
             </span>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col relative z-10">
        
        <div className="w-full overflow-x-auto scrollbar-hide pb-2 mb-6">
          <TabsList className="bg-primary/50 border border-white/5 p-1 rounded-xl flex w-max sm:w-full sm:justify-start gap-1">
            <TabsTrigger value="live" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Radio className="w-4 h-4" /> LIVE
            </TabsTrigger>
            <TabsTrigger value="replay" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <PlayCircle className="w-4 h-4" /> REPLAY
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <BarChart2 className="w-4 h-4" /> TELEMETRY
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Trophy className="w-4 h-4" /> STANDINGS
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Calendar className="w-4 h-4" /> CALENDAR
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Target className="w-4 h-4" /> RESULTS
            </TabsTrigger>
            <TabsTrigger value="updates" className="gap-2 px-5 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Newspaper className="w-4 h-4" /> UPDATES
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="relative min-h-[500px] w-full">
          
          {/* ----- LIVE ----- */}
          <TabsContent value="live" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <LiveTimingTower />
                </div>
                
                {/* Circuit Info Placeholder */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="bg-primary/50 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <Flag className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white font-bold tracking-wide">Circuit Focus</h3>
                    </div>
                    {isSessionActive ? (
                       <div className="flex flex-col gap-3">
                         <div className="text-sm text-neutral-400">Track: <span className="text-white font-medium">{session?.circuit_short_name || 'Active Track'}</span></div>
                         <div className="w-full h-32 border border-dashed border-white/10 rounded-lg flex items-center justify-center bg-black/20 text-neutral-500 text-xs mt-2">
                           Circuit Map Unavailable
                         </div>
                       </div>
                    ) : (
                      <div className="text-neutral-500 text-sm">
                        Waiting for session to begin to display track data.
                      </div>
                    )}
                  </div>

                  <div className="bg-primary/50 border border-white/5 rounded-2xl p-6 shadow-xl flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Radio className="w-5 h-5 text-red-400" />
                      <h3 className="text-white font-bold tracking-wide">Race Control</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs text-neutral-500 italic">No recent messages</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ----- REPLAY ----- */}
          <TabsContent value="replay" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
              <div className="w-full max-w-4xl bg-primary/50 border border-white/5 rounded-2xl p-8 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <History className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Session Replay</h2>
                    <p className="text-neutral-400">Load and analyze past sessions with full timing and telemetry playback.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <select disabled className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-neutral-500 outline-none">
                    <option>Year: 2024</option>
                  </select>
                  <select disabled className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-neutral-500 outline-none">
                    <option>Grand Prix...</option>
                  </select>
                  <select disabled className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-neutral-500 outline-none">
                    <option>Session...</option>
                  </select>
                </div>
                
                <button disabled className="w-full py-4 rounded-xl bg-blue-600/20 text-blue-500 font-bold border border-blue-600/30 flex justify-center items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> LOAD REPLAY
                </button>
              </div>
            </motion.div>
          </TabsContent>

          {/* ----- TELEMETRY ----- */}
          <TabsContent value="telemetry" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-primary/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl h-[600px] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
                  <div className="flex items-center gap-3">
                    <BarChart2 className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg font-bold text-white tracking-wide">
                      Head-to-Head Telemetry Analysis
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 px-6 py-4 border-b border-white/5 bg-black/10">
                  <select
                    value={driver1}
                    onChange={(e) => setDriver1(e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-white font-mono rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Driver 1</option>
                    {driverOptions.map((opt) => (
                      <option key={`d1-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-center px-4">
                     <span className="text-neutral-500 font-bold bg-neutral-900 rounded-full w-8 h-8 flex items-center justify-center text-xs">VS</span>
                  </div>
                  <select
                    value={driver2}
                    onChange={(e) => setDriver2(e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-white font-mono rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Driver 2</option>
                    {driverOptions.map((opt) => (
                      <option key={`d2-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 p-6">
                  {telemetry.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetry} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis dataKey="idx" tickFormatter={() => ''} stroke="#333" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#555" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', color: '#fff', padding: '12px' }}
                          labelFormatter={() => ''}
                          formatter={(value: any, name: any) => {
                            const label = name === 'p1Speed' ? `${getDriverName(driver1)} Speed` : `${getDriverName(driver2)} Speed`;
                            return [`${value} km/h`, label];
                          }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => value === 'p1Speed' ? getDriverName(driver1) : getDriverName(driver2)} />
                        <Line yAxisId="left" type="monotone" dataKey="p1Speed" name="p1Speed" stroke={getDriverColor(driver1)} strokeWidth={3} dot={false} isAnimationActive={true} />
                        <Line yAxisId="left" type="monotone" dataKey="p2Speed" name="p2Speed" stroke={getDriverColor(driver2)} strokeDasharray="5 5" strokeWidth={3} dot={false} isAnimationActive={true} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 border border-dashed border-white/5 rounded-xl bg-black/10">
                      <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium text-lg">Select two drivers to compare live telemetry</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ----- STANDINGS ----- */}
          <TabsContent value="standings" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-full bg-primary/50 border border-white/5 rounded-2xl shadow-xl overflow-hidden p-1 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-4 sm:px-0 pt-4 sm:pt-0 gap-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                    <Trophy className="text-manjanium-gold w-6 h-6" />
                    {standingsTab === 'drivers' ? 'Driver Championship' : 'Constructor Championship'}
                  </h2>
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 w-full sm:w-auto">
                    <button
                      onClick={() => setStandingsTab('drivers')}
                      className={cn("flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all duration-300", 
                        standingsTab === 'drivers' ? 'bg-manjanium-gold text-black shadow-md' : 'text-neutral-400 hover:text-white'
                      )}
                    >
                      DRIVERS
                    </button>
                    <button
                      onClick={() => setStandingsTab('constructors')}
                      className={cn("flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all duration-300", 
                        standingsTab === 'constructors' ? 'bg-manjanium-gold text-black shadow-md' : 'text-neutral-400 hover:text-white'
                      )}
                    >
                      TEAMS
                    </button>
                  </div>
                </div>

                {standingsLoading ? (
                  <div className="flex items-center justify-center py-32">
                    <Spin size="large" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={standingsTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-black/20 rounded-xl overflow-hidden border border-white/5"
                    >
                      <Table
                        dataSource={standingsTab === 'drivers' ? standings : constructors}
                        columns={standingsTab === 'drivers' ? standingColumns : constructorColumns}
                        pagination={false}
                        rowKey={(record) => standingsTab === 'drivers' ? record.Driver?.driverId : record.Constructor?.constructorId}
                        className="manjanium-table [&_.ant-table]:!bg-transparent [&_.ant-table-thead_th]:!bg-black/60 [&_.ant-table-thead_th]:!text-neutral-400 [&_.ant-table-thead_th]:!border-b-white/10 [&_.ant-table-tbody_td]:!border-b-white/5 [&_.ant-table-row:hover_td]:!bg-white/5"
                        scroll={{ x: 'max-content' }}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* ----- CALENDAR ----- */}
          <TabsContent value="calendar" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
               <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl w-full bg-primary/30">
                  <Calendar className="w-16 h-16 text-neutral-600 mb-6 opacity-50" />
                  <p className="text-white text-3xl font-black mb-3 font-heading tracking-tight">2026 Season Calendar</p>
                  <p className="text-neutral-400 mb-6">Interactive race map and schedule coming soon.</p>
                  <div className="text-xs text-manjanium-gold bg-manjanium-gold/10 border border-manjanium-gold/20 px-4 py-1.5 rounded-full font-bold">
                    IN DEVELOPMENT
                  </div>
                </div>
            </motion.div>
          </TabsContent>

          {/* ----- RESULTS ----- */}
          <TabsContent value="results" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
               <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl w-full bg-primary/30">
                  <Target className="w-16 h-16 text-neutral-600 mb-6 opacity-50" />
                  <p className="text-white text-3xl font-black mb-3 font-heading tracking-tight">Results Explorer</p>
                  <p className="text-neutral-400 mb-6">Detailed classifications for practice, qualifying, and race sessions.</p>
                  <div className="text-xs text-manjanium-gold bg-manjanium-gold/10 border border-manjanium-gold/20 px-4 py-1.5 rounded-full font-bold">
                    IN DEVELOPMENT
                  </div>
                </div>
            </motion.div>
          </TabsContent>

          {/* ----- UPDATES ----- */}
          <TabsContent value="updates" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
               <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl w-full bg-primary/30">
                  <Newspaper className="w-16 h-16 text-neutral-600 mb-6 opacity-50" />
                  <p className="text-white text-3xl font-black mb-3 font-heading tracking-tight">Paddock News</p>
                  <p className="text-neutral-400 mb-6">Latest updates and news directly from the paddock.</p>
                  <div className="text-xs text-manjanium-gold bg-manjanium-gold/10 border border-manjanium-gold/20 px-4 py-1.5 rounded-full font-bold">
                    IN DEVELOPMENT
                  </div>
                </div>
            </motion.div>
          </TabsContent>

        </div>
      </Tabs>

      {/* ===== F1 SOCIAL PROMO ===== */}
      <div className="mt-16 flex flex-col gap-12 relative z-10 w-full">
        <ChannelsBanner
          title="Live Timing & Race Analysis"
          description="Watch our real-time telemetry streams on Twitch. We cover every practice, qualifying, and race session with deep technical analysis."
          icon={<IconBrandTwitch className="w-10 h-10 text-purple-400" />}
          buttonText="Watch on Twitch"
          url="#"
          accentColor="bg-purple-600/20"
        />

        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Stay Updated</h3>
          <ChannelsGrid channels={[
            {
              name: "YouTube",
              description: "Race highlights, strategy breakdowns, and data analysis.",
              icon: <IconBrandYoutube className="w-8 h-8" />,
              followers: "100K",
              buttonText: "Subscribe",
              url: "https://www.youtube.com/@manjaniumonsofts67",
              accentColor: "text-red-500 border-red-500/20 group-hover:border-red-500/50",
            },
            {
              name: "Discord",
              description: "Join the F1 community. Discuss live timing and strategy.",
              icon: <IconBrandDiscord className="w-8 h-8" />,
              followers: "5K",
              buttonText: "Join Server",
              url: "#",
              accentColor: "text-indigo-400 border-indigo-400/20 group-hover:border-indigo-400/50",
            },
            {
              name: "Twitter / X",
              description: "Live session updates, penalties, and breaking news.",
              icon: <IconBrandX className="w-8 h-8" />,
              followers: "25K",
              buttonText: "Follow",
              url: "#",
              accentColor: "text-neutral-200 border-neutral-200/20 group-hover:border-neutral-200/50",
            }
          ]} />
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>}>
      <F1HubContent />
    </Suspense>
  );
}
