'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { mockStudyProgressBySemester } from '@/repositories/mockData';
import { getSubjectColor } from '@/lib/academicColors';
import AnimatedCard from '@/components/motion/AnimatedCard';

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-card rounded-2xl p-3.5 border border-primary/50 text-xs min-w-[140px] shadow-2xl backdrop-blur-md">
      <p className="font-800 text-foreground mb-2">{label} — Study Completion</p>
      {payload.map((entry) => (
        <div key={`tip-${entry.name}`} className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground font-600">{entry.name}</span>
          </div>
          <span className="font-800 text-foreground metric-value">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

interface StudyProgressChartProps {
  selectedSemester?: number;
}

export default function StudyProgressChart({ selectedSemester = 5 }: StudyProgressChartProps) {
  const data = mockStudyProgressBySemester[selectedSemester] || mockStudyProgressBySemester[5];

  // Extract subject keys from dataset (ignoring "week")
  const subjectKeys = data.length > 0 ? Object.keys(data[0]).filter((k) => k !== 'week') : [];

  return (
    <AnimatedCard className="p-6 border-border/80 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📚</span> Study Progress
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Topic completion by subject — Semester {selectedSemester} (8 Weeks)
          </p>
        </div>
        <span className="badge-cyan text-xs px-2.5 py-1 rounded-full font-800 shadow-sm">
          Sem {selectedSemester}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {subjectKeys.map((subjectName) => {
              const color = getSubjectColor(subjectName);
              const gradId = `grad-${subjectName.replace(/[^a-zA-Z0-9]/g, '')}`;
              return (
                <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.hex} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color.hex} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)', paddingTop: 8 }}
          />

          {subjectKeys.map((subjectName) => {
            const color = getSubjectColor(subjectName);
            const gradId = `grad-${subjectName.replace(/[^a-zA-Z0-9]/g, '')}`;
            return (
              <Area
                key={subjectName}
                type="monotone"
                dataKey={subjectName}
                name={subjectName}
                stroke={color.hex}
                strokeWidth={2.5}
                fill={`url(#${gradId})`}
                animationDuration={800}
                animationEasing="ease-out"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </AnimatedCard>
  );
}
