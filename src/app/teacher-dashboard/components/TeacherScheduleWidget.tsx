'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockTeacherSchedule } from '@/repositories/mockData';
import { notificationService } from '@/services/notificationService';
import { useProfile } from '@/hooks/useProfile';
import { TimetableSlot } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';
import MagneticButton from '@/components/motion/MagneticButton';

export default function TeacherScheduleWidget() {
  const router = useRouter();
  const { profile } = useProfile();
  const [schedule, setSchedule] = useState<TimetableSlot[]>(mockTeacherSchedule);
  const [liveSlotIds, setLiveSlotIds] = useState<string[]>([]);
  const [startingSlotId, setStartingSlotId] = useState<string | null>(null);

  const handleStartClass = async (slot: TimetableSlot) => {
    setStartingSlotId(slot.id);
    try {
      await notificationService.triggerClassStart(
        profile?.id || 'usr-003',
        profile?.fullName || slot.teacher || 'Dr. Priya Nair',
        slot.subject,
        slot.semesterNumber || 5,
        slot.section || 'A',
        slot.room
      );

      setLiveSlotIds((prev) => [...prev, slot.id]);
      setSchedule((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, status: 'LIVE' } : s))
      );

      toast.success(
        `Class session LIVE for ${slot.subject} in ${slot.room}! Enrolled students received instant notification.`
      );
    } catch (err: any) {
      toast.error('Failed to start class session: ' + err.message);
    } finally {
      setStartingSlotId(null);
    }
  };

  const handleMarkAttendance = (subject: string) => {
    router.push('/teacher-dashboard?tab=attendance');
  };

  return (
    <AnimatedCard className="p-6 border-border/80 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📅</span> Today&apos;s Teaching Schedule
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            BCA Academic Timetable · {schedule.length} scheduled lectures & practicals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-cyan text-xs px-2.5 py-1 rounded-lg font-700">
            Fall 2026 Live
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.map((slot, index) => {
          const isLive = slot.status === 'LIVE' || liveSlotIds.includes(slot.id);
          const isStarting = startingSlotId === slot.id;

          return (
            <div
              key={slot.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 group ${
                isLive
                  ? 'border-accent/60 bg-accent/10 shadow-glow relative overflow-hidden'
                  : index === 0
                    ? 'border-primary/40 bg-primary/5 hover:border-primary/60 hover:shadow-sm'
                    : 'border-border/60 bg-card/40 hover:border-primary/30 hover:bg-card/70'
              }`}
            >
              {isLive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-primary to-accent animate-pulse" />
              )}

              <div className="flex items-center gap-4">
                <div className="text-center min-w-[70px] py-2 px-3 rounded-2xl bg-card border border-border">
                  <p className="text-xs font-800 text-foreground metric-value">{slot.time}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-data">{slot.endTime}</p>
                </div>

                <div className="h-8 w-px bg-border/60 hidden sm:block" />

                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-800 text-foreground">{slot.subject}</span>
                    <span className="badge-violet text-[10px] px-2 py-0.5 rounded font-700">
                      {slot.subjectCode}
                    </span>
                    {isLive ? (
                      <span className="badge-cyan text-[10px] px-2.5 py-0.5 rounded-full font-800 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                        LIVE NOW
                      </span>
                    ) : index === 0 ? (
                      <span className="badge-warning text-[10px] px-1.5 py-0.5 rounded font-600 animate-pulse">
                        Next Up
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {slot.department} · {slot.semester} &nbsp;·&nbsp; Location:{' '}
                    <span className="text-foreground font-700">{slot.room}</span> &nbsp;·&nbsp;{' '}
                    {slot.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  onClick={() => handleMarkAttendance(slot.subject)}
                  className="btn-ghost text-xs px-3.5 py-1.5 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer font-600 btn-press"
                >
                  Attendance
                </button>
                <MagneticButton
                  variant={isLive ? 'accent' : 'primary'}
                  onClick={() => handleStartClass(slot)}
                  className="text-xs px-4 py-2 font-800"
                >
                  {isStarting ? 'Starting...' : isLive ? '✓ In Progress' : '▶ Start Class'}
                </MagneticButton>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
