'use client';

import React, { useState, useEffect } from 'react';
import { mockTimetable } from '@/repositories/mockData';
import { TimetableSlot } from '@/types/campus';
import Tabs from '@/components/ui/Tabs';

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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
            Class Timetable
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            BCA Semester 5 (Section A) · Fall 2026 Academic Schedule
          </p>
        </div>

        <span className="text-xs font-semibold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full w-fit">
          Fall 2026 Allotment
        </span>
      </div>

      {/* Day Selector Tabs */}
      <Tabs tabs={days} activeTab={selectedDay} onChange={setSelectedDay} variant="pills" />

      {/* Schedule Slots in Apple Grouped Card Style */}
      <div className="space-y-3">
        {timetable.map((slot, index) => {
          const isLive = slot.status === 'LIVE';
          const isNext = index === 0 && selectedDay === 'Friday' && !isLive;

          return (
            <div
              key={slot.id}
              className={`p-5 rounded-[18px] border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card ${
                isLive
                  ? 'border-primary/50 bg-[#F0FDF4] shadow-card-hover'
                  : isNext
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Time badge */}
                <div className="text-center min-w-[76px] py-2 px-3 rounded-xl bg-[#FAFAFC] border border-black/[0.05]">
                  <p className="text-xs font-bold text-[#1D1D1F] tabular-nums font-mono-data">{slot.time}</p>
                  <p className="text-[10.5px] text-[#8E8E93] font-mono-data">{slot.endTime}</p>
                </div>

                <div className="h-10 w-px bg-black/[0.06] hidden md:block" />

                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-[#1D1D1F]">{slot.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-black/[0.04] text-[#6E6E73]">
                      {slot.subjectCode}
                    </span>
                    {isLive ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#DCFCE7] text-[#15803D] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        LIVE
                      </span>
                    ) : isNext ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-700">
                        Next Up
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-medium text-[#8E8E93]">
                        {slot.status || 'Scheduled'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6E6E73]">
                    Faculty: <span className="text-[#1D1D1F] font-medium">{slot.teacher}</span>{' '}
                    &nbsp;·&nbsp; Location:{' '}
                    <span className="text-[#15803D] font-semibold">{slot.room}</span> &nbsp;·&nbsp; Type:{' '}
                    <span>{slot.type}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                    isLive
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : isNext
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-[#FAFAFC] text-[#8E8E93]'
                  }`}
                >
                  {isLive ? 'Session Active' : isNext ? 'Up Next' : 'On Schedule'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
