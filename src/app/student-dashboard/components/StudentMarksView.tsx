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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[20px] border border-black/[0.06] shadow-card">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
              Academic Marks & Transcripts
            </h2>
            <p className="text-xs sm:text-[13px] text-[#6E6E73] font-normal mt-0.5">
              Verified semester grade cards, internal assessment scores, and university transcripts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadTranscript}
              className="btn-primary text-xs py-2 px-4 shadow-subtle"
            >
              <span>Download Transcript (PDF)</span>
            </button>
          </div>
        </div>

        {/* CGPA & SGPA Metric Cards in Apple Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StaggerItem order={1}>
            <div className="bg-white p-5 rounded-[18px] border border-black/[0.06] shadow-card">
              <span className="text-[10.5px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Cumulative CGPA
              </span>
              <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1 font-mono-data">
                8.82 <span className="text-xs font-normal text-[#8E8E93]">/ 10.0</span>
              </div>
              <div className="w-full h-1 bg-[#F0FDF4] rounded-full overflow-hidden mt-3 mb-1">
                <div className="h-full bg-primary rounded-full" style={{ width: '88.2%' }} />
              </div>
              <p className="text-[11px] text-[#15803D] font-semibold">First Class with Distinction</p>
            </div>
          </StaggerItem>

          <StaggerItem order={2}>
            <div className="bg-white p-5 rounded-[18px] border border-black/[0.06] shadow-card">
              <span className="text-[10.5px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Current SGPA (Sem 5 Projected)
              </span>
              <div className="text-3xl font-extrabold text-[#15803D] tracking-tight mt-1 font-mono-data">
                9.00 <span className="text-xs font-normal text-[#8E8E93]">/ 10.0</span>
              </div>
              <div className="w-full h-1 bg-[#F0FDF4] rounded-full overflow-hidden mt-3 mb-1">
                <div className="h-full bg-primary rounded-full" style={{ width: '90%' }} />
              </div>
              <p className="text-[11px] text-[#6E6E73]">20 Earned Credits in Term</p>
            </div>
          </StaggerItem>

          <StaggerItem order={3}>
            <div className="bg-white p-5 rounded-[18px] border border-black/[0.06] shadow-card">
              <span className="text-[10.5px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Total Credits Completed
              </span>
              <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1 font-mono-data">
                104 <span className="text-xs font-normal text-[#8E8E93]">/ 140</span>
              </div>
              <div className="w-full h-1 bg-[#F0FDF4] rounded-full overflow-hidden mt-3 mb-1">
                <div className="h-full bg-primary rounded-full" style={{ width: '74%' }} />
              </div>
              <p className="text-[11px] text-[#15803D] font-semibold">BCA Degree Progress: 74%</p>
            </div>
          </StaggerItem>
        </div>

        {/* Marks Table */}
        <div className="bg-white p-6 rounded-[20px] border border-black/[0.06] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Semester 5 Marks Ledger</h3>
              <p className="text-xs text-[#8E8E93]">Theory, Internal Assessments, and External University Marks</p>
            </div>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(Number(e.target.value))}
              className="bg-[#FAFAFC] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1D1D1F] font-medium cursor-pointer focus:border-primary outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
            <table className="w-full text-left text-xs table-clean">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th className="text-center">Credits</th>
                  <th className="text-center">Internal (25)</th>
                  <th className="text-center">External (75)</th>
                  <th className="text-center">Total (100)</th>
                  <th className="text-right">Grade</th>
                </tr>
              </thead>
              <tbody>
                {sem5Marks.map((m) => (
                  <tr key={m.code}>
                    <td className="font-mono-data text-[#15803D] font-bold">{m.code}</td>
                    <td className="font-semibold text-[#1D1D1F]">{m.name}</td>
                    <td className="text-center text-[#6E6E73]">{m.credits}</td>
                    <td className="text-center font-medium text-[#1D1D1F]">{m.internal}</td>
                    <td className="text-center font-medium text-[#1D1D1F]">{m.external}</td>
                    <td className="text-center font-bold text-[#1D1D1F]">{m.total}</td>
                    <td className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#DCFCE7] text-[#15803D]">
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
