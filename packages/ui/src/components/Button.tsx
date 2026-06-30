import React from 'react';
import { colors, typography } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    
    // Base styles
    let baseStyles = "inline-flex items-center justify-center rounded-lg font-bold uppercase transition-all focus:outline-none cursor-pointer ";
    
    // Size styles
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-4 text-xl font-black italic",
    };
    
    // Variant styles
    const variantStyles = {
      primary: "bg-white text-black hover:bg-neutral-200 border border-transparent",
      secondary: "bg-neutral-800 text-white hover:bg-neutral-700 border border-transparent",
      outline: "bg-transparent text-white border border-neutral-600 hover:border-neutral-400 hover:bg-white/5",
    };
    
    const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    return (
      <button ref={ref} className={combinedClasses} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
