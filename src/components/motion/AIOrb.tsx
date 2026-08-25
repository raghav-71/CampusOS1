'use client';

import React from 'react';

interface AIOrbProps {
  status?: 'idle' | 'analyzing' | 'searching' | 'reading' | 'streaming';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AIOrb({ status = 'idle', size = 'md', className = '' }: AIOrbProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const isThinking = status !== 'idle';

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer breathing aura */}
      <div
        className={`absolute inset-0 rounded-full filter blur-md transition-all duration-500 ${
          isThinking
            ? 'bg-gradient-to-tr from-accent via-primary to-emerald-400 opacity-90 animate-pulse scale-125'
            : 'bg-gradient-to-tr from-primary via-accent to-indigo-500 opacity-60 animate-float-slow'
        }`}
      />

      {/* Rotating concentric light ring */}
      <div
        className={`absolute inset-0 rounded-full border border-accent/40 transition-transform duration-1000 ${
          isThinking ? 'animate-spin border-dashed border-accent' : 'opacity-40'
        }`}
        style={{ animationDuration: isThinking ? '3s' : '10s' }}
      />

      {/* Core glowing sphere */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 shadow-glow flex items-center justify-center text-white text-xs font-black overflow-hidden border border-white/20">
        <span className="relative z-10 text-[11px] font-black tracking-tighter">AI</span>

        {/* Shimmer sweep */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            transform: 'skewX(-20deg)',
            animation: isThinking ? 'fadeIn 0.8s ease-in-out infinite alternate' : 'none',
          }}
        />
      </div>
    </div>
  );
}

export function AIThinkingIndicator({ statusText = 'Analyzing...' }: { statusText?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/10 border border-primary/30 animate-fade-in text-xs font-700 text-foreground">
      <AIOrb size="sm" status="analyzing" />
      <span className="text-accent flex items-center gap-1.5">
        {statusText}
        <span className="inline-flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </span>
    </div>
  );
}
