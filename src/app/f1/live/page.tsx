'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Spin } from 'antd';
import { motion } from 'framer-motion';
import { Radio, Clock, Flag } from 'lucide-react';
import { LiveTimingTower } from '@/components/f1/LiveTimingTower';
import { ChannelsBanner } from '@/components/social/ChannelsBanner';
import { ChannelsGrid } from '@/components/social/ChannelsGrid';
import { IconBrandTwitch, IconBrandYoutube, IconBrandDiscord, IconBrandX } from "@tabler/icons-react";

function F1HubContent() {
  const [session, setSession] = useState<any>(null);
  const [driversMap, setDriversMap] = useState<Record<string, any>>({});
  const [positions, setPositions] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  /* --------- Fetch Live Data --------- */
  const fetchLiveData = useCallback(async () => {
    try {
      const liveRes = await fetch('/api/f1/live');
      const liveJson = await liveRes.json();

      if (liveJson.session) setSession(liveJson.session);

      if (liveJson.drivers && Array.isArray(liveJson.drivers)) {
        const map: Record<string, any> = {};
        liveJson.drivers.forEach((d: any) => {
          map[d.driver_number] = d;
        });
        setDriversMap(map);
      }

      if (Array.isArray(liveJson.positions) && Array.isArray(liveJson.intervals)) {
        const latestPositions = new Map<number, any>();
        liveJson.positions.forEach((p: any) => {
          if (!latestPositions.has(p.driver_number) ||
              new Date(p.date) > new Date(latestPositions.get(p.driver_number).date)) {
            latestPositions.set(p.driver_number, p);
          }
        });

        const latestIntervals = new Map<number, any>();
        liveJson.intervals.forEach((i: any) => {
          if (!latestIntervals.has(i.driver_number) ||
              new Date(i.date) > new Date(latestIntervals.get(i.driver_number).date)) {
            latestIntervals.set(i.driver_number, i);
          }
        });

        const merged = Array.from(latestPositions.values())
          .map((pos) => {
            const intv = latestIntervals.get(pos.driver_number);
            return {
              ...pos,
              gap_to_leader: intv?.gap_to_leader ?? '+0.000',
              interval: intv?.interval ?? '+0.000',
            };
          })
          .sort((a, b) => a.position - b.position);

        setPositions(merged);
      }
    } catch (error) {
      console.error('F1 Live Data Error:', error);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const isQuali = session?.session_type === 'Qualifying';
  const isRace = session?.session_type === 'Race';
  const isSessionActive = session !== null;

  return (
    <div className="w-full flex flex-col pt-8 px-4 sm:px-8 max-w-7xl mx-auto z-10 relative pb-32">
      
      {/* Background glow tailored for F1 */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ===== HERO / HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4 relative z-10">
        <div className="flex flex-col gap-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-1.5 h-8 bg-manjanium-gold rounded-full" />
            <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white drop-shadow-md">
              Manjanium F1 Hub
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-2 mt-2">
            {isSessionActive ? (
               <motion.div
               animate={{ opacity: [1, 0.6, 1] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               className="bg-red-500/20 border border-red-500/50 text-red-500 px-3 py-1 rounded text-xs font-bold flex items-center gap-2"
             >
               <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
               LIVE: {session.session_name}
             </motion.div>
            ) : (
              <div className="bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 px-3 py-1 rounded text-xs font-bold flex items-center gap-2">
                <Clock className="w-3 h-3" /> NO ACTIVE SESSION
              </div>
            )}
            <p className="text-sm md:text-base text-neutral-400 font-medium pl-2 border-l border-white/10">
              {isSessionActive ? session.country_name : "Next: Austrian Grand Prix in 8d 5h 29m"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isQuali && (
             <span className="text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1.5 rounded-lg">
               SECTOR TIMES PRIORITIZED
             </span>
          )}
          {isRace && (
             <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg">
               INTERVAL GAPS PRIORITIZED
             </span>
          )}
        </div>
      </div>

      <div className="relative min-h-[500px] w-full z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {liveLoading ? (
                <div className="flex items-center justify-center h-64"><Spin size="large" /></div>
              ) : (
                <LiveTimingTower />
              )}
            </div>
            
            {/* Circuit Info Placeholder */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-primary/50 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-bold tracking-wide">Circuit Focus</h3>
                </div>
                {isSessionActive ? (
                    <div className="flex flex-col gap-3">
                      <div className="text-sm text-neutral-400">Track: <span className="text-white font-medium">{session?.circuit_short_name || 'Active Track'}</span></div>
                      <div className="w-full h-32 border border-dashed border-white/10 rounded-lg flex items-center justify-center bg-black/20 text-neutral-500 text-xs mt-2">
                        Circuit Map Unavailable
                      </div>
                    </div>
                ) : (
                  <div className="text-neutral-500 text-sm">
                    Waiting for session to begin to display track data.
                  </div>
                )}
              </div>

              <div className="bg-primary/50 border border-white/5 rounded-2xl p-6 shadow-xl flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-5 h-5 text-red-400" />
                  <h3 className="text-white font-bold tracking-wide">Race Control</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-neutral-500 italic">No recent messages</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== F1 SOCIAL PROMO ===== */}
      <div className="mt-16 flex flex-col gap-12 relative z-10 w-full">
        <ChannelsBanner
          title="Live Timing & Race Analysis"
          description="Watch our real-time telemetry streams on Twitch. We cover every practice, qualifying, and race session with deep technical analysis."
          icon={<IconBrandTwitch className="w-10 h-10 text-purple-400" />}
          buttonText="Watch on Twitch"
          url="#"
          accentColor="bg-purple-600/20"
        />

        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Stay Updated</h3>
          <ChannelsGrid channels={[
            {
              name: "YouTube",
              description: "Race highlights, strategy breakdowns, and data analysis.",
              icon: <IconBrandYoutube className="w-8 h-8" />,
              followers: "100K",
              buttonText: "Subscribe",
              url: "https://www.youtube.com/@manjaniumonsofts67",
              accentColor: "text-red-500 border-red-500/20 group-hover:border-red-500/50",
            },
            {
              name: "Discord",
              description: "Join the F1 community. Discuss live timing and strategy.",
              icon: <IconBrandDiscord className="w-8 h-8" />,
              followers: "5K",
              buttonText: "Join Server",
              url: "#",
              accentColor: "text-indigo-400 border-indigo-400/20 group-hover:border-indigo-400/50",
            },
            {
              name: "Twitter / X",
              description: "Live session updates, penalties, and breaking news.",
              icon: <IconBrandX className="w-8 h-8" />,
              followers: "25K",
              buttonText: "Follow",
              url: "#",
              accentColor: "text-neutral-200 border-neutral-200/20 group-hover:border-neutral-200/50",
            }
          ]} />
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>}>
      <F1HubContent />
    </Suspense>
  );
}
