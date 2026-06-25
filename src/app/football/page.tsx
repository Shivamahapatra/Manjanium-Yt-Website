"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin } from "antd";
import { motion } from "framer-motion";
import { Trophy, Activity, History, Medal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn-tabs";
import { GroupStandingsCard } from "@/components/football/GroupStandingsCard";
import { TopScorersWidget } from "@/components/football/TopScorersWidget";
import { getTopScorers } from "@/lib/football-utils";
import { Team, StandingsResponse } from "@/types/football";
import { PastMatches } from "@/components/football/PastMatches";
import { useFootballDashboardPreset } from "@/hooks/useFootballDashboardPreset";
import { useFootballRealtime } from "@/hooks/useFootballRealtime";
import { FootballPresetLiveMatches } from "@/components/football/presets/FootballPresetLiveMatches";
import { FootballPresetStandingsFocus } from "@/components/football/presets/FootballPresetStandingsFocus";
import { FootballPresetCompactStats } from "@/components/football/presets/FootballPresetCompactStats";
import { TerminalChat } from "@/components/chat/TerminalChat";
import { FootballBadge } from "@/components/football/FootballBadge";
import "@/styles/football-design-tokens.css";

function FootballHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { preset, loading: presetLoading } = useFootballDashboardPreset();
  
  const defaultTab = searchParams.get("tab") || "live";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/football?tab=${value}`, { scroll: false });
  };

  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [pastMatches, setPastMatches] = useState<any[]>([]);
  const [standingsData, setStandingsData] = useState<StandingsResponse | null>(null);
  const [loadingStandings, setLoadingStandings] = useState(true);

  useFootballRealtime((payload) => {
    const row = payload.new;
    const fixtureId =
      (row.fixture as { id?: string } | undefined)?.id ??
      (row.id as string | undefined);
    if (!fixtureId) return;

    setFixtures((prev) => {
      const idx = prev.findIndex((f) => (f?.fixture?.id ?? f?.id) === fixtureId);
      if (idx === -1) {
        return payload.eventType === 'INSERT' ? [...prev, row] : prev;
      }
      const next = [...prev];
      next[idx] = { ...next[idx], ...row };
      return next;
    });
  });

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const response = await fetch('/api/football/fixtures/live');
        const data = await response.json();
        if (data.response) setFixtures(data.response);
      } catch (error) {} finally {
        setLoadingLive(false);
      }
    };
    const fetchPastMatches = async () => {
      try {
        const res = await fetch('/api/football/matches/past?limit=20');
        const data = await res.json();
        setPastMatches(data.matches || []);
      } catch (err) {}
    };
    const fetchStandingsData = async () => {
      try {
        const res = await fetch('/api/football/world-cup/standings-with-players');
        const data = await res.json();
        setStandingsData(data);
      } catch (error) {} finally {
        setLoadingStandings(false);
      }
    };

    fetchLiveMatches();
    fetchPastMatches();
    fetchStandingsData();
    const interval = setInterval(fetchLiveMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const topScorers = standingsData?.groups ? getTopScorers(standingsData.groups, 10) : [];

  return (
    <div className="w-full flex flex-col pt-4 px-4 sm:px-8 max-w-[1600px] mx-auto lg:pr-[400px] z-10 relative pb-24 animate-fade-in-up">
      
      {/* Featured Match Hero from Stitch */}
      {fixtures.length > 0 && activeTab === 'live' && (
        <section className="relative h-64 md:h-96 overflow-hidden bg-[var(--football-surface)] border border-[var(--football-border)] rounded-[var(--football-radius)] mb-8 group shadow-lg">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-30" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3NY6o5XP0w9-K1jzK9q8qk1ygTDR7oBeZFvi_wcyqG18uGl4NMnPiQeuVtzG6wEedRO_IfBdO1fQGUkkSWt5wXAHHoJebUITGJxmhJQUMxXLqIqxgOxVARSQ8lZokABJ_8cB1xj2WV3Z-NFko8hxQYEFJEgKweB0awnrV0CzSYFSLo9XQiW83HkUJXR85DPTWMHbdi0Vtr2h-DA4vvhrCe2PE5wTcvFcevLyUi1cYiRJvzKpWkKHMGMU-cx2wgGO678L1YTxQ2os')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--football-surface)] via-[var(--football-surface)]/60 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 space-y-4 z-20">
            <div className="flex items-center gap-3">
              {fixtures[0].fixture?.status?.short === "1H" || fixtures[0].fixture?.status?.short === "2H" ? (
                <FootballBadge variant="live">
                  🔴 LIVE
                </FootballBadge>
              ) : (
                <FootballBadge variant="upcoming">
                  UPCOMING
                </FootballBadge>
              )}
              <span className="font-bold text-xs text-[var(--football-accent)] uppercase tracking-widest drop-shadow-md">
                {fixtures[0].league.name}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-6 max-w-4xl">
              <div className="flex-1 flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <h2 className="text-2xl md:text-3xl font-black drop-shadow-md uppercase text-white" style={{ fontFamily: 'var(--football-font-heading)' }}>{fixtures[0].teams.home.name}</h2>
                  <p className="text-xs font-bold text-[#6B7280] uppercase">HOME</p>
                </div>
                <div className="w-16 h-16 md:w-24 md:h-24 bg-black/50 border border-[#333333] rounded-2xl p-3 flex items-center justify-center backdrop-blur-sm">
                  <img src={fixtures[0].teams.home.logo} alt="Home" className="w-full h-full object-contain" />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl text-white font-bold tracking-tighter" style={{ fontFamily: 'var(--football-font-heading)' }}>
                  {fixtures[0].goals.home ?? 0} - {fixtures[0].goals.away ?? 0}
                </span>
                <span className="text-sm font-bold text-[#EF4444]">{fixtures[0].fixture?.status?.elapsed ? `${fixtures[0].fixture.status.elapsed}'` : 'TBD'}</span>
              </div>
              
              <div className="flex-1 flex items-center justify-end gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-black/50 border border-[#333333] rounded-2xl p-3 flex items-center justify-center backdrop-blur-sm">
                  <img src={fixtures[0].teams.away.logo} alt="Away" className="w-full h-full object-contain" />
                </div>
                <div className="text-left hidden md:block">
                  <h2 className="text-2xl md:text-3xl font-black drop-shadow-md uppercase text-white" style={{ fontFamily: 'var(--football-font-heading)' }}>{fixtures[0].teams.away.name}</h2>
                  <p className="text-xs font-bold text-[#6B7280] uppercase">AWAY</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs System */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col">
        <div className="w-full overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
          <TabsList className="bg-[#131313] border border-[#333333] p-1 rounded-xl flex w-max shadow-sm">
            <TabsTrigger value="live" className="gap-2 px-6 rounded-lg data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[#6B7280] font-bold text-xs uppercase tracking-wider transition-all">
              <Activity className="w-4 h-4" /> Live
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-background font-bold text-xs uppercase tracking-wider transition-all">
              <Trophy className="w-4 h-4" /> Standings
            </TabsTrigger>
            <TabsTrigger value="topScorers" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-background font-bold text-xs uppercase tracking-wider transition-all">
              <Medal className="w-4 h-4" /> Scorers
            </TabsTrigger>
            <TabsTrigger value="pastMatches" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-background font-bold text-xs uppercase tracking-wider transition-all">
              <History className="w-4 h-4" /> Past
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="relative min-h-[500px] w-full">
          
          <TabsContent value="live" className="mt-0 outline-none">
            {activeTab === 'live' && (
              <>
                {preset === 'live-matches' && (
                  <FootballPresetLiveMatches
                    fixtures={fixtures}
                    loadingLive={loadingLive}
                  />
                )}
                {preset === 'standings-focus' && (
                  <FootballPresetStandingsFocus
                    standingsData={standingsData}
                    loadingStandings={loadingStandings}
                  />
                )}
                {preset === 'compact-stats' && (
                  <FootballPresetCompactStats
                    fixtures={fixtures}
                    loadingLive={loadingLive}
                    standingsData={standingsData}
                    loadingStandings={loadingStandings}
                  />
                )}

                {/* Terminal Chat Widget for Football */}
                <TerminalChat context="football" />
              </>
            )}
          </TabsContent>

          <TabsContent value="standings" className="mt-0 outline-none">
            {activeTab === 'standings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {loadingStandings ? (
                   <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {standingsData?.groups?.map((group) => (
                      <GroupStandingsCard key={group.groupName} groupData={group} isExpanded={true} onTeamClick={() => {}} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="topScorers" className="mt-0 outline-none">
            {activeTab === 'topScorers' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-full max-w-4xl mx-auto glass-panel p-6 rounded-2xl">
                   <TopScorersWidget scorers={topScorers} lastUpdated={standingsData?.lastUpdated || ""} />
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="pastMatches" className="mt-0 outline-none">
            {activeTab === 'pastMatches' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div className="w-full glass-panel rounded-2xl p-6">
                   <PastMatches matches={pastMatches} isLoading={pastMatches.length === 0} onMatchClick={(match) => router.push(`/football/matches/${match.id}`)} />
                 </div>
              </motion.div>
            )}
          </TabsContent>
          
        </div>
      </Tabs>
    </div>
  );
}

export default function FootballHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Spin size="large" /></div>}>
      <FootballHubContent />
    </Suspense>
  );
}
