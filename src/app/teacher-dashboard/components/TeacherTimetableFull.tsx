'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockTeacherSchedule } from '@/repositories/mockData';
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
  const [selectedDay, setSelectedDay] = useState('Friday');

  const handleStartClass = (subject: string, room: string) => {
    toast.success(`Lecture session initiated for ${subject} (${room})`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-700 text-foreground">Faculty Teaching Schedule & Office Hours</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dr. Priya Nair · 16 Weekly Teaching Hours Allotted
          </p>
        </div>

        <Badge variant="cyan">Semester 5 Active</Badge>
      </div>

      <Tabs
        tabs={days}
        activeTab={selectedDay}
        onChange={setSelectedDay}
        variant="pills"
      />

      <div className="space-y-3">
        {mockTeacherSchedule.map((slot, index) => {
          const isNext = index === 0 && selectedDay === 'Friday';
          return (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isNext
                  ? 'glass-card border-accent/40 shadow-glow bg-accent/5'
                  : 'glass-card border-border/70 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[72px] py-2 px-3 rounded-xl bg-card border border-border/80">
                  <p className="text-xs font-800 text-foreground metric-value">{slot.time}</p>
                  <p className="text-[11px] text-muted-foreground">{slot.endTime}</p>
                </div>

                <div className="h-10 w-px bg-border/60 hidden md:block" />

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-700 text-foreground">{slot.subject}</span>
                    <span className="badge-violet text-[10px] px-2 py-0.5 rounded font-600">
                      {slot.subjectCode}
                    </span>
                    {isNext && (
                      <span className="badge-warning text-[10px] px-2 py-0.5 rounded font-600 animate-pulse">
                        Next Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {slot.department} · {slot.semester} &nbsp;·&nbsp; Location: <span className="text-accent font-600">{slot.room}</span> &nbsp;·&nbsp; Type: {slot.type || 'Lecture'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info(`Attendance register for ${slot.subject}`)}
                >
                  Register
                </Button>
                <Button
                  variant={isNext ? 'accent' : 'primary'}
                  size="sm"
                  onClick={() => handleStartClass(slot.subject, slot.room)}
                >
                  Launch Class
                </Button>
              </div>
            </div>
          );
        })}

        {/* Office Hours Card */}
        <div className="p-4 rounded-2xl border border-dashed border-border/80 bg-muted/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-700 text-foreground">Faculty Office Hours & Research Mentorship</span>
              <span className="badge-muted text-[10px] px-2 py-0.5 rounded font-600">Open Door</span>
            </div>
            <p className="text-xs text-muted-foreground">2:00 PM – 3:30 PM · Faculty Cabin Block A-312</p>
          </div>
          <span className="text-xs text-muted-foreground font-500">Walk-ins Welcome</span>
        </div>
      </div>
    </div>
  );
}
