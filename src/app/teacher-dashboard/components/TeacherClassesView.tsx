'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ClassBatch {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  enrolledStudents: number;
  avgAttendancePct: number;
  syllabusCoveredPct: number;
  room: string;
  nextLecture: string;
}

const mockClasses: ClassBatch[] = [
  {
    id: 'cls-bca-os',
    name: 'Operating Systems',
    code: 'CS501',
    department: 'BCA',
    semester: 'Semester 5',
    enrolledStudents: 64,
    avgAttendancePct: 91.4,
    syllabusCoveredPct: 72,
    room: 'Room A-204',
    nextLecture: 'Today, 10:30 AM',
  },
  {
    id: 'cls-bca-oslab',
    name: 'OS Lab Practical (Batch A)',
    code: 'CS501L',
    department: 'BCA',
    semester: 'Semester 5',
    enrolledStudents: 32,
    avgAttendancePct: 95.0,
    syllabusCoveredPct: 80,
    room: 'Systems Lab 1',
    nextLecture: 'Today, 1:30 PM',
  },
  {
    id: 'cls-mca-sa',
    name: 'System Architecture',
    code: 'MCA302',
    department: 'MCA',
    semester: 'Semester 3',
    enrolledStudents: 42,
    avgAttendancePct: 88.6,
    syllabusCoveredPct: 60,
    room: 'MCA Hall B',
    nextLecture: 'Today, 4:00 PM',
  },
];

export default function TeacherClassesView() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<ClassBatch | null>(null);

  const handleLaunchAttendance = (className: string) => {
    router.push('/teacher-dashboard?tab=attendance');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-700 text-foreground">My Assigned Classes & Batches</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              3 active lecture and laboratory sections · 138 total students enrolled
            </p>
          </div>
          <Badge variant="cyan">Fall 2026 Live</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockClasses.map((cls) => (
            <div
              key={cls.id}
              className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-glow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-violet text-xs px-2.5 py-0.5 rounded-lg font-700">
                    {cls.code}
                  </span>
                  <span className="text-xs text-muted-foreground font-500">{cls.department} · {cls.semester}</span>
                </div>

                <h3 className="text-lg font-700 text-foreground mb-1">{cls.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Location: <span className="text-foreground font-500">{cls.room}</span> &nbsp;·&nbsp; Next: {cls.nextLecture}
                </p>

                <div className="space-y-3 p-3.5 rounded-xl bg-muted/20 border border-border/40 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-500">Syllabus Progress</span>
                      <span className="text-primary font-700 metric-value">{cls.syllabusCoveredPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${cls.syllabusCoveredPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground">Class Attendance Avg</span>
                    <span className="badge-success text-[11px] px-2 py-0.2 rounded font-700">
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
                  className="w-full text-xs"
                >
                  View Roster
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLaunchAttendance(cls.name)}
                  className="w-full text-xs"
                >
                  Mark Attendance
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Roster Modal */}
      {selectedClass && (
        <Modal
          isOpen={Boolean(selectedClass)}
          onClose={() => setSelectedClass(null)}
          title={`Class Roster: ${selectedClass.name}`}
          description={`${selectedClass.department} ${selectedClass.semester} · ${selectedClass.enrolledStudents} Enrolled`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedClass(null)}>
              Close Roster
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Showing registered students for {selectedClass.code}:</p>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {[
                { roll: 'BCA2401', name: 'Arjun Sharma', att: '94.2%' },
                { roll: 'BCA2402', name: 'Priya Menon', att: '91.0%' },
                { roll: 'BCA2403', name: 'Rohit Verma', att: '78.4%' },
                { roll: 'BCA2404', name: 'Sneha Pillai', att: '96.5%' },
                { roll: 'BCA2405', name: 'Karthik Nambiar', att: '82.0%' },
                { roll: 'BCA2406', name: 'Ananya Das', att: '95.0%' },
              ].map((s) => (
                <div key={s.roll} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs">
                  <div>
                    <span className="font-600 text-foreground">{s.name}</span>
                    <span className="text-muted-foreground font-mono-data ml-2">({s.roll})</span>
                  </div>
                  <span className="badge-success text-[10px] px-2 py-0.5 rounded font-600">Att: {s.att}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
