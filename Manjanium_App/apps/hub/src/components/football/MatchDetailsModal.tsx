import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, AlertCircle, Shield, RefreshCw, X } from 'lucide-react';
import { LiveTimeline } from '@/components/football/LiveTimeline';
import { TeamLineup } from '@/components/football/TeamLineup';
import { MatchStatistics } from '@/components/football/MatchStatistics';
import DecryptedText from "@/components/ui/DecryptedText";
import { FootballBadge } from './FootballBadge';

export interface MatchDetailsModalProps {
  matchId: string;
  isLive: boolean;
  onClose: () => void;
}

export function MatchDetailsModal({ matchId, isLive, onClose }: MatchDetailsModalProps) {
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
    if (isLive) {
      intervalId = setInterval(() => {
        setDetails((prevDetails: any) => {
          if (!prevDetails || prevDetails.match?.status === 'live') {
            fetchMatchData();
          }
          return prevDetails;
        });
      }, 10000);
    }

    // Keyboard ESC to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [matchId, isLive]);

  // Modal Overlay Wrapper
  const Overlay = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[var(--football-surface)]/95 backdrop-blur-md overflow-y-auto"
    >
      <div className="min-h-screen pb-20 font-sans text-white">
        {children}
      </div>
    </motion.div>
  );

  if (loading && !details) {
    return (
      <Overlay>
        <div className="flex flex-col items-center justify-center h-screen text-neutral-500">
          <RefreshCw className="w-8 h-8 animate-spin mb-4" />
          <p>Loading Match Data...</p>
        </div>
      </Overlay>
    );
  }

  if (error || !details?.match) {
    return (
      <Overlay>
        <div className="flex flex-col items-center justify-center h-screen text-neutral-500">
          <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
          <p>{error || 'Match not found'}</p>
          <button onClick={onClose} className="mt-4 text-blue-500 hover:underline flex items-center gap-2">
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      </Overlay>
    );
  }

  const match = details.match;
  const isFinished = match.status === 'finished';

  return (
    <Overlay>
      {/* Header Area */}
      <div className="sticky top-0 z-20 bg-[var(--football-surface-alt)]/80 backdrop-blur-md border-b border-[var(--football-border)] pt-6 pb-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto relative">
          
          <button 
            onClick={onClose}
            className="absolute -top-2 right-0 md:-right-4 p-2 bg-[#333333] hover:bg-[#444444] rounded-2xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex flex-col items-center mt-2">
            <div className="flex items-center gap-3 mb-6">
              {isLive ? (
                <FootballBadge variant="live">
                  🔴 LIVE {match.elapsedTime > 0 ? `${match.elapsedTime}'` : ''}
                </FootballBadge>
              ) : (
                <FootballBadge variant="finished">
                  {isFinished ? 'FULL TIME' : 'UPCOMING'}
                </FootballBadge>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-16 w-full">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                {match.homeTeam?.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-12 h-12 md:w-20 md:h-20 object-contain" />
                ) : (
                  <Shield className="w-12 h-12 md:w-20 md:h-20 text-neutral-300" />
                )}
                <h2 className="text-base md:text-2xl font-black text-center">{match.homeTeam?.name || 'Home'}</h2>
              </div>

              {/* Score */}
              <div className="flex items-center justify-center w-1/3">
                <div className="text-3xl md:text-6xl font-black tracking-tighter tabular-nums flex items-center gap-2 md:gap-4">
                  <motion.span key={`home-${match.homeTeam?.score}`} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: 'inherit' }} className="w-10 md:w-16 text-right">
                    {match.homeTeam?.score || 0}
                  </motion.span>
                  <span className="text-neutral-300 dark:text-neutral-700">-</span>
                  <motion.span key={`away-${match.awayTeam?.score}`} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: 'inherit' }} className="w-10 md:w-16 text-left">
                    {match.awayTeam?.score || 0}
                  </motion.span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                {match.awayTeam?.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-12 h-12 md:w-20 md:h-20 object-contain" />
                ) : (
                  <Shield className="w-12 h-12 md:w-20 md:h-20 text-neutral-300" />
                )}
                <h2 className="text-base md:text-2xl font-black text-center">{match.awayTeam?.name || 'Away'}</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs md:text-sm text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(match.kickoffTime).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {match.venue?.name || 'Unknown Venue'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex overflow-x-auto scrollbar-none gap-2 mb-6 bg-[var(--football-surface-alt)] p-1.5 rounded-xl border border-[var(--football-border)]">
          <button onClick={() => setActiveTab('lineups')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'lineups' ? 'bg-[#0EA5E9] text-white' : 'text-[#6B7280]'}`}>Lineups</button>
          <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-[#0EA5E9] text-white' : 'text-[#6B7280]'}`}>Timeline</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-[#0EA5E9] text-white' : 'text-[#6B7280]'}`}>Stats</button>
        </div>

        {/* Desktop Grid / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
               <div className="bg-[var(--football-surface-alt)] p-6 rounded-2xl text-center text-[#6B7280] border border-[var(--football-border)]">
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
               <div className="bg-[var(--football-surface-alt)] p-6 rounded-2xl text-center text-[#6B7280] border border-[var(--football-border)]">
                 Stats unavailable
               </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}
