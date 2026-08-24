'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function AdminDashboardHeader() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { profile, signOut } = useProfile();

  const adminName = profile?.fullName ?? 'Admin User';
  const initials = profile?.initials ?? 'AD';

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="lg:ml-0 ml-12">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-warning/20 border border-warning/40 flex items-center justify-center shadow-sm">
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
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome, {adminName} &nbsp;·&nbsp;{' '}
              <span className="text-success font-600">Institutional AI Surveillance Active</span>{' '}
              &nbsp;·&nbsp; Fall 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 glass-card rounded-xl px-3.5 py-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer w-48 sm:w-56 hover:border-primary/40 shadow-sm"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 text-primary"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-xs">Search platform...</span>
              <kbd className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* AI Copilot Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-warning/20 to-primary/20 border border-warning/40 text-foreground hover:border-warning text-xs font-700 transition-all cursor-pointer shadow-sm"
              title="Open Admin AI Copilot"
            >
              <span className="text-warning">🤖</span>
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative w-10 h-10 glass-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/60 hover:border-primary/40"
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
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full animate-pulse" />
              </button>

              <NotificationDropdown
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
              />
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-[#FF8C00] flex items-center justify-center text-xs font-800 text-black shadow-glow border border-white/20">
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
