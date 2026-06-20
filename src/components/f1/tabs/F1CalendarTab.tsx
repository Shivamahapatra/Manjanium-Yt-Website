"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronDown, ChevronUp, Flag, Trophy } from 'lucide-react';
import { Tag, Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountryFlag, F1_CANCELED_2026, F1_VENUES_2026 } from '@/lib/f1-helpers';

// Dynamic import for the 3D Globe with loading placeholder
const F1CalendarGlobe = dynamic(
  () => import('@/components/f1/F1CalendarGlobe'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[500px] rounded-2xl bg-neutral-900 animate-pulse flex items-center justify-center border border-neutral-800">
        <span className="text-neutral-500 text-sm font-mono">Loading 3D Globe...</span>
      </div>
    )
  }
);

export function F1CalendarTab() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextRace, setNextRace] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [hoveredRound, setHoveredRound] = useState<number | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/f1/calendar');
        const data = await res.json();

        if (data.calendar) {
          setRaces(data.calendar);

          const now = new Date();
          const upcoming = data.calendar.find(
            (r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now
          );
          setNextRace(upcoming || null);
        }
      } catch (error) {
        console.error('Failed to fetch calendar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  // Live countdown for next race in DD:HH:MM:SS format
  useEffect(() => {
    if (!nextRace) return;

    const targetDate = new Date(
      `${nextRace.date}T${nextRace.time || '00:00:00Z'}`
    );

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

      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdown(`${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  // Format a date+time string in user's timezone
  const formatSessionTime = (date: string, time?: string) => {
    if (!time) return 'TBC';
    try {
      const dt = new Date(`${date}T${time}`);
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(dt);
    } catch {
      return 'TBC';
    }
  };

  const toggleExpand = (round: string) => {
    setExpandedRound((prev) => (prev === round ? null : round));
  };

  // Extract country name from race for flag lookup
  const getRaceFlag = (race: any): string => {
    const country = race.Circuit?.Location?.country || '';
    return getCountryFlag(country);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  // Calculate completed rounds
  const completedRounds = races
    .filter((race: any) => {
      const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
      return raceDate < new Date();
    })
    .map((race: any) => Number(race.round));

  return (
    <div className="p-4 md:p-8 min-h-full bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-2 flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-white" />
            2026 Season — 22 Rounds Across 20 Countries
          </h1>
          <p className="text-neutral-500">
            Bahrain & Saudi Arabia canceled. Madrid joins as new venue.
          </p>
        </header>

        {/* ===== 3D GLOBE DISPLAY ===== */}
        <div className="w-full mb-6 bg-[#111111]/30 border border-[#1f1f1f] rounded-2xl p-4">
          <F1CalendarGlobe
            completedRounds={completedRounds}
            nextRound={Number(nextRace?.round || 1)}
            activeRound={hoveredRound}
          />
        </div>

        {/* ===== CANCELED GP BANNER ===== */}
        <div className="bg-neutral-900 border-l-4 border-amber-500 text-neutral-400 text-sm p-4 rounded-r-xl mb-6 shadow-md">
          ⚠️ Bahrain GP, Saudi Arabian GP and Emilia Romagna GP are not on the 2026 calendar. Season runs 22 rounds.
        </div>

        {/* ===== NEXT RACE HERO ===== */}
        {nextRace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-[#0a0a0a] border border-blue-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <Tag color="blue" className="mb-2 border-none font-bold">
                  UPCOMING RACE
                </Tag>
                <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                  <span className="text-4xl">{getRaceFlag(nextRace)}</span>
                  {nextRace.raceName}
                </h2>
                <div className="flex items-center gap-2 text-neutral-400 font-mono text-sm">
                  <MapPin className="w-4 h-4" />
                  {nextRace.Circuit?.circuitName},{' '}
                  {nextRace.Circuit?.Location?.locality}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-neutral-500 tracking-widest mb-1">
                  LIGHTS OUT IN
                </span>
                <span className="text-4xl font-mono font-bold text-blue-400 tracking-tight tabular-nums">
                  {countdown}
                </span>
                <span className="text-xs text-neutral-500 mt-1 font-mono">
                  DD:HH:MM:SS
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== RACE GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((race: any, idx: number) => {
            const raceDate = new Date(
              `${race.date}T${race.time || '00:00:00Z'}`
            );
            const isPast = raceDate < new Date();
            const isNext = nextRace?.round === race.round;
            const isExpanded = expandedRound === race.round;
            const flag = getRaceFlag(race);
            
            const isHovered = hoveredRound === Number(race.round);
            const venueInfo = F1_VENUES_2026.find(v => v.round === Number(race.round));
            const isNew = venueInfo?.isNew;
            const isSprint = venueInfo?.sprint || race.Sprint || race.isSprint;

            return (
              <motion.div
                id={`round-${race.round}`}
                onMouseEnter={() => setHoveredRound(Number(race.round))}
                onMouseLeave={() => setHoveredRound(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.35 }}
                key={race.round}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isHovered
                    ? 'bg-[#111111] border-blue-500 border-l-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : isNext
                      ? 'bg-[#1a1a1a] border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.12)]'
                      : isPast
                        ? 'bg-[#0a0a0a] border-[#1f1f1f] opacity-60'
                        : 'bg-[#111111] border-[#1f1f1f] hover:border-[#333]'
                }`}
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-3">
                    <span className="font-mono text-sm font-bold text-neutral-500">
                      ROUND {race.round}
                    </span>
                    <div className="flex items-center gap-2">
                      {isNew && (
                        <Tag
                          color="warning"
                          className="m-0 border-none font-bold text-[10px] bg-amber-500/20 text-amber-400"
                        >
                          NEW
                        </Tag>
                      )}
                      {isSprint && (
                        <Tag
                          color="orange"
                          className="m-0 border-none font-bold text-[10px]"
                        >
                          SPRINT
                        </Tag>
                      )}
                      {isNext ? (
                        <Tag color="blue" className="m-0 border-none font-bold">
                          NEXT
                        </Tag>
                      ) : isPast ? (
                        <Tag className="m-0 bg-[#1f1f1f] text-neutral-400 border-none">
                          COMPLETED
                        </Tag>
                      ) : null}
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold text-white mb-2 line-clamp-1 flex items-center gap-2"
                    title={race.raceName}
                  >
                    <span className="text-2xl">{flag}</span>
                    {race.raceName}
                  </h3>

                  {/* Winner for past races */}
                  {isPast && race.Results && race.Results[0] && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-neutral-400">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <span>
                        Winner: {race.Results[0].Driver?.givenName}{' '}
                        {race.Results[0].Driver?.familyName}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <CalendarIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span>
                        {new Date(race.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="font-mono">
                        {race.time
                          ? new Intl.DateTimeFormat(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZoneName: 'short',
                            }).format(
                              new Date(`${race.date}T${race.time}`)
                            )
                          : 'TBC'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span
                        className="truncate"
                        title={race.Circuit?.circuitName}
                      >
                        {race.Circuit?.circuitName}
                      </span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(race.round)}
                    className="flex items-center gap-1 mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" /> Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" /> Show details
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-[#1f1f1f] pt-4 space-y-3">
                        {/* Circuit details */}
                        <div className="text-xs text-neutral-500 space-y-1">
                          <p>
                            <span className="text-neutral-400 font-semibold">
                              Circuit:{' '}
                            </span>
                            {race.Circuit?.circuitName}
                          </p>
                          <p>
                            <span className="text-neutral-400 font-semibold">
                              Country:{' '}
                            </span>
                            {race.Circuit?.Location?.country}
                          </p>
                          <p>
                            <span className="text-neutral-400 font-semibold">
                              Locality:{' '}
                            </span>
                            {race.Circuit?.Location?.locality}
                          </p>
                        </div>

                        {/* Session schedule */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                            Session Schedule
                          </p>
                          {race.FirstPractice && (
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">
                                Practice 1
                              </span>
                              <span className="font-mono text-neutral-400">
                                {formatSessionTime(
                                  race.FirstPractice.date,
                                  race.FirstPractice.time
                                )}
                              </span>
                            </div>
                          )}
                          {race.SecondPractice && (
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">
                                Practice 2
                              </span>
                              <span className="font-mono text-neutral-400">
                                {formatSessionTime(
                                  race.SecondPractice.date,
                                  race.SecondPractice.time
                                )}
                              </span>
                            </div>
                          )}
                          {race.ThirdPractice && (
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">
                                Practice 3
                              </span>
                              <span className="font-mono text-neutral-400">
                                {formatSessionTime(
                                  race.ThirdPractice.date,
                                  race.ThirdPractice.time
                                )}
                              </span>
                            </div>
                          )}
                          {race.Sprint && (
                            <div className="flex justify-between text-xs">
                              <span className="text-amber-500 font-semibold">
                                Sprint
                              </span>
                              <span className="font-mono text-neutral-400">
                                {formatSessionTime(
                                  race.Sprint.date,
                                  race.Sprint.time
                                )}
                              </span>
                            </div>
                          )}
                          {race.Qualifying && (
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">
                                Qualifying
                              </span>
                              <span className="font-mono text-neutral-400">
                                {formatSessionTime(
                                  race.Qualifying.date,
                                  race.Qualifying.time
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs border-t border-[#1f1f1f] pt-1.5 mt-1.5">
                            <span className="text-white font-semibold">
                              Race
                            </span>
                            <span className="font-mono text-white font-semibold">
                              {formatSessionTime(race.date, race.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
