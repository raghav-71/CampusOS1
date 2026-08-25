'use client';

import React, { useState, useEffect } from 'react';
import { mockTimetable } from '@/repositories/mockData';
import { TimetableSlot } from '@/types/campus';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import AnimatedCard from '@/components/motion/AnimatedCard';

const days = [
  { id: 'Monday', label: 'Monday' },
  { id: 'Tuesday', label: 'Tuesday' },
  { id: 'Wednesday', label: 'Wednesday' },
  { id: 'Thursday', label: 'Thursday' },
  { id: 'Friday', label: 'Friday' },
  { id: 'Saturday', label: 'Saturday' },
];

export default function StudentTimetableFull() {
  const [selectedDay, setSelectedDay] = useState('Friday');
  const [timetable, setTimetable] = useState<TimetableSlot[]>(mockTimetable);

  useEffect(() => {
    const handleClassStart = (e: any) => {
      if (e.detail?.subject) {
        const sub = e.detail.subject.toLowerCase();
        setTimetable((prev) =>
          prev.map((slot) =>
            slot.subject.toLowerCase().includes(sub) || sub.includes(slot.subject.toLowerCase())
              ? { ...slot, status: 'LIVE' }
              : slot
          )
        );
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('campusos:class-started', handleClassStart);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('campusos:class-started', handleClassStart);
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📅</span> Weekly Class Schedule & Academic Timetable
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            BCA Semester 5 (Section A) · Fall 2026 Academic Calendar
          </p>
        </div>

        <Badge variant="cyan">Fall 2026 Allotment</Badge>
      </div>

      {/* Day Selector Tabs */}
      <Tabs tabs={days} activeTab={selectedDay} onChange={setSelectedDay} variant="pills" />

      {/* Schedule Slots with 3D Tilt and Spotlight Illumination */}
      <div className="space-y-3">
        {timetable.map((slot, index) => {
          const isLive = slot.status === 'LIVE';
          const isNext = index === 0 && selectedDay === 'Friday' && !isLive;

          return (
            <AnimatedCard
              key={slot.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isLive
                  ? 'border-accent/60 shadow-glow bg-accent/5 relative overflow-hidden'
                  : isNext
                    ? 'border-primary/40 shadow-sm bg-primary/5'
                    : 'border-border/70 hover:border-primary/40'
              }`}
            >
              {isLive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent animate-pulse" />
              )}

              <div className="flex items-center gap-4">
                {/* Time badge */}
                <div className="text-center min-w-[76px] py-2 px-3 rounded-2xl bg-card border border-border/80">
                  <p className="text-xs font-800 text-foreground metric-value">{slot.time}</p>
                  <p className="text-[11px] text-muted-foreground font-mono-data">{slot.endTime}</p>
                </div>

                <div className="h-10 w-px bg-border/60 hidden md:block" />

                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-800 text-foreground">{slot.subject}</span>
                    <span className="badge-violet text-[10px] px-2 py-0.5 rounded font-700">
                      {slot.subjectCode}
                    </span>
                    {isLive ? (
                      <span className="badge-cyan text-[10px] px-2.5 py-0.5 rounded-full font-800 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                        LIVE IN CLASS
                      </span>
                    ) : isNext ? (
                      <span className="badge-warning text-[10px] px-2 py-0.5 rounded font-600 animate-pulse">
                        Next Up
                      </span>
                    ) : (
                      <span className="badge-muted text-[10px] px-2 py-0.5 rounded font-600">
                        {slot.status || 'Scheduled'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Faculty: <span className="text-foreground font-600">{slot.teacher}</span>{' '}
                    &nbsp;·&nbsp; Location:{' '}
                    <span className="text-accent font-700">{slot.room}</span> &nbsp;·&nbsp; Type:{' '}
                    <span className="font-500">{slot.type}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span
                  className={`text-xs px-3.5 py-1.5 rounded-2xl font-700 border font-mono-data ${
                    isLive
                      ? 'bg-accent/20 text-accent border-accent/40 animate-pulse'
                      : isNext
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-card text-muted-foreground border-border'
                  }`}
                >
                  {isLive ? '🔴 Session In Progress' : isNext ? '⏱ Up Next' : '📅 On Schedule'}
                </span>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
