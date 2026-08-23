'use client';

import dynamic from 'next/dynamic';

const StudyProgressChart = dynamic(() => import('./StudyProgressChart'), { ssr: false });
const SubjectCoverageChart = dynamic(() => import('./SubjectCoverageChart'), { ssr: false });

export default function StudentChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-5">
      <StudyProgressChart />
      <SubjectCoverageChart />
    </div>
  );
}