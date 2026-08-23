'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: 'primary' | 'accent' | 'none';
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({
  hoverEffect = false,
  glow = 'none',
  children,
  className = '',
  ...props
}: GlassCardProps) {
  const glowStyle =
    glow === 'primary'
      ? 'shadow-glow border-primary/30'
      : glow === 'accent'
      ? 'shadow-glow-accent border-accent/30'
      : 'border-border';

  return (
    <div
      className={`glass-card rounded-2xl border ${glowStyle} ${
        hoverEffect ? 'glass-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
