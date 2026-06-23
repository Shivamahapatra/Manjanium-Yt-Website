import React from 'react';

interface F1BadgeProps {
  variant: 'alert' | 'success' | 'info' | 'default' | 'live';
  children: React.ReactNode;
  className?: string;
}

export function F1Badge({ variant, children, className = '' }: F1BadgeProps) {
  const variants = {
    alert: 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50',
    success: 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50',
    info: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50',
    default: 'bg-[#6B7280]/20 text-[#6B7280] border border-[#6B7280]/50',
    live: 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
