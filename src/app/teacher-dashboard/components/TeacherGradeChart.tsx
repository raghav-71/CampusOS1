'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { mockGradeDistributions } from '@/repositories/mockData';

const barColors = ['var(--success)', 'var(--accent)', 'var(--primary)', 'var(--warning)', 'var(--danger)'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 border border-border text-xs">
      <p className="font-600 text-foreground mb-1">{label}</p>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Students</span>
        <span className="font-600 text-foreground metric-value">{payload[0]?.value}</span>
      </div>
    </div>
  );
}

export default function TeacherGradeChart() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Score & Grade Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest Mid-Term exam results across all sections</p>
        </div>
        <span className="badge-violet text-xs px-2.5 py-1 rounded-lg font-500">64 Total Evaluated</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={mockGradeDistributions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="gradeRange" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.06)' }} />
          <Bar dataKey="studentCount" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {mockGradeDistributions.map((entry, index) => (
              <Cell key={`cell-${entry.gradeRange}`} fill={barColors[index % barColors.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
