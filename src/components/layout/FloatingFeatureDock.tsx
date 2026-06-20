"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  Home,
  Activity,
  Trophy,
  Users,
  BarChart2,
  Medal,
  Target,
  Settings,
  Flag,
  Car,
  History
} from "lucide-react";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export function FloatingFeatureDock() {
  const pathname = usePathname();
  const [currentSection, setCurrentSection] = useState<"f1" | "football" | "home">("home");

  // Determine context
  useEffect(() => {
    if (pathname?.includes("/f1")) {
      setCurrentSection("f1");
    } else if (pathname?.includes("/football")) {
      setCurrentSection("football");
    } else {
      setCurrentSection("home");
    }
  }, [pathname]);

  const handleToggleLiveMatches = () => {
    console.log("Toggle Live Matches");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleOpenSettings = () => {
    console.log("Open Settings");
    alert("Settings panel coming soon!");
  };

  // Base Items
  const homeItem: DockItem = {
    title: "Home",
    icon: <Home className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
    href: "/",
  };

  const settingsItem: DockItem = {
    title: "Settings",
    icon: <Settings className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
    onClick: handleOpenSettings,
  };

  // Football Items
  const footballItems: DockItem[] = [
    {
      title: "Live Matches",
      icon: <Activity className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/football?tab=live",
    },
    {
      title: "Standings",
      icon: <Trophy className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/football?tab=standings",
    },
    {
      title: "Players",
      icon: <Users className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/football?tab=playerSearch",
    },
    {
      title: "Past Matches",
      icon: <History className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/football?tab=pastMatches",
    },
    {
      title: "Top Scorers",
      icon: <Medal className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/football?tab=topScorers",
    },
    {
      title: "Match Details",
      icon: <Target className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/football?tab=live", // Points to live tab where match details are accessible
    },
  ];

  // F1 Items
  const f1Items: DockItem[] = [
    {
      title: "Live Timing",
      icon: <Activity className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      onClick: handleToggleLiveMatches,
    },
    {
      title: "Standings",
      icon: <Trophy className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/f1#standings",
    },
    {
      title: "Drivers",
      icon: <Users className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/f1#drivers",
    },
    {
      title: "Telemetry",
      icon: <BarChart2 className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/f1#telemetry",
    },
    {
      title: "Constructors",
      icon: <Car className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/f1#constructors",
    },
    {
      title: "Race Control",
      icon: <Flag className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
      href: "/f1#race-control",
    },
  ];

  // Dynamic Item List
  let currentItems: DockItem[] = [];
  if (currentSection === "football") {
    currentItems = [homeItem, ...footballItems, settingsItem];
  } else if (currentSection === "f1") {
    currentItems = [homeItem, ...f1Items, settingsItem];
  } else {
    // Mixed default view
    currentItems = [
      homeItem,
      {
        title: "F1 Hub",
        icon: <Car className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
        href: "/f1",
      },
      {
        title: "Football Hub",
        icon: <Activity className="h-full w-full text-neutral-300 group-hover:text-manjanium-gold transition-colors" />,
        href: "/football",
      },
      settingsItem,
    ];
  }

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      
      const key = e.key;
      // If key is a number 1-9
      const index = parseInt(key, 10) - 1;
      if (!isNaN(index) && index >= 0 && index < currentItems.length) {
        const item = currentItems[index];
        if (item.onClick) {
          item.onClick();
        } else if (item.href) {
          window.location.href = item.href;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentItems]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[5000]">
      <FloatingDock
        items={currentItems}
        desktopClassName="bg-primary border border-border shadow-2xl"
        mobileClassName="bg-primary border border-border shadow-2xl"
      />
    </div>
  );
}
