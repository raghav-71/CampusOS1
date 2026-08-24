'use client';

import React from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminReportsView() {
  const handleExport = (format: string) => {
    toast.success(`Exporting Institutional Master Analytics Report (${format})`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-700 text-foreground">
            Institutional Analytics & Performance Reports
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comprehensive annual academic indicators, enrollment benchmarks, and attendance
            compliance
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('CSV / Excel')}>
            Export Excel
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleExport('PDF')}>
            Generate Official PDF
          </Button>
        </div>
      </div>

      {/* High-Level Institutional Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Active Enrollment</p>
          <p className="text-2xl font-800 text-foreground metric-value">
            1,556 <span className="text-xs font-normal text-muted-foreground">Students</span>
          </p>
          <p className="text-[11px] text-success font-600 mt-1">+8.4% vs Previous Term</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Faculty-to-Student Ratio</p>
          <p className="text-2xl font-800 text-primary metric-value">1 : 19</p>
          <p className="text-[11px] text-muted-foreground mt-1">UGC Tier-1 Compliant</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Campus Attendance Avg</p>
          <p className="text-2xl font-800 text-success metric-value">91.8%</p>
          <p className="text-[11px] text-success font-600 mt-1">Well Above 75% Cutoff</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Annual Pass Percentage</p>
          <p className="text-2xl font-800 text-accent metric-value">94.6%</p>
          <p className="text-[11px] text-accent font-600 mt-1">Distinction Rate: 48%</p>
        </div>
      </div>

      {/* Departmental Performance Matrix */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-700 text-foreground">Departmental Performance Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Faculty count, student strength, and research output by faculty
            </p>
          </div>
          <Badge variant="cyan">Fall 2026 Audit</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Head of Department</th>
                <th className="py-3 px-3">Students</th>
                <th className="py-3 px-3">Faculty</th>
                <th className="py-3 px-3">Avg Attendance</th>
                <th className="py-3 px-3 text-right">Accreditation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[
                {
                  dept: 'Computer Applications (BCA)',
                  hod: 'Dr. Priya Nair',
                  std: 478,
                  fac: 22,
                  att: '92.4%',
                  status: 'A++ (NAAC)',
                },
                {
                  dept: 'MCA Program',
                  hod: 'Dr. Suresh Pillai',
                  std: 185,
                  fac: 14,
                  att: '90.1%',
                  status: 'A+ (NAAC)',
                },
                {
                  dept: 'Business Administration (BBA)',
                  hod: 'Dr. Ramesh Gupta',
                  std: 355,
                  fac: 18,
                  att: '88.5%',
                  status: 'A (NAAC)',
                },
                {
                  dept: 'Commerce & Accounting (B.Com)',
                  hod: 'Prof. Meera Joshi',
                  std: 318,
                  fac: 16,
                  att: '91.0%',
                  status: 'A (NAAC)',
                },
                {
                  dept: 'Management Studies (MBA)',
                  hod: 'Dr. Vikram Seth',
                  std: 220,
                  fac: 12,
                  att: '93.2%',
                  status: 'A++ (NAAC)',
                },
              ].map((row) => (
                <tr key={row.dept} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-700 text-foreground">{row.dept}</td>
                  <td className="py-3 px-3 font-500 text-foreground">{row.hod}</td>
                  <td className="py-3 px-3 font-mono-data text-primary font-600">{row.std}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.fac}</td>
                  <td className="py-3 px-3 text-success font-600">{row.att}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="badge-violet text-[10px] px-2 py-0.5 rounded-md font-600">
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
