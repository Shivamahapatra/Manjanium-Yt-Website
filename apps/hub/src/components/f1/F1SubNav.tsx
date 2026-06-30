"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, RotateCcw, BarChart2, Trophy, Calendar, Flag, Rss } from "lucide-react";

function F1SubNavContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'live';

  const navItems = [
    { label: "Live", tab: "live", href: "/f1?tab=live", icon: <Zap className="h-4 w-4" /> },
    { label: "Replay", tab: "replay", href: "/f1?tab=replay", icon: <RotateCcw className="h-4 w-4" /> },
    { label: "Telemetry", tab: "telemetry", href: "/f1?tab=telemetry", icon: <BarChart2 className="h-4 w-4" /> },
    { label: "Standings", tab: "standings", href: "/f1?tab=standings", icon: <Trophy className="h-4 w-4" /> },
    { label: "Calendar", tab: "calendar", href: "/f1?tab=calendar", icon: <Calendar className="h-4 w-4" /> },
    { label: "Results", tab: "results", href: "/f1?tab=results", icon: <Flag className="h-4 w-4" /> },
    { label: "Updates", tab: "updates", href: "/f1?tab=updates", icon: <Rss className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full bg-transparent border-b border-[#333333] overflow-x-auto scrollbar-hide shrink-0">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
      <nav className="flex items-center gap-2 px-6 h-12 min-w-max">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 h-full px-4 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? "text-[#FBBF24]"
                  : "text-[#6B7280] hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[#FBBF24] rounded-t-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function F1SubNav() {
  return (
    <Suspense fallback={<div className="w-full bg-[#111111] border-b border-[#1f1f1f] h-12 shrink-0"></div>}>
      <F1SubNavContent />
    </Suspense>
  );
}
