'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

interface AIFloatingButtonProps {
  onClick?: () => void;
}

export default function AIFloatingButton({ onClick }: AIFloatingButtonProps) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast.info('AI Study Assistant drawer will open here (Phase 8 AI Integration)');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {hovered && (
        <div className="glass-card rounded-xl px-3.5 py-2.5 border border-primary/30 text-sm font-500 text-foreground animate-fade-in-up shadow-glow whitespace-nowrap">
          Ask AI Study Assistant ✨
        </div>
      )}
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse-glow transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        title="Open AI Study Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </div>
  );
}