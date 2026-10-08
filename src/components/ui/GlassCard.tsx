'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  interactive3D?: boolean;
  enableSpotlight?: boolean;
  glow?: 'primary' | 'accent' | 'none';
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({
  hoverEffect = true,
  interactive3D = false,
  enableSpotlight = false,
  glow = 'none',
  children,
  className = '',
  style,
  ...props
}: GlassCardProps) {
  return (
    <div
      style={style}
      className={`bg-white rounded-[18px] border border-black/[0.06] shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-card-hover hover:border-black/[0.1] hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
