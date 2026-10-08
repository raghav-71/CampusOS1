'use client';

import React from 'react';

interface AIOrbProps {
  status?: 'idle' | 'analyzing' | 'searching' | 'reading' | 'streaming';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AIOrb({ status = 'idle', size = 'md', className = '' }: AIOrbProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const isThinking = status !== 'idle';

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      {/* Outer soft green ring */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isThinking
            ? 'ring-2 ring-primary/40 bg-brand-50 animate-pulse scale-110'
            : 'ring-1 ring-primary/20 bg-brand-50/50'
        }`}
      />

      {/* Core green sphere */}
      <div className="relative w-full h-full rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm overflow-hidden">
        <span className="relative z-10 text-[10px] font-black tracking-tight">AI</span>

        {/* Subtle shimmer during thinking */}
        {isThinking && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-fade-in"
            style={{
              animation: 'fadeIn 0.6s ease-in-out infinite alternate',
            }}
          />
        )}
      </div>
    </div>
  );
}

export function AIThinkingIndicator({ statusText = 'Analyzing...' }: { statusText?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-brand-50 border border-brand-100 animate-fade-in text-xs font-600 text-primary-dark">
      <AIOrb size="sm" status="analyzing" />
      <span className="flex items-center gap-1.5 text-primary-dark font-medium">
        {statusText}
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </span>
    </div>
  );
}
