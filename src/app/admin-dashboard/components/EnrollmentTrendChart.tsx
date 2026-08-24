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

const data = [
  { month: 'Jan', BCA: 420, BBA: 310, BCom: 280, MCA: 145 },
  { month: 'Feb', BCA: 435, BBA: 318, BCom: 275, MCA: 152 },
  { month: 'Mar', BCA: 448, BBA: 322, BCom: 290, MCA: 158 },
  { month: 'Apr', BCA: 441, BBA: 315, BCom: 285, MCA: 162 },
  { month: 'May', BCA: 455, BBA: 330, BCom: 295, MCA: 168 },
  { month: 'Jun', BCA: 462, BBA: 340, BCom: 302, MCA: 172 },
  { month: 'Jul', BCA: 470, BBA: 348, BCom: 310, MCA: 178 },
  { month: 'Aug', BCA: 478, BBA: 355, BCom: 318, MCA: 185 },
];

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
  const total = payload.reduce((sum, entry) => sum + entry.value, 0);
  return (
    <div className="glass-card rounded-xl p-3 border border-border text-xs min-w-[140px]">
      <p className="font-600 text-foreground mb-2">{label} 2026</p>
      {payload.map((entry) => (
        <div key={`etip-${entry.name}`} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-600 text-foreground metric-value">{entry.value}</span>
        </div>
      ))}
      <div className="border-t border-border mt-2 pt-2 flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-700 text-foreground metric-value">{total}</span>
      </div>
    </div>
  );
}

export default function EnrollmentTrendChart() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Student Enrollment</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active students by department — 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-success text-xs px-2.5 py-1 rounded-lg font-500">↑ 4.2% MoM</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradBCA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBBA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBCom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradMCA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            domain={[100, 550]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)', paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="BCA"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#gradBCA)"
          />
          <Area
            type="monotone"
            dataKey="BBA"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#gradBBA)"
          />
          <Area
            type="monotone"
            dataKey="BCom"
            stroke="var(--success)"
            strokeWidth={2}
            fill="url(#gradBCom)"
          />
          <Area
            type="monotone"
            dataKey="MCA"
            stroke="#FF6B9D"
            strokeWidth={2}
            fill="url(#gradMCA)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
