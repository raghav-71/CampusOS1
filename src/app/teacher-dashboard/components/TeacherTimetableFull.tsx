'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockTeacherSchedule } from '@/repositories/mockData';
import { notificationService } from '@/services/notificationService';
import { useProfile } from '@/hooks/useProfile';
import { TimetableSlot } from '@/types/campus';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';

const days = [
  { id: 'Monday', label: 'Monday' },
  { id: 'Tuesday', label: 'Tuesday' },
  { id: 'Wednesday', label: 'Wednesday' },
  { id: 'Thursday', label: 'Thursday' },
  { id: 'Friday', label: 'Friday' },
  { id: 'Saturday', label: 'Saturday' },
];

export default function TeacherTimetableFull() {
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedDay, setSelectedDay] = useState('Friday');
  const [schedule, setSchedule] = useState<TimetableSlot[]>(mockTeacherSchedule);
  const [liveSlotIds, setLiveSlotIds] = useState<string[]>([]);

  const handleStartClass = async (slot: TimetableSlot) => {
    try {
      await notificationService.triggerClassStart(
        profile?.id || 'usr-003',
        profile?.fullName || 'Dr. Priya Nair',
        slot.subject,
        slot.semesterNumber || 5,
        slot.section || 'A',
        slot.room
      );

      setLiveSlotIds((prev) => [...prev, slot.id]);
      setSchedule((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, status: 'LIVE' } : s))
      );

      toast.success(`Class started for ${slot.subject}! Students received live notification.`);
    } catch (err: any) {
      toast.error('Failed to start class: ' + err.message);
    }
  };

  const handleOpenAttendance = (subject: string) => {
    router.push('/teacher-dashboard?tab=attendance');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-800 text-foreground tracking-tight">
            Faculty Teaching Schedule & Office Hours
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile?.fullName || 'Dr. Priya Nair'} · BCA Department Allotted Timetable
          </p>
        </div>

        <Badge variant="cyan">BCA Semester 5 Active</Badge>
      </div>

      <Tabs tabs={days} activeTab={selectedDay} onChange={setSelectedDay} variant="pills" />

      <div className="space-y-3">
        {schedule.map((slot, index) => {
          const isLive = slot.status === 'LIVE' || liveSlotIds.includes(slot.id);
          const isNext = index === 0 && selectedDay === 'Friday' && !isLive;

          return (
            <div
              key={slot.id}
              className={`p-4.5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isLive
                  ? 'glass-card border-accent/60 shadow-glow bg-accent/5'
                  : isNext
                    ? 'glass-card border-primary/50 shadow-sm bg-primary/5'
                    : 'glass-card border-border/70 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[72px] py-2 px-3 rounded-2xl bg-card border border-border/80">
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
                        LIVE NOW
                      </span>
                    ) : isNext ? (
                      <span className="badge-warning text-[10px] px-2 py-0.5 rounded font-600 animate-pulse">
                        Next Up
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {slot.department} · {slot.semester} &nbsp;·&nbsp; Location:{' '}
                    <span className="text-accent font-700">{slot.room}</span> &nbsp;·&nbsp; Type:{' '}
                    {slot.type || 'Lecture'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAttendance(slot.subject)}
                  className="text-xs"
                >
                  Attendance Register
                </Button>
                <Button
                  variant={isLive ? 'accent' : isNext ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleStartClass(slot)}
                  className="text-xs font-700 shadow-glow"
                >
                  {isLive ? '✓ Class is Live' : '▶ Start Class'}
                </Button>
              </div>
            </div>
          );
        })}

        {/* Office Hours Card */}
        <div className="p-4.5 rounded-3xl border border-dashed border-border/80 bg-muted/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-800 text-foreground">
                Faculty Office Hours & Student Doubt Clearing
              </span>
              <span className="badge-muted text-[10px] px-2 py-0.5 rounded font-600">
                Open Door
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              2:00 PM – 3:30 PM · Faculty Cabin Block A-312 (BCA Faculty Room)
            </p>
          </div>
          <span className="text-xs text-primary font-600">Walk-ins Welcome</span>
        </div>
      </div>
    </div>
  );
}
