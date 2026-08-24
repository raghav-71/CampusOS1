'use client';

import React from 'react';

export type BadgeVariant = 'violet' | 'cyan' | 'blue' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  violet: { badge: 'badge-violet', dot: 'bg-primary' },
  cyan: { badge: 'badge-cyan', dot: 'bg-accent' },
  blue: { badge: 'badge-blue', dot: 'bg-primary' },
  success: { badge: 'badge-success', dot: 'bg-success' },
  warning: { badge: 'badge-warning', dot: 'bg-warning' },
  danger: { badge: 'badge-danger', dot: 'bg-danger' },
  muted: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

export default function Badge({
  variant = 'muted',
  size = 'sm',
  dot = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const config = variantStyles[variant] || variantStyles.muted;
  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-600 transition-colors ${config.badge} ${sizeStyles} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {children}
    </span>
  );
}
