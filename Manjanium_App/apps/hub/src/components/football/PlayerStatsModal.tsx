'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Team, Player } from '@/types/football';

export interface PlayerStatsModalProps {
  isOpen: boolean;
  team: Team | null;
  players: Player[];
  onClose: () => void;
}

type SortField = keyof Player | 'cards';

export function PlayerStatsModal({
  isOpen,
  team,
  players,
  onClose,
}: PlayerStatsModalProps) {
  const [filterPos, setFilterPos] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortField>('gamesPlayed');
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilterPos('All');
      setSortBy('gamesPlayed');
      setSortDesc(true);
      setExpandedPlayerId(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(field);
      setSortDesc(field !== 'name'); // default desc for numbers
    }
  };

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];
    
    // Filter
    if (filterPos !== 'All') {
      result = result.filter(p => p.position === filterPos);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Player];
      let bVal: any = b[sortBy as keyof Player];

      if (sortBy === 'cards') {
        // Sort by red cards primarily, then yellow
        aVal = a.redCards * 10 + a.yellowCards;
        bVal = b.redCards * 10 + b.yellowCards;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDesc ? 1 : -1;
      if (aVal > bVal) return sortDesc ? -1 : 1;
      return 0;
    });

    return result;
  }, [players, filterPos, sortBy, sortDesc]);

  const getPosColor = (pos: string) => {
    switch (pos) {
      case 'GK': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'DEF': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'MID': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'FWD': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20';
    }
  };

  const getPosBadgeColor = (pos: string) => {
    switch (pos) {
      case 'GK': return 'bg-blue-500';
      case 'DEF': return 'bg-emerald-500';
      case 'MID': return 'bg-amber-500';
      case 'FWD': return 'bg-red-500';
      default: return 'bg-neutral-500';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-neutral-600 ml-1 inline-block opacity-50" />;
    return sortDesc ? (
      <ArrowDown className="w-3 h-3 text-neutral-200 ml-1 inline-block" />
    ) : (
      <ArrowUp className="w-3 h-3 text-neutral-200 ml-1 inline-block" />
    );
  };

  // Animation variants
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const panelVariants: Variants = {
    hidden: isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', damping: 25, stiffness: 200, staggerChildren: 0.05, delayChildren: 0.1 } 
    },
    exit: isMobile ? { y: '100%', opacity: 0, transition: { duration: 0.3 } } : { x: '100%', opacity: 0, transition: { duration: 0.3 } }
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 h-[90vh] md:h-full w-full md:w-[800px] bg-[var(--football-surface)] border-t md:border-t-0 md:border-l border-[var(--football-border)] z-50 flex flex-col shadow-2xl rounded-t-2xl md:rounded-none overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--football-border)] bg-[var(--football-surface)] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-neutral-950 border border-neutral-800 rounded-2xl shadow-inner overflow-hidden">
                  {team?.logo ? (
                    <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                  ) : team?.flag ? (
                    <span className="text-2xl leading-none">{team.flag}</span>
                  ) : null}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">{team?.name}</h2>
                  <p className="text-sm text-neutral-400">Squad Statistics</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-[#333333] hover:bg-[#444444] text-white rounded-2xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-[var(--football-surface)]">
              
              {/* Position Filters */}
              <div className="p-4 flex gap-2 overflow-x-auto scrollbar-none shrink-0 border-b border-[var(--football-border)] bg-[var(--football-surface-alt)]">
                {['All', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setFilterPos(pos)}
                    className={`px-4 py-1.5 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2
                      ${filterPos === pos 
                        ? 'bg-[var(--football-accent)] text-[var(--football-surface)]' 
                        : 'bg-[#333333] text-[#6B7280] hover:bg-[#444444] hover:text-white'
                      }
                    `}
                  >
                    {pos !== 'All' && (
                      <span className={`w-2 h-2 rounded-2xl ${getPosBadgeColor(pos)}`} />
                    )}
                    {pos}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[#333333] scrollbar-track-transparent flex-1">
                <table className="w-full text-sm text-left text-white min-w-[600px]">
                  <thead className="text-[11px] text-[#6B7280] uppercase bg-[var(--football-surface-alt)] sticky top-0 z-10 shadow-sm border-b border-[var(--football-border)]">
                    <tr>
                      <th scope="col" className="px-4 py-3 w-10 text-center font-semibold cursor-pointer group" onClick={() => handleSort('number')}>
                        # <span className="group-hover:opacity-100"><SortIcon field="number" /></span>
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold cursor-pointer group" onClick={() => handleSort('name')}>
                        Player <span className="group-hover:opacity-100"><SortIcon field="name" /></span>
                      </th>
                      <th scope="col" className="px-3 py-3 text-center font-semibold cursor-pointer group" onClick={() => handleSort('position')}>
                        Pos <span className="group-hover:opacity-100"><SortIcon field="position" /></span>
                      </th>
                      <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer group" onClick={() => handleSort('gamesPlayed')}>
                        App <span className="group-hover:opacity-100"><SortIcon field="gamesPlayed" /></span>
                      </th>
                      <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer group" onClick={() => handleSort('minutesPlayed')}>
                        Min <span className="group-hover:opacity-100"><SortIcon field="minutesPlayed" /></span>
                      </th>
                      <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer group" onClick={() => handleSort('goals')}>
                        G <span className="group-hover:opacity-100"><SortIcon field="goals" /></span>
                      </th>
                      <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer group" onClick={() => handleSort('assists')}>
                        A <span className="group-hover:opacity-100"><SortIcon field="assists" /></span>
                      </th>
                      <th scope="col" className="px-4 py-3 text-center font-semibold cursor-pointer group" onClick={() => handleSort('cards')}>
                        YC/RC <span className="group-hover:opacity-100"><SortIcon field="cards" /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--football-border)]">
                    {filteredAndSortedPlayers.map((player) => (
                      <React.Fragment key={player.id}>
                        <motion.tr 
                          variants={rowVariants}
                          onClick={() => setExpandedPlayerId(expandedPlayerId === player.id ? null : player.id)}
                          className={`cursor-pointer hover:bg-[#333333] transition-colors ${expandedPlayerId === player.id ? 'bg-[#333333]/50' : ''}`}
                        >
                          <td className="px-4 py-3 text-center text-xs font-mono text-neutral-500">
                            {player.number > 0 ? player.number : '-'}
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-100 flex items-center gap-3">
                            {player.photo ? (
                              <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-2xl object-cover bg-neutral-800" loading="lazy" />
                            ) : (
                              <div className="w-8 h-8 rounded-2xl bg-neutral-800 flex items-center justify-center text-xs text-neutral-500 font-bold">
                                {player.name.charAt(0)}
                              </div>
                            )}
                            <span className="truncate max-w-[140px] md:max-w-[200px] font-semibold tracking-wide text-neutral-200">{player.name}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-1 rounded border text-[10px] font-bold tracking-wider ${getPosColor(player.position)}`}>
                              {player.position}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-center text-neutral-300">{player.gamesPlayed}</td>
                          <td className="px-2 py-3 text-center text-neutral-400 text-xs">{player.minutesPlayed}'</td>
                          <td className="px-2 py-3 text-center font-semibold text-emerald-400">{player.goals}</td>
                          <td className="px-2 py-3 text-center font-semibold text-emerald-400/80">{player.assists}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {player.yellowCards > 0 && (
                                <span className="w-3 h-4 bg-yellow-400 rounded-sm flex items-center justify-center text-[9px] text-yellow-900 font-bold">
                                  {player.yellowCards > 1 ? player.yellowCards : ''}
                                </span>
                              )}
                              {player.redCards > 0 && (
                                <span className="w-3 h-4 bg-red-500 rounded-sm flex items-center justify-center text-[9px] text-red-100 font-bold">
                                  {player.redCards > 1 ? player.redCards : ''}
                                </span>
                              )}
                              {player.yellowCards === 0 && player.redCards === 0 && <span className="text-neutral-600">-</span>}
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded Advanced Stats Row */}
                        <AnimatePresence>
                          {expandedPlayerId === player.id && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-neutral-800/30 overflow-hidden"
                            >
                              <td colSpan={8} className="p-0 border-b border-neutral-800/80">
                                <div className="px-6 py-4 flex flex-wrap gap-4 md:gap-8 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Pass Completion</span>
                                    <span className="text-neutral-200 font-bold text-lg">{(player.passCompletion || 0) > 0 ? `${player.passCompletion}%` : 'N/A'}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Shots on Target</span>
                                    <span className="text-neutral-200 font-bold text-lg">{player.shotsOnTarget ?? 'N/A'}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Tackles</span>
                                    <span className="text-neutral-200 font-bold text-lg">{player.tackles ?? 'N/A'}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Dribbles</span>
                                    <span className="text-neutral-200 font-bold text-lg">{player.dribbles ?? 'N/A'}</span>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                    
                    {filteredAndSortedPlayers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                          No players found for this position.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--football-border)] bg-[var(--football-surface)] shrink-0 text-center md:text-left">
              <p className="text-xs text-[#6B7280] flex items-center justify-center md:justify-start gap-1">
                <span className="w-1.5 h-1.5 rounded-2xl bg-[var(--football-upcoming)] inline-block animate-pulse"></span>
                Last updated: 1 hour ago
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
