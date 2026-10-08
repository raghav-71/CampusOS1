'use client';

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { useProfile } from '@/hooks/useProfile';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function NotificationBell() {
  const { profile } = useProfile();
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
    }, profile || undefined);

    return () => unsub();
  }, [profile]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-border hover:border-primary/50 hover:bg-brand-50 flex items-center justify-center text-slate-600 hover:text-primary-dark transition-all shadow-sm group cursor-pointer"
        aria-label="Toggle notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-colors group-hover:text-primary-dark ${isShaking ? 'animate-bell-shake text-primary' : ''}`}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm animate-checkmark">
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
