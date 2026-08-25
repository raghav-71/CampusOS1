'use client';

import React from 'react';
import { useMagnetic } from '@/lib/motion/useMagnetic';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  magnetic?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/30',
  danger: 'btn-danger bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white',
  accent:
    'bg-gradient-to-r from-accent to-[#00A3FF] text-[#0A0A0F] font-800 hover:shadow-glow-accent hover:-translate-y-0.5 active:translate-y-0 border border-accent/40 shadow-glow',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-xl',
  md: 'text-sm px-4.5 py-2.5 rounded-2xl',
  lg: 'text-base px-6 py-3.5 rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  magnetic = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { magneticProps } = useMagnetic({ disabled: !magnetic });

  return (
    <button
      disabled={disabled || isLoading}
      {...(magnetic ? magneticProps : {})}
      style={{
        ...(magnetic ? magneticProps.style : {}),
        ...style,
      }}
      className={`btn-press inline-flex items-center justify-center gap-2 font-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
