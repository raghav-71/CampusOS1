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

  const quickActions = [
    {
      id: 'qa-student',
      label: 'Add Student',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
    },
    {
      id: 'qa-notice',
      label: 'Post Notice',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
          <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
        </svg>
      ),
    },
    {
      id: 'qa-exam',
      label: 'Schedule Exam',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      id: 'qa-report',
      label: 'Export Report',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="lg:ml-0 ml-12">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h1 className="text-2xl font-700 text-foreground">Admin Control Center</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Welcome, {adminName} &nbsp;·&nbsp; <span className="text-success font-500">All systems operational</span> &nbsp;·&nbsp; Last sync: 2 min ago
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer w-48 sm:w-56 hover:border-warning/40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-xs">Search platform...</span>
              <kbd className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Quick actions */}
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => toast.info(`${action.label} panel opened`)}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative w-9 h-9 glass-card rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-card" />
              </button>

              <NotificationDropdown
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
              />
            </div>

            {/* Avatar / Sign out */}
            <button
              onClick={signOut}
              title="Sign out"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-warning to-[#FF8C00] flex items-center justify-center text-sm font-700 text-black cursor-pointer hover:shadow-glow transition-all"
            >
              {initials}
            </button>
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