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
  { week: 'W1', os: 12, dbms: 8, cn: 10, java: 6 },
  { week: 'W2', os: 18, dbms: 14, cn: 15, java: 12 },
  { week: 'W3', os: 22, dbms: 18, cn: 20, java: 16 },
  { week: 'W4', os: 28, dbms: 20, cn: 28, java: 22 },
  { week: 'W5', os: 35, dbms: 26, cn: 32, java: 25 },
  { week: 'W6', os: 42, dbms: 30, cn: 38, java: 28 },
  { week: 'W7', os: 50, dbms: 38, cn: 45, java: 34 },
  { week: 'W8', os: 58, dbms: 44, cn: 52, java: 40 },
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
  return (
    <div className="glass-card rounded-xl p-3 border border-border text-xs">
      <p className="font-600 text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={`tip-${entry.name}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-600 text-foreground metric-value">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function StudyProgressChart() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Study Progress</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Topic completion by subject — last 8 weeks
          </p>
        </div>
        <span className="badge-violet text-xs px-2.5 py-1 rounded-lg font-500">Sem 5</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDBMS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCN" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)', paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="os"
            name="OS"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#gradOS)"
          />
          <Area
            type="monotone"
            dataKey="dbms"
            name="DBMS"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#gradDBMS)"
          />
          <Area
            type="monotone"
            dataKey="cn"
            name="CN"
            stroke="var(--success)"
            strokeWidth={2}
            fill="url(#gradCN)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
