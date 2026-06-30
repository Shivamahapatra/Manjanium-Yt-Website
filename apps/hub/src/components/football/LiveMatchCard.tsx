import React from 'react';
import { useRouter } from 'next/navigation';
import { FootballCard } from './FootballCard';
import { FootballBadge } from './FootballBadge';
import { motion } from 'framer-motion';

export interface LiveMatchCardProps {
  match: any;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  const router = useRouter();
  
  const isLive = match.fixture.status.short === '1H' || match.fixture.status.short === '2H';
  const isFinished = match.fixture.status.short === 'FT' || match.fixture.status.short === 'PEN';

  let variant: 'live' | 'finished' | 'upcoming' = 'upcoming';
  if (isLive) variant = 'live';
  else if (isFinished) variant = 'finished';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/football/matches/${match.fixture.id}`)}
      className="cursor-pointer"
    >
      <FootballCard 
        variant={variant}
        className="h-full flex flex-col justify-center min-h-[120px] p-4"
      >
        <div className="flex items-center justify-between gap-4">
          
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 p-2 flex items-center justify-center">
              <img 
                src={match.teams.home.logo}
                alt={match.teams.home.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-white text-xs uppercase tracking-wide truncate max-w-[100px]">
              {match.teams.home.name}
            </p>
          </div>

          {/* Score & Status */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {isLive ? (
              <FootballBadge variant="live">
                {match.fixture.status.elapsed ? `${match.fixture.status.elapsed}'` : 'LIVE'}
              </FootballBadge>
            ) : (
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                {match.fixture.status.short}
              </span>
            )}
            <div 
              className="text-3xl font-black text-white tracking-tighter" 
              style={{ fontFamily: 'var(--football-font-heading)' }}
            >
              {match.goals.home ?? 0} - {match.goals.away ?? 0}
            </div>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 p-2 flex items-center justify-center">
              <img 
                src={match.teams.away.logo}
                alt={match.teams.away.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-white text-xs uppercase tracking-wide truncate max-w-[100px]">
              {match.teams.away.name}
            </p>
          </div>
          
        </div>
      </FootballCard>
    </motion.div>
  );
}
