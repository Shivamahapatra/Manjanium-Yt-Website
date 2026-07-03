"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MatchDetailsModal } from "@/components/football/MatchDetailsModal";

export function KnockoutBrackets() {
  const [brackets, setBrackets] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  useEffect(() => {
    // Fetch from real data API
    const fetchBrackets = async () => {
      try {
        const res = await fetch('/api/football/knockouts');
        const data = await res.json();
        if (data && data.length > 0 && !data.error) {
          setBrackets(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    // Initial fetch
    fetchBrackets();

    // Poll every 60 seconds for live updates
    const intervalId = setInterval(fetchBrackets, 60000);
    return () => clearInterval(intervalId);
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

  const r32 = brackets.filter(b => b.round === 'Round of 32');
  const r16 = brackets.filter(b => b.round === 'Round of 16');
  const quarters = brackets.filter(b => b.round === 'Quarter-Finals');
  const semis = brackets.filter(b => b.round === 'Semi-Finals');
  const final = brackets.filter(b => b.round === 'Final');

  const MatchCard = ({ match }: { match: any }) => {
    if (!match) return <div className="w-56 h-[90px]" />; // Spacer if missing
    return (
      <div 
        className={`bg-[var(--football-surface-alt)] border border-[var(--football-border)] p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors w-56 shadow-lg z-10 relative ${match.isPlaceholder ? 'opacity-60' : ''}`}
        onClick={() => setSelectedMatch(match.match_id)}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            {match.logo1 && <img src={match.logo1} alt={match.team1} className="w-5 h-5 object-contain" />}
            <span className="font-bold text-white text-sm truncate">{match.team1 || 'TBD'}</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-md">{!isNaN(match.score1) ? match.score1 : '-'}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            {match.logo2 && <img src={match.logo2} alt={match.team2} className="w-5 h-5 object-contain" />}
            <span className="font-bold text-white text-sm truncate">{match.team2 || 'TBD'}</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-md">{!isNaN(match.score2) ? match.score2 : '-'}</span>
        </div>
        {(match.pen1 !== undefined || match.pen2 !== undefined) && (
          <div className="text-xs text-white/50 text-center mt-1 font-mono">
            Pen: {match.pen1} - {match.pen2}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-8 overflow-x-auto overflow-y-auto max-h-[85vh]">
      <div className="sticky left-0 top-0 z-20">
        <h2 className="text-2xl font-bold mb-8 font-heading text-white">Knockout Stage (2026 World Cup)</h2>
      </div>
      
      <div className="flex justify-between min-w-[1400px] h-[1800px] items-stretch pb-12">
        {/* Round of 32 */}
        <div className="flex flex-col justify-around relative w-56">
          <div className="text-sm font-bold text-[#0EA5E9] uppercase tracking-widest text-center absolute -top-8 w-full">Round of 32</div>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="relative flex items-center h-full">
              <MatchCard match={r32[i]} />
              <div className="absolute top-1/2 -right-8 w-8 h-px bg-[var(--football-border)] z-0" />
            </div>
          ))}
        </div>

        {/* Round of 16 */}
        <div className="flex flex-col justify-around relative w-56">
          <div className="text-sm font-bold text-[#0EA5E9] uppercase tracking-widest text-center absolute -top-8 w-full">Round of 16</div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="relative flex items-center h-[225px]">
              {/* Connectors from R32 */}
              <div className="absolute top-1/2 -left-8 w-8 h-px bg-[var(--football-border)] z-0" />
              <div className="absolute -left-8 w-px bg-[var(--football-border)] z-0 h-[112px]" style={{ top: '25%' }} />
              
              <MatchCard match={r16[i]} />
              
              <div className="absolute top-1/2 -right-8 w-8 h-px bg-[var(--football-border)] z-0" />
            </div>
          ))}
        </div>

        {/* Quarter Finals */}
        <div className="flex flex-col justify-around relative w-56">
          <div className="text-sm font-bold text-[#0EA5E9] uppercase tracking-widest text-center absolute -top-8 w-full">Quarter-Finals</div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative flex items-center h-[450px]">
              {/* Connectors from R16 */}
              <div className="absolute top-1/2 -left-8 w-8 h-px bg-[var(--football-border)] z-0" />
              <div className="absolute -left-8 w-px bg-[var(--football-border)] z-0 h-[225px]" style={{ top: '25%' }} />
              
              <MatchCard match={quarters[i]} />
              
              <div className="absolute top-1/2 -right-8 w-8 h-px bg-[var(--football-border)] z-0" />
            </div>
          ))}
        </div>

        {/* Semi Finals */}
        <div className="flex flex-col justify-around relative w-56">
          <div className="text-sm font-bold text-[#0EA5E9] uppercase tracking-widest text-center absolute -top-8 w-full">Semi-Finals</div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="relative flex items-center h-[900px]">
              {/* Connectors from QF */}
              <div className="absolute top-1/2 -left-8 w-8 h-px bg-[var(--football-border)] z-0" />
              <div className="absolute -left-8 w-px bg-[var(--football-border)] z-0 h-[450px]" style={{ top: '25%' }} />
              
              <MatchCard match={semis[i]} />
              
              <div className="absolute top-1/2 -right-8 w-8 h-px bg-[var(--football-border)] z-0" />
            </div>
          ))}
        </div>

        {/* Final */}
        <div className="flex flex-col justify-center relative w-56">
          <div className="text-sm font-bold text-amber-400 uppercase tracking-widest text-center absolute -top-8 w-full flex items-center justify-center gap-2">
            🏆 Final
          </div>
          {Array.from({ length: 1 }).map((_, i) => (
            <div key={i} className="relative flex items-center scale-110">
              {/* Connectors from SF */}
              <div className="absolute top-1/2 -left-8 w-8 h-px bg-[var(--football-border)] z-0" />
              <div className="absolute -left-8 w-px bg-[var(--football-border)] z-0 h-[900px]" style={{ top: '-450px' }} />

              <MatchCard match={final[i]} />
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
