"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Flag,
  Activity,
  Trophy,
  Users,
  Car,
  Calendar,
  Video,
  Medal,
  BarChart2,
  History,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

// --- Types ---
interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultExpanded?: boolean;
}

// --- Data ---
const SIDEBAR_DATA: NavSection[] = [
  {
    title: "General",
    items: [
      { label: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: "F1 Hub",
    defaultExpanded: true,
    items: [
      { label: "Overview", href: "/f1", icon: <Flag className="w-5 h-5" /> },
      { label: "Live Races", href: "/f1/live", icon: <Activity className="w-5 h-5" /> },
      { label: "Driver Standings", href: "/f1/standings/drivers", icon: <Trophy className="w-5 h-5" /> },
      { label: "Constructor Standings", href: "/f1/standings/constructors", icon: <Car className="w-5 h-5" /> },
      { label: "Drivers", href: "/f1/drivers", icon: <Users className="w-5 h-5" /> },
      { label: "Teams", href: "/f1/teams", icon: <Car className="w-5 h-5" /> },
      { label: "Calendar", href: "/f1/calendar", icon: <Calendar className="w-5 h-5" /> },
      { label: "Highlights", href: "/f1/highlights", icon: <Video className="w-5 h-5" /> },
    ],
  },
  {
    title: "Football Hub",
    defaultExpanded: true,
    items: [
      { label: "Overview", href: "/football", icon: <Flag className="w-5 h-5" /> },
      { label: "Live Matches", href: "/football/live", icon: <Activity className="w-5 h-5" /> },
      {
        label: "Standings",
        icon: <Trophy className="w-5 h-5" />,
        children: [
          { label: "Group A", href: "/football/standings/group-a", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group B", href: "/football/standings/group-b", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group C", href: "/football/standings/group-c", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group D", href: "/football/standings/group-d", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group E", href: "/football/standings/group-e", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group F", href: "/football/standings/group-f", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group G", href: "/football/standings/group-g", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
          { label: "Group H", href: "/football/standings/group-h", icon: <div className="w-2 h-2 rounded-full bg-neutral-500" /> },
        ],
      },
      { label: "Players", href: "/football/players", icon: <Users className="w-5 h-5" /> },
      { label: "Top Scorers", href: "/football/top-scorers", icon: <Medal className="w-5 h-5" /> },
      { label: "Match Calendar", href: "/football/calendar", icon: <Calendar className="w-5 h-5" /> },
      { label: "Statistics", href: "/football/stats", icon: <BarChart2 className="w-5 h-5" /> },
      { label: "Past Matches", href: "/football/history", icon: <History className="w-5 h-5" /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
      { label: "Help", href: "/help", icon: <HelpCircle className="w-5 h-5" /> },
    ],
  },
];

// --- Internal Components ---

const CollapsibleItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { open: isSidebarOpen, animate } = useSidebar();
  
  const isDirectlyActive = item.href ? pathname === item.href : false;
  const isChildActive = item.children?.some((child) => pathname === child.href);
  const isActive = isDirectlyActive || isChildActive;

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  const toggleOpen = (e: React.MouseEvent) => {
    if (item.children) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const content = (
    <>
      <div className={cn("flex-shrink-0 transition-colors", isActive ? "text-manjanium-gold" : "text-neutral-400 group-hover:text-manjanium-gold")}>
        {item.icon}
      </div>
      <motion.div
        animate={{
          display: animate ? (isSidebarOpen ? "flex" : "none") : "flex",
          opacity: animate ? (isSidebarOpen ? 1 : 0) : 1,
        }}
        className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap"
      >
        <span className={cn("text-sm transition-colors", isActive ? "text-white font-semibold" : "text-neutral-300 group-hover:text-white")}>
          {item.label}
        </span>
        {item.children && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-neutral-500"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </motion.div>
    </>
  );

  const wrapperClasses = cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-300",
    isActive ? "bg-manjanium-gold/10" : "hover:bg-white/5",
    depth > 0 && "ml-4" // Indent nested items
  );

  return (
    <div className="flex flex-col">
      {item.href && !item.children ? (
        <Link href={item.href} className={wrapperClasses}>
          {content}
        </Link>
      ) : (
        <div onClick={toggleOpen} className={wrapperClasses}>
          {content}
        </div>
      )}

      {/* Nested Children Accordion */}
      {item.children && (
        <AnimatePresence initial={false}>
          {isOpen && isSidebarOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="mt-1 flex flex-col gap-1 border-l border-white/10 ml-5 pl-2">
                {item.children.map((child) => (
                  <CollapsibleItem key={child.label} item={child} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

const SectionAccordion = ({ section }: { section: NavSection }) => {
  const [isOpen, setIsOpen] = useState(section.defaultExpanded ?? true);
  const { open: isSidebarOpen, animate } = useSidebar();

  return (
    <div className="flex flex-col mb-6">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          display: animate ? (isSidebarOpen ? "flex" : "none") : "flex",
          opacity: animate ? (isSidebarOpen ? 1 : 0) : 1,
        }}
        className="flex items-center justify-between w-full px-2 mb-2 group cursor-pointer"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-manjanium-gold/70 group-hover:text-manjanium-gold transition-colors">
          {section.title}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 text-neutral-600 group-hover:text-manjanium-gold transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {(isOpen || !isSidebarOpen) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-1 overflow-hidden"
          >
            {section.items.map((item) => (
              <CollapsibleItem key={item.label} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Component ---

export function SportsSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Double click toggler for desktop width
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.innerWidth >= 768) {
      setOpen(!open);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-background flex-1 mx-auto overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 bg-primary border-r border-manjanium-gold/20 shadow-2xl z-[4000]">
          
          {/* Header Branding area (Double click to toggle) */}
          <div 
            className="flex items-center gap-3 px-2 py-4 cursor-pointer select-none group"
            onDoubleClick={handleDoubleClick}
          >
            <div className="w-8 h-8 rounded bg-manjanium-navy flex items-center justify-center border border-white/10 group-hover:border-manjanium-gold/50 transition-colors shrink-0">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <motion.span 
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-white font-heading font-bold tracking-widest text-lg whitespace-nowrap"
            >
              SPORTS HUB
            </motion.span>
          </div>

          {/* Scrollable Navigation Area */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {SIDEBAR_DATA.map((section) => (
              <SectionAccordion key={section.title} section={section} />
            ))}
          </div>
          
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0 relative">
        {children}
      </main>
    </div>
  );
}
