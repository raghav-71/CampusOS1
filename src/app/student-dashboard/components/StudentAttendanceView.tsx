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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-border/60 shadow-lg">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">📊</span>
              <h2 className="text-2xl font-800 text-foreground tracking-tight">Student Attendance Portal</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-500">
              Real-time attendance ledger · Mandatory minimum university cutoff: <strong className="text-accent font-700">75.0%</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAICopilot('Analyze my attendance and tell me how many classes I can safely miss or need to attend.')}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl shadow-glow cursor-pointer font-800 flex items-center gap-2"
            >
              <span>✨</span>
              <span>Ask AI Recovery Plan</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem order={1}>
            <div className="glass-card p-5 rounded-2xl border border-primary/30 shadow-sm relative overflow-hidden">
              <div className="text-xs text-muted-foreground font-600 mb-1">Cumulative Attendance</div>
              <div className="text-3xl font-900 text-foreground">{overallPct.toFixed(1)}%</div>
              <div className="text-[11px] text-emerald-400 font-700 mt-1">✓ Safe & Eligible (&gt;75%)</div>
              <div className="absolute right-3 bottom-3 text-4xl opacity-15">📈</div>
            </div>
          </StaggerItem>

          <StaggerItem order={2}>
            <div className="glass-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
              <div className="text-xs text-muted-foreground font-600 mb-1">Total Classes Attended</div>
              <div className="text-3xl font-900 text-accent">{overallAttended} <span className="text-sm font-600 text-muted-foreground">/ {overallTotal}</span></div>
              <div className="text-[11px] text-muted-foreground mt-1">Across 5 Enrolled Courses</div>
              <div className="absolute right-3 bottom-3 text-4xl opacity-15">🎓</div>
            </div>
          </StaggerItem>

          <StaggerItem order={3}>
            <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm relative overflow-hidden">
              <div className="text-xs text-amber-300 font-600 mb-1">Attention Required</div>
              <div className="text-2xl font-900 text-amber-400">Comp. Networks</div>
              <div className="text-[11px] text-amber-300 font-700 mt-1">78.9% (Borderline Warning)</div>
              <div className="absolute right-3 bottom-3 text-4xl opacity-15">⚠️</div>
            </div>
          </StaggerItem>

          <StaggerItem order={4}>
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm relative overflow-hidden">
              <div className="text-xs text-emerald-300 font-600 mb-1">Highest Attendance</div>
              <div className="text-2xl font-900 text-emerald-400">Java Programming</div>
              <div className="text-[11px] text-emerald-300 font-700 mt-1">95.2% (40 / 42 Classes)</div>
              <div className="absolute right-3 bottom-3 text-4xl opacity-15">⭐</div>
            </div>
          </StaggerItem>
        </div>

        {/* Subject Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-800 text-foreground">Course-by-Course Attendance Breakdown</h3>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-card/80 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-600 cursor-pointer focus:outline-none focus:border-accent"
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
              return (
                <div
                  key={sub.code}
                  className={`glass-card p-5 rounded-2xl border transition-all duration-200 hover:border-accent/50 ${
                    isWarning ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-700">
                        {sub.code}
                      </span>
                      <h4 className="text-base font-800 text-foreground mt-1.5">{sub.name}</h4>
                      <p className="text-xs text-muted-foreground font-500">{sub.instructor}</p>
                    </div>
                    <div className={`text-xl font-900 ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {sub.percentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center justify-between text-xs font-600 text-muted-foreground">
                      <span>Progress</span>
                      <span>{sub.attended} / {sub.total} classes</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWarning
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-primary to-accent'
                        }`}
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                  </div>

                  {isWarning && (
                    <div className="mt-3.5 pt-3 border-t border-amber-500/20 text-[11px] text-amber-300 font-600 flex items-center justify-between">
                      <span>⚠️ Only 3 classes above cutoff</span>
                      <button
                        onClick={() => openAICopilot(`Create an attendance plan for ${sub.name} so I do not fall below 75%.`)}
                        className="text-xs text-accent hover:underline font-700 cursor-pointer"
                      >
                        Plan Recovery →
                      </button>
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
          <div className="glass-card p-6 rounded-3xl border border-primary/30 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧮</span>
              <h3 className="text-base font-800 text-foreground">Attendance Simulator</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Simulate your overall percentage if you attend or miss upcoming scheduled classes.
            </p>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-700 text-foreground flex items-center justify-between">
                <span>Next Upcoming Classes:</span>
                <span className="text-accent font-900">{simulatorClasses} classes</span>
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
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-[10px] text-emerald-400 font-700 uppercase tracking-wider">If You Attend All</div>
                <div className="text-xl font-900 text-emerald-400 mt-1">
                  {(((overallAttended + simulatorClasses) / (overallTotal + simulatorClasses)) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
                <div className="text-[10px] text-rose-400 font-700 uppercase tracking-wider">If You Miss All</div>
                <div className="text-xl font-900 text-rose-400 mt-1">
                  {((overallAttended / (overallTotal + simulatorClasses)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Recent Daily Logs Table */}
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-border/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-base font-800 text-foreground">Recent Attendance Ledger</h3>
              </div>
              <span className="text-xs text-muted-foreground font-600">Last 5 Recorded Sessions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-700">
                    <th className="pb-3 px-2">Date & Time</th>
                    <th className="pb-3 px-2">Subject</th>
                    <th className="pb-3 px-2">Room</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-2 font-mono-data text-foreground font-600">
                        {log.date} <span className="text-muted-foreground">· {log.time}</span>
                      </td>
                      <td className="py-3 px-2 font-700 text-foreground">{log.subject}</td>
                      <td className="py-3 px-2 text-muted-foreground font-500">{log.room}</td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-800 ${
                            log.status === 'Present'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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
