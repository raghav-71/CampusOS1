'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TeacherFilterState, TeacherSubjectAssignment } from '@/types/campus';
import { getSubjectColor } from '@/lib/academicColors';
import { campusRepository } from '@/repositories/campusRepository';
import { notificationService } from '@/services/notificationService';
import { useProfile } from '@/hooks/useProfile';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TeacherFilterBar from './TeacherFilterBar';
import AnimatedCard from '@/components/motion/AnimatedCard';
import MagneticButton from '@/components/motion/MagneticButton';

export interface ClassRosterItem {
  roll: string;
  name: string;
  att: string;
  status: 'good' | 'warning' | 'danger';
  recentGrade: string;
}

const mockRosterBySubject: Record<string, ClassRosterItem[]> = {
  default: [
    { roll: 'BCA2401', name: 'Arjun Sharma', att: '93.3%', status: 'good', recentGrade: 'A+' },
    { roll: 'BCA2402', name: 'Priya Menon', att: '96.0%', status: 'good', recentGrade: 'O' },
    { roll: 'BCA2403', name: 'Rohit Verma', att: '68.5%', status: 'danger', recentGrade: 'B' },
    { roll: 'BCA2404', name: 'Sneha Pillai', att: '96.5%', status: 'good', recentGrade: 'O' },
    { roll: 'BCA2405', name: 'Karthik Nambiar', att: '82.0%', status: 'good', recentGrade: 'A' },
    { roll: 'BCA2406', name: 'Ananya Das', att: '95.0%', status: 'good', recentGrade: 'A+' },
    { roll: 'BCA2442', name: 'Vikram Mehta', att: '68.5%', status: 'danger', recentGrade: 'C' },
  ],
};

interface TeacherClassesViewProps {
  externalFilters?: TeacherFilterState;
}

