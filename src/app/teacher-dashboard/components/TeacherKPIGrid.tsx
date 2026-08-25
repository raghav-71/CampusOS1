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

  const enrolledCount = isSem3 ? 58 : isAll ? 154 : 64;
  const attendanceRate = isSem3 ? 89.2 : isAll ? 91.8 : 93.3;
  const gradingCount = isSem3 ? 6 : isAll ? 12 : 8;
  const lectureCount = isSem3 ? 1 : isAll ? 3 : 2;

  const teacherKPIs: KPICardData[] = [
    {
      id: 'tkpi-classes',
      title: "Today's Lectures",
      value: lectureCount,
      unit: 'batches',
      change: isSem3 ? 'Data Structures (Hall B-102)' : 'Next: Operating Systems at 10:30 AM',
      trend: 'neutral',
      detail: isSem3 ? 'Hall B-102 · BCA Sem 3' : 'Room A-204 · BCA Sem 5',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      hero: true,
    },
    {
      id: 'tkpi-students',
      title: 'Enrolled in Scope',
      value: enrolledCount,
      unit: isAll ? 'across assigned BCA courses' : 'in selected filter',
      change: 'Active Fall 2026',
      trend: 'positive',
      detail: `Avg. Attendance: ${attendanceRate}%`,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
    },
    {
      id: 'tkpi-grading',
      title: 'Pending Grading',
      value: gradingCount,
      unit: 'submissions',
      change: 'Internal 1 Reports',
      trend: 'warning',
      detail: isSem3 ? 'DSA Lab Reports (BCA Sem 3)' : 'VM Lab Reports (BCA Sem 5)',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
    },
    {
      id: 'tkpi-notes',
      title: 'Notes Published',
      value: isSem3 ? 18 : 42,
      unit: 'chapters',
      change: '+3 new this week',
      trend: 'positive',
      detail: '1.8k total student downloads',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
    {
      id: 'tkpi-papers',
      title: 'Question Papers',
      value: 4,
      unit: 'archived',
      change: 'Ready for Internal 1',
      trend: 'positive',
      detail: 'Dean Approved & Published',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {teacherKPIs.map((kpi, idx) => (
        <TeacherKPICard key={kpi.id} kpi={kpi} isHero={idx === 0} />
      ))}
    </div>
  );
}

interface TeacherKPICardProps {
  kpi: KPICardData;
  isHero?: boolean;
}

function TeacherKPICard({ kpi, isHero }: TeacherKPICardProps) {
  const trendColors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-accent',
  };

  return (
    <AnimatedCard
      className={`p-4.5 border ${kpi.borderColor} relative overflow-hidden flex flex-col justify-between ${
        isHero ? 'col-span-2 md:col-span-1 xl:col-span-1' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-700 tracking-wider text-muted-foreground uppercase">
            {kpi.title}
          </p>
          <span
            className={`w-2 h-2 rounded-full ${kpi.trend === 'warning' ? 'bg-warning animate-pulse' : 'bg-transparent'}`}
          />
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-800 text-foreground">
            <AnimatedNumber value={kpi.value} />
          </span>
          {kpi.unit && <span className="text-xs text-muted-foreground">{kpi.unit}</span>}
        </div>

        <p className={`text-xs font-600 ${trendColors[kpi.trend]}`}>{kpi.change}</p>
      </div>
      <p className="text-xs text-muted-foreground/90 mt-3 pt-2.5 border-t border-border/40 truncate font-500">
        {kpi.detail}
      </p>
    </AnimatedCard>
  );
}
