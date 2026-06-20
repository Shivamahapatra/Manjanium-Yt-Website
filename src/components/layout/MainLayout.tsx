"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MainNavbar } from "./MainNavbar";
import { SportsSidebar } from "./SportsSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // --- Global State ---
  const [currentSport, setCurrentSport] = useState<"f1" | "football" | "other">("other");
  const [liveMatchCount, setLiveMatchCount] = useState(0);
  
  // Mobile Sidebar State (controlled here to support the overlay)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- Data Fetching (Mock) ---
  useEffect(() => {
    const fetchLiveMatchCount = async () => {
      // Mock API call
      // In production, this would be: await fetch('/api/live-matches/count')
      const mockCount = Math.floor(Math.random() * 5) + 1; // Random 1-5
      setLiveMatchCount(mockCount);
    };

    fetchLiveMatchCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchLiveMatchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Context Awareness ---
  useEffect(() => {
    if (pathname?.includes("/f1")) {
      setCurrentSport("f1");
    } else if (pathname?.includes("/football")) {
      setCurrentSport("football");
    } else {
      setCurrentSport("other");
    }
  }, [pathname]);

  const handleSportChange = (sport: string) => {
    // In a real app, you might route here: router.push(`/${sport}`)
    // For now we just set state
    setCurrentSport(sport as any);
    window.location.href = `/${sport === 'other' ? '' : sport}`;
  };

  return (
    <div className="relative min-h-screen bg-background text-white font-sans selection:bg-manjanium-gold/30 flex flex-col">
      {/* Accessibility: Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-manjanium-navy text-white px-4 py-2 rounded font-bold"
      >
        Skip to main content
      </a>

      {/* Global Noise Background */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Navbar */}
      <MainNavbar 
        currentSport={currentSport}
        liveMatchCount={liveMatchCount}
        onSportChange={handleSportChange}
        onSettingsClick={() => alert("Settings coming soon")}
      />

      {/* Main Content Area (SportsSidebar handles the left/right flex layout natively) */}
      <div className="flex-1 pt-16 relative z-10 w-full h-[100dvh]">
        <SportsSidebar>
          <main id="main-content" className="w-full h-full pb-24 md:pb-6 relative z-10 overflow-x-hidden">
            {children}
          </main>
        </SportsSidebar>
      </div>


    </div>
  );
}