export default function TeacherClassesView({ externalFilters }: TeacherClassesViewProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const [assignedClasses, setAssignedClasses] = useState<TeacherSubjectAssignment[]>([]);
  const [liveSubjectIds, setLiveSubjectIds] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<TeacherSubjectAssignment | null>(null);
  const [startingClassId, setStartingClassId] = useState<string | null>(null);

  const [internalFilters, setInternalFilters] = useState<TeacherFilterState>({
    gradeYear: 'all',
    semester: 'all',
    subject: 'all',
    section: 'all',
  });

  const filters = externalFilters || internalFilters;
  const setFilters = setInternalFilters;

  useEffect(() => {
    async function loadData() {
      const teacherEmail = profile?.email || 'dr.priya.nair@campusos.edu';
      const classes = await campusRepository.getTeacherSubjects(teacherEmail);
      setAssignedClasses(classes);
    }
    loadData();
  }, [profile?.email]);

  const handleStartClass = async (cls: TeacherSubjectAssignment) => {
    setStartingClassId(cls.subjectId);
    try {
      await new Promise((r) => setTimeout(r, 450));
      await notificationService.triggerClassStart(
        profile?.id || 'usr-003',
        profile?.fullName || 'Dr. Priya Nair',
        cls.subjectName,
        cls.semesterNumber,
        cls.section,
        cls.room
      );
      setLiveSubjectIds((prev) => [...prev, cls.subjectId]);
      toast.success(`Lecture session LIVE for ${cls.subjectName}! Students notified.`);
    } catch (err: any) {
      toast.error('Failed to start class: ' + err.message);
    } finally {
      setStartingClassId(null);
    }
  };

  const handleLaunchAttendance = (className: string) => {
    router.push('/teacher-dashboard?tab=attendance');
  };

  // Apply filtering
  const filteredClasses = assignedClasses.filter((cls) => {
    if (filters.gradeYear !== 'all' && cls.year !== parseInt(filters.gradeYear, 10)) {
      return false;
    }
    if (filters.semester !== 'all' && cls.semesterNumber !== parseInt(filters.semester, 10)) {
      return false;
    }
    if (
      filters.subject !== 'all' &&
      !cls.subjectName.toLowerCase().includes(filters.subject.toLowerCase())
    ) {
      return false;
    }
    if (filters.section !== 'all' && cls.section !== filters.section) {
      return false;
    }
    return true;
  });

  const totalStudentsInScope = filteredClasses.reduce((sum, c) => sum + c.enrolledStudents, 0);

  // Group classes by Semester
  const groupedBySemester = filteredClasses.reduce<Record<number, TeacherSubjectAssignment[]>>(
    (acc, cls) => {
      if (!acc[cls.semesterNumber]) acc[cls.semesterNumber] = [];
      acc[cls.semesterNumber].push(cls);
      return acc;
    },
    {}
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>👥</span> My Assigned Subjects & BCA Cohorts
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only showing courses assigned to {profile?.fullName || 'you'} · {filteredClasses.length} active classes · {totalStudentsInScope} students
            </p>
          </div>
          <Badge variant="cyan">BCA Academic Year 2026</Badge>
        </div>

        {/* Filter Bar */}
        <TeacherFilterBar
          filters={filters}
          onChange={setFilters}
          totalFilteredStudents={totalStudentsInScope}
        />

        {filteredClasses.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground border border-border/80 space-y-2 animate-fade-in">
            <p className="text-base font-700 text-foreground">No Classes Match Current Filters</p>
            <p className="text-xs">
              Adjust your Semester or Section filters to view your other assigned BCA courses.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {Object.keys(groupedBySemester)
              .map(Number)
              .sort((a, b) => b - a)
              .map((semNum) => {
                const classesInSem = groupedBySemester[semNum];
                const yearNum = Math.ceil(semNum / 2);

                return (
                  <div key={`sem-grp-${semNum}`} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/60">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center font-800 text-primary text-xs">
                        S{semNum}
                      </div>
                      <div>
                        <h3 className="text-base font-800 text-foreground">
                          BCA Semester {semNum} (Year {yearNum})
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {classesInSem.length} Assigned Course(s) in this term
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {classesInSem.map((cls) => {
                        const colorDef = getSubjectColor(cls.subjectName);
                        const isLive = liveSubjectIds.includes(cls.subjectId);
                        const isStarting = startingClassId === cls.subjectId;

                        return (
                          <AnimatedCard
                            key={`${cls.subjectId}-${cls.section}`}
                            className={`p-6 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden ${
                              isLive
                                ? 'border-accent shadow-glow-accent'
                                : 'border-border/80 hover:border-primary/50 hover:shadow-glow'
                            }`}
                          >
                            {isLive && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent animate-pulse" />
                            )}

                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-lg font-700 border ${colorDef.badgeBg} ${colorDef.badgeBorder} ${colorDef.badgeText}`}
                                >
                                  {cls.subjectCode} · Sec {cls.section}
                                </span>
                                {isLive ? (
                                  <span className="badge-cyan text-[10px] px-2.5 py-0.5 rounded-full font-800 animate-pulse flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                                    LIVE NOW
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground font-700 font-mono-data">
                                    {cls.credits} Credits · {cls.type}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-lg font-800 text-foreground mb-1 flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ background: colorDef.hex }}
                                />
                                {cls.subjectName}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-4 font-500">
                                Location: <span className="text-foreground font-700">{cls.room}</span>
                              </p>

                              <div className="space-y-3 p-3.5 rounded-2xl bg-muted/20 border border-border/40 mb-4">
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1 font-700">
                                    <span className="text-muted-foreground font-600">Syllabus Progress</span>
                                    <span className="font-800 metric-value" style={{ color: colorDef.hex }}>
                                      {cls.syllabusCoveredPct}%
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{
                                        width: `${cls.syllabusCoveredPct}%`,
                                        background: `linear-gradient(90deg, ${colorDef.hex}, #00D4FF)`,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                  <span className="text-muted-foreground font-600">Class Attendance Avg</span>
                                  <span
                                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-800 ${
                                      cls.avgAttendancePct >= 90 ? 'badge-success' : 'badge-warning'
                                    }`}
                                  >
                                    {cls.avgAttendancePct}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectedClass(cls)}
                                  className="w-full text-xs font-700"
                                >
                                  Roster ({cls.enrolledStudents})
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLaunchAttendance(cls.subjectName)}
                                  className="w-full text-xs font-700"
                                >
                                  Attendance
                                </Button>
                              </div>

                              <MagneticButton
                                variant={isLive ? 'accent' : 'primary'}
                                size="sm"
                                onClick={() => handleStartClass(cls)}
                                disabled={isStarting}
                                className="w-full text-xs font-800 shadow-glow"
                              >
                                {isStarting
                                  ? 'Starting Session...'
                                  : isLive
                                  ? '✓ Session is Active'
                                  : '▶ Start Class & Notify Students'}
                              </MagneticButton>
                            </div>
                          </AnimatedCard>
                        );
                      })}
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
          title={`Class Roster: ${selectedClass.subjectName} (Section ${selectedClass.section})`}
          description={`BCA Semester ${selectedClass.semesterNumber} · ${selectedClass.enrolledStudents} Enrolled Students`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedClass(null)}>
              Close Roster
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 border-b border-border/50 font-700 uppercase tracking-wider">
              <span>Student Details</span>
              <span>Attendance & Standing</span>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {mockRosterBySubject.default.map((s) => (
                <div
                  key={s.roll}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs row-hover-glow transition-all ${
                    s.status === 'danger'
                      ? 'bg-danger/10 border-danger/30'
                      : 'bg-muted/20 border-border/40'
                  }`}
                >
                  <div>
                    <span className="font-800 text-foreground">{s.name}</span>
                    <span className="text-muted-foreground font-mono-data ml-2 font-600">({s.roll})</span>
                    <span className="text-[10px] text-muted-foreground ml-2 font-mono-data font-700">
                      Grade: {s.recentGrade}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-800 ${
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
