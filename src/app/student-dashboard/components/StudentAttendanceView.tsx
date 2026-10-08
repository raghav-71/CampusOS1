'use client';

import React, { useState } from 'react';
import PageTransition, { StaggerItem } from '@/components/motion/PageTransition';

interface SubjectAttendance {
  code: string;
  name: string;
  attended: number;
  total: number;
  percentage: number;
  instructor: string;
  status: 'Good' | 'Warning' | 'Critical';
}

const attendanceData: SubjectAttendance[] = [
  { code: 'CS501', name: 'Operating Systems', attended: 28, total: 30, percentage: 93.3, instructor: 'Dr. Priya Nair', status: 'Good' },
  { code: 'CS502', name: 'Database Management Systems', attended: 28, total: 32, percentage: 87.5, instructor: 'Prof. Rajesh Kumar', status: 'Good' },
  { code: 'CS503', name: 'Computer Networks', attended: 30, total: 38, percentage: 78.9, instructor: 'Dr. Amit Sen', status: 'Warning' },
  { code: 'CS504', name: 'Java Programming', attended: 40, total: 42, percentage: 95.2, instructor: 'Dr. Sunita Sharma', status: 'Good' },
  { code: 'CS505', name: 'Design & Analysis of Algorithms', attended: 24, total: 30, percentage: 80.0, instructor: 'Prof. Anand Verma', status: 'Good' },
];

const recentLogs = [
  { date: 'Aug 29, 2026', subject: 'Computer Networks (CS503)', time: '09:00 AM', status: 'Present', room: 'Room 304' },
  { date: 'Aug 29, 2026', subject: 'Java Programming (CS504)', time: '11:00 AM', status: 'Present', room: 'Lab 1' },
  { date: 'Aug 28, 2026', subject: 'Operating Systems (CS501)', time: '10:30 AM', status: 'Present', room: 'Room 301' },
  { date: 'Aug 28, 2026', subject: 'Computer Networks (CS503)', time: '02:00 PM', status: 'Absent', room: 'Room 304' },
  { date: 'Aug 27, 2026', subject: 'DBMS (CS502)', time: '09:00 AM', status: 'Present', room: 'Lab 2' },
];

