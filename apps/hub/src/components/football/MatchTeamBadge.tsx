import React from 'react';
import { cn } from '@/lib/utils';

export interface MatchTeamBadgeProps {
  team: 'home' | 'away';
  children: React.ReactNode;
  className?: string;
}

export function MatchTeamBadge({ team, children, className = '' }: MatchTeamBadgeProps) {
  const colors = {
    home: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/50',
    away: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50'
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[10px] uppercase font-bold border tracking-wider",
      colors[team],
      className
    )}>
      {children}
    </span>
  );
}
