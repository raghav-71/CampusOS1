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
  const department = 'Bachelor of Computer Applications';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8 pt-14 lg:pt-0 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-xs sm:text-[13px] text-[#6E6E73] font-normal mt-0.5">
            {formattedDate} &nbsp;·&nbsp; {department}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative">
          {/* Quick search trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-white border border-black/[0.08] rounded-xl px-3.5 py-2 text-[#6E6E73] hover:text-[#1D1D1F] hover:border-black/[0.15] transition-all cursor-pointer w-48 shadow-subtle"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#8E8E93]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-xs font-normal">Search...</span>
            <kbd className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded-md bg-[#F5F5F7] border border-black/[0.08] text-[#8E8E93]">
              ⌘K
            </kbd>
          </button>

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-black/[0.02] text-xs font-semibold transition-all cursor-pointer shadow-subtle"
            title="Ask CampusOS AI"
          >
            <AIOrb size="sm" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Dynamic Notification Bell */}
          <NotificationBell />

          {/* Clean circular avatar with subtle ring */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#DCFCE7] text-[#15803D] ring-1 ring-black/[0.08] flex items-center justify-center text-xs font-bold shadow-subtle flex-shrink-0 cursor-pointer">
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
