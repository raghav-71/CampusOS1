'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockStudentTimetable } from '@/repositories/mockData';
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

export default function StudentTimetableFull() {
  const [selectedDay, setSelectedDay] = useState('Friday');

  const handleJoinClass = (subject: string, room: string) => {
    toast.success(`Connected to Virtual Lecture Hall for ${subject} (${room})`);
  };

  const handleMarkAttendance = (subject: string) => {
    toast.info(`Attendance logged for ${subject} (Friday slot)`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-700 text-foreground">Weekly Class Schedule & Timetable</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            BCA Sem 5 · Fall 2026 Academic Calendar
          </p>
        </div>

        <Badge variant="violet">Room Allotment Active</Badge>
      </div>

      {/* Day Selector Tabs */}
      <Tabs tabs={days} activeTab={selectedDay} onChange={setSelectedDay} variant="pills" />

      {/* Schedule Slots */}
      <div className="space-y-3">
        {mockStudentTimetable.map((slot, index) => {
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
                {/* Time badge */}
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
                    Instructor: <span className="text-foreground font-500">{slot.teacher}</span>{' '}
                    &nbsp;·&nbsp; Location:{' '}
                    <span className="text-accent font-600">{slot.room}</span> &nbsp;·&nbsp; Type:{' '}
                    {slot.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAttendance(slot.subject)}
                >
                  Mark Attendance
                </Button>
                <Button
                  variant={isNext ? 'accent' : 'primary'}
                  size="sm"
                  onClick={() => handleJoinClass(slot.subject, slot.room)}
                >
                  Join Lecture
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
