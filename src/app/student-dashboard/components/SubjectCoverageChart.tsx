'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { mockSubjects } from '@/repositories/mockData';
import { getSubjectColor } from '@/lib/academicColors';

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
    <div className="glass-card rounded-xl p-3 border border-border text-xs shadow-glass">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
        <span className="text-foreground font-600">{item.name}</span>
        <span className="text-muted-foreground metric-value">{item.value}%</span>
      </div>
    </div>
  );
}

interface SubjectCoverageChartProps {
  selectedSemester?: number;
}

export default function SubjectCoverageChart({ selectedSemester = 5 }: SubjectCoverageChartProps) {
  const semesterSubjects = mockSubjects.filter((s) => s.semesterNumber === selectedSemester);

  const chartData = semesterSubjects.map((s) => ({
    id: `rchart-${s.id}`,
    name: s.name,
    value: s.syllabusProgress || s.syllabusCoveragePct || 0,
    fill: getSubjectColor(s.name).hex,
  }));

  // Identify lowest covered subject for attention hint
  const lowest = semesterSubjects.reduce(
    (min, s) =>
      (s.syllabusProgress || 0) < (min.syllabusProgress || 0) ? s : min,
    semesterSubjects[0] || { name: 'None', syllabusProgress: 100 }
  );

  return (
    <div className="glass-card rounded-2xl p-5 border border-border/80 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-700 text-foreground">Subject Coverage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Syllabus completion per subject — Semester {selectedSemester}
          </p>
        </div>
        {lowest && (lowest.syllabusProgress || 0) < 70 && (
          <span className="badge-warning text-xs px-2.5 py-1 rounded-lg font-600">
            {lowest.name} needs focus
          </span>
        )}
      </div>

      <div className="flex items-center">
        <ResponsiveContainer width="55%" height={210}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--muted)' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2.5 pl-2">
          {chartData.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: item.fill }}
                />
                <span className="text-xs text-muted-foreground truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-700 text-foreground metric-value pl-2">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
