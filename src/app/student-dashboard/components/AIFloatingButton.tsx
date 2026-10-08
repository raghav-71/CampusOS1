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
  const { magneticProps } = useMagnetic({ maxPull: 6 });

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {hovered && (
        <div className="bg-white rounded-xl px-3.5 py-1.5 border border-border text-xs font-semibold text-slate-800 animate-fade-in shadow-md flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Ask CampusOS AI ✨</span>
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
        className="relative group w-12 h-12 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md ring-4 ring-primary/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        title="Open CampusOS AI Assistant"
        aria-label="Open AI Assistant"
      >
        <AIOrb size="sm" status={hovered ? 'analyzing' : 'idle'} />

        {/* Live Active Status Indicator Dot */}
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-100 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-primary" />
        </span>
      </button>
    </div>
  );
}
