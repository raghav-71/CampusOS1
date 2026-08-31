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
import AdminFeedbackView from './AdminFeedbackView';
import AdminAICopilot from '@/components/ai/AdminAICopilot';
import PageTransition, { StaggerItem } from '@/components/motion/PageTransition';

function AdminTabRouter() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  switch (currentTab) {
    case 'students':
    case 'teachers':
    case 'faculty':
    case 'users':
      return <AdminUserTable />;
    case 'departments':
    case 'subjects':
      return <AdminDepartmentsView />;
    case 'announcements':
    case 'notices':
      return <AdminAnnouncementsView />;
    case 'analytics':
    case 'reports':
      return <AdminReportsView />;
    case 'settings':
      return <AdminSettingsView />;
    case 'feedback':
      return <AdminFeedbackView />;
    case 'events':
    case 'audit':
      return <AdminAuditLogsView />;
    case 'ai':
    case 'copilot':
      return <AdminAICopilot />;
    case 'overview':
    default:
      return (
        <div className="space-y-6">
          <StaggerItem order={1}>
            <AdminKPIGrid />
          </StaggerItem>
          <StaggerItem order={2}>
            <AdminChartsRow />
          </StaggerItem>
          <StaggerItem order={3}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
              <div className="xl:col-span-2">
                <AdminUserTable />
              </div>
              <div>
                <AdminActivityFeed />
              </div>
            </div>
          </StaggerItem>
        </div>
      );
  }
}

export default function AdminDashboardContent() {
  return (
    <div className="min-h-screen px-4 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl mx-auto">
      <AdminDashboardHeader />
      <PageTransition>
        <Suspense fallback={<div className="h-64 rounded-3xl glass-card animate-pulse" />}>
          <AdminTabRouter />
        </Suspense>
      </PageTransition>
    </div>
  );
}
