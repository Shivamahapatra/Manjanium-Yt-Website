'use client';

import React, { useEffect, useState } from "react";
import { LiveChatMarquee } from "@/components/chat/LiveChatMarquee";
import { Card, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Clock, Trophy, Activity, Users, History } from "lucide-react";

// Import new components and utils
import { GroupStandingsCard } from "@/components/football/GroupStandingsCard";
import { PlayerStatsModal } from "@/components/football/PlayerStatsModal";
import { TopScorersWidget } from "@/components/football/TopScorersWidget";
import { getTopScorers } from "@/lib/football-utils";
import { Team, StandingsResponse } from "@/types/football";
import { MatchSummary } from "@/types/match";
import { PastMatches } from "@/components/football/PastMatches";
import { MatchDetailsModal } from "@/components/football/MatchDetailsModal";

export default function FootballHubPage() {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'live' | 'standings' | 'topScorers' | 'pastMatches' | 'playerSearch'>('live');

  // Existing Live Matches State
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [debugStats, setDebugStats] = useState<any>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  // New Past Matches State
  const [pastMatches, setPastMatches] = useState<MatchSummary[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [errorPast, setErrorPast] = useState<string | null>(null);

  // Match Details Overlay State
  const [selectedMatch, setSelectedMatch] = useState<{ id: string, isLive: boolean } | null>(null);

  // New Standings State
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

  // Derived Data
  const liveCount = debugStats?.liveCount || 0;
  const isLive = liveCount > 0;
  const isUpcoming = !isLive && fixtures.length > 0;

  const topScorers = standingsData?.groups ? getTopScorers(standingsData.groups, 10) : [];
  const lastUpdated = standingsData?.lastUpdated || new Date().toISOString();

  const tabs = [
    { id: 'live', label: 'LIVE MATCHES', icon: <Activity className="w-4 h-4" /> },
    { id: 'pastMatches', label: 'PAST MATCHES', icon: <History className="w-4 h-4" /> },
    { id: 'standings', label: 'STANDINGS', icon: <Trophy className="w-4 h-4" /> },
    { id: 'topScorers', label: 'TOP SCORERS', icon: <span className="text-sm leading-none">⚽</span> },
    { id: 'playerSearch', label: 'PLAYER SEARCH', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen pb-20 bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      
      {/* Header Area */}
      <div className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-neutral-300 dark:border-neutral-800 gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-500 tracking-tight">
              Football Hub
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              FIFA World Cup 2026 Live Coverage
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            {isLive ? (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                LIVE MATCHES
              </motion.div>
            ) : isUpcoming ? (
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2">
                UPCOMING MATCHES
              </div>
            ) : null}

            <button 
              onClick={handleManualRefresh}
              disabled={loadingLive || loadingStandings || loadingPast}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-md text-xs font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(loadingLive && activeTab === 'live') || (loadingStandings && activeTab !== 'live' && activeTab !== 'pastMatches') || (loadingPast && activeTab === 'pastMatches') ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto scrollbar-none gap-2 mb-8 bg-neutral-200/50 dark:bg-neutral-900/50 p-1.5 rounded-xl border border-neutral-300 dark:border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-500 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Timestamp Global Info for non-live tabs */}
        {activeTab !== 'live' && activeTab !== 'playerSearch' && activeTab !== 'pastMatches' && (
          <div className="flex items-center gap-2 mb-6 text-xs text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Updates daily at 12:00 AM UTC</span>
          </div>
        )}

        {/* --- TAB CONTENT --- */}
        <AnimatePresence mode="wait">
          
          {/* LIVE MATCHES TAB */}
          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
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
                      <div 
                        key={fixture.id} 
                        onClick={() => setSelectedMatch({ id: fixture.id, isLive: true })}
                        className="block transition-transform hover:scale-[1.02] cursor-pointer"
                      >
                        <Card 
                          hoverable
                          className="rounded-[20px] overflow-hidden border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm"
                          bodyStyle={{ padding: 0 }}
                        >
                          <div className="bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex justify-between">
                            <span className="flex items-center gap-2">
                              {league.logo && <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />}
                              {league.season} • {league.name}
                            </span>
                            <span className={isMatchUpcoming ? "text-amber-500" : "text-red-500"}>
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
                                {isMatchUpcoming ? (
                                  <div className="text-xl font-bold text-neutral-600 dark:text-neutral-400 text-center whitespace-nowrap">
                                    {new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                ) : (
                                  <div className="text-3xl font-black font-mono dark:text-white">
                                    {match.goals.home ?? 0} - {match.goals.away ?? 0}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-center gap-2 w-1/3">
                                <img src={awayTeam?.logo || "/placeholder.png"} alt={awayTeam?.name} className="w-12 h-12 object-contain bg-white rounded-full p-1" />
                                <span className="text-sm font-bold text-center dark:text-white line-clamp-1">{awayTeam?.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-neutral-50 dark:bg-black px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-sm flex justify-between">
                            <span className="text-neutral-500">{fixture.venue?.name || "TBD"}</span>
                            <span className="text-neutral-400 text-xs">{new Date(fixture.date).toLocaleDateString()}</span>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                  
                  {!fixtures.length && !loadingLive && (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl">
                      <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium mb-2">No matches scheduled today.</p>
                      <p className="text-sm text-neutral-400">Check back later for live updates.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* PAST MATCHES TAB */}
          {activeTab === 'pastMatches' && (
            <motion.div
              key="pastMatches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {errorPast ? (
                <div className="flex flex-col items-center justify-center h-64 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-red-500 font-bold mb-2">Failed to load past matches</p>
                  <button 
                    onClick={() => fetchPastMatches()}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-800"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <PastMatches 
                  matches={pastMatches} 
                  isLoading={loadingPast && pastMatches.length === 0} 
                  onMatchClick={(match) => setSelectedMatch({ id: match.id, isLive: false })}
                />
              )}
            </motion.div>
          )}

          {/* STANDINGS TAB */}
          {activeTab === 'standings' && (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingStandings && !standingsData ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : errorStandings ? (
                <div className="flex flex-col items-center justify-center h-64 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-red-500 font-bold mb-2">Failed to load standings</p>
                  <button 
                    onClick={() => fetchStandingsData(true)}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-800"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {standingsData?.groups?.map((group) => (
                    <GroupStandingsCard 
                      key={group.groupName} 
                      groupData={group} 
                      onTeamClick={(team) => setSelectedTeam(team)} 
                      isExpanded={true}
                    />
                  ))}
                  {(!standingsData?.groups || standingsData.groups.length === 0) && (
                    <div className="col-span-full text-center py-12 text-neutral-500">
                      Standings data is not available yet.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TOP SCORERS TAB */}
          {activeTab === 'topScorers' && (
            <motion.div
              key="topScorers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              {loadingStandings && !standingsData ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : errorStandings ? (
                <div className="text-red-500 p-8 text-center bg-red-500/10 rounded-xl w-full max-w-2xl border border-red-500/20">
                  Failed to load scorer data.
                </div>
              ) : (
                <TopScorersWidget 
                  scorers={topScorers} 
                  lastUpdated={lastUpdated} 
                />
              )}
            </motion.div>
          )}

          {/* PLAYER SEARCH TAB (Placeholder) */}
          {activeTab === 'playerSearch' && (
            <motion.div
              key="playerSearch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
               <div className="flex flex-col items-center justify-center h-64 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl w-full max-w-3xl bg-neutral-50 dark:bg-neutral-900/50">
                  <Users className="w-12 h-12 text-neutral-400 mb-4 opacity-50" />
                  <p className="text-neutral-500 dark:text-neutral-400 text-xl font-bold mb-2">Player Search</p>
                  <p className="text-sm text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-3 py-1 rounded-full">Coming Soon</p>
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Global Modals */}
      <PlayerStatsModal 
        isOpen={selectedTeam !== null}
        team={selectedTeam}
        players={selectedTeam?.players || []}
        onClose={() => setSelectedTeam(null)}
      />

      <AnimatePresence>
        {selectedMatch && (
          <MatchDetailsModal 
            matchId={selectedMatch.id} 
            isLive={selectedMatch.isLive} 
            onClose={() => setSelectedMatch(null)} 
          />
        )}
      </AnimatePresence>

      {/* Simulation of Live Chat when active */}
      <LiveChatMarquee isActive={isLive && activeTab === 'live' && !selectedMatch} />
    </div>
  );
}
