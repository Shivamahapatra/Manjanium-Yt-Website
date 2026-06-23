import React from 'react';

interface F1CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function F1Card({ title, children, className = '' }: F1CardProps) {
  return (
    <div 
      className={`
        bg-[#131313] border border-[#333333] rounded-xl p-6 
        hover:border-[#FBBF24]/50 transition-all duration-300
        ${className}
      `}
    >
      {title && (
        <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk'] tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
