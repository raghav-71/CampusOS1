'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { mockSubjects } from '@/repositories/mockData';
import { getSubjectColor } from '@/lib/academicColors';
import AnimatedCard from '@/components/motion/AnimatedCard';

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
    <div className="glass-card rounded-2xl p-3 border border-primary/50 text-xs shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
        <span className="text-foreground font-800">{item.name}</span>
        <span className="text-accent font-900 metric-value">{item.value}%</span>
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
    <AnimatedCard className="p-6 border-border/80 shadow-glass">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>🎯</span> Subject Coverage
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Syllabus completion per subject — Semester {selectedSemester}
          </p>
        </div>
        {lowest && (lowest.syllabusProgress || 0) < 70 && (
          <span className="badge-warning text-xs px-2.5 py-1 rounded-full font-700 animate-pulse">
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
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              background={{ fill: 'var(--muted)' }}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2.5 pl-2">
          {chartData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-1 rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: item.fill }}
                />
                <span className="text-xs text-muted-foreground truncate font-600" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-800 text-foreground metric-value pl-2">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}
