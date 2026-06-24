'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FootballCard } from '@/components/football/FootballCard';
import { TopScorersWidget } from '@/components/football/TopScorersWidget';
import { getTopScorers } from '@/lib/football-utils';
import { StandingsResponse } from '@/types/football';

interface FootballPresetStandingsFocusProps {
  standingsData: StandingsResponse | null;
  loadingStandings: boolean;
}

const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function FootballPresetStandingsFocus({ standingsData, loadingStandings }: FootballPresetStandingsFocusProps) {
  const [selectedGroup, setSelectedGroup] = useState('A');

  const groups = useMemo(() => {
    return standingsData?.groups || [];
  }, [standingsData]);

  const currentGroup = useMemo(() => {
    return groups.find((g) => g.groupName === selectedGroup) || groups[0];
  }, [groups, selectedGroup]);

  const topScorers = useMemo(() => {
    return standingsData?.groups ? getTopScorers(standingsData.groups, 10) : [];
  }, [standingsData]);

  if (loadingStandings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#0EA5E9] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* TOP: Group selector */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {GROUP_LABELS.map((label) => {
          const hasGroup = groups.some((g) => g.groupName === label);
          return (
            <motion.button
              key={label}
              onClick={() => hasGroup && setSelectedGroup(label)}
              whileHover={{ scale: hasGroup ? 1.05 : 1 }}
              whileTap={{ scale: hasGroup ? 0.95 : 1 }}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                selectedGroup === label
                  ? 'bg-[#0EA5E9] text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                  : hasGroup
                    ? 'bg-[#1F2937] text-white hover:border-[#0EA5E9] border border-[#333333]'
                    : 'bg-[#131313] text-[#6B7280] border border-[#333333] opacity-50 cursor-not-allowed'
              }`}
            >
              Group {label}
            </motion.button>
          );
        })}
      </div>

      {/* MAIN: Standings table + Top Scorers */}
      <div className="flex gap-6">
        {/* Standings table (70%) */}
        <div className="flex-[0.7]">
          <FootballCard title={currentGroup ? `Group ${currentGroup.groupName}` : 'Standings'} className="p-0 overflow-hidden">
            {currentGroup ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-[#6B7280]">
                  <thead className="text-[11px] text-[#6B7280] uppercase bg-[var(--football-surface-alt)]/50 border-b border-[var(--football-border)]">
                    <tr>
                      <th className="px-3 py-3 w-8 text-center font-semibold">#</th>
                      <th className="px-3 py-3 font-semibold">Team</th>
                      <th className="px-2 py-3 text-center font-semibold">P</th>
                      <th className="px-2 py-3 text-center font-semibold">W</th>
                      <th className="px-2 py-3 text-center font-semibold">D</th>
                      <th className="px-2 py-3 text-center font-semibold">L</th>
                      <th className="px-2 py-3 text-center font-semibold hidden sm:table-cell">GF</th>
                      <th className="px-2 py-3 text-center font-semibold hidden sm:table-cell">GA</th>
                      <th className="px-2 py-3 text-center font-semibold">GD</th>
                      <th className="px-3 py-3 text-center font-bold text-white">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--football-border)]">
                    {currentGroup.teams.map((team: any, index: number) => {
                      const isQualified = index < 2;
                      return (
                        <tr
                          key={team.id}
                          className={`transition-colors ${
                            isQualified
                              ? 'bg-[#10B981]/5 border-l-[3px] border-l-[#10B981]'
                              : 'hover:bg-[#1F2937]/50'
                          }`}
                        >
                          <td className="px-3 py-3 text-center text-xs font-semibold">{index + 1}</td>
                          <td className="px-3 py-3 font-medium text-white flex items-center gap-2">
                            {team.logo && (
                              <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                            )}
                            <span className="truncate max-w-[140px]">{team.name}</span>
                            {isQualified && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded font-bold">
                                Q
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-3 text-center">{team.played || 0}</td>
                          <td className="px-2 py-3 text-center">{team.wins || 0}</td>
                          <td className="px-2 py-3 text-center">{team.draws || 0}</td>
                          <td className="px-2 py-3 text-center">{team.losses || 0}</td>
                          <td className="px-2 py-3 text-center hidden sm:table-cell">{team.goalsFor || 0}</td>
                          <td className="px-2 py-3 text-center hidden sm:table-cell">{team.goalsAgainst || 0}</td>
                          <td className="px-2 py-3 text-center">
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference || 0}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-white bg-[#0EA5E9]/10">
                            {team.points || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-[#6B7280]">No standings data available.</div>
            )}
          </FootballCard>
        </div>

        {/* Top Scorers (30%) */}
        <div className="flex-[0.3]">
          <TopScorersWidget
            scorers={topScorers}
            isCompact={true}
            lastUpdated={standingsData?.lastUpdated || ''}
          />
        </div>
      </div>
    </div>
  );
}
