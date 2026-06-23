import React from 'react';

interface F1BadgeProps {
  children: React.ReactNode;
  variant?: 'live' | 'default' | 'success' | 'alert';
  className?: string;
}

export function F1Badge({ children, variant = 'default', className = '' }: F1BadgeProps) {
  const variants = {
    live: 'bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444]',
    default: 'bg-[#333333] border border-[#444444] text-white',
    success: 'bg-[#10B981]/20 border border-[#10B981] text-[#10B981]',
    alert: 'bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444]',
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
