'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TeacherFilterState } from '@/types/campus';
import { getSubjectColor } from '@/lib/academicColors';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TeacherFilterBar from './TeacherFilterBar';

export interface ClassBatchEntity {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  semesterNumber: number;
  gradeYear: number;
  section: string;
  enrolledStudents: number;
  avgAttendancePct: number;
  syllabusCoveredPct: number;
  room: string;
  nextLecture: string;
  roster: {
    roll: string;
    name: string;
    att: string;
    status: 'good' | 'warning' | 'danger';
    recentGrade: string;
  }[];
}

export const ALL_TEACHER_CLASSES: ClassBatchEntity[] = [
  // Class 1: BCA Sem 5 Theory Section A
  {
    id: 'cls-bca5-os-a',
    name: 'Operating Systems',
    code: 'CS501',
    department: 'BCA',
    semester: 'Semester 5',
    semesterNumber: 5,
    gradeYear: 3,
    section: 'A',
    enrolledStudents: 64,
    avgAttendancePct: 91.4,
    syllabusCoveredPct: 72,
    room: 'Room A-204',
    nextLecture: 'Today, 10:30 AM',
    roster: [
      { roll: 'BCA2401', name: 'Arjun Sharma', att: '93.3%', status: 'good', recentGrade: 'A+' },
      { roll: 'BCA2402', name: 'Priya Menon', att: '91.0%', status: 'good', recentGrade: 'O' },
      { roll: 'BCA2403', name: 'Rohit Verma', att: '68.5%', status: 'danger', recentGrade: 'B' },
      { roll: 'BCA2404', name: 'Sneha Pillai', att: '96.5%', status: 'good', recentGrade: 'O' },
      { roll: 'BCA2405', name: 'Karthik Nambiar', att: '82.0%', status: 'good', recentGrade: 'A' },
      { roll: 'BCA2406', name: 'Ananya Das', att: '95.0%', status: 'good', recentGrade: 'A+' },
      { roll: 'BCA2442', name: 'Vikram Mehta', att: '68.5%', status: 'danger', recentGrade: 'C' },
    ],
  },
  // Class 2: BCA Sem 5 Lab Practical Batch 1
  {
    id: 'cls-bca5-oslab-b1',
    name: 'OS Lab Practical',
    code: 'CS501L',
    department: 'BCA',
    semester: 'Semester 5',
    semesterNumber: 5,
    gradeYear: 3,
    section: 'Batch 1',
    enrolledStudents: 32,
    avgAttendancePct: 95.0,
    syllabusCoveredPct: 80,
    room: 'Systems Lab 1',
    nextLecture: 'Today, 1:30 PM',
    roster: [
      { roll: 'BCA2401', name: 'Arjun Sharma', att: '95.0%', status: 'good', recentGrade: 'O' },
      { roll: 'BCA2402', name: 'Priya Menon', att: '98.0%', status: 'good', recentGrade: 'O' },
      { roll: 'BCA2404', name: 'Sneha Pillai', att: '94.0%', status: 'good', recentGrade: 'A+' },
    ],
  },
  // Class 3: MCA Sem 3 Theory Section B
  {
    id: 'cls-mca3-sa-b',
    name: 'System Architecture',
    code: 'MCA302',
    department: 'MCA',
    semester: 'Semester 3',
    semesterNumber: 3,
    gradeYear: 2,
    section: 'B',
    enrolledStudents: 42,
    avgAttendancePct: 88.6,
    syllabusCoveredPct: 60,
    room: 'MCA Hall B',
    nextLecture: 'Today, 4:00 PM',
    roster: [
      { roll: 'MCA2501', name: 'Rahul Deshmukh', att: '88.0%', status: 'good', recentGrade: 'A' },
      { roll: 'MCA2509', name: 'Pooja Hegde', att: '92.0%', status: 'good', recentGrade: 'A+' },
      { roll: 'MCA2519', name: 'Ananya Gupta', att: '62.0%', status: 'danger', recentGrade: 'C' },
    ],
  },
];

interface TeacherClassesViewProps {
  externalFilters?: TeacherFilterState;
}

