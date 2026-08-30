'use client';

import React, { useState, useEffect } from 'react';
import PageTransition, { StaggerItem } from '@/components/motion/PageTransition';
import { toast } from 'sonner';
import { campusRepository } from '@/repositories/campusRepository';
import { useProfile } from '@/hooks/useProfile';
import { Assignment } from '@/types/campus';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  dueDate: string;
  dueTime: string;
  points: number;
  status: 'Pending' | 'Submitted' | 'Graded';
  score?: number;
  feedback?: string;
  description: string;
  fileName?: string;
  fileData?: string;
  fileUrl?: string;
}

const defaultAssignments: AssignmentItem[] = [
  {
    id: 'asg-001',
    title: 'Relational Schema & ER-Diagram Design',
    subject: 'Database Management Systems',
    subjectCode: 'CS502',
    dueDate: 'Sep 05, 2026',
    dueTime: '11:59 PM',
    points: 50,
    status: 'Pending',
    description: 'Design a normalized 3NF ER schema for a multi-specialty hospital management system including doctor shifts, patient records, and pharmacy billing.',
  },
  {
    id: 'asg-002',
    title: 'Banker’s Algorithm Deadlock Avoidance Simulator',
    subject: 'Operating Systems',
    subjectCode: 'CS501',
    dueDate: 'Sep 08, 2026',
    dueTime: '05:00 PM',
    points: 50,
    status: 'Pending',
    description: 'Implement Banker’s Algorithm in C/C++ or Python to determine whether a given resource allocation state is safe and output the safe execution sequence.',
  },
  {
    id: 'asg-003',
    title: 'CIDR Variable-Length Subnet Masking (VLSM) Lab',
    subject: 'Computer Networks',
    subjectCode: 'CS503',
    dueDate: 'Aug 26, 2026',
    dueTime: '11:59 PM',
    points: 40,
    status: 'Graded',
    score: 38,
    feedback: 'Excellent CIDR subnet calculations! Small notation correction on Host-ID bits for Subnet C.',
    description: 'Calculate subnet masks, usable host ranges, and broadcast addresses for a 192.168.10.0/24 network partitioned into 4 branch subnets.',
  },
  {
    id: 'asg-004',
    title: 'Multi-Threaded Producer-Consumer Queue',
    subject: 'Java Programming',
    subjectCode: 'CS504',
    dueDate: 'Aug 22, 2026',
    dueTime: '11:59 PM',
    points: 50,
    status: 'Graded',
    score: 49,
    feedback: 'Flawless synchronization using wait() and notifyAll(). Code is clean and well commented.',
    description: 'Create a bounded buffer with concurrent producer and consumer threads demonstrating synchronized locks and starvation avoidance.',
  },
];

