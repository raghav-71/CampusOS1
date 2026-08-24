'use client';

import React from 'react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

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
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Profile Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-800 text-white shadow-glow">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-800 text-foreground">{fullName}</h2>
              <Badge variant="cyan">Enrolled Student</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono-data mb-1">{email}</p>
            <p className="text-xs text-muted-foreground">
              {department} &nbsp;·&nbsp; {semester} &nbsp;·&nbsp; Roll:{' '}
              <span className="text-foreground font-600">{rollNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 self-end sm:self-center">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Cumulative CGPA</p>
          <p className="text-2xl font-800 text-foreground metric-value">
            8.84 <span className="text-xs font-normal text-muted-foreground">/ 10</span>
          </p>
          <p className="text-[11px] text-success font-600 mt-1">Top 5% in Department</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Credits Earned</p>
          <p className="text-2xl font-800 text-foreground metric-value">
            88 <span className="text-xs font-normal text-muted-foreground">/ 120</span>
          </p>
          <p className="text-[11px] text-primary font-600 mt-1">On Track for Graduation</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Overall Attendance</p>
          <p className="text-2xl font-800 text-success metric-value">92.5%</p>
          <p className="text-[11px] text-muted-foreground mt-1">Above 75% Requirement</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Class Rank</p>
          <p className="text-2xl font-800 text-accent metric-value">
            #4 <span className="text-xs font-normal text-muted-foreground">of 120</span>
          </p>
          <p className="text-[11px] text-accent font-600 mt-1">Dean&apos;s Honor List</p>
        </div>
      </div>

      {/* Semester History Table */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-700 text-foreground">Semester Academic Progression</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical GPA and credit breakdown across completed terms
            </p>
          </div>
          <Badge variant="violet">5 Total Semesters</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-3 px-3">Term</th>
                <th className="py-3 px-3">GPA / SGPA</th>
                <th className="py-3 px-3">Credits</th>
                <th className="py-3 px-3 text-right">Term Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {semesterGrades.map((row) => (
                <tr key={row.sem} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-600 text-foreground">{row.sem}</td>
                  <td className="py-3 px-3 font-700 text-primary font-mono-data">{row.gpa}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.credits} Credits</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg font-600 ${
                        row.status.includes('Passed') ? 'badge-success' : 'badge-cyan'
                      }`}
                    >
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
