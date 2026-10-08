'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { campusRepository } from '@/repositories/campusRepository';
import { useProfile } from '@/hooks/useProfile';
import { TeacherSubjectAssignment } from '@/types/campus';
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
  const { profile } = useProfile();
  const [students, setStudents] = useState<StudentAttendanceItem[]>(initialStudents);
  const [assignedSubjects, setAssignedSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionDate, setSessionDate] = useState('2026-08-25');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAssigned() {
      const email = profile?.email || 'dr.priya.nair@campusos.edu';
      const subjs = await campusRepository.getTeacherSubjects(email);
      setAssignedSubjects(subjs);
      if (subjs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjs[0].subjectId);
      }
    }
    loadAssigned();
  }, [profile?.email, selectedSubjectId]);

  const activeSubject =
    assignedSubjects.find((s) => s.subjectId === selectedSubjectId) ||
    assignedSubjects[0] || {
      subjectId: 'sub-os',
      subjectName: 'Operating Systems',
      subjectCode: 'CS501',
      semesterNumber: 5,
      section: 'A',
      room: 'Room A-204',
    };

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
        subject: activeSubject.subjectName,
        subjectCode: activeSubject.subjectCode,
        date: sessionDate,
        status: s.status,
        semesterNumber: (activeSubject.semesterNumber || 5) as any,
        section: activeSubject.section || 'A',
      }));

      await campusRepository.recordAttendance(records);
      toast.success(
        `Attendance saved for ${activeSubject.subjectName} (Sem ${activeSubject.semesterNumber}) on ${sessionDate}! Turnout: ${turnoutPct}% (${presentCount} Present, ${absentCount} Absent)`
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
          <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
            Live Lecture Attendance Register
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Mark, evaluate, and sync daily student lecture attendance for authorized BCA cohorts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-white border border-black/[0.08] rounded-[11px] px-3 py-2 text-xs text-[#1D1D1F] font-medium outline-none cursor-pointer focus:border-primary"
          >
            {assignedSubjects.map((sub) => (
              <option key={sub.subjectId} value={sub.subjectId}>
                Semester {sub.semesterNumber} — {sub.subjectName} ({sub.subjectCode} · Sec {sub.section})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="bg-white border border-black/[0.08] rounded-[11px] px-3 py-2 text-xs text-[#1D1D1F] font-mono-data outline-none cursor-pointer focus:border-primary"
          />

          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveRegister}
            className="font-semibold shadow-xs"
          >
            {isSaving ? 'Saving...' : 'Save Register'}
          </Button>
        </div>
      </div>

      {/* Summary Bento Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[11px] text-[#6E6E73] mb-1 font-semibold uppercase tracking-wider">Total Strength</p>
          <p className="text-2xl font-bold text-[#1D1D1F] metric-value">{students.length}</p>
          <p className="text-[11px] text-[#6E6E73] mt-0.5">Enrolled batch (Section A)</p>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[11px] text-[#6E6E73] mb-1 font-semibold uppercase tracking-wider">Present Today</p>
          <p className="text-2xl font-bold text-primary-dark metric-value">{presentCount}</p>
          <p className="text-[11px] text-primary-dark font-medium mt-0.5">Active in class</p>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[11px] text-[#6E6E73] mb-1 font-semibold uppercase tracking-wider">Late Arrivals</p>
          <p className="text-2xl font-bold text-warning metric-value">{lateCount}</p>
          <p className="text-[11px] text-warning font-medium mt-0.5">Permitted with remark</p>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-black/[0.06] shadow-card">
          <p className="text-[11px] text-[#6E6E73] mb-1 font-semibold uppercase tracking-wider">Absentees</p>
          <p className="text-2xl font-bold text-danger metric-value">{absentCount}</p>
          <p className="text-[11px] text-[#6E6E73] mt-0.5 font-mono-data">{turnoutPct}% Turnout Rate</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-3.5 bg-white rounded-[16px] border border-black/[0.06] shadow-card">
        <span className="text-xs font-semibold text-[#1D1D1F]">
          BCA Sem 5 Roster ({students.length} students)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('present')}
            className="text-xs px-3 py-1.5 rounded-[10px] bg-[#F5F5F7] hover:bg-black/[0.06] text-[#1D1D1F] cursor-pointer font-semibold transition-all active:scale-[0.98]"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="text-xs px-3 py-1.5 rounded-[10px] text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] cursor-pointer font-semibold transition-all active:scale-[0.98]"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Students Roll Call Table */}
      <div className="bg-white rounded-[18px] border border-black/[0.06] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#FAFAFC] border-b border-black/[0.06] text-[#6E6E73] font-semibold text-left">
                <th className="py-3.5 px-4 font-medium">Roll Number</th>
                <th className="py-3.5 px-4 font-medium">Student Name</th>
                <th className="py-3.5 px-4 font-medium">Term Average</th>
                <th className="py-3.5 px-4 text-right font-medium">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono-data font-semibold text-[#1D1D1F]">
                    {std.rollNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1D1D1F]">{std.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold font-mono-data ${
                        std.previousAttendancePct >= 90
                          ? 'text-primary-dark'
                          : std.previousAttendancePct >= 75
                            ? 'text-emerald-600'
                            : 'text-danger'
                      }`}
                    >
                      {std.previousAttendancePct}% {std.previousAttendancePct < 75 && '⚠️'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-[10px] bg-[#F5F5F7] border border-black/[0.04]">
                      <button
                        onClick={() => setStatus(std.id, 'present')}
                        className={`px-2.5 py-1 rounded-[8px] font-semibold text-[11px] transition-all cursor-pointer active:scale-[0.98] ${
                          std.status === 'present'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStatus(std.id, 'late')}
                        className={`px-2.5 py-1 rounded-[8px] font-semibold text-[11px] transition-all cursor-pointer active:scale-[0.98] ${
                          std.status === 'late'
                            ? 'bg-warning text-white shadow-xs'
                            : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStatus(std.id, 'absent')}
                        className={`px-2.5 py-1 rounded-[8px] font-semibold text-[11px] transition-all cursor-pointer active:scale-[0.98] ${
                          std.status === 'absent'
                            ? 'bg-danger text-white shadow-xs'
                            : 'text-[#6E6E73] hover:text-[#1D1D1F]'
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
