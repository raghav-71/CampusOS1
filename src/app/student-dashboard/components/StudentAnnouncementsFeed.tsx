'use client';

import React, { useState, useEffect } from 'react';
import AnimatedCard from '@/components/motion/AnimatedCard';
import { campusRepository } from '@/repositories/campusRepository';
import { useProfile } from '@/hooks/useProfile';
import { Announcement } from '@/types/campus';

const defaultAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'DBMS Exam Rescheduled',
    body: 'The DBMS end-term exam has been moved to September 2nd. New room: Hall B.',
    priority: 'high',
    category: 'Exam',
    time: '2 hours ago',
    author: 'Office of COE (BCA)',
    read: false,
    semesterNumber: 5,
  },
  {
    id: 'ann-002',
    title: 'Tech Fest 2026 Registration Open',
    body: 'BCA Hackathon and TechFest registrations are now open. Last date: Aug 30th.',
    priority: 'medium',
    category: 'Event',
    time: '5 hours ago',
    author: 'Student Council',
    read: false,
  },
  {
    id: 'ann-003',
    title: 'Library Extended Hours During Exams',
    body: 'The central digital library will remain open until 10 PM during assessment week.',
    priority: 'low',
    category: 'General',
    time: 'Yesterday',
    author: 'Library Dept',
    read: true,
  },
  {
    id: 'ann-004',
    title: 'New OS Chapter 7 Notes Uploaded',
    body: 'Dr. Priya Nair has uploaded Chapter 7 — Virtual Memory & Page Replacement notes.',
    priority: 'low',
    category: 'Academic',
    time: 'Yesterday',
    author: 'Dr. Priya Nair',
    read: true,
    semesterNumber: 5,
  },
];

const priorityConfig = {
  high: { badge: 'badge-danger', label: 'Urgent', dot: 'bg-danger' },
  medium: { badge: 'badge-warning', label: 'Important', dot: 'bg-warning' },
  low: { badge: 'badge-muted', label: 'Info', dot: 'bg-muted-foreground' },
};

const categoryConfig: Record<string, string> = {
  Exam: 'badge-warning',
  Event: 'badge-violet',
  General: 'badge-muted',
  Academic: 'badge-cyan',
  Emergency: 'badge-danger',
  Class: 'badge-cyan',
};

export default function StudentAnnouncementsFeed() {
  const { profile } = useProfile();
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(defaultAnnouncements);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const repoAnns = await campusRepository.getAnnouncements(
          profile?.role || 'student',
          profile?.id,
          profile?.semesterNumber || 5
        );
        if (repoAnns && repoAnns.length > 0) {
          setAnnouncementsList(repoAnns);
        }
      } catch {}
    }
    loadAnnouncements();
  }, [profile]);
  return (
    <AnimatedCard className="p-6 border-border/80 h-full shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📢</span> Official Announcements
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-500">2 high-priority unread notices</p>
        </div>
        <span className="badge-cyan text-xs px-2.5 py-0.5 rounded-full font-800 shadow-sm">
          BCA Official
        </span>
      </div>

      <div className="space-y-3">
        {announcementsList.map((ann) => {
          const priority = priorityConfig[ann.priority as keyof typeof priorityConfig] || priorityConfig.low;
          return (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer row-hover-glow ${
                !ann.read
                  ? 'border-primary/40 bg-muted/30 hover:border-primary/70 shadow-sm'
                  : 'border-border/40 bg-muted/10 opacity-80 hover:opacity-100 hover:border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {!ann.read && (
                    <span className={`w-2.5 h-2.5 rounded-full ${priority.dot} animate-pulse flex-shrink-0`} />
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-700 ${categoryConfig[ann.category] || 'badge-muted'}`}
                  >
                    {ann.category}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-700 ${priority.badge}`}>
                    {priority.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono-data font-600 flex-shrink-0">{ann.time}</span>
              </div>
              <p className="text-sm font-800 text-foreground mb-1">{ann.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-500">
                {ann.body}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 font-600">— {ann.author}</p>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