export default function TeacherClassesView({ externalFilters }: TeacherClassesViewProps) {
  const router = useRouter();
  const [internalFilters, setInternalFilters] = useState<TeacherFilterState>({
    gradeYear: 'all',
    semester: 'all',
    subject: 'all',
    section: 'all',
  });

  const filters = externalFilters || internalFilters;
  const setFilters = setInternalFilters;

  const [selectedClass, setSelectedClass] = useState<ClassBatchEntity | null>(null);

  // Apply multi-parameter filtering
  const filteredClasses = ALL_TEACHER_CLASSES.filter((cls) => {
    if (filters.gradeYear !== 'all' && cls.gradeYear !== parseInt(filters.gradeYear, 10)) {
      return false;
    }
    if (filters.semester !== 'all' && cls.semesterNumber !== parseInt(filters.semester, 10)) {
      return false;
    }
    if (filters.subject !== 'all' && !cls.name.toLowerCase().includes(filters.subject.toLowerCase())) {
      return false;
    }
    if (filters.section !== 'all' && cls.section !== filters.section) {
      return false;
    }
    return true;
  });

  const totalStudentsInScope = filteredClasses.reduce((sum, c) => sum + c.enrolledStudents, 0);

  const handleLaunchAttendance = (className: string) => {
    router.push('/teacher-dashboard?tab=attendance');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight">
              Assigned Courses, Classes & Student Cohorts
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Grade-separated course management · {filteredClasses.length} active classes · {totalStudentsInScope} students in scope
            </p>
          </div>
          <Badge variant="cyan">Fall 2026 Live</Badge>
        </div>

        {/* Filter Bar */}
        <TeacherFilterBar
          filters={filters}
          onChange={setFilters}
          totalFilteredStudents={totalStudentsInScope}
        />

        {/* Filtered Classes List */}
        {filteredClasses.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground border border-border/80 space-y-2">
            <p className="text-base font-700 text-foreground">No Classes Match Current Filters</p>
            <p className="text-xs">
              Try adjusting your Grade, Semester, Subject, or Section filters to view other assigned courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredClasses.map((cls) => {
              const colorDef = getSubjectColor(cls.name);
              return (
                <div
                  key={cls.id}
                  className="glass-card rounded-3xl p-5 border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between shadow-sm hover:shadow-glow"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-lg font-700 border ${colorDef.badgeBg} ${colorDef.badgeBorder} ${colorDef.badgeText}`}
                      >
                        {cls.code} · Sec {cls.section}
                      </span>
                      <span className="text-xs text-muted-foreground font-600">
                        {cls.department} · {cls.semester}
                      </span>
                    </div>

                    <h3 className="text-lg font-800 text-foreground mb-1 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: colorDef.hex }}
                      />
                      {cls.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Location: <span className="text-foreground font-600">{cls.room}</span> &nbsp;·&nbsp; Next: {cls.nextLecture}
                    </p>

                    <div className="space-y-3 p-3.5 rounded-2xl bg-muted/20 border border-border/40 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground font-500">Syllabus Progress</span>
                          <span className="font-700 metric-value" style={{ color: colorDef.hex }}>
                            {cls.syllabusCoveredPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cls.syllabusCoveredPct}%`,
                              background: `linear-gradient(90deg, ${colorDef.hex}, #00D4FF)`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <span className="text-muted-foreground">Class Attendance Avg</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-700 ${
                            cls.avgAttendancePct >= 90 ? 'badge-success' : 'badge-warning'
                          }`}
                        >
                          {cls.avgAttendancePct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedClass(cls)}
                      className="w-full text-xs font-600"
                    >
                      View Roster ({cls.enrolledStudents})
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLaunchAttendance(cls.name)}
                      className="w-full text-xs font-700 shadow-glow"
                    >
                      Mark Attendance
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Class Roster Modal */}
      {selectedClass && (
        <Modal
          isOpen={Boolean(selectedClass)}
          onClose={() => setSelectedClass(null)}
          maxWidth="lg"
          title={`Class Roster: ${selectedClass.name} (Section ${selectedClass.section})`}
          description={`${selectedClass.department} ${selectedClass.semester} · ${selectedClass.enrolledStudents} Enrolled Students`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedClass(null)}>
              Close Roster
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 border-b border-border/50">
              <span>Student Details</span>
              <span>Attendance & Standing</span>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {selectedClass.roster.map((s) => (
                <div
                  key={s.roll}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    s.status === 'danger'
                      ? 'bg-danger/10 border-danger/30'
                      : 'bg-muted/20 border-border/40'
                  }`}
                >
                  <div>
                    <span className="font-700 text-foreground">{s.name}</span>
                    <span className="text-muted-foreground font-mono-data ml-2">({s.roll})</span>
                    <span className="text-[10px] text-muted-foreground ml-2">Grade: {s.recentGrade}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-700 ${
                      s.status === 'danger' ? 'badge-danger' : 'badge-success'
                    }`}
                  >
                    Att: {s.att} {s.status === 'danger' && '⚠️ (<75%)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