export default function StudentAttendanceView() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [simulatorClasses, setSimulatorClasses] = useState<number>(5);

  const overallAttended = attendanceData.reduce((sum, s) => sum + s.attended, 0);
  const overallTotal = attendanceData.reduce((sum, s) => sum + s.total, 0);
  const overallPct = (overallAttended / overallTotal) * 100;

  const filteredSubjects = selectedSubject === 'all'
    ? attendanceData
    : attendanceData.filter((s) => s.code === selectedSubject);

  const openAICopilot = (query: string) => {
    window.dispatchEvent(new CustomEvent('campusos:open-ai', { detail: { query } }));
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-xl sm:text-2xl font-800 text-foreground tracking-tight">Student Attendance Portal</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Real-time attendance record · Minimum university requirement: <strong className="text-primary-dark font-bold">75.0%</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAICopilot('Analyze my attendance and calculate safe absences or needed sessions.')}
              className="btn-primary text-xs py-2 px-4 shadow-sm"
            >
              ✨ Ask AI Recovery Plan
            </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem order={1}>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <div className="text-xs text-muted-foreground font-medium mb-1">Cumulative Attendance</div>
              <div className="text-3xl font-extrabold text-foreground">{overallPct.toFixed(1)}%</div>
              <div className="text-[11px] text-primary-dark font-bold mt-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Eligible for University Exams (&gt;75%)</span>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem order={2}>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <div className="text-xs text-muted-foreground font-medium mb-1">Total Classes Attended</div>
              <div className="text-3xl font-extrabold text-foreground">{overallAttended} <span className="text-sm font-semibold text-muted-foreground">/ {overallTotal}</span></div>
              <div className="text-[11px] text-muted-foreground mt-1.5">Across 5 Enrolled BCA Courses</div>
            </div>
          </StaggerItem>

          <StaggerItem order={3}>
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
              <div className="text-xs text-amber-700 font-medium mb-1">Attention Required</div>
              <div className="text-2xl font-bold text-amber-800">Comp. Networks</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1.5">78.9% (Borderline Threshold)</div>
            </div>
          </StaggerItem>

          <StaggerItem order={4}>
            <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-sm">
              <div className="text-xs text-primary-dark font-medium mb-1">Highest Attendance</div>
              <div className="text-2xl font-bold text-primary-dark">Java Programming</div>
              <div className="text-[11px] text-primary-dark font-semibold mt-1.5">95.2% (40 / 42 Classes)</div>
            </div>
          </StaggerItem>
        </div>

        {/* Subject Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Course-by-Course Attendance Breakdown</h3>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-medium cursor-pointer focus:outline-none focus:border-primary shadow-sm"
            >
              <option value="all">All Subjects (5)</option>
              {attendanceData.map((s) => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub) => {
              const isWarning = sub.status === 'Warning';
              const isHigh = sub.percentage >= 90;
              return (
                <div
                  key={sub.code}
                  className={`bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
                    isWarning ? 'border-amber-300' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {sub.code}
                      </span>
                      <h4 className="text-base font-bold text-foreground mt-1.5">{sub.name}</h4>
                      <p className="text-xs text-muted-foreground font-normal">{sub.instructor}</p>
                    </div>
                    <div className={`text-xl font-extrabold ${isWarning ? 'text-amber-600' : isHigh ? 'text-primary-dark' : 'text-slate-800'}`}>
                      {sub.percentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Progress</span>
                      <span>{sub.attended} / {sub.total} classes</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWarning
                            ? 'bg-amber-500'
                            : isHigh
                              ? 'bg-primary'
                              : 'bg-emerald-600'
                        }`}
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                  </div>

                  {isWarning ? (
                    <div className="mt-3.5 pt-3 border-t border-amber-100 text-[11px] text-amber-800 font-medium flex items-center justify-between">
                      <span>⚠️ Only 3 classes above cutoff</span>
                      <button
                        onClick={() => openAICopilot(`Create an attendance plan for ${sub.name} so I do not fall below 75%.`)}
                        className="text-xs text-primary-dark hover:underline font-bold cursor-pointer"
                      >
                        Plan Recovery →
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px] text-primary-dark font-medium flex items-center justify-between">
                      <span>✓ Healthy attendance record</span>
                      <span className="text-[10px] bg-brand-50 text-primary-dark px-2 py-0.5 rounded font-bold border border-brand-100">Safe</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Attendance Simulator & Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-base font-bold text-foreground">Attendance Simulator</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Simulate your overall percentage if you attend or miss upcoming scheduled classes.
            </p>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Next Scheduled Classes:</span>
                <span className="text-primary-dark font-bold">{simulatorClasses} classes</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={simulatorClasses}
                onChange={(e) => setSimulatorClasses(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-100 text-center">
                <div className="text-[10px] text-primary-dark font-bold uppercase tracking-wider">Attend All</div>
                <div className="text-xl font-extrabold text-primary-dark mt-1">
                  {(((overallAttended + simulatorClasses) / (overallTotal + simulatorClasses)) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
                <div className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Miss All</div>
                <div className="text-xl font-extrabold text-red-700 mt-1">
                  {((overallAttended / (overallTotal + simulatorClasses)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Recent Daily Logs Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <h3 className="text-base font-bold text-foreground">Recent Attendance Ledger</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Last 5 Recorded Sessions</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs table-clean">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Subject</th>
                    <th>Room</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td className="font-mono-data text-foreground font-semibold">
                        {log.date} <span className="text-muted-foreground font-normal">· {log.time}</span>
                      </td>
                      <td className="font-bold text-foreground">{log.subject}</td>
                      <td className="text-muted-foreground">{log.room}</td>
                      <td className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            log.status === 'Present'
                              ? 'bg-brand-50 text-primary-dark border border-brand-100'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
