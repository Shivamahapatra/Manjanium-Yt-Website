'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Activity, AlertCircle, Shield, Goal, Flag, RefreshCw } from 'lucide-react';
import { LiveTimeline, MatchEvent } from '@/components/football/LiveTimeline';
import { TeamLineup } from '@/components/football/TeamLineup';
import { MatchStatistics } from '@/components/football/MatchStatistics';

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

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
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch match data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!matchId) return;
    fetchMatchData();

    // Setup polling if match is live (we assume it might be live until first fetch says otherwise, but we can just poll every 10s safely)
    const intervalId = setInterval(() => {
      // Only poll if we don't have details yet, OR if details says it's live
      setDetails((prevDetails: any) => {
        if (!prevDetails || prevDetails.match?.status === 'live') {
          fetchMatchData();
        }
        return prevDetails;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [matchId]);

  if (loading && !details) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center text-neutral-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Match Data...</p>
      </div>
    );
  }

  if (error || !details?.match) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center text-neutral-500">
        <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
        <p>{error || 'Match not found'}</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 hover:underline">Go Back</button>
      </div>
    );
  }

  const match = details.match;
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const renderHeader = () => (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 pt-8 pb-6 px-4 md:px-8 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Football Hub
        </button>

        <div className="flex flex-col items-center">
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
              <h2 className="text-lg md:text-2xl font-black text-center">{match.homeTeam?.name || 'Home'}</h2>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center w-1/3">
              <div className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums flex items-center gap-2 md:gap-4">
                <motion.span key={match.homeTeam?.score} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: 'inherit' }} className="w-12 text-right">
                  {match.homeTeam?.score || 0}
                </motion.span>
                <span className="text-neutral-300 dark:text-neutral-700">-</span>
                <motion.span key={match.awayTeam?.score} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: 'inherit' }} className="w-12 text-left">
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
              <h2 className="text-lg md:text-2xl font-black text-center">{match.awayTeam?.name || 'Away'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs md:text-sm text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(match.kickoffTime).toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {match.venue?.name || 'Unknown Venue'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLineups = () => {
    if (!match.homeTeam || !match.awayTeam) return null;

    return (
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
    );
  };

  const renderTimeline = () => {
    const events = commentary?.events || [];
    
    return (
      <LiveTimeline 
        events={events}
        isLive={isLive}
        currentMinute={match.elapsedTime}
        onEventClick={(evt) => console.log("Event clicked:", evt)}
        homeTeamLogo={match.homeTeam?.logo}
        awayTeamLogo={match.awayTeam?.logo}
      />
    );
  };

  const renderStats = () => {
    const s = stats?.matchStats;
    if (!s || !s.homeTeam || !s.awayTeam) {
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 text-center text-neutral-500 border border-neutral-200 dark:border-neutral-800">
          <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p>Match statistics not available.</p>
        </div>
      );
    }

    return (
      <MatchStatistics 
        homeTeamStats={s.homeTeam}
        awayTeamStats={s.awayTeam}
        homeTeamName={match.homeTeam?.name || 'Home'}
        awayTeamName={match.awayTeam?.name || 'Away'}
        homeTeamLogo={match.homeTeam?.logo}
        awayTeamLogo={match.awayTeam?.logo}
      />
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      {renderHeader()}

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex overflow-x-auto scrollbar-none gap-2 mb-6 bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <button onClick={() => setActiveTab('lineups')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'lineups' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>Lineups</button>
          <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>Timeline</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>Stats</button>
        </div>

        {/* Desktop Grid / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${activeTab !== 'lineups' ? 'hidden lg:block' : ''} order-2 lg:order-1`}>
            {renderLineups()}
          </div>
          
          <div className={`${activeTab !== 'timeline' ? 'hidden lg:block' : ''} order-1 lg:order-2`}>
            {renderTimeline()}
          </div>
          
          <div className={`${activeTab !== 'stats' ? 'hidden lg:block' : ''} order-3 lg:order-3`}>
            {renderStats()}
          </div>
        </div>
      </div>
    </div>
  );
}
