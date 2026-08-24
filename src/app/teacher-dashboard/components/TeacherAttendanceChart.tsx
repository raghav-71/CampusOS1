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
    <div className="glass-card rounded-xl p-3 border border-border text-xs min-w-[130px] shadow-glass">
      <p className="font-600 text-foreground mb-2">{label} - Attendance Rate</p>
      {payload.map((entry) => (
        <div key={`tatip-${entry.name}`} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-600 text-foreground metric-value">{entry.value}%</span>
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
    <div className="glass-card rounded-2xl p-5 border border-border shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-700 text-foreground">Weekly Class Attendance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnout across lecture sections — {filters?.semester !== 'all' ? `Semester ${filters?.semester}` : 'All Semesters'}
          </p>
        </div>
        <span className="badge-success text-xs px-2.5 py-1 rounded-lg font-700">91.4% Avg</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={mockFacultyAttendanceTrends}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradTeachOS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={osColor.hex} stopOpacity={0.35} />
              <stop offset="95%" stopColor={osColor.hex} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTeachDBMS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={dbmsColor.hex} stopOpacity={0.3} />
              <stop offset="95%" stopColor={dbmsColor.hex} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTeachCN" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={cnColor.hex} stopOpacity={0.25} />
              <stop offset="95%" stopColor={cnColor.hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
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
              strokeWidth={2}
              fill="url(#gradTeachOS)"
            />
          )}
          {(!filters?.subject || filters.subject === 'all' || filters.subject.includes('DBMS')) && (
            <Area
              type="monotone"
              dataKey="dbms"
              name="DBMS (CS502)"
              stroke={dbmsColor.hex}
              strokeWidth={2}
              fill="url(#gradTeachDBMS)"
            />
          )}
          {(!filters?.subject || filters.subject === 'all' || filters.subject.includes('Networks') || filters.subject.includes('Architecture')) && (
            <Area
              type="monotone"
              dataKey="cn"
              name="CN / SA"
              stroke={cnColor.hex}
              strokeWidth={2}
              fill="url(#gradTeachCN)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
