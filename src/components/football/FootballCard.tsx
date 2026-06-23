import React from 'react';
import { cn } from '@/lib/utils';

export interface FootballCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'live' | 'upcoming' | 'finished';
}

export function FootballCard({ 
  title, 
  children, 
  className = '',
  variant = 'default'
}: FootballCardProps) {
  const borderColors = {
    default: 'border-[var(--football-border)]',
    live: 'border-[var(--football-live)]/50 bg-[var(--football-live)]/5',
    upcoming: 'border-[var(--football-upcoming)]/50 bg-[var(--football-upcoming)]/5',
    finished: 'border-[var(--football-finished)]/50'
  };

  return (
    <div 
      className={cn(
        "rounded-[var(--football-radius)] p-6 border transition-all duration-300 hover:border-[var(--football-accent)]/50 shadow-md",
        borderColors[variant],
        className
      )}
      style={{
        backgroundColor: 'var(--football-surface)',
      }}
    >
      {title && (
        <h3 
          className="text-lg font-bold text-white mb-4 uppercase tracking-wider"
          style={{ fontFamily: 'var(--football-font-heading)' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
