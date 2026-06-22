"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import MainNavbar from "./MainNavbar";
import SportsSidebar from "./SportsSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isCustomLayoutPage = pathname === '/f1' || pathname === '/football';

  if (isCustomLayoutPage) {
    return (
      <div className="relative min-h-screen" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
      {/* Accessibility: Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-primary text-background px-4 py-2 rounded font-bold"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <MainNavbar />

      {/* Main Content Area */}
      <div className="flex-1 pt-16 w-full" style={{ height: 'calc(100dvh - 64px)' }}>
        <SportsSidebar>
          <main id="main-content" className="w-full h-full pb-16 md:pb-0 overflow-x-hidden overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </SportsSidebar>
      </div>
    </div>
  );
}
