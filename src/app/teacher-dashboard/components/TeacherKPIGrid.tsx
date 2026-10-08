'use client';

import React from 'react';
import { KPICardData, TeacherFilterState } from '@/types/campus';
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

  const teacherKPIs = [
    {
      id: 'tkpi-classes',
      title: "TODAY'S LECTURES",
      value: lectureCount,
      unit: 'scheduled',
      status: isSem3 ? 'Data Structures (Hall B-102)' : 'Next: OS at 10:30 AM',
      subtitle: isSem3 ? 'BCA Semester 3 · 54 Enrolled' : 'BCA Semester 5 · Room A-204 · 58 Enrolled',
      progress: 33,
      badgeText: 'Active',
    },
    {
      id: 'tkpi-notes',
      title: 'STUDY MATERIALS',
      value: notesCount,
      unit: 'chapters',
      status: '+4 uploaded this term',
      subtitle: isSem3 ? '1.2k student reads' : '2.8k verified student downloads',
      progress: 75,
      badgeText: 'Course Library',
    },
    {
      id: 'tkpi-papers',
      title: 'QUESTION PAPERS',
      value: papersCount,
      unit: 'archives',
      status: 'Internal assessments ready',
      subtitle: 'Dean approved · University model papers',
      progress: 100,
      badgeText: 'Verified',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {teacherKPIs.map((kpi) => (
        <div
          key={kpi.id}
          className="p-5 sm:p-6 border border-black/[0.06] bg-white rounded-[18px] flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-200"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase">
                {kpi.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#DCFCE7] text-[#15803D]">
                {kpi.badgeText}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
                <AnimatedNumber value={kpi.value} />
              </span>
              <span className="text-xs font-semibold text-[#6E6E73]">
                {kpi.unit}
              </span>
            </div>

            <p className="text-xs font-semibold text-[#15803D] mt-1">
              {kpi.status}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.04]">
            <div className="w-full h-1.5 bg-[#F0FDF4] rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8E8E93] truncate">{kpi.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
