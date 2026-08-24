import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import TeacherDashboardContent from './components/TeacherDashboardContent';

export default function TeacherDashboardPage() {
  return (
    <AppLayout role="teacher" activePath="/teacher-dashboard">
      <Suspense fallback={<div className="h-64 rounded-2xl glass-card animate-pulse m-6" />}>
        <TeacherDashboardContent />
      </Suspense>
    </AppLayout>
  );
}
