"use client";

import { motion } from "framer-motion";
import { IconBrandYoutube } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function F1Layout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch live session info to determine top bar state
    // In a real app we might fetch from /api/f1/live to get the session name
    // For now we simulate an active session since we don't have a specific session route.
    setSession({
      session_name: "Race",
      country_name: "Spain",
      isLive: true
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* TOP BAR */}
      <div className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          {session?.isLive ? (
            <>
              <div className="flex items-center gap-2 text-white font-mono text-sm tracking-wide">
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
                LIVE — {session.session_name} — {session.country_name}
              </div>
            </>
          ) : (
            <div className="text-[#737373] font-mono text-sm tracking-wide">
              NEXT: Spanish Grand Prix in 3 days
            </div>
          )}
        </div>
        
        <Link 
          href="https://www.youtube.com/@manjaniumonsofts67" 
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors border border-[#333]"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-white tracking-wide">Subscribe</span>
        </Link>
      </div>
      
      {/* PAGE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
