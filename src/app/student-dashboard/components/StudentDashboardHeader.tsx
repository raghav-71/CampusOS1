'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import NotificationBell from '@/components/motion/NotificationBell';
import AIOrb from '@/components/motion/AIOrb';

export default function StudentDashboardHeader() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { profile } = useProfile();

  const firstName = profile?.fullName?.split(' ')?.[0] ?? 'Arjun';
  const initials = profile?.initials ?? 'AS';
  const department = 'Bachelor of Computer Applications (BCA)';
  const semester = 'Semester 5';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-in">
        <div className="lg:ml-0 ml-12">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl animate-float-slow">👋</span>
            <h1 className="text-2xl font-800 text-foreground tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-500">
            {department} · {semester} &nbsp;·&nbsp;{' '}
            <span className="text-accent font-700">3 classes today</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Quick search trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden md:flex items-center gap-2.5 glass-card rounded-2xl px-4 py-2.5 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer w-52 hover:border-accent/50 shadow-sm btn-press"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0 text-accent"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-xs font-500">Search Campus OS...</span>
            <kbd className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded-lg bg-muted border border-border text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* AI Assistant Quick Trigger with Live Breathing Orb */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-primary/25 via-accent/15 to-primary/25 border border-primary/50 text-foreground hover:border-accent text-xs font-800 transition-all cursor-pointer shadow-glow btn-press"
            title="Ask Campus OS AI"
          >
            <AIOrb size="sm" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Dynamic Notification Bell with shake & spring badge */}
          <NotificationBell />

          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-900 text-white shadow-glow flex-shrink-0 cursor-pointer border border-white/20 btn-press">
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
