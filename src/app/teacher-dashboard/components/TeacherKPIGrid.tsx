import React from 'react';
import { KPICardData } from '@/types/campus';

const teacherKPIs: KPICardData[] = [
  {
    id: 'tkpi-classes',
    title: "Today's Lectures",
    value: '3',
    unit: 'batches',
    change: 'Next: OS at 10:30 AM',
    trend: 'neutral',
    detail: 'Room A-204 · Sem 5',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    hero: true,
  },
  {
    id: 'tkpi-students',
    title: 'Students Enrolled',
    value: '184',
    unit: 'across 3 courses',
    change: '+12 new this term',
    trend: 'positive',
    detail: 'Avg. Attendance: 91.4%',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
  {
    id: 'tkpi-grading',
    title: 'Pending Grading',
    value: '12',
    unit: 'submissions',
    change: 'Due in 2 days',
    trend: 'warning',
    detail: 'VM Lab Report (BCA Sem 5)',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/25',
  },
  {
    id: 'tkpi-notes',
    title: 'Notes Published',
    value: '38',
    unit: 'chapters',
    change: '+2 this week',
    trend: 'positive',
    detail: '1.4k total student views',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    id: 'tkpi-ai-assistant',
    title: 'AI Assessment Queries',
    value: '24',
    unit: 'generated',
    change: '3 question papers drafted',
    trend: 'positive',
    detail: 'Saves ~4 hrs weekly',
    color: 'text-[#FF6B9D]',
    bgColor: 'bg-[#FF6B9D]/10',
    borderColor: 'border-[#FF6B9D]/20',
  },
];

export default function TeacherKPIGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
      {teacherKPIs.map((kpi, idx) => (
        <TeacherKPICard key={kpi.id} kpi={kpi} isHero={idx === 0} />
      ))}
    </div>
  );
}

interface TeacherKPICardProps {
  kpi: KPICardData;
  isHero?: boolean;
}

function TeacherKPICard({ kpi, isHero }: TeacherKPICardProps) {
  const trendColors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-accent',
  };

  return (
    <div
      className={`glass-card rounded-2xl p-4 border ${kpi.borderColor} glass-card-hover relative overflow-hidden ${
        isHero ? 'col-span-2 md:col-span-1 xl:col-span-1' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">{kpi.title}</p>
        <span className={`w-2 h-2 rounded-full ${kpi.trend === 'warning' ? 'bg-warning animate-pulse' : 'bg-transparent'}`} />
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-800 text-foreground metric-value">{kpi.value}</span>
        {kpi.unit && <span className="text-xs text-muted-foreground">{kpi.unit}</span>}
      </div>

      <p className={`text-xs font-500 ${trendColors[kpi.trend]}`}>{kpi.change}</p>
      <p className="text-xs text-muted-foreground mt-1.5 truncate">{kpi.detail}</p>
    </div>
  );
}
