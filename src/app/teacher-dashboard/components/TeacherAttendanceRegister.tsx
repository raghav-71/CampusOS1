'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { campusRepository } from '@/repositories/campusRepository';
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
    id: 'usr-001',
    name: 'Arjun Sharma',
    rollNumber: 'BCA2401',
    status: 'present',
    previousAttendancePct: 93.3,
  },
  {
    id: 'usr-002',
    name: 'Priya Menon',
    rollNumber: 'BCA2402',
    status: 'present',
    previousAttendancePct: 96.0,
  },
  {
    id: 'usr-004',
    name: 'Rohit Verma',
    rollNumber: 'BCA2403',
    status: 'absent',
    previousAttendancePct: 68.5,
  },
  {
    id: 'usr-006',
    name: 'Sneha Pillai',
    rollNumber: 'BCA2404',
    status: 'present',
    previousAttendancePct: 96.5,
  },
  {
    id: 'usr-008',
    name: 'Karthik Nambiar',
    rollNumber: 'BCA2405',
    status: 'late',
    previousAttendancePct: 82.0,
  },
  {
    id: 'usr-009',
    name: 'Ananya Das',
    rollNumber: 'BCA2406',
    status: 'present',
    previousAttendancePct: 95.0,
  },
  {
    id: 'usr-011',
    name: 'Vikram Mehta',
    rollNumber: 'BCA2442',
    status: 'absent',
    previousAttendancePct: 68.5,
  },
];

export default function TeacherAttendanceRegister() {
  const [students, setStudents] = useState<StudentAttendanceItem[]>(initialStudents);
  const [selectedBatch, setSelectedBatch] = useState('BCA-Sem5-OS');
  const [sessionDate, setSessionDate] = useState('2026-08-25');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveRegister = async () => {
    setIsSaving(true);
    try {
      const records = students.map((s) => ({
        id: `att-${Date.now()}-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        subject: 'Operating Systems',
        subjectCode: 'CS501',
        date: sessionDate,
        status: s.status,
        semesterNumber: 5 as const,
        section: 'A',
      }));

      await campusRepository.recordAttendance(records);
      toast.success(
        `Attendance saved for ${selectedBatch} on ${sessionDate}! Turnout: ${turnoutPct}% (${presentCount} Present, ${absentCount} Absent)`
      );
    } catch (err: any) {
      toast.error('Failed to save attendance: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-800 text-foreground tracking-tight">
            Live Lecture Attendance Register
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mark, evaluate, and sync daily student lecture attendance for BCA cohorts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-600 outline-none cursor-pointer"
          >
            <option value="BCA-Sem5-OS">BCA Sem 5 — Operating Systems (Room A-204)</option>
            <option value="BCA-Sem5-OSLab">BCA Sem 5 — OS Lab Batch 1 (Systems Lab 1)</option>
            <option value="BCA-Sem3-DSA">BCA Sem 3 — Data Structures (Hall B-102)</option>
          </select>

          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono-data outline-none cursor-pointer"
          />

          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveRegister}
            className="shadow-glow font-700"
          >
            {isSaving ? 'Saving...' : 'Save Register'}
          </Button>
        </div>
      </div>

      {/* Summary Bento Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1 font-700 uppercase tracking-wider">Total Strength</p>
          <p className="text-2xl font-800 text-foreground metric-value">{students.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Enrolled batch (Section A)</p>
        </div>

        <div className="glass-card rounded-3xl p-4 border border-success/30">
          <p className="text-xs text-muted-foreground mb-1 font-700 uppercase tracking-wider">Present Today</p>
          <p className="text-2xl font-800 text-success metric-value">{presentCount}</p>
          <p className="text-[11px] text-success font-600 mt-0.5">Active in class</p>
        </div>

        <div className="glass-card rounded-3xl p-4 border border-warning/30">
          <p className="text-xs text-muted-foreground mb-1 font-700 uppercase tracking-wider">Late Arrivals</p>
          <p className="text-2xl font-800 text-warning metric-value">{lateCount}</p>
          <p className="text-[11px] text-warning font-600 mt-0.5">Permitted with remark</p>
        </div>

        <div className="glass-card rounded-3xl p-4 border border-danger/30">
          <p className="text-xs text-muted-foreground mb-1 font-700 uppercase tracking-wider">Absentees</p>
          <p className="text-2xl font-800 text-danger metric-value">{absentCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono-data">{turnoutPct}% Turnout Rate</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-3.5 glass-card rounded-3xl border border-border/80">
        <span className="text-xs font-700 text-foreground">
          BCA Sem 5 Roster ({students.length} students)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('present')}
            className="text-xs btn-secondary px-3 py-1.5 rounded-xl cursor-pointer font-600"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="text-xs btn-ghost px-3 py-1.5 rounded-xl cursor-pointer font-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Students Roll Call Table */}
      <div className="glass-card rounded-3xl border border-border overflow-hidden">
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
                  <td className="py-3.5 px-4 font-mono-data font-700 text-foreground">
                    {std.rollNumber}
                  </td>
                  <td className="py-3.5 px-4 font-700 text-foreground">{std.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-700 font-mono-data ${
                        std.previousAttendancePct >= 90
                          ? 'text-success'
                          : std.previousAttendancePct >= 75
                            ? 'text-accent'
                            : 'text-danger'
                      }`}
                    >
                      {std.previousAttendancePct}% {std.previousAttendancePct < 75 && '⚠️'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60">
                      <button
                        onClick={() => setStatus(std.id, 'present')}
                        className={`px-3 py-1 rounded-xl font-700 transition-all cursor-pointer ${
                          std.status === 'present'
                            ? 'bg-success text-white shadow-glow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStatus(std.id, 'late')}
                        className={`px-3 py-1 rounded-xl font-700 transition-all cursor-pointer ${
                          std.status === 'late'
                            ? 'bg-warning text-black shadow-glow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStatus(std.id, 'absent')}
                        className={`px-3 py-1 rounded-xl font-700 transition-all cursor-pointer ${
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
