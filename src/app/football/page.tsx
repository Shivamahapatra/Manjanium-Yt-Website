"use client";

import React, { useEffect, useState } from "react";
import { LiveChatMarquee } from "@/components/chat/LiveChatMarquee";
import { Card, Spin } from "antd";
import { motion } from "framer-motion";

export default function FootballHubPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const response = await fetch('/api/football/fixtures/live');
        const data = await response.json();
        // API-Sports wraps data arrays inside a "response" key
        if (data.response) {
          setFixtures(data.response);
        }
      } catch (error) {
        console.error("Error fetching Football data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const isLive = fixtures.length > 0;

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
            {fixtures.map((match: any) => {
              const homeTeam = match.teams.home;
              const awayTeam = match.teams.away;
              const fixture = match.fixture;
              const league = match.league;

              return (
                <Card 
                  key={fixture.id}
                  hoverable
                  className="rounded-[20px] overflow-hidden border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm"
                  bodyStyle={{ padding: 0 }}
                >
                  <div className="bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex justify-between">
                    <span className="flex items-center gap-2">
                      {league.logo && <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />}
                      {league.season} • {league.name}
                    </span>
                    <span className="text-red-500">
                      {fixture.status.elapsed ? `${fixture.status.elapsed}'` : fixture.status.short}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <img src={homeTeam?.logo || "/placeholder.png"} alt={homeTeam?.name} className="w-12 h-12 object-contain bg-white rounded-full p-1" />
                        <span className="text-sm font-bold text-center dark:text-white line-clamp-1">{homeTeam?.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center w-1/3">
                        <div className="text-3xl font-black font-mono dark:text-white">
                          {match.goals.home ?? 0} - {match.goals.away ?? 0}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <img src={awayTeam?.logo || "/placeholder.png"} alt={awayTeam?.name} className="w-12 h-12 object-contain bg-white rounded-full p-1" />
                        <span className="text-sm font-bold text-center dark:text-white line-clamp-1">{awayTeam?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-black px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-sm flex justify-between">
                    <span className="text-neutral-500">{fixture.venue?.name || "TBD"}</span>
                    <span className="text-neutral-400 text-xs">{new Date(fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </Card>
              );
            })}
            
            {!fixtures.length && (
              <div className="col-span-full text-center py-20 text-neutral-500">
                No live matches found right now. Check back later!
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
