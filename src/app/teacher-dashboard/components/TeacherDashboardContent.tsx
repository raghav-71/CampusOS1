'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TeacherFilterState } from '@/types/campus';
import TeacherDashboardHeader from '@/app/teacher-dashboard/components/TeacherDashboardHeader';
import TeacherFilterBar from '@/app/teacher-dashboard/components/TeacherFilterBar';
import TeacherKPIGrid from '@/app/teacher-dashboard/components/TeacherKPIGrid';
import TeacherChartsRow from '@/app/teacher-dashboard/components/TeacherChartsRow';
import TeacherScheduleWidget from '@/app/teacher-dashboard/components/TeacherScheduleWidget';
import TeacherSubmissionsFeed from '@/app/teacher-dashboard/components/TeacherSubmissionsFeed';
import TeacherAttendanceRegister from '@/app/teacher-dashboard/components/TeacherAttendanceRegister';
import TeacherAssignmentsView from '@/app/teacher-dashboard/components/TeacherAssignmentsView';
import TeacherNotesPublisher from '@/app/teacher-dashboard/components/TeacherNotesPublisher';
import TeacherClassesView from '@/app/teacher-dashboard/components/TeacherClassesView';
import TeacherQuestionPapersView from '@/app/teacher-dashboard/components/TeacherQuestionPapersView';
import TeacherTimetableFull from '@/app/teacher-dashboard/components/TeacherTimetableFull';
import TeacherProfileView from '@/app/teacher-dashboard/components/TeacherProfileView';
import FacultyAIEngine from '@/components/ai/FacultyAIEngine';

function TeacherTabRouter() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [sharedFilters, setSharedFilters] = useState<TeacherFilterState>({
    gradeYear: 'all',
    semester: 'all',
    subject: 'all',
    section: 'all',
  });

  switch (currentTab) {
    case 'classes':
      return <TeacherClassesView externalFilters={sharedFilters} />;
    case 'attendance':
      return <TeacherAttendanceRegister />;
    case 'assignments':
      return <TeacherAssignmentsView />;
    case 'notes':
      return <TeacherNotesPublisher />;
    case 'papers':
      return <TeacherQuestionPapersView />;
    case 'timetable':
      return <TeacherTimetableFull />;
    case 'profile':
      return <TeacherProfileView />;
    case 'aigen':
    case 'ai':
      return <FacultyAIEngine />;
    case 'overview':
    default:
      return (
        <div className="space-y-5 animate-fade-in">
          {/* Global Filter Bar on Overview */}
          <TeacherFilterBar filters={sharedFilters} onChange={setSharedFilters} />
          <TeacherKPIGrid filters={sharedFilters} />
          <TeacherChartsRow filters={sharedFilters} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <TeacherScheduleWidget />
            </div>
            <div>
              <TeacherSubmissionsFeed />
            </div>
          </div>
        </div>
      );
  }
}

export default function TeacherDashboardContent() {
  return (
    <div className="min-h-screen px-4 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
      <TeacherDashboardHeader />
      <Suspense fallback={<div className="h-64 rounded-2xl glass-card animate-pulse" />}>
        <TeacherTabRouter />
      </Suspense>
    </div>
  );
}
