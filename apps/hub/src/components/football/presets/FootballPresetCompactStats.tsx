'use client';

import React, { useMemo } from 'react';
import { FootballCard } from '@/components/football/FootballCard';
import { LiveMatchCard } from '@/components/football/LiveMatchCard';
import { GroupStandingsCard } from '@/components/football/GroupStandingsCard';
import { TopScorersWidget } from '@/components/football/TopScorersWidget';
import { getTopScorers } from '@/lib/football-utils';
import { StandingsResponse } from '@/types/football';

interface FootballPresetCompactStatsProps {
  fixtures: any[];
  loadingLive: boolean;
  standingsData: StandingsResponse | null;
  loadingStandings: boolean;
}

export function FootballPresetCompactStats({
  fixtures,
  loadingLive,
  standingsData,
  loadingStandings,
}: FootballPresetCompactStatsProps) {
  const topScorers = useMemo(() => {
    return standingsData?.groups ? getTopScorers(standingsData.groups, 5) : [];
  }, [standingsData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Match cards (compact) */}
      <div>
        <FootballCard title="Live Matches" className="h-full p-4">
          {loadingLive ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full" />
            </div>
          ) : fixtures.length === 0 ? (
            <div className="p-4 text-center text-[#6B7280] text-sm">No live matches.</div>
          ) : (
            <div className="space-y-3">
              {fixtures.slice(0, 4).map((match: any) => (
                <LiveMatchCard key={match.fixture.id} match={match} />
              ))}
            </div>
          )}
        </FootballCard>
      </div>

      {/* CENTER: Group standings (compact) */}
      <div>
        <FootballCard title="Standings" className="h-full p-4">
          {loadingStandings ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full" />
            </div>
          ) : standingsData?.groups && standingsData.groups.length > 0 ? (
            <div className="space-y-3">
              {standingsData.groups.slice(0, 3).map((group: any) => (
                <div key={group.groupName} className="bg-[#1F2937] rounded-lg p-3">
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Group {group.groupName}
                  </h4>
                  <table className="w-full text-xs">
                    <thead className="text-[#6B7280] uppercase">
                      <tr>
                        <th className="text-left p-1">#</th>
                        <th className="text-left p-1">Team</th>
                        <th className="text-right p-1">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.teams.slice(0, 4).map((team: any, idx: number) => (
                        <tr key={team.id} className="border-t border-[#333333]/30">
                          <td className="p-1 text-[#6B7280]">{idx + 1}</td>
                          <td className="p-1 text-white truncate max-w-[100px]">{team.name}</td>
                          <td className="p-1 text-right font-bold text-[#0EA5E9]">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-[#6B7280] text-sm">No standings data.</div>
          )}
        </FootballCard>
      </div>

      {/* RIGHT: Top scorers + Quick stats */}
      <div className="space-y-4">
        <TopScorersWidget
          scorers={topScorers}
          isCompact={true}
          lastUpdated={standingsData?.lastUpdated || ''}
        />
        <FootballCard className="p-4">
          <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-[#1F2937] rounded">
              <p className="text-[#6B7280] text-xs">Matches</p>
              <p className="text-lg font-bold text-white">{fixtures.length}</p>
            </div>
            <div className="p-2 bg-[#1F2937] rounded">
              <p className="text-[#6B7280] text-xs">Groups</p>
              <p className="text-lg font-bold text-white">{standingsData?.groups?.length || 0}</p>
            </div>
          </div>
        </FootballCard>
      </div>
    </div>
  );
}
