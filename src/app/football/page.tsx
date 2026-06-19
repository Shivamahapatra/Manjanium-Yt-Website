"use client";

import React, { useEffect, useState } from "react";
import { LiveChatMarquee } from "@/components/chat/LiveChatMarquee";
import { Card, Spin } from "antd";
import { motion } from "framer-motion";

export default function FootballHubPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/football/live");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching Football data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const isLive = data?.events?.some(
    (event: any) => event.status?.type?.state === "in"
  ) ?? true; // Default to true to show off the simulation

  return (
    <div className="min-h-screen p-8 bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-300 dark:border-neutral-800 pb-4">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500">Live Match Center</h1>
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE MATCHES
            </motion.div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data?.events?.map((event: any) => {
              const homeTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
              const awayTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');

              return (
                <Card 
                  key={event.id}
                  hoverable
                  className="rounded-[20px] overflow-hidden border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm"
                  bodyStyle={{ padding: 0 }}
                >
                  <div className="bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex justify-between">
                    <span>{event.season?.year} • {event.competitions[0]?.type?.abbreviation || 'Match'}</span>
                    <span className={event.status.type.state === "in" ? "text-red-500" : ""}>
                      {event.status.type.detail}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <img src={homeTeam?.team?.logo || "/placeholder.png"} alt={homeTeam?.team?.name} className="w-12 h-12 object-contain bg-white rounded-full p-1" />
                        <span className="text-sm font-bold text-center dark:text-white line-clamp-1">{homeTeam?.team?.shortDisplayName}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center w-1/3">
                        <div className="text-3xl font-black font-mono dark:text-white">
                          {homeTeam?.score || "0"} - {awayTeam?.score || "0"}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <img src={awayTeam?.team?.logo || "/placeholder.png"} alt={awayTeam?.team?.name} className="w-12 h-12 object-contain bg-white rounded-full p-1" />
                        <span className="text-sm font-bold text-center dark:text-white line-clamp-1">{awayTeam?.team?.shortDisplayName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-black px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-sm flex justify-between">
                    <span className="text-neutral-500">{event.competitions[0]?.venue?.fullName || "TBD"}</span>
                    <a href={event.links?.[0]?.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">
                      Gamecast
                    </a>
                  </div>
                </Card>
              );
            })}
            
            {!data?.events?.length && (
              <div className="col-span-full text-center py-20 text-neutral-500">
                No matches found right now.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulation of Live Chat when active */}
      <LiveChatMarquee isActive={isLive} />
    </div>
  );
}
