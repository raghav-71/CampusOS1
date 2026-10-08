'use client';

import React from 'react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';
import MarksCardSubmissionSection from './MarksCardSubmissionSection';

const semesterGrades = [
  { sem: 'Semester 1', gpa: '8.40', credits: 22, status: 'Passed (Distinction)' },
  { sem: 'Semester 2', gpa: '8.65', credits: 22, status: 'Passed (Distinction)' },
  { sem: 'Semester 3', gpa: '8.90', credits: 22, status: 'Passed (Distinction)' },
  { sem: 'Semester 4', gpa: '9.40', credits: 22, status: 'Passed (Distinction)' },
  { sem: 'Semester 5', gpa: 'In Progress', credits: 24, status: 'Active Term' },
];

export default function StudentProfileView() {
  const { profile } = useProfile();

  const fullName = profile?.fullName ?? 'Arjun Sharma';
  const email = profile?.email ?? 'arjun.sharma@campusos.edu';
  const rollNumber = profile?.rollNumber ?? '2024-BCA-042';
  const department = profile?.department ?? 'Computer Applications (BCA)';
  const semester = profile?.semester ?? 'Semester 5';
  const initials = profile?.initials ?? 'AS';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-10">
      {/* Profile Card Banner */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-card">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#DCFCE7] text-[#15803D] border border-black/[0.04] flex items-center justify-center text-xl sm:text-2xl font-bold shadow-subtle flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">{fullName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#DCFCE7] text-[#15803D]">
                Enrolled
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] font-mono-data mb-1">{email}</p>
            <p className="text-xs text-[#6E6E73]">
              {department} &nbsp;·&nbsp; {semester} &nbsp;·&nbsp; Roll:{' '}
              <span className="text-[#1D1D1F] font-semibold">{rollNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 self-end sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast.info('Profile editing will open in Settings')}
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success('Official academic transcript downloaded')}
          >
            Download Transcript
          </Button>
        </div>
      </div>

      {/* Academic Bento KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[10.5px] text-[#8E8E93] uppercase font-semibold mb-1">Cumulative CGPA</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight font-mono-data">
            8.84 <span className="text-xs font-normal text-[#8E8E93]">/ 10</span>
          </p>
          <p className="text-[11px] text-[#15803D] font-semibold mt-1">Top 5% in Department</p>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[10.5px] text-[#8E8E93] uppercase font-semibold mb-1">Credits Earned</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight font-mono-data">
            88 <span className="text-xs font-normal text-[#8E8E93]">/ 120</span>
          </p>
          <p className="text-[11px] text-[#15803D] font-semibold mt-1">On Track for Degree</p>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[10.5px] text-[#8E8E93] uppercase font-semibold mb-1">Overall Attendance</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#15803D] tracking-tight font-mono-data">92.5%</p>
          <p className="text-[11px] text-[#8E8E93] mt-1">&gt; 75% Requirement</p>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[10.5px] text-[#8E8E93] uppercase font-semibold mb-1">Class Rank</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight font-mono-data">
            #4 <span className="text-xs font-normal text-[#8E8E93]">of 120</span>
          </p>
          <p className="text-[11px] text-[#15803D] font-semibold mt-1">Dean&apos;s Honor List</p>
        </div>
      </div>

      {/* Marks Card Submission Section */}
      <MarksCardSubmissionSection />

      {/* Semester History Table */}
      <div className="bg-white rounded-[20px] p-6 sm:p-7 border border-black/[0.06] shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F]">Semester Academic Progression</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Historical GPA and credit breakdown across completed terms
            </p>
          </div>
          <span className="text-xs font-semibold text-[#6E6E73] bg-black/[0.04] px-2.5 py-1 rounded-full">
            5 Total Semesters
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
          <table className="w-full text-xs table-clean">
            <thead>
              <tr>
                <th>Term</th>
                <th>GPA / SGPA</th>
                <th>Credits</th>
                <th className="text-right">Term Status</th>
              </tr>
            </thead>
            <tbody>
              {semesterGrades.map((row) => (
                <tr key={row.sem}>
                  <td className="font-semibold text-[#1D1D1F]">{row.sem}</td>
                  <td className="font-bold text-[#15803D] font-mono-data">{row.gpa}</td>
                  <td className="text-[#6E6E73]">{row.credits} Credits</td>
                  <td className="text-right">
                    <span className="text-[10.5px] px-2 py-0.5 rounded-md font-semibold bg-[#DCFCE7] text-[#15803D]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
