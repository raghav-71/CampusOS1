'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface StudentAttendanceItem {
  id: string;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late';
  previousAttendancePct: number;
}

const initialStudents: StudentAttendanceItem[] = [
  {
    id: 'std-1',
    name: 'Arjun Sharma',
    rollNumber: 'BCA2401',
    status: 'present',
    previousAttendancePct: 94.2,
  },
  {
    id: 'std-2',
    name: 'Priya Menon',
    rollNumber: 'BCA2402',
    status: 'present',
    previousAttendancePct: 91.0,
  },
  {
    id: 'std-3',
    name: 'Rohit Verma',
    rollNumber: 'BCA2403',
    status: 'absent',
    previousAttendancePct: 78.4,
  },
  {
    id: 'std-4',
    name: 'Sneha Pillai',
    rollNumber: 'BCA2404',
    status: 'present',
    previousAttendancePct: 96.5,
  },
  {
    id: 'std-5',
    name: 'Karthik Nambiar',
    rollNumber: 'BCA2405',
    status: 'late',
    previousAttendancePct: 82.0,
  },
  {
    id: 'std-6',
    name: 'Ananya Das',
    rollNumber: 'BCA2406',
    status: 'present',
    previousAttendancePct: 95.0,
  },
  {
    id: 'std-7',
    name: 'Varun Krishnan',
    rollNumber: 'BCA2407',
    status: 'present',
    previousAttendancePct: 89.2,
  },
  {
    id: 'std-8',
    name: 'Divya Nair',
    rollNumber: 'BCA2408',
    status: 'present',
    previousAttendancePct: 92.8,
  },
];

export default function TeacherAttendanceRegister() {
  const [students, setStudents] = useState<StudentAttendanceItem[]>(initialStudents);
  const [selectedBatch, setSelectedBatch] = useState('BCA-Sem5-OS');
  const [sessionDate, setSessionDate] = useState('2026-08-23');

  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const turnoutPct = Math.round(((presentCount + lateCount * 0.5) / students.length) * 100);

  const setStatus = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const markAll = (status: 'present' | 'absent') => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    toast.success(`Marked all students as ${status}`);
  };

  const handleSaveRegister = () => {
    toast.success(
      `Attendance saved for ${selectedBatch} on ${sessionDate}! Turnout: ${turnoutPct}% (${presentCount} Present, ${absentCount} Absent)`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-700 text-foreground">Live Lecture Attendance Register</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mark, evaluate, and sync daily student lecture attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="BCA-Sem5-OS">BCA Sem 5 — Operating Systems (Room A-204)</option>
            <option value="BCA-Sem5-OSLab">BCA Sem 5 — OS Lab Batch A (Systems Lab 1)</option>
            <option value="MCA-Sem3-SA">MCA Sem 3 — System Architecture (Hall B)</option>
          </select>

          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
          />

          <Button variant="primary" size="sm" onClick={handleSaveRegister}>
            Save Register
          </Button>
        </div>
      </div>

      {/* Summary Bento Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Strength</p>
          <p className="text-2xl font-800 text-foreground metric-value">{students.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Enrolled batch</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-success/30">
          <p className="text-xs text-muted-foreground mb-1">Present Today</p>
          <p className="text-2xl font-800 text-success metric-value">{presentCount}</p>
          <p className="text-[11px] text-success font-600 mt-0.5">Active in class</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-warning/30">
          <p className="text-xs text-muted-foreground mb-1">Late Arrivals</p>
          <p className="text-2xl font-800 text-warning metric-value">{lateCount}</p>
          <p className="text-[11px] text-warning font-600 mt-0.5">Permitted with remark</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-danger/30">
          <p className="text-xs text-muted-foreground mb-1">Absentees</p>
          <p className="text-2xl font-800 text-danger metric-value">{absentCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{turnoutPct}% Turnout Rate</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-3 glass-card rounded-2xl border border-border/80">
        <span className="text-xs font-600 text-foreground">
          Batch Roster ({students.length} students)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('present')}
            className="text-xs btn-secondary px-3 py-1.5 cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="text-xs btn-ghost px-3 py-1.5 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Students Roll Call Table */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Term Average</th>
                <th className="py-3.5 px-4 text-right">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono-data font-600 text-foreground">
                    {std.rollNumber}
                  </td>
                  <td className="py-3.5 px-4 font-600 text-foreground">{std.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-600 ${
                        std.previousAttendancePct >= 90
                          ? 'text-success'
                          : std.previousAttendancePct >= 80
                            ? 'text-accent'
                            : 'text-warning'
                      }`}
                    >
                      {std.previousAttendancePct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
                      <button
                        onClick={() => setStatus(std.id, 'present')}
                        className={`px-2.5 py-1 rounded-lg font-600 transition-all cursor-pointer ${
                          std.status === 'present'
                            ? 'bg-success text-white shadow-glow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStatus(std.id, 'late')}
                        className={`px-2.5 py-1 rounded-lg font-600 transition-all cursor-pointer ${
                          std.status === 'late'
                            ? 'bg-warning text-black shadow-glow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStatus(std.id, 'absent')}
                        className={`px-2.5 py-1 rounded-lg font-600 transition-all cursor-pointer ${
                          std.status === 'absent'
                            ? 'bg-danger text-white shadow-glow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
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
