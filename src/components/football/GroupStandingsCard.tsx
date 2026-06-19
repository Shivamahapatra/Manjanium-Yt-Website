'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Team {
  id: string;
  name: string;
  logo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualification: 'qualified' | 'contending' | 'eliminated';
  // Other properties like flag and players can exist but are optional for this card
  flag?: string;
  players?: any[];
}

export interface GroupData {
  groupName: string;
  teams: Team[];
}

export interface GroupStandingsCardProps {
  groupData: GroupData;
  onTeamClick: (team: Team) => void;
  isExpanded?: boolean;
}

export function GroupStandingsCard({
  groupData,
  onTeamClick,
  isExpanded: defaultExpanded = true,
}: GroupStandingsCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
        when: 'beforeChildren',
        staggerChildren: 0.05,
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusColor = (status: Team['qualification'], index: number) => {
    // If status is strictly passed or default to index rules for 4-team groups
    if (status === 'qualified' || index < 2) 
      return 'border-l-[3px] border-l-[#10b981] bg-[#10b981]/5 hover:bg-[#10b981]/15';
    if (status === 'contending' || index === 2) 
      return 'border-l-[3px] border-l-[#f59e0b] bg-[#f59e0b]/5 hover:bg-[#f59e0b]/15';
    
    return 'border-l-[3px] border-l-[#ef4444] bg-[#ef4444]/5 hover:bg-[#ef4444]/15';
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col w-full shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-4 py-3 bg-neutral-800/40 hover:bg-neutral-800/80 transition-colors"
      >
        <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-wider">
          {groupData.groupName}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-neutral-300">
                <thead className="text-[11px] text-neutral-400 uppercase bg-neutral-950/50 border-b border-neutral-800">
                  <tr>
                    <th scope="col" className="px-3 py-2 w-8 text-center font-semibold tracking-wider">#</th>
                    <th scope="col" className="px-3 py-2 font-semibold tracking-wider">Team</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider">P</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider">W</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider">D</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider">L</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider hidden sm:table-cell">GF</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider hidden sm:table-cell">GA</th>
                    <th scope="col" className="px-2 py-2 text-center font-semibold tracking-wider">GD</th>
                    <th scope="col" className="px-3 py-2 text-center font-bold tracking-wider text-neutral-200">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30">
                  {groupData.teams.map((team, index) => (
                    <motion.tr
                      key={team.id || index}
                      variants={rowVariants}
                      onClick={() => onTeamClick(team)}
                      className={`cursor-pointer transition-colors ${getStatusColor(team.qualification, index)}`}
                    >
                      <td className="px-3 py-3 text-center text-xs font-semibold text-neutral-400">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 font-medium text-neutral-100 flex items-center gap-2">
                        {team.logo && (
                          <img 
                            src={team.logo} 
                            alt={team.name} 
                            className="w-5 h-5 object-contain"
                            loading="lazy" 
                          />
                        )}
                        {/* Fallback to flag if logo is not available */}
                        {!team.logo && team.flag && (
                          <span className="text-base leading-none">{team.flag}</span>
                        )}
                        <span className="truncate max-w-[110px] sm:max-w-none">{team.name}</span>
                      </td>
                      <td className="px-2 py-3 text-center text-neutral-300">{team.played}</td>
                      <td className="px-2 py-3 text-center text-neutral-300">{team.wins}</td>
                      <td className="px-2 py-3 text-center text-neutral-300">{team.draws}</td>
                      <td className="px-2 py-3 text-center text-neutral-300">{team.losses}</td>
                      <td className="px-2 py-3 text-center text-neutral-300 hidden sm:table-cell">{team.goalsFor}</td>
                      <td className="px-2 py-3 text-center text-neutral-300 hidden sm:table-cell">{team.goalsAgainst}</td>
                      <td className="px-2 py-3 text-center text-neutral-300">
                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-white bg-neutral-900/20">{team.points}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
