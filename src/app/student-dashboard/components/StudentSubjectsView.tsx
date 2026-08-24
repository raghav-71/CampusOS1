'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockSubjects } from '@/repositories/mockData';
import { PROGRAM_SEMESTERS, getSemesterInfo } from '@/lib/academicModel';
import { getSubjectColor } from '@/lib/academicColors';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function StudentSubjectsView() {
  const router = useRouter();
  const [activeSemester, setActiveSemester] = useState<number>(5);

  const filteredSubjects = mockSubjects.filter((s) => s.semesterNumber === activeSemester);
  const totalCredits = filteredSubjects.reduce((sum, s) => sum + (s.credits || 0), 0);
  const currentSemInfo = getSemesterInfo(activeSemester);

  const handleAskAI = (subjectName: string) => {
    toast.info(`Launching AI Tutor tailored for ${subjectName}`);
    router.push('/student-dashboard?tab=ai');
  };

  const handleViewNotes = (subjectName: string) => {
    router.push('/student-dashboard?tab=notes');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-800 text-foreground tracking-tight">
            Academic Curriculum & Enrolled Subjects
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentSemInfo.label} ({currentSemInfo.term}) · {totalCredits} Total Course Credits Registered
          </p>
        </div>
        <Badge variant={activeSemester === 5 ? 'cyan' : 'muted'}>
          {activeSemester === 5 ? 'Active Current Term' : `Completed Term (Sem ${activeSemester})`}
        </Badge>
      </div>

      {/* 3D Blue Semester Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl border border-primary/30 overflow-x-auto no-scrollbar shadow-glass">
        {PROGRAM_SEMESTERS.map((sem) => {
          const isSelected = activeSemester === sem.semester;
          return (
            <button
              key={sem.semester}
              onClick={() => setActiveSemester(sem.semester)}
              className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-xl text-xs font-700 transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-glow border border-primary/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <div>{sem.label}</div>
              <div className="text-[10px] opacity-75 font-normal">{sem.term}</div>
            </button>
          );
        })}
      </div>

      {/* Subjects Grid for Active Semester */}
      {filteredSubjects.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground border border-border/80">
          <p className="text-sm">No course registrations found for {currentSemInfo.label}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => {
            const colorDef = getSubjectColor(subject.name);
            return (
              <div
                key={subject.id}
                className="glass-card rounded-3xl p-5 border border-border/80 hover:border-primary/50 transition-all shadow-sm hover:shadow-glow flex flex-col justify-between"
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-lg font-700 border ${colorDef.badgeBg} ${colorDef.badgeBorder} ${colorDef.badgeText}`}
                    >
                      {subject.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-muted/40 text-muted-foreground font-600">
                        {subject.type || 'THEORY'}
                      </span>
                      <span className="text-xs text-muted-foreground font-600">
                        {subject.credits} Credits
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-800 text-foreground mb-1 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: colorDef.hex }}
                    />
                    {subject.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Instructor: <span className="text-foreground font-600">{subject.instructor}</span>
                  </p>

                  {/* Progress & Attendance Metrics */}
                  <div className="space-y-3 p-3.5 rounded-2xl bg-muted/20 border border-border/40 mb-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-500">Syllabus Coverage</span>
                        <span className="font-800 metric-value" style={{ color: colorDef.hex }}>
                          {subject.syllabusProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${subject.syllabusProgress}%`,
                            background: `linear-gradient(90deg, ${colorDef.hex}, #00D4FF)`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="text-muted-foreground">Term Attendance</span>
                      <span className="badge-success text-[11px] px-2 py-0.5 rounded font-700">
                        {subject.attendanceRate}% Present
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewNotes(subject.name)}
                    className="w-full text-xs font-600"
                  >
                    View Notes
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAskAI(subject.name)}
                    className="w-full text-xs font-700 shadow-glow"
                  >
                    Ask AI Tutor ✨
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
