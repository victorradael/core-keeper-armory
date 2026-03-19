import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'filled',
  size = 'md',
  isLoading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2';
  
  const variants = {
    filled: 'bg-primary text-[#1C1B1F] hover:shadow-lg hover:shadow-primary/20',
    outlined: 'border border-primary text-primary hover:bg-primary/10',
    tonal: 'bg-[#4A4458] text-[#E6E1E5] hover:bg-[#5A5468]',
    text: 'text-primary hover:bg-primary/10'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-4 text-lg rounded-[24px]'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}
