"use client";

import { motion } from "framer-motion";
import { IconBrandYoutube } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { F1SubNav } from "@/components/f1/F1SubNav";

export default function F1Layout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [nextRace, setNextRace] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchSessionStatus = async () => {
      try {
        const res = await fetch('/api/f1/live');
        const data = await res.json();
        
        if (data.session && data.positions && Array.isArray(data.positions) && data.positions.length > 0) {
          setSession(data.session);
          setIsLive(true);
        } else {
          setIsLive(false);
          setSession(null);
          // Fetch next race from calendar
          try {
            const calRes = await fetch('/api/f1/calendar');
            const calData = await calRes.json();
            if (calData.calendar) {
              const now = new Date();
              const upcoming = calData.calendar.find((r: any) => 
                new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now
              );
              if (upcoming) setNextRace(upcoming);
            }
          } catch { /* silent */ }
        }
      } catch {
        setIsLive(false);
      }
    };

    fetchSessionStatus();
    const interval = setInterval(fetchSessionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for next race
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
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* TOP BAR */}
      <div className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          {isLive && session ? (
            <div className="flex items-center gap-2 text-white font-mono text-sm tracking-wide">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              />
              LIVE — {session.session_name} — {session.country_name}
            </div>
          ) : nextRace ? (
            <div className="text-[#737373] font-mono text-sm tracking-wide">
              NEXT: {nextRace.raceName} in {countdown}
            </div>
          ) : (
            <div className="text-[#737373] font-mono text-sm tracking-wide">
              MANJANIUM F1 HUB
            </div>
          )}
        </div>
        
        <Link 
          href="https://www.youtube.com/@manjaniumonsofts67" 
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors border border-[#333]"
        >
          <IconBrandYoutube className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-white tracking-wide">Subscribe</span>
        </Link>
      </div>
      
      <F1SubNav />
      
      {/* PAGE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
