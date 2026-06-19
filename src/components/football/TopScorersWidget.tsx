'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Player as BasePlayer } from './PlayerStatsModal';

export interface ScorerPlayer extends BasePlayer {
  teamName?: string;
  teamFlag?: string;
  rankChange?: 'up' | 'down' | 'same'; // Represents historical rank change
}

export interface TopScorersWidgetProps {
  scorers: ScorerPlayer[];
  isCompact?: boolean;
  lastUpdated: string;
}

const getRelativeTime = (dateString: string) => {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMins = Math.floor(diffInMs / (1000 * 60));

  if (diffInHours > 24) return `${Math.floor(diffInHours / 24)} days ago`;
  if (diffInHours > 0) return `${diffInHours} hours ago`;
  if (diffInMins > 0) return `${diffInMins} mins ago`;
  return 'just now';
};

export function TopScorersWidget({
  scorers,
  isCompact = false,
  lastUpdated,
}: TopScorersWidgetProps) {
  
  // Sort by goals (desc), then assists (desc), then least games played
  const top10Scorers = useMemo(() => {
    if (!scorers || scorers.length === 0) return [];
    
    return [...scorers]
      .sort((a, b) => {
        if (a.goals !== b.goals) return b.goals - a.goals;
        if (a.assists !== b.assists) return b.assists - a.assists;
        return a.gamesPlayed - b.gamesPlayed;
      })
      .slice(0, 10);
  }, [scorers]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return <span className="text-xl md:text-2xl drop-shadow-md">🥇</span>;
      case 2: return <span className="text-xl md:text-2xl drop-shadow-md">🥈</span>;
      case 3: return <span className="text-xl md:text-2xl drop-shadow-md">🥉</span>;
      default: return <span className="text-sm font-bold text-neutral-400 w-6 text-center">{rank}</span>;
    }
  };

  const getRankHighlight = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-amber-500/10 border-l-[3px] border-l-amber-400 hover:bg-amber-500/20';
      case 2: return 'bg-slate-300/10 border-l-[3px] border-l-slate-300 hover:bg-slate-300/20';
      case 3: return 'bg-[#cd7f32]/10 border-l-[3px] border-l-[#cd7f32] hover:bg-[#cd7f32]/20';
      default: return 'bg-neutral-900 border-l-[3px] border-l-transparent hover:bg-neutral-800/80';
    }
  };

  const RankChangeIcon = ({ change }: { change?: 'up' | 'down' | 'same' }) => {
    if (change === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    if (change === 'same') return <Minus className="w-3 h-3 text-neutral-600" />;
    return null;
  };

  return (
    <div className="flex flex-col bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-5 bg-neutral-900 border-b border-neutral-800">
        <h2 className={`font-bold text-white flex items-center gap-2 ${isCompact ? 'text-lg' : 'text-xl md:text-2xl'}`}>
          <span>🏆</span> Top Scorers
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium bg-neutral-950 px-3 py-1.5 rounded-full border border-neutral-800/50">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Updated: {getRelativeTime(lastUpdated)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 md:p-4 bg-neutral-950/50">
        {top10Scorers.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 font-medium">
            No goalscorers found.
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            {top10Scorers.map((player, index) => {
              const rank = index + 1;
              return (
                <motion.div
                  key={player.id || index}
                  variants={rowVariants}
                  className={`flex items-center p-3 md:p-4 rounded-xl transition-colors shadow-sm ${getRankHighlight(rank)}`}
                >
                  {/* Rank & Medal */}
                  <div className="flex items-center justify-center w-8 md:w-12 shrink-0 mr-1 md:mr-3">
                    {getRankMedal(rank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center flex-1 min-w-0 gap-3 md:gap-4">
                    {!isCompact && (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 bg-neutral-800 border border-neutral-700/50">
                        {player.photo ? (
                          <img src={player.photo} alt={player.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold text-sm">
                            {player.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-neutral-100 truncate ${isCompact ? 'text-sm' : 'text-base md:text-lg'}`}>
                          {player.name}
                        </span>
                        {player.rankChange && !isCompact && <RankChangeIcon change={player.rankChange} />}
                      </div>
                      
                      {!isCompact && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                          {player.teamFlag && <span>{player.teamFlag}</span>}
                          <span className="truncate">{player.teamName || 'Unknown Team'}</span>
                          {player.position && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-neutral-700 mx-1"></span>
                              <span className="font-mono text-[10px] uppercase text-neutral-500">{player.position}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats (Goals & Assists) */}
                  <div className="flex items-center gap-4 md:gap-8 shrink-0 pl-2">
                    {!isCompact && (
                      <div className="hidden sm:flex flex-col items-center justify-center opacity-70">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">Assists</span>
                        <span className="text-sm font-semibold text-neutral-300">{player.assists}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center min-w-[3rem]">
                      {!isCompact && <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">Goals</span>}
                      {/* Animate goals change if data updates */}
                      <AnimatePresence mode="popLayout">
                        <motion.span 
                          key={player.goals}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className={`font-black text-emerald-400 drop-shadow-sm ${isCompact ? 'text-xl' : 'text-2xl md:text-3xl'}`}
                        >
                          {player.goals}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
