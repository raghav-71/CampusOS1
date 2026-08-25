'use client';

import React, { useState } from 'react';
import AIOrb from '@/components/motion/AIOrb';
import { useMagnetic } from '@/lib/motion/useMagnetic';

interface AIFloatingButtonProps {
  onClick?: () => void;
  role?: string;
}

export default function AIFloatingButton({ onClick, role = 'student' }: AIFloatingButtonProps) {
  const [hovered, setHovered] = useState(false);
  const { magneticProps } = useMagnetic({ maxPull: 8 });

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {hovered && (
        <div className="glass-card rounded-2xl px-4 py-2.5 border border-accent/40 text-xs font-700 text-foreground animate-modal-pop shadow-glow flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>Ask Campus OS AI Intelligence Layer ✨</span>
        </div>
      )}
      <button
        onClick={onClick}
        {...magneticProps}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={(e) => {
          setHovered(false);
          magneticProps.onMouseLeave();
        }}
        className="relative group w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center shadow-glow animate-pulse-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/30 btn-press"
        title="Open Campus OS AI Assistant"
      >
        {/* Holographic Ring Rotation */}
        <div
          className="absolute inset-[-4px] rounded-3xl border border-accent/50 border-dashed pointer-events-none animate-spin"
          style={{ animationDuration: '12s' }}
        />

        {/* Living Breathing AI Core Orb */}
        <AIOrb size="md" status={hovered ? 'analyzing' : 'idle'} />

        {/* Live Active Status Indicator Dot */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent border-2 border-background" />
        </span>
      </button>
    </div>
  );
}
