'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function StudentDashboardHeader() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { profile, signOut } = useProfile();

  const firstName = profile?.fullName?.split(' ')?.[0] ?? 'Student';
  const initials = profile?.initials ?? 'AS';
  const department = profile?.department ?? 'Computer Applications (BCA)';
  const semester = profile?.semester ?? 'Sem 5';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="lg:ml-0 ml-12">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-800 text-foreground tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {department} — {semester} &nbsp;·&nbsp;{' '}
            <span className="text-accent font-600">3 classes today</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative">
          {/* Quick search trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden md:flex items-center gap-2 glass-card rounded-xl px-3.5 py-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer w-48 hover:border-primary/40 shadow-sm"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0 text-primary"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-xs">Quick search...</span>
            <kbd className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 text-foreground hover:border-accent text-xs font-700 transition-all cursor-pointer shadow-sm"
            title="Ask Campus OS AI"
          >
            <span className="text-accent">✨</span>
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer relative border border-border/60 hover:border-primary/40"
              title="Notifications"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
            </button>
            <NotificationDropdown
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
            />
          </div>

          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-800 text-white shadow-glow flex-shrink-0 cursor-pointer border border-white/20">
            {initials}
          </div>
        </div>
      </div>

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        userRole="student"
      />
    </>
  );
}
