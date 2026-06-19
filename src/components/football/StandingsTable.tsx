'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Team } from '@/types/football'; 

export type SortField = 'points' | 'goalsFor' | 'name' | 'goalDifference' | 'played' | 'wins' | 'draws' | 'losses' | 'goalsAgainst';

export interface StandingsTableProps {
  teams: Team[];
  onTeamSelect: (team: Team) => void;
  sortBy?: SortField;
  onSortChange?: (sortBy: SortField) => void;
}

export function StandingsTable({
  teams,
  onTeamSelect,
  sortBy: externalSortBy,
  onSortChange,
}: StandingsTableProps) {
  const [internalSortBy, setInternalSortBy] = useState<SortField>('points');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  const currentSortBy = externalSortBy || internalSortBy;

  const handleSort = (field: SortField) => {
    if (currentSortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setInternalSortBy(field);
      // default string to asc, numbers to desc
      setSortDesc(field !== 'name'); 
      if (onSortChange) onSortChange(field);
    }
  };

  const sortedTeams = useMemo(() => {
    if (!teams) return [];
    return [...teams].sort((a, b) => {
      let aVal = a[currentSortBy];
      let bVal = b[currentSortBy];
      
      if (currentSortBy === 'name') {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }
      
      if (aVal < bVal) return sortDesc ? 1 : -1;
      if (aVal > bVal) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [teams, currentSortBy, sortDesc]);

  const getStatusColor = (status: Team['qualification']) => {
    if (status === 'qualified') return 'bg-[#10b981]/5 border-l-[3px] border-l-[#10b981]';
    if (status === 'contending') return 'bg-[#f59e0b]/5 border-l-[3px] border-l-[#f59e0b]';
    if (status === 'eliminated') return 'bg-[#ef4444]/5 border-l-[3px] border-l-[#ef4444]';
    return 'border-l-[3px] border-transparent';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (currentSortBy !== field) return <ArrowUpDown className="w-3 h-3 text-neutral-600 ml-1 inline-block opacity-50" />;
    return sortDesc ? (
      <ArrowDown className="w-3 h-3 text-neutral-200 ml-1 inline-block" />
    ) : (
      <ArrowUp className="w-3 h-3 text-neutral-200 ml-1 inline-block" />
    );
  };

  if (!teams || teams.length === 0) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg">
        <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
          <ArrowUpDown className="w-8 h-8 text-neutral-500 opacity-50" />
        </div>
        <p className="text-neutral-400 font-medium">No teams available</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden w-full shadow-lg">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <table className="w-full text-sm text-left text-neutral-300">
          <thead className="text-[11px] text-neutral-400 uppercase bg-neutral-950/80 border-b border-neutral-800">
            <tr>
              <th scope="col" className="px-4 py-3 w-10 text-center font-semibold tracking-wider">Rank</th>
              <th scope="col" className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors whitespace-nowrap group" onClick={() => handleSort('name')}>
                Team <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="name" /></span>
              </th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors hidden sm:table-cell group" onClick={() => handleSort('played')}>
                Played <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="played" /></span>
              </th>
              {/* Stacked W/D/L for mobile */}
              <th scope="col" className="px-2 py-3 text-center font-semibold sm:hidden whitespace-nowrap">W-D-L</th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors hidden sm:table-cell group" onClick={() => handleSort('wins')}>
                W <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="wins" /></span>
              </th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors hidden sm:table-cell group" onClick={() => handleSort('draws')}>
                D <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="draws" /></span>
              </th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors hidden sm:table-cell group" onClick={() => handleSort('losses')}>
                L <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="losses" /></span>
              </th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors hidden sm:table-cell group" onClick={() => handleSort('goalsFor')}>
                GF <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="goalsFor" /></span>
              </th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors hidden sm:table-cell group" onClick={() => handleSort('goalsAgainst')}>
                GA <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="goalsAgainst" /></span>
              </th>
              <th scope="col" className="px-2 py-3 text-center font-semibold cursor-pointer select-none hover:text-neutral-200 transition-colors group" onClick={() => handleSort('goalDifference')}>
                GD <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="goalDifference" /></span>
              </th>
              <th scope="col" className="px-4 py-3 text-center font-bold text-neutral-300 cursor-pointer select-none hover:text-white transition-colors bg-neutral-900/40 group" onClick={() => handleSort('points')}>
                Pts <span className="group-hover:opacity-100 transition-opacity"><SortIcon field="points" /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {sortedTeams.map((team, index) => (
              <tr
                key={team.id || index}
                onClick={() => onTeamSelect && onTeamSelect(team)}
                className={`cursor-pointer hover:bg-neutral-800/80 transition-colors ${getStatusColor(team.qualification)}`}
              >
                <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-400">
                  {index + 1}
                </td>
                <td className="px-4 py-4 font-medium text-neutral-100 flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-neutral-950 border border-neutral-800 rounded-full shrink-0 overflow-hidden shadow-sm">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" loading="lazy" />
                    ) : team.flag ? (
                      <span className="text-lg leading-none">{team.flag}</span>
                    ) : null}
                  </div>
                  <span className="truncate max-w-[130px] sm:max-w-[200px] font-semibold tracking-wide text-neutral-200">{team.name}</span>
                </td>
                <td className="px-2 py-4 text-center text-neutral-300 hidden sm:table-cell">{team.played}</td>
                
                {/* W-D-L Stack for mobile */}
                <td className="px-2 py-4 text-center text-neutral-400 sm:hidden whitespace-nowrap text-xs font-mono">
                  <span className="text-emerald-500">{team.wins}</span>-
                  <span className="text-neutral-400">{team.draws}</span>-
                  <span className="text-red-500">{team.losses}</span>
                </td>

                <td className="px-2 py-4 text-center text-neutral-300 hidden sm:table-cell">{team.wins}</td>
                <td className="px-2 py-4 text-center text-neutral-300 hidden sm:table-cell">{team.draws}</td>
                <td className="px-2 py-4 text-center text-neutral-300 hidden sm:table-cell">{team.losses}</td>
                <td className="px-2 py-4 text-center text-neutral-300 hidden sm:table-cell">{team.goalsFor}</td>
                <td className="px-2 py-4 text-center text-neutral-300 hidden sm:table-cell">{team.goalsAgainst}</td>
                <td className="px-2 py-4 text-center text-neutral-300">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${team.goalDifference > 0 ? 'bg-emerald-500/10 text-emerald-400' : team.goalDifference < 0 ? 'bg-red-500/10 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-bold text-white bg-neutral-900/20 text-base">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
