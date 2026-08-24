'use client';

import React, { useState } from 'react';

interface AIFloatingButtonProps {
  onClick?: () => void;
  role?: string;
}

export default function AIFloatingButton({ onClick, role = 'student' }: AIFloatingButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {hovered && (
        <div className="glass-card rounded-2xl px-4 py-2.5 border border-primary/40 text-xs font-600 text-foreground animate-fade-in-up shadow-glow flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>Ask Campus OS AI Intelligence Layer ✨</span>
        </div>
      )}
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center shadow-glow animate-pulse-glow transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
        title="Open Campus OS AI Assistant"
      >
        {/* Holographic Ring Rotation */}
        <div className="absolute inset-[-4px] rounded-3xl border border-accent/40 border-dashed animate-spin-slow pointer-events-none" />

        {/* Inner Glowing Center */}
        <div className="w-10 h-10 rounded-xl bg-card/40 backdrop-blur-md flex items-center justify-center text-white">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="3" fill="#00D8F6" fillOpacity="0.4" />
          </svg>
        </div>

        {/* Live Active Status Indicator Dot */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent border-2 border-background" />
        </span>
      </button>
    </div>
  );
}
