'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockExams } from '@/repositories/mockData';
import { useProfile } from '@/hooks/useProfile';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function StudentExamsView() {
  const { profile } = useProfile();
  const [hallTicketOpen, setHallTicketOpen] = useState(false);

  const studentName = profile?.fullName ?? 'Arjun Sharma';
  const rollNumber = profile?.rollNumber ?? '2024-BCA-042';
  const department = profile?.department ?? 'Computer Applications (BCA)';

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 text-foreground">Examination Schedule & Hall Ticket</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mid-Semester Examinations — Semester 5 (Fall 2026)
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => setHallTicketOpen(true)}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            }
          >
            Download Hall Ticket
          </Button>
        </div>

        {/* Exams List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockExams.map((exam, index) => (
            <div
              key={exam.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                index === 0
                  ? 'border-warning/50 bg-warning/5 shadow-glow'
                  : 'border-border/80 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="badge-violet text-xs px-2.5 py-0.5 rounded-lg font-700">
                  {exam.subjectCode}
                </span>
                <span className="badge-warning text-[11px] px-2 py-0.5 rounded font-600">
                  {index === 0 ? 'Starts in 4 Days' : 'Upcoming'}
                </span>
              </div>

              <h3 className="text-lg font-700 text-foreground mb-1">{exam.subject}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Location: <span className="text-foreground font-600">{exam.room}</span> &nbsp;·&nbsp; Max Marks: 100
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exam Date</span>
                  <span className="font-600 text-foreground">{exam.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Slot</span>
                  <span className="font-600 text-foreground font-mono-data">{exam.time}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <button
                  onClick={() => toast.info(`Viewing syllabus for ${exam.subject}`)}
                  className="text-xs text-primary hover:underline font-500 cursor-pointer"
                >
                  View Exam Syllabus →
                </button>
                <Badge variant="cyan">Seating Verified</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hall Ticket Admit Card Modal */}
      {hallTicketOpen && (
        <Modal
          isOpen={hallTicketOpen}
          onClose={() => setHallTicketOpen(false)}
          maxWidth="xl"
          title="Official Examination Hall Ticket"
          description="University Examination Board · Fall Semester 2026"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setHallTicketOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success('Hall ticket PDF generated and downloaded');
                  setHallTicketOpen(false);
                }}
              >
                Print / Save PDF
              </Button>
            </div>
          }
        >
          <div className="p-5 rounded-2xl border border-border bg-card/80 space-y-5">
            {/* Student Info Bar */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-base font-800 text-foreground">{studentName}</h4>
                <p className="text-xs text-muted-foreground">{department} · Semester 5</p>
                <p className="text-xs font-mono-data text-primary font-700 mt-0.5">Roll No: {rollNumber}</p>
              </div>
              <div className="w-16 h-20 rounded-xl bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground text-center font-600">
                Photo ID
              </div>
            </div>

            {/* Exam Table in Admit Card */}
            <div>
              <p className="text-xs font-700 uppercase tracking-wider text-muted-foreground mb-2">
                Authorized Examinations
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 text-left">Code</th>
                    <th className="py-2 text-left">Subject</th>
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-right">Hall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {mockExams.map((e) => (
                    <tr key={`ht-${e.id}`}>
                      <td className="py-2 font-mono-data font-600 text-foreground">{e.subjectCode}</td>
                      <td className="py-2 text-foreground font-500">{e.subject}</td>
                      <td className="py-2 text-muted-foreground">{e.date}</td>
                      <td className="py-2 text-right font-600 text-accent">{e.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verification Seal */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-muted-foreground">
              <span>Barcode ID: 8829-1029-4401</span>
              <span className="text-success font-600">✓ Verified & Approved by Controller of Examinations</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
