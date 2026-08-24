'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { mockSubjects } from '@/repositories/mockData';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function StudentSubjectsView() {
  const router = useRouter();

  const handleAskAI = (subjectName: string) => {
    toast.info(`Launching AI Tutor tailored for ${subjectName}`);
    router.push('/student-dashboard?tab=ai');
  };

  const handleViewNotes = (subjectName: string) => {
    router.push('/student-dashboard?tab=notes');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-700 text-foreground">
            Enrolled Subjects & Syllabus Coverage
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Semester 5 · 24 Total Course Credits Registered
          </p>
        </div>
        <Badge variant="cyan">BCA Sem 5 Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockSubjects.map((subject) => (
          <div
            key={subject.id}
            className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all shadow-sm hover:shadow-glow flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="badge-violet text-xs px-2.5 py-0.5 rounded-lg font-700">
                  {subject.code}
                </span>
                <span className="text-xs text-muted-foreground font-500">
                  {subject.credits} Credits
                </span>
              </div>

              <h3 className="text-lg font-700 text-foreground mb-1">{subject.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Instructor: <span className="text-foreground font-500">{subject.instructor}</span>
              </p>

              {/* Progress & Attendance Metrics */}
              <div className="space-y-3 p-3.5 rounded-xl bg-muted/20 border border-border/40 mb-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-500">Syllabus Covered</span>
                    <span className="text-primary font-700 metric-value">
                      {subject.syllabusProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${subject.syllabusProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground">My Attendance</span>
                  <span className="badge-success text-[11px] px-2 py-0.2 rounded font-700">
                    {subject.attendanceRate}% Present
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleViewNotes(subject.name)}
                className="w-full text-xs"
              >
                View Notes
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAskAI(subject.name)}
                className="w-full text-xs"
              >
                Ask AI Tutor ✨
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
