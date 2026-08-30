'use client';

import React from 'react';
import { KPICardData, TeacherFilterState } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';
import AnimatedNumber from '@/components/motion/AnimatedNumber';

interface TeacherKPIGridProps {
  filters?: TeacherFilterState;
}

export default function TeacherKPIGrid({ filters }: TeacherKPIGridProps) {
  const isSem3 = filters?.semester === '3';
  const isAll =
    !filters ||
    (filters.gradeYear === 'all' &&
      filters.semester === 'all' &&
      filters.subject === 'all' &&
      filters.section === 'all');

  const lectureCount = isSem3 ? 1 : isAll ? 3 : 2;
  const notesCount = isSem3 ? 18 : isAll ? 42 : 24;
  const papersCount = isSem3 ? 2 : isAll ? 6 : 4;

  const teacherKPIs: (KPICardData & { icon: string; badgeText: string })[] = [
    {
      id: 'tkpi-classes',
      title: "Today's Lectures",
      value: lectureCount,
      unit: 'Scheduled Sessions',
      change: isSem3 ? 'Data Structures (Hall B-102)' : 'Next: Operating Systems at 10:30 AM',
      trend: 'neutral',
      detail: isSem3 ? 'BCA Semester 3 · Section A (54 Enrolled)' : 'BCA Semester 5 · Room A-204 (58 Enrolled)',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/40',
      hero: true,
      icon: '📅',
      badgeText: 'Active Timetable',
    },
    {
      id: 'tkpi-notes',
      title: 'Notes & Study Materials',
      value: notesCount,
      unit: 'Published Chapters',
      change: '+4 Chapters Uploaded This Term',
      trend: 'positive',
      detail: isSem3 ? '1.2k student reads & downloads' : '2.8k total verified student downloads',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/40',
      icon: '📚',
      badgeText: 'Course Library',
    },
    {
      id: 'tkpi-papers',
      title: 'Question Papers & Exams',
      value: papersCount,
      unit: 'Official Archives',
      change: '1st & 2nd Internal Assessment Ready',
      trend: 'positive',
      detail: 'Dean Approved · University Model Papers',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/40',
      icon: '📑',
      badgeText: 'Exam Registry',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {teacherKPIs.map((kpi) => (
        <TeacherKPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

interface TeacherKPICardProps {
  kpi: KPICardData & { icon: string; badgeText: string };
}

function TeacherKPICard({ kpi }: TeacherKPICardProps) {
  const trendColors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-accent',
  };

  return (
    <AnimatedCard
      className={`p-5 sm:p-6 border ${kpi.borderColor} bg-card/60 relative overflow-hidden rounded-3xl flex flex-col justify-between shadow-glass hover:shadow-glow transition-all`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{kpi.icon}</span>
            <p className="text-xs font-800 tracking-wider text-muted-foreground uppercase">
              {kpi.title}
            </p>
          </div>
          <span className="badge-cyan text-[10px] px-2.5 py-0.5 rounded-full font-700">
            {kpi.badgeText}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-3xl sm:text-4xl font-800 text-foreground font-mono-data">
            <AnimatedNumber value={kpi.value} />
          </span>
          {kpi.unit && (
            <span className="text-xs font-600 text-muted-foreground">
              {kpi.unit}
            </span>
          )}
        </div>

        <p className={`text-xs font-700 mt-1 leading-snug ${trendColors[kpi.trend]}`}>
          {kpi.change}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-500 text-foreground/80 leading-tight">
          {kpi.detail}
        </span>
      </div>
    </AnimatedCard>
  );
}
