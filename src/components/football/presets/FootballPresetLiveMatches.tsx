'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FootballCard } from '@/components/football/FootballCard';
import { FootballBadge } from '@/components/football/FootballBadge';
import { LiveMatchCard } from '@/components/football/LiveMatchCard';
import { TerminalChat } from '@/components/chat/TerminalChat';

interface FootballPresetLiveMatchesProps {
  fixtures: any[];
  loadingLive: boolean;
}

export function FootballPresetLiveMatches({ fixtures, loadingLive }: FootballPresetLiveMatchesProps) {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const liveCount = fixtures?.filter((f: any) =>
    f?.fixture?.status?.short === '1H' || f?.fixture?.status?.short === '2H'
  ).length || 0;

  const displayMatch = selectedMatch || (fixtures?.length > 0 ? fixtures[0] : null);

  return (
    <div className="flex flex-col gap-6">
      {/* TOP: Live match count badge */}
      <div className="flex items-center gap-3">
        <FootballBadge variant="live">
          🔴 {liveCount} LIVE MATCHES
        </FootballBadge>
        <span className="text-[#6B7280] text-sm">
          {fixtures?.length || 0} total matches today
        </span>
      </div>

      {/* MAIN: Match cards + Team Radio */}
      <div className="flex gap-6">
        {/* MAIN (80%): Live match cards in grid */}
        <div className="flex-[0.8]">
          <FootballCard title="Match Center" className="h-full p-4">
            {loadingLive ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin w-8 h-8 border-2 border-[#0EA5E9] border-t-transparent rounded-full" />
              </div>
            ) : !fixtures || fixtures.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280]">No live matches currently.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fixtures?.map((match: any) => (
                  <motion.div
                    key={match?.fixture?.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMatch(match)}
                    className={`cursor-pointer transition-all ${
                      displayMatch?.fixture?.id === match?.fixture?.id
                        ? 'ring-2 ring-[#0EA5E9] rounded-xl'
                        : ''
                    }`}
                  >
                    <LiveMatchCard match={match} />
                  </motion.div>
                ))}
              </div>
            )}
          </FootballCard>
        </div>

        {/* RIGHT (20%): Team Radio / Chat */}
        <div className="flex-[0.2]">
          <FootballCard title="Live Feed" className="h-full p-4">
            <TerminalChat context="football" />
          </FootballCard>
        </div>
      </div>
    </div>
  );
}
