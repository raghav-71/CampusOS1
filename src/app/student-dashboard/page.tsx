import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import StudentDashboardContent from './components/StudentDashboardContent';

export default function StudentDashboardPage() {
  return (
    <AppLayout role="student" activePath="/student-dashboard">
      <Suspense fallback={<div className="h-64 rounded-2xl glass-card animate-pulse m-6" />}>
        <StudentDashboardContent />
      </Suspense>
    </AppLayout>
  );
}
