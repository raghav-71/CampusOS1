import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher' | 'admin';
  activePath?: string;
}

export default function AppLayout({ children, role, activePath }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background bg-grid-pattern">
      <Sidebar role={role} activePath={activePath} />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}