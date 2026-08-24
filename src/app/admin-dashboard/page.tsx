import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import AdminDashboardContent from './components/AdminDashboardContent';

export default function AdminDashboardPage() {
  return (
    <AppLayout role="admin" activePath="/admin-dashboard">
      <Suspense fallback={<div className="h-64 rounded-2xl glass-card animate-pulse m-6" />}>
        <AdminDashboardContent />
      </Suspense>
    </AppLayout>
  );
}
