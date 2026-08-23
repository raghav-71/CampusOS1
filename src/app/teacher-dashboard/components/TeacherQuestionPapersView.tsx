'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface QuestionPaper {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  semester: string;
  examType: 'Mid-Term' | 'End-Term' | 'Quiz' | 'Practical';
  totalMarks: number;
  duration: string;
  status: 'Published' | 'Draft' | 'Approved by Dean';
  createdDate: string;
}

const mockPapers: QuestionPaper[] = [
  {
    id: 'qp-001',
    title: 'Operating Systems Mid-Semester Examination Paper 2026',
    subject: 'Operating Systems',
    subjectCode: 'CS501',
    semester: 'Sem 5',
    examType: 'Mid-Term',
    totalMarks: 100,
    duration: '3 Hours',
    status: 'Approved by Dean',
    createdDate: 'Aug 18, 2026',
  },
  {
    id: 'qp-002',
    title: 'Virtual Memory & Deadlocks Special Quiz 1',
    subject: 'Operating Systems',
    subjectCode: 'CS501',
    semester: 'Sem 5',
    examType: 'Quiz',
    totalMarks: 20,
    duration: '45 Mins',
    status: 'Published',
    createdDate: 'Aug 12, 2026',
  },
  {
    id: 'qp-003',
    title: 'System Architecture Advanced End-Term Blueprint',
    subject: 'System Architecture',
    subjectCode: 'MCA302',
    semester: 'Sem 3',
    examType: 'End-Term',
    totalMarks: 100,
    duration: '3 Hours',
    status: 'Draft',
    createdDate: 'Aug 20, 2026',
  },
];

export default function TeacherQuestionPapersView() {
  const [papers] = useState<QuestionPaper[]>(mockPapers);
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 text-foreground">Examination Question Papers & Blueprints</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft, review, and export standardized university examination question papers
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('AI Question Paper Generator is available in the Faculty AI drawer')}
          >
            Generate with AI ✨
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((qp) => (
            <div
              key={qp.id}
              className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={qp.examType === 'Mid-Term' ? 'violet' : qp.examType === 'End-Term' ? 'warning' : 'cyan'}>
                    {qp.examType}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono-data">{qp.duration}</span>
                </div>

                <h3 className="text-base font-700 text-foreground mb-1.5 line-clamp-2">{qp.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {qp.subject} ({qp.subjectCode}) · {qp.semester} · Max Marks: {qp.totalMarks}
                </p>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-success font-600">{qp.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{qp.createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewPaper(qp)}
                  className="w-full text-xs"
                >
                  Preview Paper
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.success(`Exporting "${qp.title}" to PDF`)}
                  className="w-full text-xs"
                >
                  Export PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Paper Preview Modal */}
      {previewPaper && (
        <Modal
          isOpen={Boolean(previewPaper)}
          onClose={() => setPreviewPaper(null)}
          maxWidth="xl"
          title={previewPaper.title}
          description={`${previewPaper.subjectCode} · Duration: ${previewPaper.duration} · Max Marks: ${previewPaper.totalMarks}`}
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPreviewPaper(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success('Downloaded complete question paper PDF with marking scheme');
                  setPreviewPaper(null);
                }}
              >
                Print / Download
              </Button>
            </div>
          }
        >
          <div className="p-5 rounded-2xl border border-border bg-card/80 space-y-4 font-mono-data text-xs leading-relaxed">
            <div className="text-center border-b border-border pb-3">
              <h4 className="font-800 text-sm text-foreground">UNIVERSITY DEPARTMENT OF COMPUTER APPLICATIONS</h4>
              <p className="text-muted-foreground">{previewPaper.examType} Examination — Semester 5</p>
            </div>

            <div>
              <p className="font-700 text-primary mb-1">PART A (Answer all questions — 10 x 2 = 20 Marks)</p>
              <p>1. Define Virtual Memory and explain the role of the TLB.</p>
              <p>2. Differentiate between preemptive and non-preemptive CPU scheduling.</p>
              <p>3. State the necessary and sufficient conditions for deadlock.</p>
            </div>

            <div className="pt-2 border-t border-border/40">
              <p className="font-700 text-accent mb-1">PART B (Answer any 4 questions — 4 x 20 = 80 Marks)</p>
              <p>4. Consider a system with 5 processes (P0-P4) and 3 resource types (A,B,C). Implement the Banker&apos;s Safety Algorithm to find the safe sequence.</p>
              <p>5. Explain page replacement algorithms: FIFO, LRU, and Optimal with memory trace benchmarks.</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
