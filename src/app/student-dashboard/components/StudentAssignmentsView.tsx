'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { campusRepository } from '@/repositories/campusRepository';
import { useProfile } from '@/hooks/useProfile';
import { Assignment, Submission } from '@/types/campus';
import { fileStorageService } from '@/services/fileStorageService';
import { DocumentParserService } from '@/services/documentParserService';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';

interface StudentAssignmentCardData {
  assignment: Assignment;
  submission?: Submission;
  userStatus: 'Pending' | 'Submitted' | 'Graded' | 'Late';
}

export default function StudentAssignmentsView() {
  const { profile } = useProfile();
  const [assignmentCards, setAssignmentCards] = useState<StudentAssignmentCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Graded'>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedItem, setSelectedItem] = useState<StudentAssignmentCardData | null>(null);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  // Submission Form State
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStudentAssignments = async () => {
    setLoading(true);
    try {
      // 1. Fetch real assignments strictly for student's enrolled semester
      const asgs = await campusRepository.getAssignments(undefined, profile || undefined);

      // 2. Fetch student's own submissions
      const subms = await campusRepository.getSubmissions(undefined, profile || undefined);

      const cards: StudentAssignmentCardData[] = asgs.map((asg) => {
        const studentSubm = subms.find((s) => s.assignmentId === asg.id);

        let userStatus: 'Pending' | 'Submitted' | 'Graded' | 'Late' = 'Pending';
        if (studentSubm) {
          if (studentSubm.status === 'graded') userStatus = 'Graded';
          else userStatus = 'Submitted';
        }

        return {
          assignment: asg,
          submission: studentSubm,
          userStatus,
        };
      });

      setAssignmentCards(cards);
    } catch (err: any) {
      toast.error('Failed to load assignments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentAssignments();
  }, [profile]);

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = fileStorageService.validateFile(file, {
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv', 'py', 'c', 'cpp', 'java', 'zip', 'png', 'jpg'],
      maxSizeBytes: 25 * 1024 * 1024,
    });

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file format');
      return;
    }

    setSubmissionFile(file);
    toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
  };

  // Submit Assignment Handler
  const handleSubmitAssignment = async () => {
    if (!selectedItem) return;
    if (!submissionFile && !textAnswer.trim()) {
      toast.error('Please attach your solution document or type an answer.');
      return;
    }

    setIsSubmitting(true);
    let storedFileData: string | undefined = undefined;
    let storedFileName: string | undefined = undefined;
    let storedFileSize: string | undefined = undefined;
    let extractedText: string | undefined = undefined;

    try {
      if (submissionFile) {
        try {
          const parsed = await DocumentParserService.parseFile(submissionFile);
          if (parsed.success) {
            extractedText = parsed.extractedText;
          }
        } catch {}

        const stored = await fileStorageService.uploadFile(
          submissionFile,
          'submission',
          { allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv', 'py', 'c', 'cpp', 'java', 'zip'] }
        );
        storedFileData = stored.dataUrl || stored.previewUrl;
        storedFileName = stored.fileName;
        storedFileSize = stored.fileSize;
      }

      const asg = selectedItem.assignment;
      const createdSubm = await campusRepository.submitAssignment(
        {
          assignmentId: asg.id,
          assignmentTitle: asg.title,
          studentId: profile?.id || 'usr-001',
          studentName: profile?.fullName || 'Arjun Sharma',
          studentEmail: profile?.email || 'arjun.sharma@campusos.demo',
          rollNumber: profile?.rollNumber || 'BCA2401',
          subject: asg.subject,
          subjectCode: asg.subjectCode,
          semesterNumber: asg.semesterNumber,
          maxScore: asg.maxScore,
          textAnswer: textAnswer.trim() || undefined,
          fileName: storedFileName,
          fileSize: storedFileSize,
          fileData: storedFileData,
          extractedText: extractedText || textAnswer.trim(),
        },
        profile || undefined
      );

      // Update state
      setAssignmentCards((prev) =>
        prev.map((c) =>
          c.assignment.id === asg.id
            ? { ...c, submission: createdSubm, userStatus: createdSubm.status === 'graded' ? 'Graded' : 'Submitted' }
            : c
        )
      );

      toast.success(`Successfully submitted assignment "${asg.title}"!`);
      setSelectedItem(null);
      setSubmissionFile(null);
      setTextAnswer('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Campus AI for this Assignment
  const handleAskCampusAI = (promptText: string, asg: Assignment) => {
    window.dispatchEvent(
      new CustomEvent('campusos:open-ai', {
        detail: {
          query: `${promptText}\n\n[Assignment Details: "${asg.title}" for ${asg.subject} (Semester ${asg.semesterNumber})]\nMax Marks: ${asg.maxScore} | Due: ${asg.dueDate}\nInstructions:\n${asg.description || asg.extractedText || ''}`,
          selectedDocument: {
            id: asg.id,
            title: asg.title,
            subject: asg.subject,
            semester: `Semester ${asg.semesterNumber}`,
            extractedText: asg.extractedText || asg.description,
          },
        },
      })
    );
    toast.info(`CampusOS AI is analyzing "${asg.title}"...`);
  };

  // Filtered Cards
  const filteredCards = assignmentCards.filter((card) => {
    if (filter !== 'All' && card.userStatus !== filter) return false;
    if (subjectFilter !== 'All' && card.assignment.subject !== subjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        card.assignment.title.toLowerCase().includes(q) ||
        card.assignment.subject.toLowerCase().includes(q) ||
        card.assignment.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const totalTasks = assignmentCards.length;
  const pendingTasks = assignmentCards.filter((c) => c.userStatus === 'Pending').length;
  const submittedTasks = assignmentCards.filter((c) => c.userStatus === 'Submitted').length;
  const gradedTasks = assignmentCards.filter((c) => c.userStatus === 'Graded').length;

  const distinctSubjects = Array.from(new Set(assignmentCards.map((c) => c.assignment.subject)));

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📚</span> Coursework & Laboratory Assignments
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified syllabus tasks, problem sets, and practical deliverables for Semester {profile?.semesterNumber || 5}
            </p>
          </div>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Total Course Tasks</span>
              <span>📝</span>
            </div>
            <p className="text-2xl font-800 text-foreground font-mono-data">{totalTasks}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Enrolled Semester {profile?.semesterNumber || 5}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-warning/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Pending / To Do</span>
              <span className="text-warning">⏳</span>
            </div>
            <p className="text-2xl font-800 text-warning font-mono-data">{pendingTasks}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting your solution</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Submitted</span>
              <span className="text-accent">📥</span>
            </div>
            <p className="text-2xl font-800 text-accent font-mono-data">{submittedTasks}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Under faculty evaluation</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-success/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Graded & Evaluated</span>
              <span className="text-success">🌟</span>
            </div>
            <p className="text-2xl font-800 text-success font-mono-data">{gradedTasks}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Feedback & scores available</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card rounded-2xl p-4 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', 'Pending', 'Submitted', 'Graded'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                  filter === tab
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab === 'All' ? 'All Assignments' : tab === 'Pending' ? 'To Do' : tab}
              </button>
            ))}
          </div>

          {/* Subject Filter & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-card border border-border/70 text-xs font-600 text-foreground outline-none cursor-pointer"
            >
              <option value="All">All Course Subjects</option>
              {distinctSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/70 w-48 sm:w-56">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Assignment Grid */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading course tasks...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-border/60">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl mx-auto mb-3">
              🎉
            </div>
            <h3 className="text-base font-800 text-foreground mb-1">No Assignments Matching Filter</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {filter !== 'All' || subjectFilter !== 'All' || searchQuery
                ? 'Try clearing your filters to see all available coursework.'
                : 'All caught up! No pending assignments currently assigned.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const { assignment: asg, submission: subm, userStatus } = card;

              return (
                <div
                  key={asg.id}
                  className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="cyan">{asg.subjectCode || 'BCA'}</Badge>
                        <Badge variant="muted">{asg.subject}</Badge>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-800 px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                          userStatus === 'Graded'
                            ? 'bg-success/15 text-success border border-success/30'
                            : userStatus === 'Submitted'
                            ? 'bg-accent/15 text-accent border border-accent/30'
                            : 'bg-warning/15 text-warning border border-warning/30'
                        }`}
                      >
                        {userStatus === 'Graded'
                          ? `Graded: ${subm?.score}/${asg.maxScore}`
                          : userStatus === 'Submitted'
                          ? 'Submitted'
                          : 'Pending'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-800 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {asg.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {asg.description || 'Complete the assignment instructions and submit your work.'}
                    </p>

                    {/* Metadata: Teacher, Due Date, Points */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1 text-muted-foreground">
                      <span>
                        👤 Instructor: <strong className="text-foreground font-600">{asg.teacher}</strong>
                      </span>
                      <span>
                        📅 Due: <strong className="text-foreground font-mono-data">{asg.dueDate} {asg.dueTime || '11:59 PM'}</strong>
                      </span>
                      <span>
                        🎯 Max: <strong className="text-foreground font-mono-data">{asg.maxScore} pts</strong>
                      </span>
                    </div>

                    {/* Feedback preview if graded */}
                    {subm?.feedback && (
                      <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 text-xs text-success-foreground">
                        <p className="font-700 text-success text-[11px] mb-0.5">Faculty Feedback ({subm.score}/{asg.maxScore} marks):</p>
                        <p className="text-foreground/90 italic line-clamp-1">"{subm.feedback}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAskCampusAI('Explain what this assignment is asking me to do and how to approach it step-by-step.', asg)}
                      className="text-xs font-700 text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1.5 rounded-xl border border-purple-500/30 transition-all"
                    >
                      <span>✨ Ask Campus AI</span>
                    </button>

                    <Button
                      variant={userStatus === 'Pending' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setSelectedItem(card);
                        setTextAnswer(subm?.textAnswer || '');
                        setSubmissionFile(null);
                      }}
                      className="text-xs font-700"
                    >
                      {userStatus === 'Pending'
                        ? 'Submit Assignment 🚀'
                        : userStatus === 'Submitted'
                        ? 'Review Submission 👁️'
                        : 'View Grade & Solution 🌟'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── ASSIGNMENT DETAIL & SUBMISSION MODAL ─────────────────────────── */}
      {selectedItem && (
        <Modal
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="text-base font-800 text-foreground">{selectedItem.assignment.title}</h3>
                <p className="text-xs text-muted-foreground font-500">
                  {selectedItem.assignment.subject} · {selectedItem.assignment.teacher} · Max {selectedItem.assignment.maxScore} marks
                </p>
              </div>
            </div>
          }
          maxWidth="2xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAskCampusAI('Explain the step-by-step approach to solve this assignment.', selectedItem.assignment)}
                  className="text-purple-300 font-700 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40"
                >
                  ✨ Ask Campus AI
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                {selectedItem.userStatus !== 'Graded' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitAssignment}
                    disabled={isSubmitting}
                    className="shadow-glow font-800"
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : selectedItem.submission
                      ? 'Update Submission 🚀'
                      : 'Submit Assignment 🚀'}
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Graded Card (If Graded) */}
            {selectedItem.submission?.status === 'graded' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-success/15 to-emerald-500/10 border border-success/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-800 uppercase tracking-wider text-success flex items-center gap-1.5">
                    <span>🌟</span> Faculty Evaluation & Grade
                  </span>
                  <span className="text-sm font-800 font-mono-data text-success">
                    Score: {selectedItem.submission.score} / {selectedItem.assignment.maxScore}
                  </span>
                </div>
                {selectedItem.submission.feedback && (
                  <div className="pt-2 border-t border-success/20 text-xs text-foreground/90">
                    <p className="font-600 text-muted-foreground mb-0.5">Instructor Remarks:</p>
                    <p className="italic bg-black/20 p-2.5 rounded-xl border border-border/30">
                      "{selectedItem.submission.feedback}"
                    </p>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Graded on {selectedItem.submission.gradedAt || 'Recent'} by {selectedItem.submission.gradedBy || selectedItem.assignment.teacher}
                </p>
              </div>
            )}

            {/* Assignment Instructions & Problem Statement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-800 uppercase tracking-wider text-muted-foreground">
                  Assignment Instructions & Requirements
                </h4>
                <span className="text-xs text-muted-foreground font-mono-data">
                  Deadline: <strong className="text-foreground">{selectedItem.assignment.dueDate} {selectedItem.assignment.dueTime || '11:59 PM'}</strong>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-card/80 border border-border/60 text-xs font-mono-data leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedItem.assignment.description || 'Complete the assignment questions following university standards.'}
              </div>
            </div>

            {/* Attached Faculty File (If Any) */}
            {selectedItem.assignment.fileName && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-lg flex-shrink-0">📎</span>
                  <div className="truncate">
                    <p className="font-700 text-foreground truncate">{selectedItem.assignment.fileName}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedItem.assignment.fileSize || 'Course Document'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setViewingDoc({
                        id: selectedItem.assignment.id,
                        title: selectedItem.assignment.title,
                        subject: selectedItem.assignment.subject,
                        fileName: selectedItem.assignment.fileName,
                        fileSize: selectedItem.assignment.fileSize,
                        fileData: selectedItem.assignment.fileData,
                        extractedText: selectedItem.assignment.extractedText || selectedItem.assignment.description,
                        semesterNumber: selectedItem.assignment.semesterNumber,
                      })
                    }
                    className="text-xs"
                  >
                    📖 Read in Viewer
                  </Button>
                </div>
              </div>
            )}

            {/* Campus AI Quick Prompts Banner */}
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-800 text-purple-300 flex items-center gap-1.5">
                  <span>✨</span> CampusOS AI Study Assistant
                </span>
                <span className="text-[11px] text-purple-300/70">Context-Aware AI Tutor</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Explain what this assignment asks',
                  'Summarize attached problem set',
                  'How should I approach this problem?',
                  'Give me 5 practice viva questions',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskCampusAI(q, selectedItem.assignment)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 transition-all cursor-pointer"
                  >
                    {q} →
                  </button>
                ))}
              </div>
            </div>

            {/* Student Submission Workspace */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h4 className="text-xs font-800 uppercase tracking-wider text-muted-foreground">
                Your Submission Solution
              </h4>

              {/* Upload File */}
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">
                  Upload Solution Document / Source Code (.pdf, .py, .java, .c, .zip)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.py,.c,.cpp,.java,.zip,.png,.jpg"
                  disabled={selectedItem.userStatus === 'Graded'}
                  className="input-field text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-700 file:bg-primary file:text-white cursor-pointer"
                />
                {submissionFile && (
                  <p className="text-[11px] text-success mt-1 font-600">
                    ✓ Attached: {submissionFile.name} ({(submissionFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                {selectedItem.submission?.fileName && !submissionFile && (
                  <p className="text-[11px] text-accent mt-1 font-600">
                    📂 Previously Submitted File: {selectedItem.submission.fileName} ({selectedItem.submission.fileSize || 'Saved'})
                  </p>
                )}
              </div>

              {/* Text Solution / Explanation */}
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1">
                  Or Type Your Solution Notes / Code Summary
                </label>
                <textarea
                  rows={4}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={selectedItem.userStatus === 'Graded'}
                  placeholder="Detail your algorithmic implementation, methodology, test results, and conclusions..."
                  className="input-field resize-none text-xs font-mono-data"
                />
              </div>

              {selectedItem.submission && (
                <p className="text-[11px] text-muted-foreground">
                  Last submitted on: <strong className="text-foreground">{selectedItem.submission.submittedAt}</strong>
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ─── IN-APP DOCUMENT VIEWER MODAL ─────────────────────────────────── */}
      {viewingDoc && (
        <DocumentViewerModal
          isOpen={Boolean(viewingDoc)}
          onClose={() => setViewingDoc(null)}
          document={viewingDoc}
        />
      )}
    </>
  );
}
