"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Clock, Trophy, BarChart2, Calendar, Radio, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/live', label: 'Live Dashboard', icon: Activity },
  { href: '/telemetry', label: 'Telemetry', icon: BarChart2 },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/results', label: 'Results', icon: Clock },
  { href: '/replay', label: 'Replay', icon: Radio },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-md text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800/50">
          <div className="w-8 h-8 rounded bg-[#E10600] flex items-center justify-center font-bold text-white tracking-tighter">
            F1
          </div>
          <span className="font-extrabold tracking-tight text-white text-xl">COSMOS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#E10600] rounded-r-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className={cn("transition-colors", isActive ? "text-[#E10600]" : "group-hover:text-zinc-300")} />
                  <span className="font-medium text-sm">{link.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <div className="px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-500 font-mono flex items-center justify-between">
            <span>VERSION</span>
            <span className="text-zinc-300">v2.0.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
