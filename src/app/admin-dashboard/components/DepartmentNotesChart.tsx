'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const data = [
  { id: 'dept-bca', dept: 'BCA', notes: 3240, teachers: 22 },
  { id: 'dept-bba', dept: 'BBA', notes: 2180, teachers: 18 },
  { id: 'dept-bcom', dept: 'B.Com', notes: 1640, teachers: 16 },
  { id: 'dept-mca', dept: 'MCA', notes: 1187, teachers: 14 },
  { id: 'dept-mba', dept: 'MBA', notes: 890, teachers: 12 },
  { id: 'dept-bsc', dept: 'B.Sc', notes: 720, teachers: 8 },
];

const barColors = [
  'var(--primary)',
  'var(--accent)',
  'var(--success)',
  '#FF6B9D',
  '#FFB300',
  '#A88FFF',
];

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = data.find((d) => d.dept === label);
  return (
    <div className="glass-card rounded-xl p-3 border border-border text-xs">
      <p className="font-600 text-foreground mb-1.5">{label} Department</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Notes uploaded</span>
          <span className="font-600 text-foreground metric-value">
            {payload[0]?.value?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Faculty count</span>
          <span className="font-600 text-foreground metric-value">{item?.teachers}</span>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentNotesChart() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Notes by Department</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total documents uploaded per department
          </p>
        </div>
        <span className="badge-cyan text-xs px-2.5 py-1 rounded-lg font-500">8,247 total</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="dept"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,71,255,0.06)' }} />
          <Bar dataKey="notes" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={barColors[index % barColors.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
