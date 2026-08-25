'use client';

import React, { useState, useEffect } from 'react';
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
import { ExamCategory, TeacherExamPerformance } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import AnimatedCard from '@/components/motion/AnimatedCard';
import AnimatedNumber from '@/components/motion/AnimatedNumber';

const barColors = [
  '#00E599', // O (90-100%)
  '#00D8F6', // A+ (80-89%)
  '#1E6BFF', // A (70-79%)
  '#6366F1', // B+ (60-69%)
  '#FFB300', // B (50-59%)
  '#FF8A00', // C (40-49%)
  '#FF4757', // F (<40%)
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-card rounded-2xl p-3.5 border border-primary/50 text-xs shadow-2xl backdrop-blur-md">
      <p className="font-800 text-foreground mb-1">{label}</p>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Students:</span>
        <span className="font-900 text-primary metric-value">{payload[0]?.value}</span>
      </div>
    </div>
  );
}

export default function TeacherGradeChart() {
  const [selectedExam, setSelectedExam] = useState<ExamCategory>('INTERNAL_1');
  const [performance, setPerformance] = useState<TeacherExamPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPerformance() {
      setIsLoading(true);
      const data = await campusRepository.getTeacherExamPerformance(selectedExam);
      setPerformance(data);
      setIsLoading(false);
    }
    loadPerformance();
  }, [selectedExam]);

  return (
    <AnimatedCard className="p-6 border-border/80 shadow-glass space-y-5">
      {/* Header & Exam Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
            <span>📊</span> Score & Grade Distribution
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real student examination evaluation results across assigned courses
          </p>
        </div>

        {/* Interactive Exam Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-700 text-muted-foreground uppercase tracking-wider hidden sm:inline">
            Exam:
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value as ExamCategory)}
            className="bg-card border border-primary/40 rounded-xl px-3.5 py-1.5 text-xs text-foreground font-700 outline-none cursor-pointer hover:border-accent transition-all shadow-sm btn-press"
          >
            <option value="INTERNAL_1">1st Internal Assessment</option>
            <option value="INTERNAL_2">2nd Internal Assessment</option>
            <option value="LAB_INTERNAL_1">Lab Internal 1 (Practical)</option>
            <option value="END_SEMESTER">End Semester University Exam</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Pills */}
      {performance && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-center hover:border-primary/40 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-700 block">Average</span>
            <span className="text-sm font-900 text-primary">
              <AnimatedNumber value={performance.averageScore} decimals={1} suffix="%" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-center hover:border-success/40 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-700 block">Highest</span>
            <span className="text-sm font-900 text-success">
              <AnimatedNumber value={performance.highestScore} decimals={1} suffix="%" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-center hover:border-danger/40 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-700 block">Lowest</span>
            <span className="text-sm font-900 text-danger">
              <AnimatedNumber value={performance.lowestScore} decimals={1} suffix="%" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-center hover:border-accent/40 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-700 block">Median</span>
            <span className="text-sm font-900 text-accent">
              <AnimatedNumber value={performance.medianScore} decimals={1} suffix="%" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-center hover:border-success/40 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-700 block">Pass Rate</span>
            <span className="text-sm font-900 text-success">
              <AnimatedNumber value={performance.passPercentage} suffix="%" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 text-center hover:border-primary/40 transition-all">
            <span className="text-[10px] text-muted-foreground uppercase font-700 block">Evaluated</span>
            <span className="text-sm font-900 text-foreground">
              <AnimatedNumber value={performance.totalStudents} suffix=" std" />
            </span>
          </div>
        </div>
      )}

      {/* Recharts Bar Chart with Smooth Animation */}
      <div className="relative h-60 w-full pt-2">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-accent animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performance?.gradeDistribution || []}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
              <XAxis
                dataKey="gradeRange"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 216, 246, 0.08)' }} />
              <Bar
                dataKey="studentCount"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {(performance?.gradeDistribution || []).map((entry, index) => (
                  <Cell
                    key={`cell-${entry.gradeRange}`}
                    fill={barColors[index % barColors.length]}
                    fillOpacity={0.92}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 font-500">
        <span>Active Focus: {performance?.examLabel}</span>
        <span className="font-700 text-foreground">BCA Grading Criteria (≥40% Pass Cutoff)</span>
      </div>
    </AnimatedCard>
  );
}
