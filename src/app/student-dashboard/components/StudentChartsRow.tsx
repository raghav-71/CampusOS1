'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PROGRAM_SEMESTERS } from '@/lib/academicModel';

const StudyProgressChart = dynamic(() => import('./StudyProgressChart'), { ssr: false });
const SubjectCoverageChart = dynamic(() => import('./SubjectCoverageChart'), { ssr: false });

export default function StudentChartsRow() {
  const [selectedSemester, setSelectedSemester] = useState<number>(5);

  return (
    <div className="space-y-3">
      {/* Semester Selector for Charts */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-700 text-muted-foreground mr-1">Academic Term:</span>
          {PROGRAM_SEMESTERS.map((sem) => {
            const isActive = selectedSemester === sem.semester;
            return (
              <button
                key={sem.semester}
                onClick={() => setSelectedSemester(sem.semester)}
                className={`px-3 py-1 rounded-xl text-xs font-700 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-glow border border-primary/50'
                    : 'glass-card text-muted-foreground hover:text-foreground hover:border-primary/40 border border-border/60'
                }`}
              >
                {sem.shortLabel} {sem.isCurrent && '⚡'}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Showing Semester {selectedSemester} Analytics
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-5">
        <StudyProgressChart selectedSemester={selectedSemester} />
        <SubjectCoverageChart selectedSemester={selectedSemester} />
      </div>
    </div>
  );
}