export default function StudentAssignmentsView() {
  const { profile } = useProfile();
  const [assignments, setAssignments] = useState<AssignmentItem[]>(defaultAssignments);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Graded'>('All');
  const [selectedAsg, setSelectedAsg] = useState<AssignmentItem | null>(null);
  const [viewingDoc, setViewingDoc] = useState<AssignmentItem | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const repoAsgs = await campusRepository.getAssignments(undefined, profile || undefined);
        if (repoAsgs && repoAsgs.length > 0) {
          const mapped: AssignmentItem[] = repoAsgs.map((a: Assignment, idx: number) => ({
            id: a.id,
            title: a.title,
            subject: a.subject,
            subjectCode: a.subject.includes('OS') || a.subject.includes('Operating') ? 'CS501' : a.subject.includes('DBMS') || a.subject.includes('Database') ? 'CS502' : 'CS503',
            dueDate: a.dueDate || 'Sep 10, 2026',
            dueTime: '11:59 PM',
            points: a.maxScore || 50,
            status: idx === 2 || idx === 3 ? 'Graded' : 'Pending',
            score: idx === 2 ? 38 : idx === 3 ? 49 : undefined,
            feedback: idx === 2 ? 'Well structured solution!' : undefined,
            description: a.description || 'Complete the assignment questions thoroughly.',
            fileName: a.fileName,
            fileData: a.fileData,
            fileUrl: a.fileUrl,
          }));
          setAssignments(mapped);
        }
      } catch {}
    }
    loadAssignments();
  }, [profile]);

  const filtered = assignments.filter((a) => (filter === 'All' ? true : a.status === filter));

  const openAICopilot = (query: string) => {
    window.dispatchEvent(new CustomEvent('campusos:open-ai', { detail: { query } }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size exceeds 20MB limit.');
        return;
      }
      setSubmissionFile(file);
      toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleSubmitAssignment = () => {
    if (!selectedAsg) return;
    if (!submissionFile) {
      toast.error('Please attach your solution document or source file first.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setAssignments((prev) =>
        prev.map((a) => (a.id === selectedAsg.id ? { ...a, status: 'Submitted' } : a))
      );
      setIsUploading(false);
      toast.success(`Assignment "${selectedAsg.title}" successfully submitted!`);
      setSelectedAsg(null);
      setSubmissionFile(null);
    }, 800);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-border/60 shadow-lg">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">📝</span>
              <h2 className="text-2xl font-800 text-foreground tracking-tight">Student Assignments Portal</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-500">
              Submit lab solutions, research papers, and track graded instructor feedback.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAICopilot('Help me structure my ER-diagram assignment for DBMS.')}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl shadow-glow cursor-pointer font-800 flex items-center gap-2"
            >
              <span>✨</span>
              <span>Ask AI Assignment Tutor</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Pending', 'Submitted', 'Graded'] as const).map((tab) => {
            const count = tab === 'All' ? assignments.length : assignments.filter((a) => a.status === tab).length;
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-700 transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary text-white shadow-glow border border-primary/50'
                    : 'bg-card/60 text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20' : 'bg-secondary'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Assignment Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((asg, idx) => (
            <StaggerItem key={asg.id} order={(((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)}>
              <div className="glass-card p-6 rounded-3xl border border-border/60 shadow-md space-y-4 hover:border-accent/50 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono-data px-2.5 py-1 rounded-md bg-secondary text-accent font-700">
                      {asg.subjectCode} · {asg.subject}
                    </span>
                    <h3 className="text-lg font-800 text-foreground mt-2">{asg.title}</h3>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-xl font-800 shrink-0 ${
                      asg.status === 'Graded'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : asg.status === 'Submitted'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {asg.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {asg.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Due Date:</span>
                    <strong className="text-foreground font-700">{asg.dueDate} ({asg.dueTime})</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Points:</span>
                    <strong className="text-accent font-800">
                      {asg.score !== undefined ? `${asg.score} / ${asg.points}` : `${asg.points} Max Points`}
                    </strong>
                  </div>
                </div>

                {asg.feedback && (
                  <div className="p-3 rounded-2xl bg-secondary/50 border border-border/40 text-xs text-foreground/90 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-700 uppercase tracking-wider block">
                      Instructor Feedback:
                    </span>
                    <p className="italic">{asg.feedback}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {asg.status === 'Pending' ? (
                    <button
                      onClick={() => setSelectedAsg(asg)}
                      className="btn-primary text-xs py-2 px-4 rounded-xl shadow-glow cursor-pointer font-800 flex-1"
                    >
                      📤 Submit Solution →
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewingDoc(asg)}
                      className="text-xs py-2 px-4 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground font-700 border border-border/60 cursor-pointer flex-1"
                    >
                      📄 View Submission
                    </button>
                  )}
                  <button
                    onClick={() => openAICopilot(`Help me with the ${asg.title} assignment in ${asg.subject}. Explain the key principles.`)}
                    className="text-xs py-2 px-3 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-700 cursor-pointer"
                    title="Ask AI Copilot for help"
                  >
                    ✨ Hints
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>

        {/* Universal Document Viewer & AI Study Modal for Assignments */}
        <DocumentViewerModal
          isOpen={Boolean(viewingDoc)}
          onClose={() => setViewingDoc(null)}
          document={
            viewingDoc
              ? {
                  id: viewingDoc.id,
                  title: viewingDoc.title,
                  subject: viewingDoc.subject,
                  fileName: viewingDoc.fileName || `${viewingDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_solution.pdf`,
                  fileType: 'pdf',
                  fileData: viewingDoc.fileData,
                  fileUrl: viewingDoc.fileUrl,
                  extractedText: `ASSIGNMENT SOLUTION SUBMISSION\nTitle: ${viewingDoc.title}\nSubject: ${viewingDoc.subject} (${viewingDoc.subjectCode})\nStatus: ${viewingDoc.status}\nScore: ${viewingDoc.score || 'Awaiting evaluation'} / ${viewingDoc.points}\n\nInstructor Feedback:\n${viewingDoc.feedback || 'Your submission has been received and verified by the department portal.'}\n\nTask Specification:\n${viewingDoc.description}`,
                  description: viewingDoc.description,
                  totalMarks: viewingDoc.points,
                }
              : null
          }
        />

        {/* Submit Modal Drawer */}
        {selectedAsg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-primary/40 shadow-2xl space-y-5 animate-modal-pop">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-800 text-foreground">Submit Assignment Solution</h3>
                <button
                  onClick={() => setSelectedAsg(null)}
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[11px] font-mono-data text-accent font-700">
                  {selectedAsg.subjectCode} · {selectedAsg.subject}
                </span>
                <h4 className="text-base font-800 text-foreground mt-0.5">{selectedAsg.title}</h4>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-6 text-center space-y-3 bg-secondary/20 transition-colors">
                <span className="text-3xl block">📁</span>
                <div className="text-xs text-foreground font-700">
                  {submissionFile ? submissionFile.name : 'Choose your solution document to upload'}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Supports PDF, DOCX, Python, Java, C/C++, ZIP (Max 20MB)
                </p>
                <label className="btn-primary text-xs py-2 px-4 rounded-xl shadow-glow cursor-pointer font-800 inline-block">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.py,.java,.cpp,.c,.zip,.rar"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedAsg(null)}
                  className="text-xs py-2 px-4 rounded-xl bg-secondary/50 text-muted-foreground font-700 hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={isUploading}
                  className="btn-primary text-xs py-2.5 px-5 rounded-xl shadow-glow font-800 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : '✓ Confirm Submission'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
