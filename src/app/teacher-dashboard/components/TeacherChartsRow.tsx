'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TeacherFilterState } from '@/types/campus';

const TeacherAttendanceChart = dynamic(
  () => import('@/app/teacher-dashboard/components/TeacherAttendanceChart'),
  { ssr: false }
);
const TeacherGradeChart = dynamic(
  () => import('@/app/teacher-dashboard/components/TeacherGradeChart'),
  { ssr: false }
);

interface TeacherChartsRowProps {
  filters?: TeacherFilterState;
}

export default function TeacherChartsRow({ filters }: TeacherChartsRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-5">
      <TeacherAttendanceChart filters={filters} />
      <TeacherGradeChart />
    </div>
  );
}
