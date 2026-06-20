"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LiveChatMarquee } from "@/components/chat/LiveChatMarquee";
import { Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Clock, Trophy, Activity, Users, History, Medal } from "lucide-react";

// Shadcn Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn-tabs";
import { cn } from "@/lib/utils";
import { ChannelsBanner } from '@/components/social/ChannelsBanner';
import { ChannelsGrid } from '@/components/social/ChannelsGrid';
import { IconBrandYoutube, IconBrandDiscord, IconBrandX } from "@tabler/icons-react";

// Components
import { GroupStandingsCard } from "@/components/football/GroupStandingsCard";
import { PlayerStatsModal } from "@/components/football/PlayerStatsModal";
import { TopScorersWidget } from "@/components/football/TopScorersWidget";
import { getTopScorers } from "@/lib/football-utils";
import { Team, StandingsResponse } from "@/types/football";
import { MatchSummary } from "@/types/match";
import { PastMatches } from "@/components/football/PastMatches";

function FootballHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Tabs State (Initialize from URL if present)
  const defaultTab = searchParams.get("tab") || "live";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Sync tab state with URL without triggering full reloads
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

  // State
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [debugStats, setDebugStats] = useState<any>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  const [pastMatches, setPastMatches] = useState<MatchSummary[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [errorPast, setErrorPast] = useState<string | null>(null);


  const [standingsData, setStandingsData] = useState<StandingsResponse | null>(null);
  const [loadingStandings, setLoadingStandings] = useState(true);
  const [errorStandings, setErrorStandings] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('/api/football/fixtures/live');
      const data = await response.json();
      if (data.response) {
        setFixtures(data.response);
        setDebugStats(data.debug);
      }
    } catch (error) {
      console.error("Error fetching Live Matches", error);
    } finally {
      setLoadingLive(false);
    }
  };

  const fetchPastMatches = async () => {
    setLoadingPast(true);
    try {
      const res = await fetch('/api/football/matches/past?limit=20');
      if (!res.ok) throw new Error('Failed to fetch past matches');
      const data = await res.json();
      setPastMatches(data.matches || []);
    } catch (err: any) {
      console.error(err);
      setErrorPast('Failed to load past matches');
    } finally {
      setLoadingPast(false);
    }
  };

  const fetchStandingsData = async (bypassCache = false) => {
    setLoadingStandings(true);
    setErrorStandings(null);
    try {
      const url = bypassCache 
        ? '/api/football/world-cup/standings-with-players?cache=false' 
        : '/api/football/world-cup/standings-with-players';
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch standings');
      
      const data = await response.json();
      setStandingsData(data);
    } catch (error: any) {
      setErrorStandings(error.message || 'Failed to load standings');
    } finally {
      setLoadingStandings(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    fetchPastMatches();
    fetchStandingsData();
    const interval = setInterval(fetchLiveMatches, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    if (activeTab === 'live') {
      setLoadingLive(true);
      fetchLiveMatches();
    } else if (activeTab === 'pastMatches') {
      fetchPastMatches();
    } else {
      fetchStandingsData(true);
    }
  };

  const liveCount = debugStats?.liveCount || 0;
  const isLive = liveCount > 0;
  const isUpcoming = !isLive && fixtures.length > 0;

  const topScorers = standingsData?.groups ? getTopScorers(standingsData.groups, 10) : [];
  const lastUpdated = standingsData?.lastUpdated || new Date().toISOString();

  return (
    <div className="w-full flex flex-col pt-8 px-4 sm:px-8 max-w-7xl mx-auto z-10 relative">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
        <div className="flex flex-col gap-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-1.5 h-8 bg-manjanium-gold rounded-full" />
            <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white drop-shadow-md">
              Football Hub
            </h1>
          </motion.div>
          <p className="text-sm md:text-base text-neutral-400 font-medium pl-4">
            FIFA World Cup 2026 Live Coverage
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          {isLive ? (
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-sm"
            >
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              {liveCount} LIVE MATCHES
            </motion.div>
          ) : isUpcoming ? (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
              UPCOMING MATCHES
            </div>
          ) : null}

          <button 
            onClick={handleManualRefresh}
            disabled={loadingLive || loadingStandings || loadingPast}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 group"
          >
            <RefreshCw className={`w-3.5 h-3.5 group-hover:text-manjanium-gold transition-colors ${(loadingLive && activeTab === 'live') || (loadingStandings && activeTab !== 'live' && activeTab !== 'pastMatches') || (loadingPast && activeTab === 'pastMatches') ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs System */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col">
        
        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto scrollbar-hide pb-2 mb-6">
          <TabsList className="bg-primary/50 border border-white/5 p-1 rounded-xl flex w-max sm:w-full sm:justify-start">
            <TabsTrigger value="live" className="gap-2 px-6 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Activity className="w-4 h-4" /> LIVE MATCHES
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-2 px-6 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Trophy className="w-4 h-4" /> STANDINGS
            </TabsTrigger>
            <TabsTrigger value="topScorers" className="gap-2 px-6 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Medal className="w-4 h-4" /> TOP SCORERS
            </TabsTrigger>
            <TabsTrigger value="playerSearch" className="gap-2 px-6 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <Users className="w-4 h-4" /> PLAYER SEARCH
            </TabsTrigger>
            <TabsTrigger value="pastMatches" className="gap-2 px-6 rounded-lg data-[state=active]:bg-manjanium-gold data-[state=active]:text-black transition-all">
              <History className="w-4 h-4" /> PAST MATCHES
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Global Timestamp */}
        {activeTab !== 'live' && activeTab !== 'playerSearch' && activeTab !== 'pastMatches' && (
          <div className="flex items-center gap-2 mb-6 text-xs text-neutral-400 font-medium px-2">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Updates daily at 12:00 AM UTC</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="relative min-h-[500px] w-full">
          
          {/* LIVE MATCHES */}
          <TabsContent value="live" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {loadingLive && fixtures.length === 0 ? (
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
                    const isMatchUpcoming = match.isUpcoming;

                    return (
                      <motion.div 
                        key={fixture.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group"
                        onClick={() => router.push(`/football/matches/${fixture.id}`)}
                      >
                        <div className="bg-primary border border-white/5 hover:border-manjanium-gold/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg hover:shadow-manjanium-gold/10 hover:-translate-y-1">
                          
                          {/* Card Header */}
                          <div className="bg-black/40 px-5 py-3 text-xs font-semibold text-neutral-400 flex justify-between items-center border-b border-white/5">
                            <span className="flex items-center gap-2">
                              {league.logo && <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain brightness-200" />}
                              {league.name}
                            </span>
                            <span className={cn("px-2 py-1 rounded-md bg-black/50 border", isMatchUpcoming ? "text-amber-500 border-amber-500/20" : "text-red-500 border-red-500/20 animate-pulse")}>
                              {fixture.status.elapsed ? `${fixture.status.elapsed}'` : fixture.status.short}
                            </span>
                          </div>
                          
                          {/* Card Body */}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              {/* Home Team */}
                              <div className="flex flex-col items-center gap-3 w-[35%]">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 p-2 shadow-inner">
                                  <img src={homeTeam?.logo || "/placeholder.png"} alt={homeTeam?.name} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-sm font-bold text-center text-white line-clamp-2">{homeTeam?.name}</span>
                              </div>
                              
                              {/* Score */}
                              <div className="flex flex-col items-center justify-center w-[30%]">
                                {isMatchUpcoming ? (
                                  <div className="text-2xl font-bold text-neutral-400 text-center whitespace-nowrap font-mono">
                                    {new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                ) : (
                                  <div className="text-4xl font-black font-mono text-manjanium-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                                    {match.goals.home ?? 0} - {match.goals.away ?? 0}
                                  </div>
                                )}
                              </div>

                              {/* Away Team */}
                              <div className="flex flex-col items-center gap-3 w-[35%]">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 p-2 shadow-inner">
                                  <img src={awayTeam?.logo || "/placeholder.png"} alt={awayTeam?.name} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-sm font-bold text-center text-white line-clamp-2">{awayTeam?.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Footer */}
                          <div className="bg-black/20 px-5 py-3 border-t border-white/5 text-xs flex justify-between items-center text-neutral-500">
                            <span className="truncate max-w-[70%]">{fixture.venue?.name || "TBD Stadium"}</span>
                            <span className="whitespace-nowrap">{new Date(fixture.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {!fixtures.length && !loadingLive && (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl bg-black/20">
                      <p className="text-neutral-400 text-lg font-medium mb-2">No matches scheduled right now.</p>
                      <p className="text-sm text-neutral-500">Check back later for live updates.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* STANDINGS */}
          <TabsContent value="standings" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {loadingStandings && !standingsData ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : errorStandings ? (
                <div className="flex flex-col items-center justify-center h-64 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-red-500 font-bold mb-2">Failed to load standings</p>
                  <button onClick={() => fetchStandingsData(true)} className="px-4 py-2 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-800">
                    Retry Connection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {standingsData?.groups?.map((group) => (
                    <GroupStandingsCard key={group.groupName} groupData={group} onTeamClick={(team) => setSelectedTeam(team)} isExpanded={true} />
                  ))}
                  {(!standingsData?.groups || standingsData.groups.length === 0) && (
                    <div className="col-span-full text-center py-12 text-neutral-500">Standings data is not available yet.</div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* TOP SCORERS */}
          <TabsContent value="topScorers" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex justify-center">
              {loadingStandings && !standingsData ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : errorStandings ? (
                <div className="text-red-500 p-8 text-center bg-red-500/10 rounded-xl w-full max-w-2xl border border-red-500/20">
                  Failed to load scorer data.
                </div>
              ) : (
                <div className="w-full max-w-4xl">
                  <TopScorersWidget scorers={topScorers} lastUpdated={lastUpdated} />
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* PAST MATCHES */}
          <TabsContent value="pastMatches" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {errorPast ? (
                <div className="flex flex-col items-center justify-center h-64 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-red-500 font-bold mb-2">Failed to load past matches</p>
                  <button onClick={() => fetchPastMatches()} className="px-4 py-2 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-800">
                    Retry Connection
                  </button>
                </div>
              ) : (
                <div className="w-full bg-primary/50 rounded-2xl border border-white/5 p-6 shadow-xl">
                  <PastMatches matches={pastMatches} isLoading={loadingPast && pastMatches.length === 0} onMatchClick={(match) => router.push(`/football/matches/${match.id}`)} />
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* PLAYER SEARCH */}
          <TabsContent value="playerSearch" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex justify-center">
               <div className="flex flex-col items-center justify-center h-80 border border-dashed border-white/10 rounded-2xl w-full max-w-3xl bg-black/20">
                  <Users className="w-16 h-16 text-neutral-600 mb-4 opacity-50" />
                  <p className="text-white text-2xl font-bold mb-3 font-heading">Global Player Search</p>
                  <p className="text-sm text-manjanium-gold bg-manjanium-gold/10 border border-manjanium-gold/20 px-4 py-1.5 rounded-full font-bold">Coming Soon</p>
                </div>
            </motion.div>
          </TabsContent>

        </div>
      </Tabs>

      {/* ===== FOOTBALL SOCIAL PROMO ===== */}
      <div className="mt-16 mb-8 flex flex-col gap-12 relative z-10 w-full">
        <ChannelsBanner
          title="World Cup Highlights"
          description="Subscribe to our YouTube channel for exclusive match highlights, deep-dive tactical analysis, and World Cup predictions."
          icon={<IconBrandYoutube className="w-10 h-10 text-red-500" />}
          buttonText="Subscribe Now"
          url="https://www.youtube.com/@manjaniumonsofts67"
          accentColor="bg-red-600/20"
        />

        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Connect With Us</h3>
          <ChannelsGrid channels={[
            {
              name: "Twitter / X",
              description: "Live score updates, goal alerts, and breaking transfer news.",
              icon: <IconBrandX className="w-8 h-8" />,
              followers: "25K",
              buttonText: "Follow",
              url: "#",
              accentColor: "text-neutral-200 border-neutral-200/20 group-hover:border-neutral-200/50",
            },
            {
              name: "YouTube",
              description: "Post-match analysis, player ratings, and weekly recaps.",
              icon: <IconBrandYoutube className="w-8 h-8" />,
              followers: "100K",
              buttonText: "Subscribe",
              url: "https://www.youtube.com/@manjaniumonsofts67",
              accentColor: "text-red-500 border-red-500/20 group-hover:border-red-500/50",
            },
            {
              name: "Discord",
              description: "Join the Football community. Live match chat and debates.",
              icon: <IconBrandDiscord className="w-8 h-8" />,
              followers: "5K",
              buttonText: "Join Server",
              url: "#",
              accentColor: "text-indigo-400 border-indigo-400/20 group-hover:border-indigo-400/50",
            }
          ]} />
        </div>
      </div>

      {/* Global Modals */}
      <PlayerStatsModal isOpen={selectedTeam !== null} team={selectedTeam} players={selectedTeam?.players || []} onClose={() => setSelectedTeam(null)} />

      {/* Simulation of Live Chat when active */}
      <LiveChatMarquee isActive={isLive && activeTab === 'live'} />
      
    </div>
  );
}

// Wrap in Suspense boundary for useSearchParams
export default function FootballHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>}>
      <FootballHubContent />
    </Suspense>
  );
}
