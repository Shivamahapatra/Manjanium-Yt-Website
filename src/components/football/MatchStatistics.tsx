import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { Activity, Info } from 'lucide-react';

export interface TeamStats {
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;
  passes?: number;
  passCompletion?: number;
  tackles?: number;
  interceptions?: number;
  fouls?: number;
  corners?: number;
  offsides?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
}

export interface MatchStatisticsProps {
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

const STAT_DEFINITIONS: Record<string, string> = {
  'Possession %': 'The percentage of time a team has control of the ball.',
  'Shots': 'Total number of attempts to score a goal.',
  'Shots on Target': 'Shots that would have resulted in a goal if not blocked or saved.',
  'Passes': 'Total number of passes attempted by the team.',
  'Pass Completion %': 'Percentage of passes that successfully reached a teammate.',
  'Tackles': 'Successful challenges to take the ball away from an opponent.',
  'Interceptions': 'Reading the opponent\'s pass and intercepting the ball.',
  'Corners': 'Total corner kicks awarded.',
  'Fouls': 'Infringements of the rules penalized by the referee.',
  'Yellow Cards': 'Official cautions issued to players.',
  'Red Cards': 'Send-offs resulting in a player leaving the pitch.',
};

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 1,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v).toString();
        }
      });
      return () => controls.stop();
    }
  }, [value]);

  return <span ref={nodeRef}>{value}</span>;
}

export function MatchStatistics({ 
  homeTeamStats, 
  awayTeamStats, 
  homeTeamName, 
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo
}: MatchStatisticsProps) {

  const StatRow = ({ 
    label, 
    homeVal, 
    awayVal, 
    invertColors = false 
  }: { 
    label: string; 
    homeVal?: number; 
    awayVal?: number; 
    invertColors?: boolean; 
  }) => {
    const h = homeVal || 0;
    const a = awayVal || 0;
    const total = h + a;
    
    // Calculate percentages for the progress bar widths
    const homePct = total === 0 ? 50 : (h / total) * 100;
    const awayPct = total === 0 ? 50 : (a / total) * 100;

    // Highlight the higher stat (or lower if invertColors is true, e.g. fouls/cards)
    const isHomeHigher = h > a;
    const isAwayHigher = a > h;
    const homeHighlighted = invertColors ? isAwayHigher : isHomeHigher;
    const awayHighlighted = invertColors ? isHomeHigher : isAwayHigher;

    const tooltipText = STAT_DEFINITIONS[label] || '';

    return (
      <div className="mb-6 relative group">
        <div className="flex justify-between items-center mb-2">
          {/* Home Value */}
          <span className={`text-sm md:text-base font-bold tabular-nums w-12 text-left transition-colors duration-300
            ${homeHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500'}
          `}>
            <AnimatedNumber value={h} />
          </span>

          {/* Stat Label & Tooltip */}
          <div className="flex flex-col items-center relative">
            <span className="text-xs md:text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1 cursor-help">
              {label}
              {tooltipText && <Info className="w-3 h-3 text-neutral-400" />}
            </span>
            
            {/* Tooltip Popup */}
            {tooltipText && (
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48 bg-neutral-900 text-white text-[10px] md:text-xs text-center p-2 rounded shadow-lg">
                {tooltipText}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
              </div>
            )}
          </div>

          {/* Away Value */}
          <span className={`text-sm md:text-base font-bold tabular-nums w-12 text-right transition-colors duration-300
            ${awayHighlighted ? 'text-red-600 dark:text-red-400' : 'text-neutral-500'}
          `}>
            <AnimatedNumber value={a} />
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="flex h-2.5 md:h-3 rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 gap-1 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${homePct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${homeHighlighted ? 'bg-blue-600' : 'bg-blue-400/60'}`}
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${awayPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${awayHighlighted ? 'bg-red-600' : 'bg-red-400/60'}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" /> Team Statistics
        </h3>
      </div>

      {/* Team Headers */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex flex-col items-center gap-2 w-1/3">
          {homeTeamLogo && <img src={homeTeamLogo} className="w-10 h-10 object-contain" alt="home" />}
          <span className="text-xs font-bold text-center uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate w-full">{homeTeamName}</span>
        </div>
        <span className="text-xs text-neutral-400 font-bold uppercase w-1/3 text-center">vs</span>
        <div className="flex flex-col items-center gap-2 w-1/3">
          {awayTeamLogo && <img src={awayTeamLogo} className="w-10 h-10 object-contain" alt="away" />}
          <span className="text-xs font-bold text-center uppercase tracking-wider text-red-600 dark:text-red-400 truncate w-full">{awayTeamName}</span>
        </div>
      </div>

      {/* Stats List */}
      <div className="flex flex-col flex-1">
        <StatRow label="Possession %" homeVal={homeTeamStats.possession} awayVal={awayTeamStats.possession} />
        <StatRow label="Shots" homeVal={homeTeamStats.shots} awayVal={awayTeamStats.shots} />
        <StatRow label="Shots on Target" homeVal={homeTeamStats.shotsOnTarget} awayVal={awayTeamStats.shotsOnTarget} />
        <StatRow label="Passes" homeVal={homeTeamStats.passes} awayVal={awayTeamStats.passes} />
        <StatRow label="Pass Completion %" homeVal={homeTeamStats.passCompletion} awayVal={awayTeamStats.passCompletion} />
        <StatRow label="Tackles" homeVal={homeTeamStats.tackles} awayVal={awayTeamStats.tackles} />
        <StatRow label="Interceptions" homeVal={homeTeamStats.interceptions} awayVal={awayTeamStats.interceptions} />
        <StatRow label="Corners" homeVal={homeTeamStats.corners} awayVal={awayTeamStats.corners} />
        <StatRow label="Fouls" homeVal={homeTeamStats.fouls} awayVal={awayTeamStats.fouls} invertColors />
        <StatRow label="Yellow Cards" homeVal={homeTeamStats.yellowCards} awayVal={awayTeamStats.yellowCards} invertColors />
        <StatRow label="Red Cards" homeVal={homeTeamStats.redCards} awayVal={awayTeamStats.redCards} invertColors />
      </div>
    </div>
  );
}
