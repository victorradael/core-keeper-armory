import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  hoverable?: boolean;
}

export function Card({
  variant = 'filled',
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-[24px] p-6 transition-all overflow-hidden';
  
  const variants = {
    elevated: 'bg-[#2B2930] shadow-md border border-white/5',
    filled: 'bg-[#211F26] border border-transparent',
    outlined: 'bg-transparent border border-[#49454F]'
  };

  const interactiveStyles = hoverable ? 'hover:shadow-lg hover:border-primary/20 hover:scale-[1.01] cursor-pointer' : '';

  return (
    <div
      className={cn(baseStyles, variants[variant], interactiveStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
}
