"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Flag } from 'lucide-react';
import { Tag } from 'antd';
import { motion } from 'framer-motion';

export default function CalendarPage() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextRace, setNextRace] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/f1/calendar`);
        const data = await res.json();
        
        if (data.calendar) {
          setRaces(data.calendar);
          
          const now = new Date();
          const upcoming = data.calendar.find((r: any) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now);
          setNextRace(upcoming);
        }
      } catch (error) {
        console.error("Failed to fetch calendar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

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

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-500 to-neutral-400 dark:from-white dark:via-zinc-200 dark:to-zinc-500 mb-2 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-neutral-800 dark:text-white" />
              RACE CALENDAR
            </h1>
            <p className="text-neutral-500">Full season schedule and countdown.</p>
          </div>
        </header>

        {nextRace && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-black border border-blue-900/50 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <Tag color="blue" className="mb-2 border-none">UPCOMING RACE</Tag>
                <h2 className="text-3xl font-bold text-white mb-1">{nextRace.raceName}</h2>
                <div className="flex items-center gap-2 text-neutral-400 font-mono">
                  <MapPin className="w-4 h-4" /> {nextRace.Circuit.circuitName}, {nextRace.Circuit.Location.locality}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-neutral-500 tracking-widest mb-1">LIGHTS OUT IN</span>
                <span className="text-4xl font-mono font-bold text-blue-400 tracking-tight">{countdown}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((race: any, idx: number) => {
            const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
            const isPast = raceDate < new Date();
            const isNext = nextRace?.round === race.round;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={race.round} 
                className={`p-5 rounded-xl border transition-all ${
                  isNext 
                    ? 'bg-[#1a1a1a] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : isPast 
                      ? 'bg-[#0a0a0a] border-[#1f1f1f] opacity-70' 
                      : 'bg-[#111111] border-[#1f1f1f] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-3">
                  <span className="font-mono text-sm font-bold text-neutral-500">ROUND {race.round}</span>
                  {isNext ? (
                    <Tag color="blue" className="m-0 border-none">NEXT</Tag>
                  ) : isPast ? (
                    <Tag className="m-0 bg-[#1f1f1f] text-neutral-400 border-none">COMPLETED</Tag>
                  ) : null}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={race.raceName}>{race.raceName}</h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <CalendarIcon className="w-4 h-4 text-neutral-500" />
                    <span>{new Date(race.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <span>{race.time ? new Date(`${race.date}T${race.time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : 'TBC'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span className="truncate" title={race.Circuit.circuitName}>{race.Circuit.circuitName}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
