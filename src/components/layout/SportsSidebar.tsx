"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Flag, Trophy, Settings } from "lucide-react";
import { IconBrandYoutube } from "@tabler/icons-react";

const SIDEBAR_ITEMS = [
  { label: "Home", href: "/", icon: <Home className="w-8 h-8" /> },
  { label: "YouTube", href: "https://www.youtube.com/@manjaniumonsofts67", icon: <IconBrandYoutube className="w-8 h-8" />, external: true },
  { label: "F1", href: "/f1", icon: <Flag className="w-8 h-8" /> },
  { label: "Football", href: "/football", icon: <Trophy className="w-8 h-8" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="w-8 h-8" /> },
];

export function SportsSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col-reverse md:flex-row h-full w-full bg-background flex-1 mx-auto overflow-hidden">
      {/* Navigation Bar */}
      <nav className="flex md:flex-col items-center justify-around md:justify-start bg-[#0f172a] py-2 md:py-4 w-full md:w-20 shrink-0 border-t md:border-t-0 md:border-r border-border h-[72px] md:h-full overflow-y-visible z-[4000]">
        
        {/* Navigation Icons */}
        <ul className="flex flex-row md:flex-col gap-2 md:gap-6 items-center justify-around w-full px-2 md:px-0 md:mt-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              !item.external &&
              (pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href)));

            return (
              <li key={item.label} className="relative group flex justify-center">
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all duration-150",
                    isActive
                      ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                      : "text-[#f1f5f9] hover:bg-white/5 hover:text-[#fbbf24]"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-full h-full"
                  >
                    {item.icon}
                  </motion.div>
                </Link>
                
                {/* Tooltip (Desktop Only) */}
                <div className="hidden md:flex absolute left-full ml-4 px-3 py-1.5 bg-black text-[#f1f5f9] text-sm font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 items-center">
                  {/* Tooltip arrow */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-black" />
                  {item.label}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-background relative h-full">
        {children}
      </div>
    </div>
  );
}
