'use client';

import React, { useState, useEffect } from 'react';
import { campusRepository } from '@/repositories/campusRepository';
import { StudentPerformanceRecord } from '@/types/campus';
import AnimatedCard from '@/components/motion/AnimatedCard';
import AnimatedNumber from '@/components/motion/AnimatedNumber';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function TeacherStudentPerformanceView() {
  const [students, setStudents] = useState<StudentPerformanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformanceRecord | null>(null);
  const [filterTrend, setFilterTrend] = useState<'all' | 'improving' | 'steady' | 'needs_attention'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const data = await campusRepository.getTeacherStudentPerformanceMatrix();
      setStudents(data);
    }
    load();
  }, []);

  const filtered = students.filter((s) => {
    const matchTrend = filterTrend === 'all' || s.trend === filterTrend;
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase());
    return matchTrend && matchSearch;
  });

  const getTrendBadge = (trend: StudentPerformanceRecord['trend']) => {
    switch (trend) {
      case 'improving':
        return (
          <span className="badge-success text-[10px] px-2.5 py-0.5 rounded-lg font-700 flex items-center gap-1 shadow-sm">
            ↗ Improving
          </span>
        );
      case 'steady':
        return (
          <span className="badge-cyan text-[10px] px-2.5 py-0.5 rounded-lg font-700 flex items-center gap-1 shadow-sm">
            → Consistent
          </span>
        );
      case 'needs_attention':
      default:
        return (
          <span className="badge-danger text-[10px] px-2.5 py-0.5 rounded-lg font-700 flex items-center gap-1 shadow-sm animate-pulse">
            ⚠️ Needs Attention
          </span>
        );
    }
  };

  return (
    <>
      <AnimatedCard className="p-6 border-border/80 shadow-glass space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📈</span> Student Examination Performance Measurement
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive multi-assessment matrix & longitudinal performance trends for BCA Sem 5
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search student or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card/80 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent w-40 sm:w-48 btn-press"
            />
            <select
              value={filterTrend}
              onChange={(e) => setFilterTrend(e.target.value as any)}
              className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-700 outline-none cursor-pointer hover:border-accent transition-all btn-press"
            >
              <option value="all">All Trends</option>
              <option value="improving">Improving ↗</option>
              <option value="steady">Consistent →</option>
              <option value="needs_attention">Needs Attention ⚠️</option>
            </select>
          </div>
        </div>

        {/* Matrix Table with Row Hover Illumination */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Internal 1 (50)</th>
                <th className="py-3 px-3">Internal 2 (50)</th>
                <th className="py-3 px-3">Lab (50)</th>
                <th className="py-3 px-3">End Sem (100)</th>
                <th className="py-3 px-3">Overall</th>
                <th className="py-3 px-3">Trend</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((s) => (
                <tr key={s.studentId} className="row-hover-glow transition-all">
                  <td className="py-3.5 px-3">
                    <div className="font-800 text-foreground">{s.studentName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono-data">
                      {s.rollNumber} · Sec {s.section}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono-data">
                    <span className="font-800 text-foreground">{s.internal1Marks}</span>
                    <span className="text-muted-foreground text-[10px]"> / {s.internal1Max}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono-data">
                    <span className="font-800 text-foreground">{s.internal2Marks}</span>
                    <span className="text-muted-foreground text-[10px]"> / {s.internal2Max}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono-data">
                    <span className="font-800 text-accent">{s.labInternalMarks}</span>
                    <span className="text-muted-foreground text-[10px]"> / {s.labInternalMax}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono-data">
                    <span className="font-800 text-primary">{s.endSemMarks}</span>
                    <span className="text-muted-foreground text-[10px]"> / {s.endSemMax}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-900 text-foreground font-mono-data">
                      <AnimatedNumber value={s.overallPercentage} suffix="%" />
                    </span>
                    <span className="badge-violet text-[9px] px-1.5 py-0.2 rounded-md ml-1.5 font-800">
                      {s.overallGrade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">{getTrendBadge(s.trend)}</td>
                  <td className="py-3.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudent(s)}
                      className="text-xs text-primary hover:underline font-700"
                    >
                      Audit Drilldown →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Drilldown Modal */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={`Performance Audit: ${selectedStudent.studentName}`}
          description={`${selectedStudent.rollNumber} · BCA Semester ${selectedStudent.semesterNumber} (Section ${selectedStudent.section})`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedStudent(null)}>
              Close Audit
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-card border border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-700 block">Overall Score</span>
                <span className="text-base font-900 text-primary">{selectedStudent.overallPercentage}%</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-700 block">Cumulative Grade</span>
                <span className="text-base font-900 text-accent">{selectedStudent.overallGrade}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-700 block">Attendance</span>
                <span className="text-base font-900 text-success">{selectedStudent.attendancePct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-700 block">Trajectory</span>
                <span className="text-base font-900 text-foreground capitalize">{selectedStudent.trend.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
              <span className="font-700 text-foreground block">Assessment Timeline & Progression:</span>
              <div className="space-y-1 text-muted-foreground leading-relaxed font-mono-data">
                <p>• <strong>1st Internal Exam:</strong> {selectedStudent.internal1Marks} / {selectedStudent.internal1Max} ({Math.round((selectedStudent.internal1Marks / selectedStudent.internal1Max) * 100)}%)</p>
                <p>• <strong>2nd Internal Exam:</strong> {selectedStudent.internal2Marks} / {selectedStudent.internal2Max} ({Math.round((selectedStudent.internal2Marks / selectedStudent.internal2Max) * 100)}%)</p>
                <p>• <strong>Lab Practical Assessment:</strong> {selectedStudent.labInternalMarks} / {selectedStudent.labInternalMax} ({Math.round((selectedStudent.labInternalMarks / selectedStudent.labInternalMax) * 100)}%)</p>
                <p>• <strong>End Semester Examination:</strong> {selectedStudent.endSemMarks} / {selectedStudent.endSemMax} ({selectedStudent.endSemMarks}%)</p>
              </div>
            </div>

            {selectedStudent.trend === 'needs_attention' ? (
              <div className="p-3 rounded-2xl bg-danger/10 border border-danger/30 text-danger leading-relaxed">
                <strong>Faculty Intervention Recommendation:</strong> Student is performing below expectations or has low attendance ({selectedStudent.attendancePct}%). Recommended to assign remediation problem sets in memory management and schedule counseling.
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-success/10 border border-success/30 text-success leading-relaxed">
                <strong>Academic Standing:</strong> Satisfactory progression with consistent upward trend in theoretical analysis and practical implementation tasks.
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
