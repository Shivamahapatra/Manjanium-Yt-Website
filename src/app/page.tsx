"use client";

import React, { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconBrandYoutube, 
  IconArrowRight,
  IconBrandTwitch,
  IconBrandDiscord,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandPinterest,
  IconBrandReddit
} from "@tabler/icons-react";
import Link from "next/link";
import { ChannelsGrid } from "@/components/social/ChannelsGrid";
import { Activity, BarChart2, Trophy, Calendar, Rss, MapPin } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { HeroSection } from "@/components/home/HeroSection";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { SectionTitle } from "@/components/home/SectionTitle";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Globe } from "@/components/ui/Globe";
import { GroupStandingsCard } from "@/components/football/GroupStandingsCard";

const globeConfig = {
  pointLight: "#ffffff",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  showAtmosphere: true,
  atmosphereColor: "#0ea5e9",
  atmosphereAltitude: 0.1,
  polygonColor: "rgba(14, 165, 233, 0.4)",
  globeColor: "#0f172a",
  autoRotate: true,
  autoRotateSpeed: 1,
};

const globeData = [
  {
    order: 1,
    startLat: 51.5074,
    startLng: -0.1278,
    endLat: 48.8566,
    endLng: 2.3522,
    arcAlt: 0.2,
    color: "#0ea5e9",
  },
  {
    order: 2,
    startLat: 48.8566,
    startLng: 2.3522,
    endLat: 41.9028,
    endLng: 12.4964,
    arcAlt: 0.2,
    color: "#10b981",
  },
];

const mockGroupData = {
  id: "group-a",
  groupName: "A" as const,
  teams: [
    { id: "t1", name: "USA", flag: "🇺🇸", logo: "", players: [], played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 5, goalsAgainst: 2, goalDifference: 3, points: 7, qualification: "qualified" as const },
    { id: "t2", name: "Mexico", flag: "🇲🇽", logo: "", players: [], played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 4, goalsAgainst: 3, goalDifference: 1, points: 6, qualification: "qualified" as const },
    { id: "t3", name: "Canada", flag: "🇨🇦", logo: "", players: [], played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 4, qualification: "contending" as const },
    { id: "t4", name: "Panama", flag: "🇵🇦", logo: "", players: [], played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 5, goalDifference: -4, points: 0, qualification: "eliminated" as const },
  ]
};

