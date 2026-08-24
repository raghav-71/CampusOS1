'use client';

import React, { useRef, useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  interactive3D?: boolean;
  glow?: 'primary' | 'accent' | 'none';
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({
  hoverEffect = false,
  interactive3D = false,
  glow = 'none',
  children,
  className = '',
  onMouseMove,
  onMouseLeave,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive3D && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      setTransformStyle(
        `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`
      );
    }
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive3D) {
      setTransformStyle('');
    }
    if (onMouseLeave) onMouseLeave(e);
  };

  const glowStyle =
    glow === 'primary'
      ? 'shadow-glow border-primary/40'
      : glow === 'accent'
        ? 'shadow-glow-accent border-accent/40'
        : 'border-border/80';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle || undefined,
        transition: transformStyle
          ? 'transform 0.1s ease-out'
          : 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      className={`glass-card rounded-2xl border ${glowStyle} ${
        hoverEffect ? 'glass-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
