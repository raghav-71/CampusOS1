'use client';

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    let lastCount = 0;
    const unsub = notificationService.subscribe((list) => {
      const unread = list.filter((n) => !n.read).length;
      if (unread > lastCount) {
        // New notification arrived! Trigger bell shake animation
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 700);
      }
      lastCount = unread;
      setUnreadCount(unread);
    });

    return () => unsub();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-10 h-10 rounded-2xl glass-card border border-border/80 hover:border-accent/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all btn-press shadow-sm group cursor-pointer"
        aria-label="Toggle notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-colors group-hover:text-accent ${isShaking ? 'animate-bell-shake text-accent' : ''}`}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-800 text-white shadow-glow animate-checkmark">
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
