'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,  } from 'recharts';

const data = [
  { id: 'rchart-java', name: 'Java', value: 82, fill: '#00D4FF' },
  { id: 'rchart-daa', name: 'DAA', value: 65, fill: '#6C47FF' },
  { id: 'rchart-cn', name: 'CN', value: 78, fill: '#00E096' },
  { id: 'rchart-dbms', name: 'DBMS', value: 55, fill: '#FFB300' },
  { id: 'rchart-os', name: 'OS', value: 72, fill: '#FF6B9D' },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="glass-card rounded-xl p-3 border border-border text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
        <span className="text-foreground font-600">{item.name}</span>
        <span className="text-muted-foreground metric-value">{item.value}%</span>
      </div>
    </div>
  );
}

export default function SubjectCoverageChart() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-600 text-foreground">Subject Coverage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Syllabus completion per subject</p>
        </div>
        <span className="badge-warning text-xs px-2.5 py-1 rounded-lg font-500">DBMS needs attention</span>
      </div>
      <div className="flex items-center">
        <ResponsiveContainer width="55%" height={200}>
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="20%" outerRadius="90%"
            data={data}
            startAngle={90} endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--muted)' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2.5 pl-2">
          {data.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-xs font-600 text-foreground metric-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}