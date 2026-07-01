import React from 'react';
import { cn } from '@/lib/utils';

export interface FootballBadgeProps {
  variant: 'live' | 'finished' | 'upcoming' | 'goal' | 'card' | 'sub' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function FootballBadge({ variant, children, className = '' }: FootballBadgeProps) {
  const variants = {
    live: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 animate-pulse',
    finished: 'bg-[#6B7280]/20 text-[#6B7280] border-[#6B7280]/50',
    upcoming: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50',
    goal: 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/50',
    card: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50',
    sub: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/50',
    info: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/50'
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold border tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
