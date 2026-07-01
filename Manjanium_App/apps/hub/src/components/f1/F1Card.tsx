import React from 'react';
import { cn } from '@/lib/utils';

interface F1CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function F1Card({ title, children, className = '' }: F1CardProps) {
  return (
    <div
      className={cn(
        "bg-[#131313] border border-[#333333] rounded-[12px] p-6 hover:border-[#FBBF24]/50 transition-all duration-300",
        className
      )}
      style={{
        backgroundColor: 'var(--f1-surface)',
        borderColor: 'var(--f1-border)',
      }}
    >
      {title && (
        <h3
          className="text-lg font-bold text-white mb-4"
          style={{ fontFamily: 'var(--f1-font-heading)' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
