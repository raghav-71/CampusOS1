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
import { mockFacultyAttendanceTrends } from '@/repositories/mockData';
import { TeacherFilterState } from '@/types/campus';
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
      <p className="font-800 text-foreground mb-2">{label} — Attendance Rate</p>
      {payload.map((entry) => (
        <div key={`tatip-${entry.name}`} className="flex items-center justify-between gap-3 mb-1.5">
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

interface TeacherAttendanceChartProps {
  filters?: TeacherFilterState;
}

export default function TeacherAttendanceChart({ filters }: TeacherAttendanceChartProps) {
  const osColor = getSubjectColor('Operating Systems');
  const dbmsColor = getSubjectColor('DBMS');
  const cnColor = getSubjectColor('Computer Networks');

  return (
    <AnimatedCard className="p-6 border-border/80 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📈</span> Weekly Class Attendance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnout across lecture sections — {filters?.semester !== 'all' ? `Semester ${filters?.semester}` : 'All Semesters'}
          </p>
        </div>
        <span className="badge-success text-xs px-2.5 py-1 rounded-full font-800 shadow-sm">91.4% Avg</span>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart
          data={mockFacultyAttendanceTrends}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradTeachOS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={osColor.hex} stopOpacity={0.4} />
              <stop offset="95%" stopColor={osColor.hex} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTeachDBMS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={dbmsColor.hex} stopOpacity={0.35} />
              <stop offset="95%" stopColor={dbmsColor.hex} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTeachCN" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={cnColor.hex} stopOpacity={0.3} />
              <stop offset="95%" stopColor={cnColor.hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[75, 100]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)', paddingTop: 8 }}
          />

          {(!filters?.subject || filters.subject === 'all' || filters.subject.includes('OS')) && (
            <Area
              type="monotone"
              dataKey="os"
              name="OS (CS501)"
              stroke={osColor.hex}
              strokeWidth={2.5}
              fill="url(#gradTeachOS)"
              animationDuration={800}
              animationEasing="ease-out"
            />
          )}
          {(!filters?.subject || filters.subject === 'all' || filters.subject.includes('DBMS')) && (
            <Area
              type="monotone"
              dataKey="dbms"
              name="DBMS (CS502)"
              stroke={dbmsColor.hex}
              strokeWidth={2.5}
              fill="url(#gradTeachDBMS)"
              animationDuration={800}
              animationEasing="ease-out"
            />
          )}
          {(!filters?.subject || filters.subject === 'all' || filters.subject.includes('Networks') || filters.subject.includes('Architecture')) && (
            <Area
              type="monotone"
              dataKey="cn"
              name="CN / SA"
              stroke={cnColor.hex}
              strokeWidth={2.5}
              fill="url(#gradTeachCN)"
              animationDuration={800}
              animationEasing="ease-out"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </AnimatedCard>
  );
}
