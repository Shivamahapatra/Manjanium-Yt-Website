'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Team, Group as GroupData } from '@/types/football';

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
    <div className="bg-surface border border-border-color rounded-xl overflow-hidden flex flex-col w-full shadow-medium transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-4 py-3 bg-bg-primary/40 hover:bg-bg-primary/80 transition-colors"
      >
        <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">
          {groupData.groupName}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
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
              <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-[11px] text-text-secondary uppercase bg-bg-primary/50 border-b border-border-color">
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
                    <th scope="col" className="px-3 py-2 text-center font-bold tracking-wider text-text-primary">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {groupData?.teams && groupData.teams.length > 0 ? (
                    groupData.teams.map((team, index) => (
                      <motion.tr
                        key={team?.id || index}
                        variants={rowVariants}
                        onClick={() => onTeamClick && onTeamClick(team)}
                        className={`cursor-pointer transition-colors ${getStatusColor(team?.qualification || 'contending', index)}`}
                      >
                        <td className="px-3 py-3 text-center text-xs font-semibold text-text-secondary">
                          {index + 1}
                        </td>
                        <td className="px-3 py-3 font-medium text-text-primary flex items-center gap-2">
                          {team?.logo && (
                            <img 
                              src={team.logo} 
                              alt={team.name || 'Team'} 
                              className="w-5 h-5 object-contain"
                              loading="lazy" 
                            />
                          )}
                          {!team?.logo && team?.flag && (
                            <span className="text-base leading-none">{team.flag}</span>
                          )}
                          <span className="truncate max-w-[110px] sm:max-w-none">{team?.name || 'Unknown Team'}</span>
                        </td>
                        <td className="px-2 py-3 text-center text-text-secondary">{team?.played || 0}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">{team?.wins || 0}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">{team?.draws || 0}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">{team?.losses || 0}</td>
                        <td className="px-2 py-3 text-center text-text-secondary hidden sm:table-cell">{team?.goalsFor || 0}</td>
                        <td className="px-2 py-3 text-center text-text-secondary hidden sm:table-cell">{team?.goalsAgainst || 0}</td>
                        <td className="px-2 py-3 text-center text-text-secondary">
                          {team?.goalDifference > 0 ? `+${team.goalDifference}` : (team?.goalDifference || 0)}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-text-primary bg-bg-primary/20">{team?.points || 0}</td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-3 py-6 text-center text-text-secondary">
                        No teams available in this group.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
