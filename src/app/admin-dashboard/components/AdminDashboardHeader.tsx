'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import NotificationBell from '@/components/motion/NotificationBell';
import AIOrb from '@/components/motion/AIOrb';

export default function AdminDashboardHeader() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { profile } = useProfile();

  const adminName = profile?.fullName ?? 'Controller of Examinations';
  const initials = profile?.initials ?? 'COE';

  return (
    <>
      <div className="mb-6 lg:mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="lg:ml-0 ml-12">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-2xl bg-warning/20 border border-warning/40 flex items-center justify-center shadow-sm animate-float-slow">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFB300"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h1 className="text-2xl font-800 text-foreground tracking-tight">
                Admin Control Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-500">
              Welcome, {adminName} &nbsp;·&nbsp;{' '}
              <span className="text-success font-700">BCA Institutional Surveillance Active</span>{' '}
              &nbsp;·&nbsp; Fall 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2.5 glass-card rounded-2xl px-4 py-2.5 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer w-48 sm:w-56 hover:border-accent/50 shadow-sm btn-press"
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
              <span className="text-xs font-500">Search platform...</span>
              <kbd className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded-lg bg-muted border border-border text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* AI Copilot Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-warning/25 via-primary/15 to-warning/25 border border-warning/50 text-foreground hover:border-warning text-xs font-800 transition-all cursor-pointer shadow-glow btn-press"
              title="Open Admin AI Copilot"
            >
              <AIOrb size="sm" />
              <span className="hidden sm:inline">Admin AI</span>
            </button>

            {/* Notifications with bell shake & spring */}
            <NotificationBell />

            {/* Avatar */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-warning to-[#FF8C00] flex items-center justify-center text-xs font-900 text-black shadow-glow border border-white/20 btn-press">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        userRole="admin"
      />
    </>
  );
}
