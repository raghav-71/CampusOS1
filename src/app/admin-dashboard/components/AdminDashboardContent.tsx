'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminDashboardHeader from './AdminDashboardHeader';
import AdminKPIGrid from './AdminKPIGrid';
import AdminChartsRow from './AdminChartsRow';
import AdminUserTable from './AdminUserTable';
import AdminActivityFeed from './AdminActivityFeed';
import AdminAnnouncementsView from './AdminAnnouncementsView';
import AdminDepartmentsView from './AdminDepartmentsView';
import AdminAuditLogsView from './AdminAuditLogsView';
import AdminReportsView from './AdminReportsView';
import AdminSettingsView from './AdminSettingsView';
import AdminAICopilot from '@/components/ai/AdminAICopilot';

function AdminTabRouter() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  switch (currentTab) {
    case 'students':
    case 'teachers':
      return <AdminUserTable />;
    case 'subjects':
      return <AdminDepartmentsView />;
    case 'announcements':
      return <AdminAnnouncementsView />;
    case 'reports':
      return <AdminReportsView />;
    case 'settings':
      return <AdminSettingsView />;
    case 'events':
    case 'audit':
      return <AdminAuditLogsView />;
    case 'ai':
    case 'copilot':
      return <AdminAICopilot />;
    case 'overview':
    default:
      return (
        <>
          <AdminKPIGrid />
          <AdminChartsRow />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
            <div className="xl:col-span-2">
              <AdminUserTable />
            </div>
            <div>
              <AdminActivityFeed />
            </div>
          </div>
        </>
      );
  }
}

export default function AdminDashboardContent() {
  return (
    <div className="min-h-screen px-4 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
      <AdminDashboardHeader />
      <Suspense fallback={<div className="h-64 rounded-2xl glass-card animate-pulse" />}>
        <AdminTabRouter />
      </Suspense>
    </div>
  );
}