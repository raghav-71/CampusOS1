'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCard from '@/components/motion/AnimatedCard';

const subjectColors: Record<string, string> = {
  'Operating Systems': 'border-l-primary bg-primary/10 border-primary/40',
  DBMS: 'border-l-accent bg-accent/10 border-accent/40',
  'Computer Networks': 'border-l-success bg-success/10 border-success/40',
  'Java Programming': 'border-l-warning bg-warning/10 border-warning/40',
  DAA: 'border-l-[#FF6B9D] bg-[#FF6B9D]/10 border-[#FF6B9D]/40',
};

const initialTodayClasses = [
  {
    id: 'cls-001',
    subject: 'Operating Systems',
    time: '10:30 AM',
    endTime: '11:30 AM',
    room: 'Room A-204',
    teacher: 'Dr. Priya Nair',
    status: 'upcoming',
  },
  {
    id: 'cls-002',
    subject: 'DBMS',
    time: '12:00 PM',
    endTime: '1:00 PM',
    room: 'Room B-301',
    teacher: 'Prof. Rajan Mehta',
    status: 'upcoming',
  },
  {
    id: 'cls-003',
    subject: 'Computer Networks',
    time: '2:30 PM',
    endTime: '3:30 PM',
    room: 'Lab-2',
    teacher: 'Dr. Kavitha Rao',
    status: 'upcoming',
  },
];

const upcomingClasses = [
  {
    id: 'cls-004',
    subject: 'Java Programming',
    time: 'Mon, 9:00 AM',
    room: 'Room A-102',
    teacher: 'Prof. Anil Kumar',
  },
  {
    id: 'cls-005',
    subject: 'DAA',
    time: 'Mon, 11:00 AM',
    room: 'Room B-204',
    teacher: 'Dr. Suresh Pillai',
  },
];

export default function StudentTimetableWidget() {
  const router = useRouter();
  const [classes, setClasses] = useState(initialTodayClasses);

  useEffect(() => {
    const handleLiveClass = (e: any) => {
      if (e.detail?.subject) {
        const sub = e.detail.subject.toLowerCase();
        setClasses((prev) =>
          prev.map((c) =>
            c.subject.toLowerCase().includes(sub) || sub.includes(c.subject.toLowerCase())
              ? { ...c, status: 'LIVE' }
              : c
          )
        );
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('campusos:class-started', handleLiveClass);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('campusos:class-started', handleLiveClass);
      }
    };
  }, []);

  return (
    <AnimatedCard className="p-6 border-border/80 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight">Today&apos;s Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono-data">BCA Sem 5 · Friday Schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-cyan text-xs px-2.5 py-1 rounded-lg font-700">3 lectures</span>
          <button
            onClick={() => router.push('/student-dashboard?tab=timetable')}
            className="text-xs text-primary hover:underline font-700 cursor-pointer btn-press"
          >
            Full timetable →
          </button>
        </div>
      </div>

      {/* Today's classes */}
      <div className="space-y-3 mb-5">
        {classes.map((cls) => {
          const isLive = cls.status === 'LIVE';

          return (
            <div
              key={cls.id}
              className={`flex items-center gap-4 p-3.5 rounded-2xl border-l-4 transition-all duration-200 ${
                isLive
                  ? 'border-l-accent bg-accent/15 border border-accent/40 shadow-glow'
                  : `${subjectColors[cls.subject] || 'border-l-muted bg-muted/20'} border border-border/50 hover:bg-card/70`
              }`}
            >
              <div className="text-center min-w-[58px]">
                <p className="text-xs font-800 text-foreground metric-value">{cls.time}</p>
                <p className="text-[10px] text-muted-foreground font-mono-data">{cls.endTime}</p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-800 text-foreground truncate">{cls.subject}</p>
                  {isLive && (
                    <span className="badge-cyan text-[9px] px-2 py-0.2 rounded-full font-800 animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cls.teacher}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-700 text-accent font-mono-data">{cls.room}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming */}
      <div>
        <p className="text-[11px] font-700 uppercase tracking-wider text-muted-foreground mb-3">
          Upcoming Next Week
        </p>
        <div className="space-y-2">
          {upcomingClasses.map((cls) => (
            <div
              key={cls.id}
              className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 hover:bg-muted/10 px-2 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-xs text-foreground font-700">{cls.subject}</span>
                <span className="text-[11px] text-muted-foreground">({cls.teacher})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-mono-data">{cls.room}</span>
                <span className="badge-muted text-[10px] px-2 py-0.5 rounded-md font-600">
                  {cls.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}
