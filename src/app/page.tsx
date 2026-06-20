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
        <div
          key={item.title}
          className="relative group block p-2 h-full w-full"
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
          <div className="rounded-2xl h-full w-full p-6 bg-primary/80 backdrop-blur-md border border-border relative z-20 flex flex-col overflow-hidden group-hover:border-manjanium-gold transition-colors shadow-2xl">
            <div className={`mb-4 ${item.textColor}`}>{item.icon}</div>
            <h4 className="text-white font-bold tracking-wide mt-4">{item.title}</h4>
            <p className="mt-4 text-neutral-400 tracking-wide leading-relaxed text-sm flex-1">{item.description}</p>
            <div className={`mt-6 text-sm font-bold ${item.textColor} flex items-center gap-1`}>
              Explore <IconArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
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
    <div className="bg-primary/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden relative shadow-2xl font-mono text-sm h-full flex flex-col w-full max-w-sm mx-auto">
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-sans font-bold text-blue-400 z-10">
        SIMULATED DATA
      </div>
      <div className="flex bg-primary p-3 text-xs text-neutral-500 font-bold border-b border-border">
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
            className="flex items-center px-3 py-2 bg-background/50 rounded border border-transparent hover:border-border transition-colors"
          >
            <div className="w-8 text-neutral-500 font-bold">{d.pos}</div>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-1.5 h-4 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
              <span className="font-bold text-white tracking-wider">{d.acronym}</span>
            </div>
            <div className={`w-20 text-right font-bold ${i === 0 ? "text-blue-400" : "text-neutral-300"}`}>
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
    },
    {
      title: "Head-to-Head Telemetry",
      description: "Compare speed, throttle, brake and gear between any two drivers.",
      icon: <BarChart2 className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-blue-500",
      hoverBg: "bg-blue-500/[0.1]",
    },
    {
      title: "Championship Standings",
      description: "Driver and Constructor tables updated after every race.",
      icon: <Trophy className="w-8 h-8" />,
      accent: "amber",
      textColor: "text-amber-500",
      hoverBg: "bg-amber-500/[0.1]",
    },
    {
      title: "Football Match Center",
      description: "Live scores and World Cup 2026 group standings.",
      icon: <MapPin className="w-8 h-8" />,
      accent: "green",
      textColor: "text-green-500",
      hoverBg: "bg-green-500/[0.1]",
    },
    {
      title: "Race Calendar",
      description: "Full 2026 F1 season schedule in your local timezone.",
      icon: <Calendar className="w-8 h-8" />,
      accent: "blue",
      textColor: "text-blue-500",
      hoverBg: "bg-blue-500/[0.1]",
    },
    {
      title: "Technical Updates",
      description: "Latest car upgrades and regulation news aggregated from top sources.",
      icon: <Rss className="w-8 h-8" />,
      accent: "neutral",
      textColor: "text-neutral-400",
      hoverBg: "bg-neutral-500/[0.1]",
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
      accentColor: "text-neutral-200 border-neutral-200/20 group-hover:border-neutral-200/50",
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
      accentColor: "text-teal-400 border-teal-400/20 group-hover:border-teal-400/50",
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
    <div className="flex flex-col min-h-screen bg-background overflow-hidden selection:bg-blue-500/30 relative">
      
      {/* NOISE BACKGROUND */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* SECTION 1 — HERO */}
      <div className="relative">
        <AuroraBackground showRadialGradient className="min-h-screen w-full relative pb-20 pt-10 lg:pt-0">
          
          {/* Custom Static Grid Background inside Hero */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #1f1f1f 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {/* Custom Spotlights */}
          <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none z-0" />
          <div className="absolute top-[0%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none z-0" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center px-4 w-full max-w-7xl mx-auto h-full gap-12 lg:gap-8 mt-16 lg:mt-0">
            
            {/* Left Content Column */}
            <motion.div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm border border-border mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-xs font-bold text-white tracking-widest uppercase">LIVE NOW — F1 & Football Data Hub</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6"
              >
                Manjanium <br className="hidden lg:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-sm">On Softs</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="text-xl md:text-2xl text-neutral-400 max-w-xl font-light mb-10"
              >
                The Ultimate F1 & Football Hub. Track every session and match in real-time.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full lg:w-auto"
              >
                <Link href="/f1" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-lg w-full shadow-lg shadow-blue-500/20"
                  >
                    Enter F1 Hub <IconArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                <Link href="/football" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-green-600 hover:bg-green-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-lg w-full shadow-lg shadow-green-500/20"
                  >
                    Enter Football Center <IconArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <Link href="https://www.youtube.com/@manjaniumonsofts67" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white/10 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-md border border-white/10 text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-base w-full"
                  >
                    <IconBrandYoutube className="w-5 h-5 text-red-500" />
                    Subscribe
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
                className="flex flex-wrap justify-center lg:justify-start items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-widest"
              >
                <span>20 F1 Drivers</span>
                <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                <span>Real-time Telemetry</span>
                <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                <span>Global Football Coverage</span>
                <span className="w-1 h-1 bg-neutral-700 rounded-full hidden sm:block" />
                <span className="hidden sm:block">0 Ads</span>
              </motion.div>
            </motion.div>

            {/* Right Content Column — Terminal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex-1 w-full max-w-xl hidden md:block"
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

      {/* SECTION 2 — LIVE TELEMETRY PREVIEW */}
      <div className="w-full bg-background py-24 border-y border-border relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-4">F1 HUB</div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-2">
              Live Sports Telemetry<br/>
              <span className="text-blue-500 italic">Uninterrupted.</span>
            </h2>
            <p className="text-lg text-neutral-400 my-8 leading-relaxed max-w-lg">
              Track every gap, interval, and sector time as it happens. Built for fans who want more than a broadcast.
            </p>
            <Link href="/f1" className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-2 group transition-colors">
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
      <div className="w-full bg-background py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Platform Features</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Everything you need to track the sport, completely engineered from scratch.</p>
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
      </div>

      {/* SECTION 4 — SOCIAL CHANNELS */}
      <div className="w-full bg-background py-24 border-t border-border relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary border border-border mb-4">
              <span className="text-xs font-bold text-manjanium-gold tracking-widest uppercase">Community</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Follow Us on Social Media</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Join thousands of fans across our platforms. Live streams, updates, and community discussions.
            </p>
          </motion.div>

          <ChannelsGrid channels={socialChannels} />
        </div>
      </div>

      {/* SECTION 5 — WORLD CUP STRIP */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full bg-gradient-to-r from-primary to-background py-16 border-y border-border relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-2xl">⚽</span> FIFA World Cup 2026
            </h2>
            <p className="text-neutral-400 text-lg">Live scores and group standings — updated in real time.</p>
          </div>
          <Link href="/football">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-green-600 hover:bg-green-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-green-500/20"
            >
              Enter Football Center <IconArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* SECTION 5 — FOOTER */}
      <footer className="w-full bg-background py-12 border-t border-border relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <div className="text-white font-serif font-bold text-xl mb-1">Manjanium On Softs</div>
              <div className="text-neutral-500 text-sm">Built for fans, by fans.</div>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-semibold text-neutral-400">
              <Link href="/f1" className="hover:text-white transition-colors">F1 Hub</Link>
              <Link href="/football" className="hover:text-white transition-colors">Football</Link>
              <Link href="/f1?tab=calendar" className="hover:text-white transition-colors">Calendar</Link>
              <Link href="/f1?tab=standings" className="hover:text-white transition-colors">Standings</Link>
            </div>

            <div>
              <Link href="https://www.youtube.com/@manjaniumonsofts67" target="_blank" rel="noopener noreferrer">
                <button className="bg-primary hover:bg-primary/80 border border-border text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] text-xs font-bold">
                  <IconBrandYoutube className="w-4 h-4 text-red-500" /> Subscribe
                </button>
              </Link>
            </div>
          </div>
          
          <div className="text-center text-xs text-neutral-600 pt-8 border-t border-border">
            Data sourced from OpenF1, Jolpica & ESPN. Not affiliated with Formula 1 or FIFA.
          </div>
        </div>
      </footer>

    </div>
  );
}