// --- HOVER EFFECT COMPONENT ---
const FeaturesHoverEffect = ({ items }: { items: any[] }) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="h-full"
        >
          <Link
            href={item.path}
            className="relative group block h-full w-full cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className={`absolute inset-0 h-full w-full ${item.hoverBg} block rounded-2xl`}
                  layoutId="hoverBackground"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                />
              )}
            </AnimatePresence>
            <motion.div 
              className="rounded-2xl h-full w-full p-6 bg-card-bg dark:bg-card-bg backdrop-blur-md border border-card-border dark:border-card-border shadow-md dark:shadow-lg relative z-20 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className={`mb-4 ${item.textColor} text-4xl`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {item.icon}
              </motion.div>
              <h4 className="text-text-primary dark:text-text-primary font-bold text-lg tracking-wide mt-2">{item.title}</h4>
              <p className="mt-3 text-text-secondary dark:text-text-secondary tracking-wide leading-relaxed text-sm flex-1">{item.description}</p>
              <motion.div 
                className={`mt-6 text-sm font-semibold ${item.textColor} flex items-center gap-2`}
                whileHover={{ x: 4 }}
              >
                Explore <motion.span whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}><IconArrowRight className="w-4 h-4" /></motion.span>
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// --- MOCK TIMING TOWER ---
const MockTimingTower = () => {
  const initialDrivers = [
    { pos: 1, acronym: "VER", gap: "LEADER", color: "#3671C6" },
    { pos: 2, acronym: "NOR", gap: "+1.432", color: "#FF8000" },
    { pos: 3, acronym: "LEC", gap: "+4.201", color: "#E8002D" },
    { pos: 4, acronym: "HAM", gap: "+8.911", color: "#27F4D2" },
    { pos: 5, acronym: "RUS", gap: "+11.003", color: "#27F4D2" },
    { pos: 6, acronym: "PIA", gap: "+14.551", color: "#FF8000" },
    { pos: 7, acronym: "ANT", gap: "+18.992", color: "#27F4D2" },
    { pos: 8, acronym: "ALO", gap: "+22.105", color: "#229971" },
    { pos: 9, acronym: "GAS", gap: "+26.441", color: "#0090FF" },
    { pos: 10, acronym: "COL", gap: "+31.008", color: "#64C4FF" },
  ];

  const [data, setData] = useState(initialDrivers);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((d, i) => {
          if (i === 0) return d;
          const currentGap = parseFloat(d.gap.replace("+", ""));
          const newGap = (currentGap + (Math.random() * 0.2 - 0.05)).toFixed(3);
          return { ...d, gap: `+${newGap}` };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-bg-secondary/30 backdrop-blur-md border border-border-primary/50 rounded-xl overflow-hidden relative font-mono text-sm h-full flex flex-col w-full">
      <div className="flex bg-bg-tertiary/50 p-3 text-xs text-text-tertiary font-bold border-b border-border-primary/50">
        <div className="w-8">POS</div>
        <div className="flex-1">DRIVER</div>
        <div className="w-20 text-right">GAP</div>
      </div>
      <div className="p-2 flex flex-col gap-1.5 flex-1 justify-center">
        {data.slice(0, 8).map((d, i) => (
          <motion.div
            key={d.acronym}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center px-3 py-2 bg-card-bg/50 rounded border border-border-primary/30 transition-colors"
          >
            <div className="w-8 text-text-tertiary font-bold">{d.pos}</div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-1.5 h-4 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
              <span className="font-bold text-text-primary tracking-wider">{d.acronym}</span>
            </div>
            <div className={`w-20 text-right font-bold ${i === 0 ? "text-brand-primary" : "text-text-secondary"}`}>
              {d.gap}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function HomePage() {
  const features = [
    {
      title: "Live Timing Tower",
      description: "Real-time intervals and gap data during every session.",
      icon: <Activity className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-brand-primary",
      hoverBg: "bg-brand-primary/10",
      path: "/f1?tab=live",
    },
    {
      title: "Head-to-Head Telemetry",
      description: "Compare speed, throttle, brake and gear between any two drivers.",
      icon: <BarChart2 className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-brand-primary",
      hoverBg: "bg-brand-primary/10",
      path: "/f1?tab=telemetry",
    },
    {
      title: "Championship Standings",
      description: "Driver and Constructor tables updated after every race.",
      icon: <Trophy className="w-8 h-8" />,
      accent: "amber",
      textColor: "text-brand-accent",
      hoverBg: "bg-brand-accent/10",
      path: "/f1?tab=standings",
    },
    {
      title: "Football Match Center",
      description: "Live scores and World Cup 2026 group standings.",
      icon: <MapPin className="w-8 h-8" />,
      accent: "green",
      textColor: "text-brand-secondary",
      hoverBg: "bg-brand-secondary/10",
      path: "/football",
    },
    {
      title: "Race Calendar",
      description: "Full 2026 F1 season schedule in your local timezone.",
      icon: <Calendar className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-brand-primary",
      hoverBg: "bg-brand-primary/10",
      path: "/f1?tab=calendar",
    },
    {
      title: "Technical Updates",
      description: "Latest car upgrades and regulation news aggregated from top sources.",
      icon: <Rss className="w-8 h-8" />,
      accent: "neutral",
      textColor: "text-text-secondary",
      hoverBg: "bg-interactive-hover",
      path: "/f1?tab=updates",
    },
  ];

  const socialChannels = [
    {
      name: "Twitch",
      description: "Live F1 Telemetry & Analysis. Watch real-time data streams.",
      icon: <IconBrandTwitch className="w-8 h-8" />,
      followers: "50K",
      buttonText: "Watch Live",
      url: "#",
      accentColor: "text-purple-500 border-purple-500/20 group-hover:border-purple-500/50",
    },
    {
      name: "YouTube",
      description: "Highlights & Deep Dives. Match replays and F1 analysis.",
      icon: <IconBrandYoutube className="w-8 h-8" />,
      followers: "100K",
      buttonText: "Subscribe",
      url: "https://www.youtube.com/@manjaniumonsofts67",
      accentColor: "text-red-500 border-red-500/20 group-hover:border-red-500/50",
    },
    {
      name: "Discord",
      description: "Join Our Community. Chat with fans, discuss races and matches.",
      icon: <IconBrandDiscord className="w-8 h-8" />,
      followers: "5K",
      buttonText: "Join Server",
      url: "#",
      accentColor: "text-indigo-400 border-indigo-400/20 group-hover:border-indigo-400/50",
    },
    {
      name: "Twitter / X",
      description: "Fast-paced updates, news flashes, and live commentary.",
      icon: <IconBrandX className="w-8 h-8" />,
      followers: "25K",
      buttonText: "Follow",
      url: "#",
      accentColor: "text-zinc-600 dark:text-zinc-200 border-zinc-200/20 group-hover:border-zinc-400/50",
    },
    {
      name: "Instagram",
      description: "Behind-the-scenes, paddock photos, and matchday vibes.",
      icon: <IconBrandInstagram className="w-8 h-8" />,
      followers: "75K",
      buttonText: "Follow",
      url: "#",
      accentColor: "text-pink-500 border-pink-500/20 group-hover:border-pink-500/50",
    },
    {
      name: "TikTok",
      description: "Short clips, funny moments, and quick technical analysis.",
      icon: <IconBrandTiktok className="w-8 h-8" />,
      followers: "150K",
      buttonText: "Follow",
      url: "#",
      accentColor: "text-teal-500 border-teal-500/20 group-hover:border-teal-500/50",
    },
    {
      name: "Reddit",
      description: "Deep technical discussions, strategy analysis, and memes.",
      icon: <IconBrandReddit className="w-8 h-8" />,
      followers: "10K",
      buttonText: "Join Subreddit",
      url: "#",
      accentColor: "text-orange-500 border-orange-500/20 group-hover:border-orange-500/50",
    },
    {
      name: "Pinterest",
      description: "High-res wallpapers, data viz graphics, and car designs.",
      icon: <IconBrandPinterest className="w-8 h-8" />,
      buttonText: "Follow",
      url: "#",
      accentColor: "text-red-600 border-red-600/20 group-hover:border-red-600/50",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary overflow-hidden selection:bg-brand-primary/30 relative">
      
      {/* NOISE BACKGROUND */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-10 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <AuroraBackground showRadialGradient className="min-h-screen w-full relative pb-20 pt-10 lg:pt-0 bg-transparent">
        {/* Side Rays Effect */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <SideRays
            speed={1.8}
            rayColor1="var(--brand-primary)"
            rayColor2="var(--brand-secondary)"
            intensity={1.2}
            spread={1.8}
            origin="top-right"
            tilt={0}
            saturation={1.2}
            blend={0.5}
            falloff={2.0}
            opacity={0.4}
          />
        </div>

        <HeroSection />
      </AuroraBackground>

      {/* DASHBOARD SECTION */}
      <div className="py-24 max-w-7xl mx-auto px-6 w-full">
        <SectionTitle 
          title="Live Dashboard" 
          subtitle="Real-time telemetry and statistics from across the world of F1 and Football."
        />

        <DashboardGrid>
          {/* Timing Tower Card */}
          <Card 
            title="Live Timing Tower" 
            headerAction={<Badge variant="alert" pulse>Live</Badge>}
            className="lg:col-span-1"
          >
            <MockTimingTower />
          </Card>

          {/* 3D Globe Card */}
          <Card 
            title="Circuit Locations" 
            className="lg:col-span-2 min-h-[400px]"
          >
            <div className="h-[350px] w-full relative">
              <Globe globeConfig={globeConfig} data={globeData} />
            </div>
          </Card>

          {/* Football Standings Card */}
          <Card 
            title="World Cup 2026 Standings" 
            className="lg:col-span-1"
          >
            <GroupStandingsCard groupData={mockGroupData} onTeamClick={() => {}} />
          </Card>

          {/* Telemetry Card */}
          <Card 
            title="Live Telemetry" 
            className="lg:col-span-2"
          >
            <div className="h-[300px] w-full flex items-center justify-center bg-bg-secondary/50 rounded-lg border border-dashed border-border-primary">
              <div className="text-center">
                <Activity className="w-12 h-12 text-brand-primary mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary font-medium">Real-time Telemetry Stream Active</p>
                <p className="text-text-tertiary text-sm mt-1">Syncing with OpenF1 servers...</p>
              </div>
            </div>
          </Card>
        </DashboardGrid>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-24 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle 
            title="Platform Features" 
            subtitle="Everything you need to track the sport, completely engineered from scratch."
          />
          <FeaturesHoverEffect items={features} />
        </div>
      </div>

      {/* SOCIAL SECTION */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle 
            title="Join the Community" 
            subtitle="Follow us across our platforms for live updates, deep dives, and discussions."
          />
          <ChannelsGrid channels={socialChannels} />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-16 bg-bg-secondary border-t border-border-primary">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md">MN</div>
              <span className="font-serif font-bold text-text-primary text-lg">Manjanium On Softs</span>
            </div>
            <p className="text-text-tertiary text-sm">Built for fans, by fans. © 2026</p>
          </div>
          <div className="flex gap-8">
            <Link href="/f1" className="text-text-secondary hover:text-brand-primary transition-colors font-bold text-sm">F1 Hub</Link>
            <Link href="/football" className="text-text-secondary hover:text-brand-secondary transition-colors font-bold text-sm">Football</Link>
            <Link href="/f1?tab=calendar" className="text-text-secondary hover:text-text-primary transition-colors font-bold text-sm">Calendar</Link>
            <Link href="/f1?tab=standings" className="text-text-secondary hover:text-text-primary transition-colors font-bold text-sm">Standings</Link>
          </div>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => window.open('https://www.youtube.com/@manjaniumonsofts67', '_blank')}
          >
            <IconBrandYoutube className="w-4 h-4" /> Subscribe
          </Button>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-12 border-t border-border-primary/50 text-center">
          <p className="text-text-tertiary text-[10px] uppercase tracking-widest leading-relaxed">
            Data sourced from OpenF1, Jolpica & ESPN. <br />
            Not affiliated with Formula 1 or FIFA.
          </p>
        </div>
      </footer>
    </div>
  );
}
