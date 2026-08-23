'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import GlobalSearchModal from '@/components/GlobalSearchModal';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function TeacherDashboardHeader() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { profile, signOut } = useProfile();

  const teacherName = profile?.fullName ?? 'Dr. Priya Nair';
  const department = profile?.department ?? 'Computer Applications (BCA)';
  const initials = profile?.initials ?? 'PN';

  const quickActions = [
    {
      id: 'ta-attendance',
      label: 'Mark Attendance',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      id: 'ta-assignment',
      label: 'New Assignment',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      id: 'ta-upload',
      label: 'Upload Note',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
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
              <span className="text-2xl">👩‍🏫</span>
              <h1 className="text-2xl font-700 text-foreground">Welcome back, {teacherName}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {department} &nbsp;·&nbsp; <span className="text-accent font-500">3 classes scheduled today</span> &nbsp;·&nbsp; 12 assignments pending grading
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer w-48 sm:w-56 hover:border-accent/40"
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
                onClick={() => toast.success(`${action.label} panel opened`)}
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-card" />
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
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm font-700 text-white cursor-pointer hover:shadow-glow transition-all"
            >
              {initials}
            </button>
          </div>
        </div>
      </div>

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        userRole="teacher"
      />
    </>
  );
}
