import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  photo?: string;
  isSubstituted?: boolean;
  yellowCards?: number;
  redCards?: number;
}

export interface TeamData {
  name: string;
  logo?: string;
  formation: string;
  lineup: Player[];
  substitutes: Player[];
}

export interface TeamLineupProps {
  team: TeamData;
  isHomeTeam: boolean;
  highlightedPlayerId: string | null;
  onPlayerClick: (player: Player) => void;
}

export function TeamLineup({ team, isHomeTeam, highlightedPlayerId, onPlayerClick }: TeamLineupProps) {
  
  // Parse formation
  const formationRows = useMemo(() => {
    if (!team.formation) return [];
    // Formations like "4-3-3" or "4-2-3-1"
    const parsed = ['1', ...team.formation.split('-')].map(Number);
    
    // Fallback if parsing goes wrong
    if (parsed.some(isNaN) || parsed.reduce((a,b) => a+b, 0) !== 11) {
      return [1, 4, 3, 3]; // Default to 4-3-3
    }
    return parsed;
  }, [team.formation]);

  // Group players by rows
  const playerRows = useMemo(() => {
    const rows: Player[][] = [];
    let currentIndex = 0;
    
    formationRows.forEach((count) => {
      rows.push(team.lineup.slice(currentIndex, currentIndex + count));
      currentIndex += count;
    });

    return rows;
  }, [team.lineup, formationRows]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
          ) : (
            <Shield className="w-8 h-8 text-neutral-300" />
          )}
          <h3 className="font-bold text-lg">{team.name}</h3>
        </div>
        <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-400">
          Formation: {team.formation || '4-3-3'}
        </span>
      </div>

      {/* Visual Pitch */}
      <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-green-600 rounded-2xl overflow-hidden shadow-inner border-4 border-green-700 select-none">
        {/* Pitch Markings (SVG overlay) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
          <svg width="100%" height="100%" viewBox="0 0 100 130" preserveAspectRatio="none">
            {/* Center Line */}
            <line x1="0" y1="65" x2="100" y2="65" stroke="white" strokeWidth="0.5" />
            {/* Center Circle */}
            <circle cx="50" cy="65" r="12" fill="none" stroke="white" strokeWidth="0.5" />
            {/* Center Dot */}
            <circle cx="50" cy="65" r="1" fill="white" />
            
            {/* Top Penalty Area */}
            <rect x="20" y="0" width="60" height="22" fill="none" stroke="white" strokeWidth="0.5" />
            <rect x="35" y="0" width="30" height="8" fill="none" stroke="white" strokeWidth="0.5" />
            <path d="M 38 22 A 12 12 0 0 0 62 22" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="15" r="0.5" fill="white" />

            {/* Bottom Penalty Area */}
            <rect x="20" y="108" width="60" height="22" fill="none" stroke="white" strokeWidth="0.5" />
            <rect x="35" y="122" width="30" height="8" fill="none" stroke="white" strokeWidth="0.5" />
            <path d="M 38 108 A 12 12 0 0 1 62 108" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="115" r="0.5" fill="white" />
          </svg>
        </div>

        {/* Players */}
        {playerRows.map((row, rowIndex) => {
          // Calculate Y position
          // isHomeTeam: GK at bottom (90%) -> FWD at top (10%)  [Wait, home faces UP so GK is at bottom]
          // awayTeam: GK at top (10%) -> FWD at bottom (90%)
          
          let yPct = 0;
          if (formationRows.length > 1) {
             const progress = rowIndex / (formationRows.length - 1); // 0 to 1
             // If home: row 0 (GK) is at 90%, row N (FWD) is at 10%
             yPct = isHomeTeam ? 90 - (80 * progress) : 10 + (80 * progress);
          } else {
             yPct = 50; // Fallback
          }

          return row.map((player, colIndex) => {
            // Calculate X position
            // Evenly distribute across 100% width
            const rowCount = row.length;
            // Spacing factor to avoid edges:
            const widthPerPlayer = 80 / Math.max(1, rowCount);
            const startX = 50 - ((rowCount - 1) * widthPerPlayer) / 2;
            const xPct = startX + (colIndex * widthPerPlayer);

            const isHighlighted = highlightedPlayerId === player.id;
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: player.isSubstituted ? 0.6 : 1, 
                  scale: isHighlighted ? 1.1 : 1,
                  left: `${xPct}%`,
                  top: `${yPct}%`
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
                onClick={() => onPlayerClick(player)}
              >
                {/* Player Circle */}
                <div className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 shadow-lg transition-colors
                  ${isHomeTeam ? 'bg-blue-600 border-blue-400 group-hover:bg-blue-500' : 'bg-red-600 border-red-400 group-hover:bg-red-500'}
                  ${isHighlighted ? 'ring-4 ring-yellow-400' : ''}
                `}>
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    player.number
                  )}

                  {/* Cards Indicator */}
                  {player.redCards ? (
                    <div className="absolute -top-1 -right-1 w-3 h-4 bg-red-500 rounded-sm shadow-sm border border-red-700" />
                  ) : player.yellowCards ? (
                    <div className="absolute -top-1 -right-1 w-3 h-4 bg-yellow-400 rounded-sm shadow-sm border border-yellow-600" />
                  ) : null}

                  {/* Substituted Indicator */}
                  {player.isSubstituted && (
                    <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-0.5 border border-neutral-700">
                      <ArrowRight className="w-3 h-3 text-red-400" />
                    </div>
                  )}
                </div>

                {/* Player Name */}
                <div className="mt-1 flex flex-col items-center">
                  <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-md shadow-sm whitespace-nowrap
                    ${player.isSubstituted ? 'bg-neutral-900/60 text-neutral-300 line-through' : 'bg-neutral-900/80 text-white'}
                  `}>
                    {player.name}
                  </span>
                  <span className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase mt-0.5 drop-shadow-md">
                    {player.position}
                  </span>
                </div>
              </motion.div>
            );
          });
        })}
      </div>

      {/* Substitutes Bench */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <h4 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          Substitutes Bench
        </h4>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          {team.substitutes.map(sub => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={sub.id}
              onClick={() => onPlayerClick(sub)}
              className={`flex items-center gap-3 min-w-[200px] p-3 rounded-xl border transition-colors text-left
                ${highlightedPlayerId === sub.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }
              `}
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">
                {sub.number}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate">{sub.name}</span>
                <span className="text-xs text-neutral-500">{sub.position}</span>
              </div>
            </motion.button>
          ))}
          {team.substitutes.length === 0 && (
            <div className="text-sm text-neutral-500 italic px-2">No substitutes available</div>
          )}
        </div>
      </div>
    </div>
  );
}
