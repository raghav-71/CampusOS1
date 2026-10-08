'use client';

import React from 'react';
import AnimatedNumber from '@/components/motion/AnimatedNumber';

const primaryMetrics = [
  {
    id: 'kpi-attendance',
    title: 'ATTENDANCE',
    value: 93.3,
    unit: '%',
    status: 'Good standing',
    statusColor: 'text-[#15803D]',
    progress: 93.3,
    subtitle: 'Above 75% cutoff threshold',
  },
  {
    id: 'kpi-classes',
    title: "TODAY'S CLASSES",
    value: 3,
    unit: 'sessions',
    status: 'Next: OS at 10:30 AM',
    statusColor: 'text-[#1D1D1F]',
    progress: 33.3,
    subtitle: 'Room A-204 · Dr. Priya Nair',
  },
  {
    id: 'kpi-assignments',
    title: 'COURSEWORK',
    value: 2,
    unit: 'pending',
    status: 'Due this week',
    statusColor: 'text-[#D97706]',
    progress: 60,
    subtitle: '1 submitted · 2 in progress',
  },
  {
    id: 'kpi-exam',
    title: 'UPCOMING EXAM',
    value: 3,
    unit: 'days away',
    status: 'Operating Systems',
    statusColor: 'text-[#15803D]',
    progress: 85,
    subtitle: 'Internal Assessment · Hall A-1',
  },
];

const todaySchedule = [
  {
    time: '09:00 - 10:15',
    title: 'Operating Systems (Theory)',
    room: 'Room A-204',
    instructor: 'Dr. Priya Nair',
    status: 'completed',
    type: 'Lecture',
  },
  {
    time: '10:30 - 11:45',
    title: 'Computer Networks (Lab)',
    room: 'Network Lab 3',
    instructor: 'Dr. Amit Sen',
    status: 'in-progress',
    type: 'Lab Session',
  },
  {
    time: '14:00 - 15:15',
    title: 'Database Management Systems',
    room: 'Lecture Hall 2',
    instructor: 'Prof. Rajesh Kumar',
    status: 'upcoming',
    type: 'Lecture',
  },
];

const courseProgress = [
  { name: 'Operating Systems', code: 'CS501', attendance: 94, syllabus: 82 },
  { name: 'Computer Networks', code: 'CS502', attendance: 92, syllabus: 78 },
  { name: 'Database Management Systems', code: 'CS503', attendance: 96, syllabus: 85 },
  { name: 'Software Engineering', code: 'CS504', attendance: 91, syllabus: 75 },
];

export default function StudentKPIGrid() {
  return (
    <div className="space-y-6 mb-8 animate-fade-in">
      {/* ─── 1. APPLE-STYLE METRIC TILES ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {primaryMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white rounded-[18px] p-5 border border-black/[0.06] shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#8E8E93] tracking-wider uppercase">
                {metric.title}
              </span>
              <div className="flex items-baseline gap-1.5 mt-2 mb-1">
                <span className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                  <AnimatedNumber value={metric.value} />
                </span>
                <span className="text-sm font-semibold text-[#6E6E73]">{metric.unit}</span>
              </div>
              <p className={`text-xs font-semibold ${metric.statusColor}`}>
                {metric.status}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.04]">
              {/* Minimalist Progress Indicator */}
              <div className="w-full h-1.5 bg-[#F0FDF4] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(metric.progress, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#8E8E93] truncate">{metric.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 2. TODAY'S SCHEDULE & ACADEMIC PROGRESS (GROUPED SECTIONS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Schedule Card */}
        <div className="lg:col-span-7 bg-white rounded-[20px] p-6 border border-black/[0.06] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                Today&apos;s Schedule
              </h2>
              <p className="text-xs text-[#8E8E93]">Wednesday · 3 Sessions Enrolled</p>
            </div>
            <span className="text-xs font-semibold text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
              Live Day
            </span>
          </div>

          <div className="space-y-2.5">
            {todaySchedule.map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAFAFC] hover:bg-black/[0.02] border border-black/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="text-right w-24 flex-shrink-0">
                    <p className="text-xs font-bold text-[#1D1D1F] tabular-nums font-mono-data">
                      {session.time.split(' - ')[0]}
                    </p>
                    <p className="text-[10px] text-[#8E8E93]">
                      {session.time.split(' - ')[1]}
                    </p>
                  </div>
                  <div className="w-1 h-8 rounded-full bg-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1D1D1F] truncate">
                      {session.title}
                    </p>
                    <p className="text-[11px] text-[#6E6E73] truncate">
                      {session.room} &nbsp;·&nbsp; {session.instructor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                  {session.status === 'in-progress' && (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Now
                    </span>
                  )}
                  {session.status === 'completed' && (
                    <span className="text-[11px] font-medium text-[#8E8E93]">
                      Completed
                    </span>
                  )}
                  {session.status === 'upcoming' && (
                    <span className="text-[11px] font-medium text-[#6E6E73] bg-[#E5E5EA] px-2 py-0.5 rounded-md">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Course Progress Card */}
        <div className="lg:col-span-5 bg-white rounded-[20px] p-6 border border-black/[0.06] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                  Academic Progress
                </h2>
                <p className="text-xs text-[#8E8E93]">Semester 5 Syllabus Tracking</p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                AI Summary →
              </button>
            </div>

            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1D1D1F] truncate max-w-[200px]">
                      {course.name}
                    </span>
                    <span className="font-bold text-[#15803D] font-mono-data tabular-nums">
                      {course.syllabus}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F0FDF4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${course.syllabus}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#6E6E73]">
            <span>Average Attendance: <strong className="text-[#1D1D1F]">93.3%</strong></span>
            <span>All Courses: <strong className="text-[#15803D]">Eligible</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
