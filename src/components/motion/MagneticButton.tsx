'use client';

import React from 'react';
import { useMagnetic } from '@/lib/motion/useMagnetic';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  maxPull?: number;
  className?: string;
}

export default function MagneticButton({
  children,
  variant = 'primary',
  size = 'md',
  maxPull = 5,
  className = '',
  style,
  ...props
}: MagneticButtonProps) {
  const { magneticProps } = useMagnetic({ maxPull });

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-2xl',
  };

  const variantClasses = {
    primary: 'btn-primary shadow-glow',
    secondary: 'btn-secondary',
    accent:
      'bg-accent text-black font-800 hover:bg-white hover:text-primary shadow-glow border border-accent/40',
    ghost:
      'bg-transparent hover:bg-primary/10 text-foreground border border-border/60 hover:border-primary/40 font-600',
  };

  return (
    <button
      {...props}
      {...magneticProps}
      style={{
        ...magneticProps.style,
        ...style,
      }}
      className={`btn-press inline-flex items-center justify-center gap-2 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
