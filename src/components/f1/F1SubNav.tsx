"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, RotateCcw, BarChart2, Trophy, Calendar, Flag, Rss } from "lucide-react";

export function F1SubNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Live", href: "/f1/live", icon: <Zap className="h-4 w-4" /> },
    { label: "Replay", href: "/f1/replay", icon: <RotateCcw className="h-4 w-4" /> },
    { label: "Telemetry", href: "/f1/telemetry", icon: <BarChart2 className="h-4 w-4" /> },
    { label: "Standings", href: "/f1/standings", icon: <Trophy className="h-4 w-4" /> },
    { label: "Calendar", href: "/f1/calendar", icon: <Calendar className="h-4 w-4" /> },
    { label: "Results", href: "/f1/results", icon: <Flag className="h-4 w-4" /> },
    { label: "Updates", href: "/f1/updates", icon: <Rss className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full bg-[#111111] border-b border-[#1f1f1f] overflow-x-auto scrollbar-hide shrink-0">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />
      <nav className="flex items-center gap-6 px-6 h-12 min-w-max">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 h-full px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "border-[#3b82f6] text-white"
                  : "border-transparent text-[#737373] hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
