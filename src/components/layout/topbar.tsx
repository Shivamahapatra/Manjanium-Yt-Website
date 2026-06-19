"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Topbar() {
  const [isLive, setIsLive] = useState(false);
  const [sessionName, setSessionName] = useState("Awaiting Session");

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch('/api/openf1/sessions');
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          const latest = json[json.length - 1];
          setSessionName(`${latest.session_name} - ${latest.country_name}`);
          
          // Basic heuristic: If we have a recent session, mark as LIVE. 
          // OpenF1 doesn't have a direct "is_live" boolean, so we assume the latest queried session is the active one.
          setIsLive(true);
        }
      } catch (e) {
        console.error("Topbar Live Status Error:", e);
      }
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4 ml-12 md:ml-0">
        <h1 className="text-lg font-bold text-white hidden sm:block">Manjanium F1 Hub</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {isLive ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E10600]/10 border border-[#E10600]/20"
            >
              <div className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse shadow-[0_0_8px_#E10600]" />
              <span className="text-xs font-bold text-[#E10600] tracking-wider">LIVE</span>
              <span className="text-xs text-zinc-300 ml-2 hidden sm:inline-block border-l border-zinc-700 pl-2">
                {sessionName}
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-xs font-bold text-zinc-400 tracking-wider">OFFLINE</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
