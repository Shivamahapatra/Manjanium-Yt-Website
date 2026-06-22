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
import { Terminal } from "@/components/ui/terminal";

// --- HOVER EFFECT COMPONENT ---
const FeaturesHoverEffect = ({ items }: { items: any[] }) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
      {items.map((item, idx) => (
        <Link
          key={item.title}
          href={item.path}
          className="relative group block p-2 h-full w-full cursor-pointer"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className={`absolute inset-0 h-full w-full ${item.hoverBg} block rounded-3xl`}
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <div className="rounded-2xl h-full w-full p-6 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl relative z-20 flex flex-col overflow-hidden transition-colors">
            <div className={`mb-4 ${item.textColor}`}>{item.icon}</div>
            <h4 className="text-zinc-900 dark:text-zinc-50 font-bold tracking-wide mt-4">{item.title}</h4>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 tracking-wide leading-relaxed text-sm flex-1">{item.description}</p>
            <div className={`mt-6 text-sm font-bold ${item.textColor} flex items-center gap-1`}>
              Explore <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

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
    <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl rounded-2xl overflow-hidden relative font-mono text-sm h-full flex flex-col w-full max-w-sm mx-auto">
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded text-[10px] font-sans font-bold text-zinc-600 dark:text-zinc-400 z-10">
        SIMULATED DATA
      </div>
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-3 text-xs text-zinc-600 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-8">POS</div>
        <div className="flex-1">DRIVER</div>
        <div className="w-20 text-right">GAP</div>
      </div>
      <div className="p-2 flex flex-col gap-1.5 flex-1 justify-center">
        {data.map((d, i) => (
          <motion.div
            key={d.acronym}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-transparent transition-colors"
          >
            <div className="w-8 text-zinc-500 font-bold">{d.pos}</div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-1.5 h-4 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">{d.acronym}</span>
            </div>
            <div className={`w-20 text-right font-bold ${i === 0 ? "text-blue-500 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-300"}`}>
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
  const telemetryCommands = [
    "manjanium config --env=production",
    "npm run connect --api=f1 --realtime",
    "Fetching driver data: VER, NOR, LEC...",
    "Syncing World Cup 2026 data stream..."
  ];
  const telemetryOutputs = {
    0: ["[OK] Environment loaded."],
    1: ["Starting secure websocket connection to OpenF1...", "Connected: port 8080", "10hz data stream established."],
    2: ["VER gap to LEADER: 0.000", "NOR gap to LEADER: +1.432", "[Pipeline active]"],
    3: ["Group A fixtures synced.", "Match Center ready."]
  };

  const features = [
    {
      title: "Live Timing Tower",
      description: "Real-time intervals and gap data during every session.",
      icon: <Activity className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-blue-500",
      hoverBg: "bg-blue-500/[0.1]",
      path: "/f1?tab=live",
    },
    {
      title: "Head-to-Head Telemetry",
      description: "Compare speed, throttle, brake and gear between any two drivers.",
      icon: <BarChart2 className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-blue-500",
      hoverBg: "bg-blue-500/[0.1]",
      path: "/f1?tab=telemetry",
    },
    {
      title: "Championship Standings",
      description: "Driver and Constructor tables updated after every race.",
      icon: <Trophy className="w-8 h-8" />,
      accent: "amber",
      textColor: "text-amber-500",
      hoverBg: "bg-amber-500/[0.1]",
      path: "/f1?tab=standings",
    },
    {
      title: "Football Match Center",
      description: "Live scores and World Cup 2026 group standings.",
      icon: <MapPin className="w-8 h-8" />,
      accent: "green",
      textColor: "text-green-500",
      hoverBg: "bg-green-500/[0.1]",
      path: "/football",
    },
    {
      title: "Race Calendar",
      description: "Full 2026 F1 season schedule in your local timezone.",
      icon: <Calendar className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-blue-500",
      hoverBg: "bg-blue-500/[0.1]",
      path: "/f1?tab=calendar",
    },
    {
      title: "Technical Updates",
      description: "Latest car upgrades and regulation news aggregated from top sources.",
      icon: <Rss className="w-8 h-8" />,
      accent: "neutral",
      textColor: "text-neutral-500 dark:text-neutral-400",
      hoverBg: "bg-neutral-500/[0.1]",
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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden selection:bg-blue-500/30 relative">
      
      {/* NOISE BACKGROUND */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* SECTION 1 — HERO */}
      <div className="relative">
        <AuroraBackground showRadialGradient className="min-h-screen w-full relative pb-20 pt-10 lg:pt-0 bg-transparent">
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-screen w-full relative z-10 pt-20 lg:pt-0">
            {/* Hero Left Text Column */}
            <div className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left max-w-2xl">
              <div className="flex flex-col gap-4 items-center lg:items-start">
                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className="text-5xl md:text-7xl font-serif font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-[1.1] mb-2"
                >
                  Manjanium <br className="hidden lg:block"/> 
                  <span className="text-zinc-900 dark:text-zinc-50 drop-shadow-sm">On Softs</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                  className="text-lg md:text-xl text-zinc-900 dark:text-zinc-50 font-medium"
                >
                  The Ultimate F1 & Football Hub. Track every session and match in real-time.
                </motion.p>
              </div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full"
              >
                <Link
                  href="/f1"
                  className="bg-stitch-secondary hover:bg-stitch-secondary-container text-white dark:text-zinc-950 font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                >
                  Enter F1 Hub <IconArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/football"
                  className="bg-stitch-primary hover:bg-stitch-primary-container text-white dark:text-zinc-950 font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                >
                  Enter Football Center <IconArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>

            {/* Hero Right Terminal Column */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex-1 w-full max-w-xl hidden lg:block"
            >
              <Terminal 
                commands={telemetryCommands} 
                outputs={telemetryOutputs} 
                username="manjanium-core" 
                enableSound={false}
              />
            </motion.div>
          </div>
        </AuroraBackground>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* SECTION 2 — LIVE TELEMETRY PREVIEW */}
        <div className="w-full relative z-10 py-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-blue-600 dark:text-blue-500 text-xs font-bold tracking-widest uppercase mb-4">F1 HUB</div>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-zinc-900 dark:text-zinc-50 leading-tight mb-2">
                Live Sports Telemetry<br/>
                <span className="text-blue-600 dark:text-blue-500 italic">Uninterrupted.</span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 my-8 leading-relaxed max-w-lg font-medium">
                Track every gap, interval, and sector time as it happens. Built for fans who want more than a broadcast.
              </p>
              <Link href="/f1" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-bold flex items-center gap-2 group transition-colors">
                Go to F1 Hub 
                <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
               <MockTimingTower />
            </motion.div>

          </div>
        </div>

        {/* SECTION 3 — FEATURES GRID */}
        <div className="w-full relative z-10 py-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-6">Platform Features</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto font-medium">Everything you need to track the sport, completely engineered from scratch.</p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
          >
             <FeaturesHoverEffect items={features} />
          </motion.div>
        </div>

        {/* SECTION 4 — SOCIAL CHANNELS */}
        <div className="w-full relative z-10 py-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-500 tracking-widest uppercase">Community</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-6">Follow Us on Social Media</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
              Join thousands of fans across our platforms. Live streams, updates, and community discussions.
            </p>
          </motion.div>

          <ChannelsGrid channels={socialChannels} />
        </div>

        {/* SECTION 5 — FOOTBALL STRIP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl rounded-3xl p-8 md:p-12 relative z-10 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-3 flex items-center justify-center md:justify-start gap-3">
                <span className="text-2xl">⚽</span> FIFA World Cup 2026
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">Live scores and group standings — updated in real time.</p>
            </div>
            <Link href="/football">
              <button
                className="bg-green-600 text-white hover:bg-green-700 font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Enter Football Center <IconArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </motion.div>

      </div>

      {/* SECTION 6 — FOOTER */}
      <footer className="w-full bg-white dark:bg-zinc-950 py-12 border-t border-zinc-200 dark:border-zinc-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <div className="text-zinc-900 dark:text-zinc-50 font-serif font-black text-xl mb-1">Manjanium On Softs</div>
              <div className="text-zinc-500 text-sm font-medium">Built for fans, by fans.</div>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <Link href="/f1" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">F1 Hub</Link>
              <Link href="/football" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Football</Link>
              <Link href="/f1?tab=calendar" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Calendar</Link>
              <Link href="/f1?tab=standings" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Standings</Link>
            </div>

            <div>
              <Link href="https://www.youtube.com/@manjaniumonsofts67" target="_blank" rel="noopener noreferrer">
                <button className="bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-xs font-bold">
                  <IconBrandYoutube className="w-4 h-4 text-[#E10600]" /> Subscribe
                </button>
              </Link>
            </div>
          </div>
          
          <div className="text-center text-xs text-zinc-500 pt-8 border-t border-zinc-200 dark:border-zinc-800 font-medium">
            Data sourced from OpenF1, Jolpica & ESPN. Not affiliated with Formula 1 or FIFA.
          </div>
        </div>
      </footer>

    </div>
  );
}
