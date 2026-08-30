'use client';

import React, { useState } from 'react';
import MarksCardSubmissionSection from './MarksCardSubmissionSection';
import PageTransition, { StaggerItem } from '@/components/motion/PageTransition';
import { toast } from 'sonner';

interface SubjectMark {
  code: string;
  name: string;
  credits: number;
  internal: number;
  external: number;
  total: number;
  maxTotal: number;
  grade: string;
  gradePoint: number;
}

const sem5Marks: SubjectMark[] = [
  { code: 'CS501', name: 'Operating Systems', credits: 4, internal: 24, external: 68, total: 92, maxTotal: 100, grade: 'O', gradePoint: 10 },
  { code: 'CS502', name: 'Database Management Systems', credits: 4, internal: 22, external: 65, total: 87, maxTotal: 100, grade: 'A+', gradePoint: 9 },
  { code: 'CS503', name: 'Computer Networks', credits: 4, internal: 21, external: 61, total: 82, maxTotal: 100, grade: 'A', gradePoint: 8 },
  { code: 'CS504', name: 'Java Programming', credits: 4, internal: 25, external: 70, total: 95, maxTotal: 100, grade: 'O', gradePoint: 10 },
  { code: 'CS505', name: 'Design & Analysis of Algorithms', credits: 4, internal: 20, external: 63, total: 83, maxTotal: 100, grade: 'A', gradePoint: 8 },
];

export default function StudentMarksView() {
  const [selectedSem, setSelectedSem] = useState<number>(5);

  const handleDownloadTranscript = () => {
    toast.success('Official BCA Semester 5 Grade Transcript PDF downloaded!');
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-border/60 shadow-lg">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">🎓</span>
              <h2 className="text-2xl font-800 text-foreground tracking-tight">Academic Marks & Transcripts</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-500">
              Verified semester grade cards, internal assessment scores, and university transcripts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadTranscript}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl shadow-glow cursor-pointer font-800 flex items-center gap-2"
            >
              <span>📥</span>
              <span>Download Transcript (PDF)</span>
            </button>
          </div>
        </div>

        {/* CGPA & SGPA Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem order={1}>
            <div className="glass-card p-5 rounded-2xl border border-primary/40 shadow-sm relative overflow-hidden">
              <div className="text-xs text-muted-foreground font-600 mb-1">Cumulative CGPA</div>
              <div className="text-3xl font-900 text-foreground">8.82 <span className="text-sm text-muted-foreground font-600">/ 10.0</span></div>
              <div className="text-[11px] text-emerald-400 font-700 mt-1">⭐ First Class with Distinction</div>
            </div>
          </StaggerItem>

          <StaggerItem order={2}>
            <div className="glass-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
              <div className="text-xs text-muted-foreground font-600 mb-1">Current SGPA (Sem 5 Projected)</div>
              <div className="text-3xl font-900 text-accent">9.00 <span className="text-sm text-muted-foreground font-600">/ 10.0</span></div>
              <div className="text-[11px] text-muted-foreground mt-1">20 Earned Credits in Term</div>
            </div>
          </StaggerItem>

          <StaggerItem order={3}>
            <div className="glass-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
              <div className="text-xs text-muted-foreground font-600 mb-1">Total Credits Completed</div>
              <div className="text-3xl font-900 text-foreground">104 <span className="text-sm text-muted-foreground font-600">/ 140 Credits</span></div>
              <div className="text-[11px] text-accent font-700 mt-1">BCA Degree Progress: 74%</div>
            </div>
          </StaggerItem>
        </div>

        {/* Marks Table */}
        <div className="glass-card p-6 rounded-3xl border border-border/60 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-800 text-foreground">Semester 5 Marks Ledger</h3>
              <p className="text-xs text-muted-foreground">Theory, Internal Assessments, and External University Marks</p>
            </div>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(Number(e.target.value))}
              className="bg-card/80 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-600 cursor-pointer focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-700">
                  <th className="pb-3 px-2">Code</th>
                  <th className="pb-3 px-2">Subject Name</th>
                  <th className="pb-3 px-2 text-center">Credits</th>
                  <th className="pb-3 px-2 text-center">Internal (25)</th>
                  <th className="pb-3 px-2 text-center">External (75)</th>
                  <th className="pb-3 px-2 text-center">Total (100)</th>
                  <th className="pb-3 px-2 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sem5Marks.map((m) => (
                  <tr key={m.code} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-2 font-mono-data text-accent font-700">{m.code}</td>
                    <td className="py-3.5 px-2 font-700 text-foreground">{m.name}</td>
                    <td className="py-3.5 px-2 text-center font-600 text-muted-foreground">{m.credits}</td>
                    <td className="py-3.5 px-2 text-center font-700 text-foreground">{m.internal}</td>
                    <td className="py-3.5 px-2 text-center font-700 text-foreground">{m.external}</td>
                    <td className="py-3.5 px-2 text-center font-900 text-foreground">{m.total}</td>
                    <td className="py-3.5 px-2 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-900 bg-primary/15 text-primary border border-primary/30">
                        {m.grade} ({m.gradePoint})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload & Verified Marks Cards Submission Section */}
        <div className="pt-2">
          <MarksCardSubmissionSection />
        </div>
      </div>
    </PageTransition>
  );
}
