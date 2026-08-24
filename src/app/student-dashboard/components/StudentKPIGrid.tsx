'use client';

import React, { Suspense, lazy } from 'react';
import GlassCard from '@/components/ui/GlassCard';

const Campus3DCore = lazy(() => import('@/components/ui/Campus3DCore'));

const kpiData = [
  {
    id: 'kpi-classes',
    title: "Today's Lectures",
    value: '3',
    unit: 'sessions',
    change: '+1 from yesterday',
    trend: 'neutral',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    detail: 'Next: OS at 10:30 AM (Room A-204)',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
  {
    id: 'kpi-exam',
    title: 'Earliest Exam',
    value: '3',
    unit: 'days away',
    change: 'OS (CS501) — Aug 27, 2026',
    trend: 'warning',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    detail: 'Block A, Exam Hall 1',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  {
    id: 'kpi-attendance',
    title: 'Attendance Rate',
    value: '92.1',
    unit: '% cumulative',
    change: 'Above 75% cutoff threshold',
    trend: 'positive',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    detail: 'Eligible for all 5 exams',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  {
    id: 'kpi-notes',
    title: 'Study Materials',
    value: '247',
    unit: 'documents',
    change: '+6 newly uploaded',
    trend: 'positive',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    detail: 'Dr. Priya Nair uploaded Ch 7',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
];

export default function StudentKPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* 3D Spatial Hero Card — Spans 2 columns on tablet/desktop */}
      <div className="md:col-span-2 xl:col-span-2">
        <Hero3DStudyCard />
      </div>

      {/* KPI Cards */}
      {kpiData.slice(0, 2).map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

function Hero3DStudyCard() {
  return (
    <GlassCard
      interactive3D
      hoverEffect
      glow="primary"
      className="p-6 relative overflow-hidden h-full flex flex-col justify-between"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] font-700 uppercase tracking-widest text-accent font-mono-data">
              Campus OS Spatial Core
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Academic Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Semester 5 · 94.2% Attendance · 5 Enrolled Subjects
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl glass-card border border-primary/40 text-xs font-700 text-foreground">
              Overall: <span className="text-accent">A Grade</span>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('campusos:open-ai'))}
              className="px-3.5 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-xs font-700 text-foreground transition-all cursor-pointer flex items-center gap-1.5"
            >
              Ask AI Mentor ✨
            </button>
          </div>
        </div>

        {/* Embedded 3D Canvas Centerpiece */}
        <div className="w-44 h-40 flex-shrink-0 self-center">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Loading 3D...
              </div>
            }
          >
            <Campus3DCore className="w-full h-full" />
          </Suspense>
        </div>
      </div>
    </GlassCard>
  );
}

interface KPICardProps {
  kpi: (typeof kpiData)[0];
}

function KPICard({ kpi }: KPICardProps) {
  const trendColors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-accent',
  };

  return (
    <GlassCard
      interactive3D
      hoverEffect
      className={`p-5 border ${kpi.borderColor} relative overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl ${kpi.bgColor} border ${kpi.borderColor} flex items-center justify-center ${kpi.color}`}
          >
            {kpi.icon}
          </div>
          <span className="text-[11px] font-700 tracking-wider text-muted-foreground uppercase">
            {kpi.title}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-800 text-foreground metric-value">{kpi.value}</span>
          <span className="text-xs text-muted-foreground font-500">{kpi.unit}</span>
        </div>
        <p className={`text-xs font-600 ${trendColors[kpi.trend as keyof typeof trendColors]}`}>
          {kpi.change}
        </p>
      </div>
      <p className="text-xs text-muted-foreground/90 mt-3 pt-2.5 border-t border-border/40 truncate">
        {kpi.detail}
      </p>
    </GlassCard>
  );
}
