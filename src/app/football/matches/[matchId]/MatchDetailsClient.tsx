'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, AlertCircle, Shield, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { LiveTimeline } from '@/components/football/LiveTimeline';
import { TeamLineup } from '@/components/football/TeamLineup';
import { MatchStatistics } from '@/components/football/MatchStatistics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface MatchDetailsClientProps {
  matchId: string;
}

export function MatchDetailsClient({ matchId }: MatchDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lineups' | 'timeline' | 'stats'>('timeline');
  const [details, setDetails] = useState<any>(null);
  const [commentary, setCommentary] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchData = async () => {
    try {
      const [detailsRes, commRes, statsRes] = await Promise.all([
        fetch(`/api/football/matches/${matchId}/details`),
        fetch(`/api/football/matches/${matchId}/commentary`),
        fetch(`/api/football/matches/${matchId}/stats`)
      ]);

      if (detailsRes.ok) setDetails(await detailsRes.json());
      if (commRes.ok) setCommentary(await commRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch match data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    fetchMatchData();

    let intervalId: NodeJS.Timeout;
    
    // Initial polling setup
    intervalId = setInterval(() => {
      setDetails((prevDetails: any) => {
        if (!prevDetails || prevDetails.match?.status === 'live') {
          fetchMatchData();
        } else {
          // If match is no longer live, stop polling
          clearInterval(intervalId);
        }
        return prevDetails;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [matchId]);

  if (loading && !details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-neutral-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Match Data...</p>
      </div>
    );
  }

  if (error || !details?.match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-neutral-500">
        <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
        <p>{error || 'Match not found'}</p>
        <Link href="/football" className="mt-4 text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Football Hub
        </Link>
      </div>
    );
  }

  const match = details.match;
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div className="pb-20">
      {/* Header Area */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 pt-6 pb-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/football')}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </button>
            <div className="flex items-center gap-4">
              <button disabled className="p-2 text-neutral-400 opacity-50 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button disabled className="p-2 text-neutral-400 opacity-50 cursor-not-allowed">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center mt-2">
            <div className="flex items-center gap-3 mb-6">
              {isLive ? (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  LIVE {match.elapsedTime > 0 ? `${match.elapsedTime}'` : ''}
                </motion.div>
              ) : (
                <div className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded-md text-xs font-bold">
                  {isFinished ? 'FULL TIME' : 'UPCOMING'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-16 w-full">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                {match.homeTeam?.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-16 h-16 md:w-24 md:h-24 object-contain" />
                ) : (
                  <Shield className="w-16 h-16 md:w-24 md:h-24 text-neutral-300" />
                )}
                <h2 className="text-lg md:text-3xl font-black text-center">{match.homeTeam?.name || 'Home'}</h2>
              </div>

              {/* Score */}
              <div className="flex items-center justify-center w-1/3">
                <div className="text-4xl md:text-7xl font-black tracking-tighter tabular-nums flex items-center gap-2 md:gap-6">
                  <motion.span key={`home-${match.homeTeam?.score}`} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: 'inherit' }} className="w-12 md:w-20 text-right">
                    {match.homeTeam?.score || 0}
                  </motion.span>
                  <span className="text-neutral-300 dark:text-neutral-700">-</span>
                  <motion.span key={`away-${match.awayTeam?.score}`} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: 'inherit' }} className="w-12 md:w-20 text-left">
                    {match.awayTeam?.score || 0}
                  </motion.span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                {match.awayTeam?.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-16 h-16 md:w-24 md:h-24 object-contain" />
                ) : (
                  <Shield className="w-16 h-16 md:w-24 md:h-24 text-neutral-300" />
                )}
                <h2 className="text-lg md:text-3xl font-black text-center">{match.awayTeam?.name || 'Away'}</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 text-xs md:text-sm text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(match.kickoffTime).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {match.venue?.name || 'Unknown Venue'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex overflow-x-auto scrollbar-none gap-2 mb-6 bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button onClick={() => setActiveTab('lineups')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'lineups' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>Lineups</button>
          <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>Timeline</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>Stats</button>
        </div>

        {/* Desktop Grid / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${activeTab !== 'lineups' ? 'hidden lg:block' : ''} order-2 lg:order-1`}>
            {match.homeTeam && match.awayTeam ? (
              <div className="flex flex-col gap-8">
                <TeamLineup 
                  team={match.homeTeam} 
                  isHomeTeam={true} 
                  highlightedPlayerId={null} 
                  onPlayerClick={(p) => console.log('Player clicked', p)} 
                />
                <TeamLineup 
                  team={match.awayTeam} 
                  isHomeTeam={false} 
                  highlightedPlayerId={null} 
                  onPlayerClick={(p) => console.log('Player clicked', p)} 
                />
              </div>
            ) : null}
          </div>
          
          <div className={`${activeTab !== 'timeline' ? 'hidden lg:block' : ''} order-1 lg:order-2`}>
            {commentary?.events ? (
               <LiveTimeline 
                 events={commentary.events} 
                 isLive={isLive} 
                 currentMinute={match.elapsedTime} 
                 onEventClick={(e) => console.log('Event', e)} 
               />
            ) : (
               <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl text-center text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                 Timeline unavailable
               </div>
            )}
          </div>

          <div className={`${activeTab !== 'stats' ? 'hidden lg:block' : ''} order-3 lg:order-3`}>
            {stats?.matchStats?.homeTeam ? (
               <MatchStatistics 
                 homeTeamStats={stats.matchStats.homeTeam}
                 awayTeamStats={stats.matchStats.awayTeam}
                 homeTeamName={match.homeTeam.name}
                 awayTeamName={match.awayTeam.name}
                 homeTeamLogo={match.homeTeam.logo}
                 awayTeamLogo={match.awayTeam.logo}
               />
            ) : (
               <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl text-center text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                 Stats unavailable
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
