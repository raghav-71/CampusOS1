'use client';

import React, { useRef, useState, useEffect } from 'react';

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
  interactive3D = true,
  enableSpotlight = true,
  glow = 'none',
  children,
  className = '',
  onMouseMove,
  onMouseLeave,
  style,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTouchDevice.current && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (interactive3D) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3.5;
        const rotateY = ((x - centerX) / centerX) * 3.5;
        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px) scale3d(1.01, 1.01, 1.01)`
        );
      }

      if (enableSpotlight) {
        setSpotlight({
          x: Math.round((x / rect.width) * 100),
          y: Math.round((y / rect.height) * 100),
          opacity: 1,
        });
      }
    }
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTouchDevice.current) {
      setTransformStyle('');
      setSpotlight((prev) => ({ ...prev, opacity: 0 }));
    }
    if (onMouseLeave) onMouseLeave(e);
  };

  const glowStyle =
    glow === 'primary'
      ? 'shadow-glow border-primary/50'
      : glow === 'accent'
        ? 'shadow-glow-accent border-accent/50'
        : 'border-border/80';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle || undefined,
        transition: transformStyle
          ? 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.28s ease',
        ...style,
      }}
      className={`glass-card rounded-3xl border relative overflow-hidden ${glowStyle} ${
        hoverEffect ? 'glass-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {/* Holographic Radial Cursor Spotlight */}
      {enableSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(380px circle at ${spotlight.x}% ${spotlight.y}%, rgba(0, 216, 246, 0.12), transparent 70%)`,
            opacity: spotlight.opacity,
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
