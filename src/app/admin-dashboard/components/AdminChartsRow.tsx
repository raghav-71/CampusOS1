'use client';

import dynamic from 'next/dynamic';

const EnrollmentTrendChart = dynamic(() => import('./EnrollmentTrendChart'), { ssr: false });
const DepartmentNotesChart = dynamic(() => import('./DepartmentNotesChart'), { ssr: false });

export default function AdminChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-5">
      <EnrollmentTrendChart />
      <DepartmentNotesChart />
    </div>
  );
}