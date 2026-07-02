"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MatchDetailsModal } from "@/components/football/MatchDetailsModal";

export function KnockoutBrackets() {
  const [brackets, setBrackets] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  useEffect(() => {
    // Fetch from Supabase
    const fetchBrackets = async () => {
      const { data, error } = await supabase
        .from('tournament_brackets')
        .select('*');
      
      if (!error && data) {
        setBrackets(data);
      }
    };
    fetchBrackets();
  }, []);

  // Mock data for visual structure if database is empty
  const mockData = [
    { id: '1', round: 'Quarter-Finals', match_id: 'm1', team1: 'Spain', team2: 'Germany', score1: 2, score2: 1 },
    { id: '2', round: 'Quarter-Finals', match_id: 'm2', team1: 'Portugal', team2: 'France', score1: 0, score2: 0, pen1: 3, pen2: 5 },
    { id: '3', round: 'Quarter-Finals', match_id: 'm3', team1: 'England', team2: 'Switzerland', score1: 1, score2: 1, pen1: 5, pen2: 3 },
    { id: '4', round: 'Quarter-Finals', match_id: 'm4', team1: 'Netherlands', team2: 'Turkey', score1: 2, score2: 1 },
    { id: '5', round: 'Semi-Finals', match_id: 'm5', team1: 'Spain', team2: 'France', score1: 2, score2: 1 },
    { id: '6', round: 'Semi-Finals', match_id: 'm6', team1: 'England', team2: 'Netherlands', score1: 2, score2: 1 },
    { id: '7', round: 'Final', match_id: 'm7', team1: 'Spain', team2: 'England', score1: null, score2: null }
  ];

  const displayData = brackets.length > 0 ? brackets : mockData;

  const quarters = displayData.filter(b => b.round === 'Quarter-Finals');
  const semis = displayData.filter(b => b.round === 'Semi-Finals');
  const final = displayData.filter(b => b.round === 'Final');

  const MatchCard = ({ match }: { match: any }) => (
    <div 
      className="bg-[var(--football-surface-alt)] border border-[var(--football-border)] p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-colors w-48 shadow-lg"
      onClick={() => setSelectedMatch(match.match_id)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white truncate w-3/4">{match.team1 || 'TBD'}</span>
        <span className="text-emerald-400 font-mono font-bold">{match.score1 ?? '-'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-bold text-white truncate w-3/4">{match.team2 || 'TBD'}</span>
        <span className="text-emerald-400 font-mono font-bold">{match.score2 ?? '-'}</span>
      </div>
      {(match.pen1 !== undefined || match.pen2 !== undefined) && (
        <div className="text-xs text-white/50 text-center mt-2 font-mono">
          Pen: {match.pen1} - {match.pen2}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full glass-panel rounded-2xl p-8 overflow-x-auto min-h-[600px]">
      <h2 className="text-2xl font-bold mb-12 font-heading text-white">Knockout Stage</h2>
      
      <div className="flex justify-between min-w-[800px] items-center">
        {/* Quarter Finals */}
        <div className="flex flex-col gap-12 justify-center relative">
          <div className="text-sm font-bold text-[#0EA5E9] uppercase tracking-widest text-center mb-4">Quarter-Finals</div>
          {quarters.slice(0, 4).map((q, i) => (
            <div key={i} className="relative">
              <MatchCard match={q} />
              {/* Connector line */}
              <div className="absolute top-1/2 -right-12 w-12 h-px bg-[var(--football-border)]" />
            </div>
          ))}
        </div>

        {/* Semi Finals */}
        <div className="flex flex-col gap-32 justify-center relative">
          <div className="text-sm font-bold text-[#0EA5E9] uppercase tracking-widest text-center mb-4">Semi-Finals</div>
          {semis.slice(0, 2).map((s, i) => (
            <div key={i} className="relative">
              {/* Connector lines from QF */}
              <div className="absolute top-1/2 -left-12 w-12 h-px bg-[var(--football-border)]" />
              <div className="absolute -left-12 w-px bg-[var(--football-border)] top-[-3rem] h-[6rem]" style={{ top: i === 0 ? '-3rem' : 'auto', bottom: i === 1 ? '-3rem' : 'auto' }} />
              
              <MatchCard match={s} />
              
              {/* Connector line to Final */}
              <div className="absolute top-1/2 -right-12 w-12 h-px bg-[var(--football-border)]" />
            </div>
          ))}
        </div>

        {/* Final */}
        <div className="flex flex-col justify-center relative">
          <div className="text-sm font-bold text-amber-400 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
            🏆 Final
          </div>
          {final.slice(0, 1).map((f, i) => (
            <div key={i} className="relative scale-110">
               {/* Connector lines from SF */}
              <div className="absolute top-1/2 -left-12 w-12 h-px bg-[var(--football-border)]" />
              <div className="absolute -left-12 w-px bg-[var(--football-border)] top-[-8rem] h-[16rem]" />

              <MatchCard match={f} />
            </div>
          ))}
        </div>
      </div>

      {selectedMatch && (
        <MatchDetailsModal 
          isLive={false} 
          matchId={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}
