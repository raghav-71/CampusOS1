'use client';

import React from 'react';
import { toast } from 'sonner';
import { mockTeacherSchedule } from '@/repositories/mockData';

export default function TeacherScheduleWidget() {
  const handleStartClass = (subject: string, room: string) => {
    toast.success(`Lecture session started for ${subject} (${room})`);
  };

  const handleMarkAttendance = (subject: string) => {
    toast.info(`Opening attendance register for ${subject}`);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Today&apos;s Teaching Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Friday · 3 scheduled lectures and labs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-cyan text-xs px-2.5 py-1 rounded-lg font-500">Live Semester</span>
        </div>
      </div>

      <div className="space-y-3">
        {mockTeacherSchedule.map((slot, index) => (
          <div
            key={slot.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20 hover:border-accent/40 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[64px] py-1 px-2.5 rounded-lg bg-card border border-border">
                <p className="text-xs font-700 text-foreground metric-value">{slot.time}</p>
                <p className="text-[11px] text-muted-foreground">{slot.endTime}</p>
              </div>

              <div className="h-8 w-px bg-border hidden sm:block" />

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-600 text-foreground">{slot.subject}</span>
                  <span className="badge-violet text-[10px] px-1.5 py-0.5 rounded font-600">
                    {slot.subjectCode}
                  </span>
                  {index === 0 && (
                    <span className="badge-warning text-[10px] px-1.5 py-0.5 rounded font-600 animate-pulse">
                      Next Up
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {slot.department} · {slot.semester} &nbsp;·&nbsp; Location: <span className="text-foreground font-500">{slot.room}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleMarkAttendance(slot.subject)}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                Attendance
              </button>
              <button
                onClick={() => handleStartClass(slot.subject, slot.room)}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Launch Class
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
