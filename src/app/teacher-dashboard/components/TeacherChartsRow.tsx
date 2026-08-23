'use client';

import dynamic from 'next/dynamic';

const TeacherAttendanceChart = dynamic(() => import('@/app/teacher-dashboard/components/TeacherAttendanceChart'), { ssr: false });
const TeacherGradeChart = dynamic(() => import('@/app/teacher-dashboard/components/TeacherGradeChart'), { ssr: false });

export default function TeacherChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-5">
      <TeacherAttendanceChart />
      <TeacherGradeChart />
    </div>
  );
}
