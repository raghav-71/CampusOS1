'use client';

import React from 'react';
import { useTilt } from '@/lib/motion/useTilt';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  enableSpotlight?: boolean;
  glowColor?: string;
}

export default function AnimatedCard({
  children,
  className = '',
  maxTilt = 2,
  enableSpotlight = true,
  glowColor = 'rgba(34, 197, 94, 0.05)',
  style,
  ...props
}: AnimatedCardProps) {
  const { tiltProps, glowPos } = useTilt({ maxRotation: maxTilt });

  return (
    <div
      {...props}
      {...tiltProps}
      style={{
        ...tiltProps.style,
        ...style,
      }}
      className={`glass-card glass-card-hover relative overflow-hidden ${className}`}
    >
      {/* Holographic Radial Cursor Spotlight */}
      {enableSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(420px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`,
            opacity: glowPos.opacity,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
