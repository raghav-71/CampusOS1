'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useProfile } from '@/hooks/useProfile';
import { Role } from '@/types/campus';

interface NavItem {
  id: string;
  tabKey: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  title?: string;
  items: NavItem[];
}

const studentNav: NavGroup[] = [
  {
    id: 'grp-student-overview',
    items: [
      {
        id: 'nav-dashboard',
        tabKey: 'overview',
        label: 'Overview',
        href: '/student-dashboard?tab=overview',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-student-academics',
    title: 'Academics',
    items: [
      {
        id: 'nav-attendance',
        tabKey: 'attendance',
        label: 'Attendance',
        href: '/student-dashboard?tab=attendance',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
        ),
      },
      {
        id: 'nav-timetable',
        tabKey: 'timetable',
        label: 'Timetable',
        href: '/student-dashboard?tab=timetable',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        id: 'nav-assignments',
        tabKey: 'assignments',
        label: 'Assignments',
        href: '/student-dashboard?tab=assignments',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
        badge: 2,
        badgeColor: 'badge-blue',
      },
      {
        id: 'nav-notes',
        tabKey: 'notes',
        label: 'Notes & Docs',
        href: '/student-dashboard?tab=notes',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        ),
        badge: 3,
        badgeColor: 'badge-cyan',
      },
      {
        id: 'nav-exams',
        tabKey: 'exams',
        label: 'Exams',
        href: '/student-dashboard?tab=exams',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
      },
      {
        id: 'nav-marks',
        tabKey: 'marks',
        label: 'Results & Marks',
        href: '/student-dashboard?tab=marks',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        id: 'nav-codelab',
        tabKey: 'codelab',
        label: 'CodeLab',
        href: '/student-dashboard?tab=codelab',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        ),
      },
      {
        id: 'nav-ai',
        tabKey: 'ai',
        label: 'AI Assistant',
        href: '/student-dashboard?tab=ai',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ),
        badgeColor: 'badge-cyan',
      },
    ],
  },
  {
    id: 'grp-student-communication',
    title: 'Communication',
    items: [
      {
        id: 'nav-notifications',
        tabKey: 'notifications',
        label: 'Notifications',
        href: '/student-dashboard?tab=notifications',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        ),
        badge: 3,
        badgeColor: 'badge-cyan',
      },
      {
        id: 'nav-announcements',
        tabKey: 'announcements',
        label: 'Announcements',
        href: '/student-dashboard?tab=announcements',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
            <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-student-account',
    title: 'Account',
    items: [
      {
        id: 'nav-profile',
        tabKey: 'profile',
        label: 'Profile',
        href: '/student-dashboard?tab=profile',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        id: 'nav-settings',
        tabKey: 'settings',
        label: 'Settings',
        href: '/student-dashboard?tab=settings',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

const teacherNav: NavGroup[] = [
  {
    id: 'grp-teacher-overview',
    items: [
      {
        id: 'nav-teacher-dash',
        tabKey: 'overview',
        label: 'Overview',
        href: '/teacher-dashboard?tab=overview',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-teacher-academics',
    title: 'Academics',
    items: [
      {
        id: 'nav-teacher-classes',
        tabKey: 'classes',
        label: 'Classes',
        href: '/teacher-dashboard?tab=classes',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
        badge: 3,
        badgeColor: 'badge-cyan',
      },
      {
        id: 'nav-teacher-attendance',
        tabKey: 'attendance',
        label: 'Attendance',
        href: '/teacher-dashboard?tab=attendance',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-assignments',
        tabKey: 'assignments',
        label: 'Assignments',
        href: '/teacher-dashboard?tab=assignments',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
        badge: 12,
        badgeColor: 'badge-warning',
      },
      {
        id: 'nav-teacher-notes',
        tabKey: 'notes',
        label: 'Publish Notes',
        href: '/teacher-dashboard?tab=notes',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-papers',
        tabKey: 'papers',
        label: 'Question Papers',
        href: '/teacher-dashboard?tab=papers',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-timetable',
        tabKey: 'timetable',
        label: 'Schedule',
        href: '/teacher-dashboard?tab=timetable',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-codelab',
        tabKey: 'codelab',
        label: 'Faculty CodeLab',
        href: '/teacher-dashboard?tab=codelab',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-aigen',
        tabKey: 'aigen',
        label: 'AI Generator',
        href: '/teacher-dashboard?tab=aigen',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-teacher-communication',
    title: 'Communication',
    items: [
      {
        id: 'nav-teacher-announcements',
        tabKey: 'announcements',
        label: 'Announcements',
        href: '/teacher-dashboard?tab=announcements',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
            <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-teacher-account',
    title: 'Account',
    items: [
      {
        id: 'nav-teacher-profile',
        tabKey: 'profile',
        label: 'Profile',
        href: '/teacher-dashboard?tab=profile',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-settings',
        tabKey: 'settings',
        label: 'Settings',
        href: '/teacher-dashboard?tab=settings',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    id: 'grp-admin-overview',
    items: [
      {
        id: 'nav-admin-dash',
        tabKey: 'overview',
        label: 'Overview',
        href: '/admin-dashboard?tab=overview',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-admin-academics',
    title: 'Academics & Directory',
    items: [
      {
        id: 'nav-admin-students',
        tabKey: 'students',
        label: 'Students',
        href: '/admin-dashboard?tab=students',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
        badge: 12,
        badgeColor: 'badge-cyan',
      },
      {
        id: 'nav-admin-teachers',
        tabKey: 'teachers',
        label: 'Teachers',
        href: '/admin-dashboard?tab=teachers',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-subjects',
        tabKey: 'subjects',
        label: 'Departments',
        href: '/admin-dashboard?tab=subjects',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-notes',
        tabKey: 'notes',
        label: 'Notes Library',
        href: '/admin-dashboard?tab=notes',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
        badge: 5,
        badgeColor: 'badge-warning',
      },
      {
        id: 'nav-admin-copilot',
        tabKey: 'copilot',
        label: 'AI Copilot',
        href: '/admin-dashboard?tab=copilot',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ),
        badgeColor: 'badge-cyan',
      },
    ],
  },
  {
    id: 'grp-admin-communication',
    title: 'Communication & Trail',
    items: [
      {
        id: 'nav-admin-announce',
        tabKey: 'announcements',
        label: 'Announcements',
        href: '/admin-dashboard?tab=announcements',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
            <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-reports',
        tabKey: 'reports',
        label: 'Audit & Reports',
        href: '/admin-dashboard?tab=reports',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-admin-account',
    title: 'Account',
    items: [
      {
        id: 'nav-admin-settings',
        tabKey: 'settings',
        label: 'Settings',
        href: '/admin-dashboard?tab=settings',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

function getNavGroups(role: Role): NavGroup[] {
  if (role === 'admin') return adminNav;
  if (role === 'teacher') return teacherNav;
  return studentNav;
}

interface SidebarProps {
  role: Role;
  activePath?: string;
}

function SidebarInner({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navGroups = getNavGroups(role);
  const { profile, signOut } = useProfile();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentTab = searchParams.get('tab') || 'overview';

  const displayName =
    profile?.fullName ??
    (role === 'admin' ? 'Admin User' : role === 'teacher' ? 'Dr. Priya Nair' : 'Arjun Sharma');
  const displayEmail =
    profile?.email ??
    (role === 'admin'
      ? 'admin@campusos.edu'
      : role === 'teacher'
        ? 'dr.priya.nair@campusos.edu'
        : 'arjun.sharma@campusos.edu');
  const displayInitials =
    profile?.initials ?? (role === 'admin' ? 'AD' : role === 'teacher' ? 'PN' : 'AS');

  // Core tabs for iOS-style bottom bar
  const bottomNavItems = [
    { label: 'Overview', tab: 'overview', icon: studentNav[0].items[0].icon },
    { label: role === 'student' ? 'Timetable' : 'Schedule', tab: 'timetable', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )},
    { label: 'Notes', tab: 'notes', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    )},
    { label: 'AI', tab: role === 'student' ? 'ai' : role === 'teacher' ? 'aigen' : 'copilot', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    )},
    { label: 'Profile', tab: 'profile', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
  ];

  const SidebarContent = () => (
    <>
      {/* Brand & Platform Header */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-subtle ring-2 ring-primary/20">
            <AppLogo size={20} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] text-[#1D1D1F] tracking-tight leading-none">
                Campus<span className="text-primary font-black">OS</span>
              </span>
              <span className="text-[10px] text-primary-dark font-semibold tracking-wider uppercase mt-1">
                {role} portal
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-black/[0.06] mx-3 mb-2" />

      {/* Grouped Apple Navigation */}
      <nav className="flex-1 px-2.5 space-y-4 overflow-y-auto no-scrollbar py-1">
        {navGroups.map((group) => (
          <div key={group.id}>
            {group.title && !collapsed && (
              <p className="px-3 mb-1 text-[10.5px] font-semibold tracking-wider uppercase text-[#8E8E93]">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isTabActive = currentTab === item.tabKey;
                const isPathActive = pathname.startsWith(item.href.split('?')[0]) && isTabActive;
                const isActive = isTabActive || isPathActive;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''} ${
                      collapsed ? 'justify-center px-0' : ''
                    }`}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-primary-dark' : 'text-[#8E8E93]'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className={`flex-1 truncate ${isActive ? 'text-[#1D1D1F] font-semibold' : 'text-[#48484A] font-normal'}`}>
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                              item.badgeColor || 'badge-muted'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account Footer & macOS-Style User Pill */}
      <div className="mt-auto pt-2 bg-transparent pb-3 px-2.5">
        <div className="h-px bg-black/[0.06] mb-2.5" />
        {!collapsed && (
          <div className="mb-2">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/[0.03] border border-black/[0.04]">
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary-dark ring-1 ring-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {displayInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1D1D1F] truncate leading-tight">{displayName}</p>
                <p className="text-[10.5px] text-[#8E8E93] truncate">{displayEmail}</p>
              </div>
              <button
                onClick={signOut}
                className="p-1 rounded-md hover:bg-black/[0.05] text-[#8E8E93] hover:text-red-600 transition-colors cursor-pointer"
                title="Sign out"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-black/[0.03] transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {!collapsed && <span className="font-medium text-[11.5px]">Collapse</span>}
        </button>
      </div>
    </>
  );

  const basePath = role === 'admin' ? '/admin-dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  return (
    <>
      {/* Desktop macOS-Style Translucent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 sidebar-macos shadow-subtle transition-all duration-200 ease-out flex-shrink-0 z-30 ${
          collapsed ? 'w-[68px]' : 'w-[245px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar with Hamburger for full drawer */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white/85 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
            <AppLogo size={16} />
          </div>
          <span className="font-extrabold text-sm text-[#1D1D1F] tracking-tight">
            Campus<span className="text-primary font-black">OS</span>
          </span>
        </div>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1D1D1F] hover:bg-black/[0.05] cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Open full menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* iOS-Style Bottom Navigation Bar on Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/90 backdrop-blur-xl border-t border-black/[0.08] flex items-center justify-around px-2 pb-safe shadow-subtle">
        {bottomNavItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <Link
              key={item.tab}
              href={`${basePath}?tab=${item.tab}`}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] cursor-pointer transition-colors ${
                isActive ? 'text-primary-dark font-semibold' : 'text-[#8E8E93] hover:text-[#1D1D1F]'
              }`}
            >
              <span className={`p-1 rounded-full ${isActive ? 'bg-[#DCFCE7]' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[280px] bg-white flex flex-col h-full shadow-modal animate-slide-right">
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/[0.05] text-[#8E8E93] hover:text-[#1D1D1F] cursor-pointer"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense
      fallback={
        <aside className="hidden lg:flex w-[245px] h-screen bg-card border-r border-border" />
      }
    >
      <SidebarInner {...props} />
    </Suspense>
  );
}
