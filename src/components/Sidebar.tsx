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
    id: 'grp-student-main',
    items: [
      {
        id: 'nav-dashboard',
        tabKey: 'overview',
        label: 'Dashboard',
        href: '/student-dashboard?tab=overview',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        id: 'nav-notes',
        tabKey: 'notes',
        label: 'Notes & Docs',
        href: '/student-dashboard?tab=notes',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        ),
        badge: 3,
        badgeColor: 'badge-cyan',
      },
      {
        id: 'nav-subjects',
        tabKey: 'subjects',
        label: 'Subjects',
        href: '/student-dashboard?tab=subjects',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        ),
      },
      {
        id: 'nav-timetable',
        tabKey: 'timetable',
        label: 'Timetable',
        href: '/student-dashboard?tab=timetable',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-student-campus',
    title: 'Campus',
    items: [
      {
        id: 'nav-events',
        tabKey: 'events',
        label: 'Events',
        href: '/student-dashboard?tab=events',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
            <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
            <path d="M12 3v4" />
          </svg>
        ),
        badge: 2,
        badgeColor: 'badge-blue',
      },
      {
        id: 'nav-exams',
        tabKey: 'exams',
        label: 'Exam Schedule',
        href: '/student-dashboard?tab=exams',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
      },
      {
        id: 'nav-announcements',
        tabKey: 'announcements',
        label: 'Announcements',
        href: '/student-dashboard?tab=announcements',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
            <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
          </svg>
        ),
        badge: 4,
        badgeColor: 'badge-warning',
      },
    ],
  },
  {
    id: 'grp-student-ai',
    title: 'AI Intelligence',
    items: [
      {
        id: 'nav-ai',
        tabKey: 'ai',
        label: 'AI Study Assistant',
        href: '/student-dashboard?tab=ai',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },
      {
        id: 'nav-flashcards',
        tabKey: 'flashcards',
        label: 'Flashcards',
        href: '/student-dashboard?tab=flashcards',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M8 2v4M16 2v4" />
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
        label: 'My Profile',
        href: '/student-dashboard?tab=profile',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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
    id: 'grp-teacher-main',
    items: [
      {
        id: 'nav-teacher-dash',
        tabKey: 'overview',
        label: 'Dashboard',
        href: '/teacher-dashboard?tab=overview',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-classes',
        tabKey: 'classes',
        label: 'My Classes',
        href: '/teacher-dashboard?tab=classes',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-assignments',
        tabKey: 'assignments',
        label: 'Assignments',
        href: '/teacher-dashboard?tab=assignments',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        ),
        badge: 12,
        badgeColor: 'badge-warning',
      },
    ],
  },
  {
    id: 'grp-teacher-academic',
    title: 'Academic & AI',
    items: [
      {
        id: 'nav-teacher-aigen',
        tabKey: 'aigen',
        label: 'AI Assessment Gen',
        href: '/teacher-dashboard?tab=aigen',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-papers',
        tabKey: 'papers',
        label: 'Question Papers',
        href: '/teacher-dashboard?tab=papers',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-notes',
        tabKey: 'notes',
        label: 'Upload Notes',
        href: '/teacher-dashboard?tab=notes',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        ),
      },
      {
        id: 'nav-teacher-timetable',
        tabKey: 'timetable',
        label: 'My Schedule',
        href: '/teacher-dashboard?tab=timetable',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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
        label: 'Faculty Profile',
        href: '/teacher-dashboard?tab=profile',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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
    id: 'grp-admin-main',
    items: [
      {
        id: 'nav-admin-dash',
        tabKey: 'overview',
        label: 'Dashboard',
        href: '/admin-dashboard?tab=overview',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-copilot',
        tabKey: 'copilot',
        label: 'AI Copilot',
        href: '/admin-dashboard?tab=copilot',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
        badgeColor: 'badge-cyan',
      },
      {
        id: 'nav-admin-students',
        tabKey: 'students',
        label: 'Students',
        href: '/admin-dashboard?tab=students',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-admin-content',
    title: 'Content & Logistics',
    items: [
      {
        id: 'nav-admin-notes',
        tabKey: 'notes',
        label: 'Notes Library',
        href: '/admin-dashboard?tab=notes',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
        badge: 5,
        badgeColor: 'badge-warning',
      },
      {
        id: 'nav-admin-subjects',
        tabKey: 'subjects',
        label: 'Departments',
        href: '/admin-dashboard?tab=subjects',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-events',
        tabKey: 'events',
        label: 'Events',
        href: '/admin-dashboard?tab=events',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-announce',
        tabKey: 'announcements',
        label: 'Announcements',
        href: '/admin-dashboard?tab=announcements',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z" />
            <path d="M5.45 17l4.42-8.85A2 2 0 0111.73 7h.54a2 2 0 011.86 1.15L18.55 17" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'grp-admin-system',
    title: 'System',
    items: [
      {
        id: 'nav-admin-reports',
        tabKey: 'reports',
        label: 'Reports',
        href: '/admin-dashboard?tab=reports',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        id: 'nav-admin-settings',
        tabKey: 'settings',
        label: 'Settings',
        href: '/admin-dashboard?tab=settings',
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
            <AppLogo size={22} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-gradient-primary tracking-tight whitespace-nowrap">
                Campus OS
              </span>
              <span className="text-[10px] text-accent/80 font-mono-data tracking-wider uppercase">
                3D Blue Platform
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 mb-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-600 ${
              role === 'admin' ? 'badge-warning' : role === 'teacher' ? 'badge-cyan' : 'badge-blue'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{
                background:
                  role === 'admin'
                    ? 'var(--warning)'
                    : role === 'teacher'
                      ? 'var(--accent)'
                      : 'var(--primary)',
              }}
            />
            {role.charAt(0).toUpperCase() + role.slice(1)} Workspace
          </span>
        </div>
      )}

      <div className="h-px bg-border/60 mx-4 mb-3" />

      {/* Nav groups */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.id}>
            {group.title && !collapsed && (
              <p className="px-2 mb-1.5 text-[11px] font-700 tracking-wider uppercase text-muted-foreground/70">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isTabActive = currentTab === item.tabKey;
                const isPathActive = pathname.startsWith(item.href.split('?')[0]) && isTabActive;
                const isActive = isTabActive || isPathActive;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`sidebar-nav-item group ${isActive ? 'active' : ''} ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:text-accent">
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate transition-transform duration-200 group-hover:translate-x-0.5">
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-lg font-800 transition-all ${
                              item.badgeColor || 'badge-muted'
                            } ${isActive ? 'shadow-glow-accent' : ''}`}
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

      {/* Bottom: user profile + collapse button */}
      <div className="mt-auto pt-2">
        <div className="h-px bg-border/60 mx-4 mb-3" />
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40 hover:border-primary/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-700 text-white flex-shrink-0 shadow-glow">
                {displayInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-700 text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg hover:bg-danger/20 text-muted-foreground hover:text-danger transition-colors cursor-pointer"
                title="Sign out"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="px-3 pb-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!collapsed && <span className="font-500">Collapse menu</span>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-card/95 backdrop-blur-xl border-r border-border/80 transition-all duration-300 ease-in-out flex-shrink-0 z-30 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 glass-card rounded-xl flex items-center justify-center text-foreground cursor-pointer shadow-glow"
        onClick={() => setMobileOpen(true)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[270px] bg-card border-r border-primary/30 flex flex-col h-full animate-slide-in-right">
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              onClick={() => setMobileOpen(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
        <aside className="hidden lg:flex w-[250px] h-screen bg-card border-r border-border" />
      }
    >
      <SidebarInner {...props} />
    </Suspense>
  );
}
