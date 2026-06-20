"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Flag, Trophy, Settings } from "lucide-react";
import { IconBrandYoutube } from "@tabler/icons-react";
import "@/styles/sidebar.css";

const SIDEBAR_ITEMS = [
  { label: "HOME", href: "/", icon: <Home className="w-6 h-6" /> },
  { label: "YOUTUBE", href: "https://www.youtube.com/@manjaniumonsofts67", icon: <IconBrandYoutube className="w-6 h-6" />, external: true },
  { label: "F1", href: "/f1", icon: <Flag className="w-6 h-6" /> },
  { label: "FOOTBALL", href: "/football", icon: <Trophy className="w-6 h-6" /> },
  { label: "SETTINGS", href: "/settings", icon: <Settings className="w-6 h-6" /> },
];

export function SportsSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* DESKTOP SIDEBAR (Absolute left, expands on hover over the content) */}
      <motion.nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ width: isHovered ? 240 : 80 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="hidden md:flex flex-col absolute top-0 left-0 h-full border-r border-[#fbbf24] premium-sidebar z-[5000] overflow-hidden"
      >
        {/* Brand Logo / Top Section */}
        <div className="flex items-center h-[80px] shrink-0 px-5 pt-4">
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center shrink-0 shadow-lg group hover:border-[#fbbf24] transition-colors relative">
             <div className="absolute inset-0 bg-[#fbbf24] opacity-0 group-hover:opacity-20 blur-md rounded-xl transition-opacity" />
             <span className="text-white font-black text-xl leading-none relative z-10">M</span>
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="ml-4 text-white font-heading font-bold tracking-widest text-lg whitespace-nowrap"
              >
                SPORTS HUB
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-3 pt-8 px-4 sidebar-scroll-area">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = !item.external && (pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href)));

            return (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="group relative flex items-center h-12 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]"
                aria-label={item.label}
              >
                {/* Active Indicator Line */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-8 w-1 bg-[#fbbf24] rounded-r-full shadow-[0_0_8px_#fbbf24]"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Active Background Highlight */}
                {isActive && (
                  <div className="absolute inset-0 bg-[#fbbf24]/10 rounded-xl pointer-events-none" />
                )}

                {/* Icon Container */}
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={cn(
                      "flex items-center justify-center transition-colors duration-150 relative",
                      isActive ? "text-[#fbbf24]" : "text-[#94a3b8] group-hover:text-[#fbbf24]"
                    )}
                  >
                    {isActive && <div className="absolute inset-0 bg-[#fbbf24] blur-lg opacity-20" />}
                    {item.icon}
                  </motion.div>
                </div>

                {/* Label (Visible on expand) */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "ml-3 text-[14px] font-[Inter] font-semibold tracking-wide whitespace-nowrap",
                        isActive ? "text-[#fbbf24]" : "text-[#f1f5f9] group-hover:text-white"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] premium-sidebar-mobile border-t border-[#fbbf24]/30 z-[5000] px-4">
        <ul className="flex items-center justify-between h-full">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = !item.external && (pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href)));

            return (
              <li key={item.label} className="relative flex justify-center w-full">
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]",
                    isActive
                      ? "text-[#fbbf24]"
                      : "text-[#94a3b8] hover:text-[#fbbf24]"
                  )}
                  aria-label={item.label}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center w-full h-full relative"
                  >
                    {isActive && <div className="absolute inset-0 bg-[#fbbf24] blur-md opacity-20 rounded-full scale-150" />}
                    {item.icon}
                  </motion.div>
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    className="absolute -top-3 w-8 h-1 bg-[#fbbf24] rounded-b-full shadow-[0_0_8px_#fbbf24]"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* MAIN CONTENT AREA */}
      {/* On desktop: left padding is 80px to accommodate collapsed sidebar. */}
      {/* On mobile: bottom padding is 72px */}
      <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden md:pl-[80px] pb-[72px] md:pb-0 relative z-10">
        {children}
      </div>
    </div>
  );
}
