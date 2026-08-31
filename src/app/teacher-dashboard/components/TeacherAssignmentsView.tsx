'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Assignment, Submission, TeacherSubjectAssignment } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { useProfile } from '@/hooks/useProfile';
import { fileStorageService } from '@/services/fileStorageService';
import { DocumentParserService } from '@/services/documentParserService';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';

export default function TeacherAssignmentsView() {
  const { profile } = useProfile();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Selections
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeSubmissionsAsg, setActiveSubmissionsAsg] = useState<Assignment | null>(null);
  const [evalSubm, setEvalSubm] = useState<Submission | null>(null);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  // Create Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('23:59');
  const [newMaxMarks, setNewMaxMarks] = useState('50');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'draft'>('active');
  const [allowLate, setAllowLate] = useState(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Grading Form State
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submFilter, setSubmFilter] = useState<'all' | 'pending' | 'graded'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const email = profile?.email || 'faculty@campusos.demo';
      const subjs = await campusRepository.getTeacherSubjects(email);
      setTeacherSubjects(subjs);
      if (subjs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjs[0].subjectId);
      }

      const asgs = await campusRepository.getAssignments(undefined, profile || undefined);
      setAssignments(asgs);

      const allSubms = await campusRepository.getSubmissions(undefined, profile || undefined);
      setSubmissions(allSubms);
    } catch (err: any) {
      toast.error('Failed to load assignments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  // Handle Attachment File Selection
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

    setAttachedFile(file);
    toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
  };

  // Create Assignment Submit Handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) {
      toast.error('Please complete the assignment title and due date fields');
      return;
    }

    const assignedSub =
      teacherSubjects.find((s) => s.subjectId === selectedSubjectId) ||
      teacherSubjects[0] || {
        subjectName: 'Operating Systems',
        subjectId: 'subj-501',
        subjectCode: 'CS501',
        semesterNumber: 5,
        semester: 'Semester 5',
      };

    setIsUploadingFile(true);
    let storedFileData: string | undefined = undefined;
    let storedFileName: string | undefined = undefined;
    let storedFileSize: string | undefined = undefined;
    let extractedText: string | undefined = undefined;

    try {
      if (attachedFile) {
        try {
          const parsed = await DocumentParserService.parseFile(attachedFile);
          if (parsed.success) {
            extractedText = parsed.extractedText;
          }
        } catch {}

        const stored = await fileStorageService.uploadFile(
          attachedFile,
          'assignment',
          { allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv', 'py', 'c', 'cpp', 'java', 'zip'] }
        );
        storedFileData = stored.dataUrl || stored.previewUrl;
        storedFileName = stored.fileName;
        storedFileSize = stored.fileSize;
      }

      const newAsg = await campusRepository.createAssignment(
        {
          title: newTitle.trim(),
          subject: assignedSub.subjectName,
          subjectId: assignedSub.subjectId,
          subjectCode: assignedSub.subjectCode,
          department: 'BCA',
          semester: assignedSub.semester || `Semester ${assignedSub.semesterNumber}`,
          semesterNumber: (assignedSub.semesterNumber || 5) as any,
          teacher: profile?.fullName || 'Dr. Priya Nair',
          teacherId: profile?.id || 'usr-faculty-001',
          dueDate: newDueDate,
          dueTime: newDueTime,
          maxScore: parseInt(newMaxMarks, 10) || 50,
          description: newDesc.trim(),
          status: newStatus,
          allowLateSubmissions: allowLate,
          fileName: storedFileName,
          fileSize: storedFileSize,
          fileData: storedFileData,
          extractedText: extractedText || newDesc.trim(),
        },
        profile || undefined
      );

      setAssignments((prev) => [newAsg, ...prev]);
      toast.success(`Published assignment "${newAsg.title}" for ${newAsg.subject} (Semester ${newAsg.semesterNumber})`);

      // Reset form
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDueDate('');
      setNewDesc('');
      setAttachedFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create assignment');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Grade Submission Handler
  const handleSaveEvaluation = async () => {
    if (!evalSubm) return;
    const scoreNum = parseFloat(scoreInput);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > evalSubm.maxScore) {
      toast.error(`Score must be a number between 0 and ${evalSubm.maxScore}`);
      return;
    }

    try {
      const updated = await campusRepository.gradeSubmission(
        evalSubm.id,
        scoreNum,
        feedbackInput.trim(),
        profile || undefined
      );

      if (updated) {
        setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === updated.assignmentId
              ? { ...a, gradedSubmissions: Math.min((a.gradedSubmissions || 0) + 1, a.totalSubmissions || 1) }
              : a
          )
        );
        toast.success(`Evaluated ${evalSubm.studentName}: ${scoreNum}/${evalSubm.maxScore} marks awarded!`);
        setEvalSubm(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save grade');
    }
  };

  // Delete Assignment Handler
  const handleDeleteAssignment = async (asg: Assignment) => {
    if (!confirm(`Are you sure you want to delete assignment "${asg.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const ok = await campusRepository.deleteAssignment(asg.id, profile || undefined);
      if (ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== asg.id));
        setSubmissions((prev) => prev.filter((s) => s.assignmentId !== asg.id));
        toast.success(`Deleted assignment "${asg.title}"`);
        if (activeSubmissionsAsg?.id === asg.id) {
          setActiveSubmissionsAsg(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete assignment');
    }
  };

  // Filtered Assignments
  const filteredAssignments = assignments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (subjectFilter !== 'all' && a.subject !== subjectFilter && a.subjectId !== subjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate KPIs
  const totalAsgs = assignments.length;
  const activeAsgs = assignments.filter((a) => a.status === 'active').length;
  const totalSubmsCount = submissions.length;
  const gradedSubmsCount = submissions.filter((s) => s.status === 'graded').length;
  const pendingSubmsCount = totalSubmsCount - gradedSubmsCount;

  // Active Assignment Submissions List
  const currentAsgSubmissions = activeSubmissionsAsg
    ? submissions.filter((s) => s.assignmentId === activeSubmissionsAsg.id)
    : [];

  const filteredCurrentSubmissions = currentAsgSubmissions.filter((s) => {
    if (submFilter === 'pending') return s.status !== 'graded';
    if (submFilter === 'graded') return s.status === 'graded';
    return true;
  });

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📋</span> Faculty Assignment & Grading Hub
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create syllabus coursework, track student submissions, and perform rubrics-based grading
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="shadow-glow font-700"
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Create New Assignment
          </Button>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Total Assignments</span>
              <span>📚</span>
            </div>
            <p className="text-2xl font-800 text-foreground font-mono-data">{totalAsgs}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across authorized subjects</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-success/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Active & Published</span>
              <span className="text-success">🟢</span>
            </div>
            <p className="text-2xl font-800 text-success font-mono-data">{activeAsgs}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Open for student submissions</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Submissions Received</span>
              <span>📥</span>
            </div>
            <p className="text-2xl font-800 text-accent font-mono-data">{totalSubmsCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{gradedSubmsCount} graded ({totalSubmsCount > 0 ? Math.round((gradedSubmsCount / totalSubmsCount) * 100) : 0}%)</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border/70 hover:border-warning/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-600">
              <span>Pending Evaluation</span>
              <span className="text-warning">⏳</span>
            </div>
            <p className="text-2xl font-800 text-warning font-mono-data">{pendingSubmsCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for grading</p>
          </div>
        </div>

        {/* Filter & Control Bar */}
        <div className="glass-card rounded-2xl p-4 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'draft', 'closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                  statusFilter === st
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {st === 'all' ? 'All Assignments' : st === 'active' ? 'Active' : st === 'draft' ? 'Drafts' : 'Closed'}
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
              <option value="all">All Assigned Subjects</option>
              {teacherSubjects.map((s) => (
                <option key={s.subjectId} value={s.subjectName}>
                  Sem {s.semesterNumber}: {s.subjectName} ({s.subjectCode})
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

        {/* Assignments Cards & Table */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading course assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-border/60">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl mx-auto mb-3">
              📝
            </div>
            <h3 className="text-base font-800 text-foreground mb-1">No Assignments Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
              {searchQuery || statusFilter !== 'all' || subjectFilter !== 'all'
                ? 'Try adjusting your search query or subject filters.'
                : 'Get started by creating your first course assignment or practical lab task.'}
            </p>
            <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
              Create First Assignment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg) => {
              const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
              const totalCount = asg.totalSubmissions || asgSubmissions.length;
              const gradedCount = asgSubmissions.filter((s) => s.status === 'graded').length;
              const progressPct = totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={asg.id}
                  className="glass-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="cyan">{asg.subjectCode || 'BCA'}</Badge>
                        <Badge variant="muted">{asg.semester || `Semester ${asg.semesterNumber}`}</Badge>
                      </div>
                      <span
                        className={`text-[10px] font-800 px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                          asg.status === 'active'
                            ? 'bg-success/15 text-success border border-success/30'
                            : asg.status === 'draft'
                            ? 'bg-muted text-muted-foreground border border-border'
                            : 'bg-destructive/15 text-destructive border border-destructive/30'
                        }`}
                      >
                        {asg.status}
                      </span>
                    </div>

                    <h3 className="text-base font-800 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {asg.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {asg.description || 'Complete the assignment guidelines and submit your solution.'}
                    </p>

                    {/* Due Date, Max Score & Attachment Indicators */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        📅 Due: <strong className="text-foreground font-mono-data">{asg.dueDate} {asg.dueTime || '11:59 PM'}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        🎯 Max Marks: <strong className="text-foreground font-mono-data">{asg.maxScore}</strong>
                      </span>
                      {asg.fileName && (
                        <button
                          onClick={() =>
                            setViewingDoc({
                              id: asg.id,
                              title: asg.title,
                              subject: asg.subject,
                              fileName: asg.fileName,
                              fileSize: asg.fileSize,
                              fileData: asg.fileData,
                              extractedText: asg.extractedText,
                              semesterNumber: asg.semesterNumber,
                            })
                          }
                          className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-600"
                        >
                          📎 {asg.fileName}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submission Progress & Actions */}
                  <div className="pt-3.5 border-t border-border/50 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-500">Grading Progress</span>
                        <span className="font-700 font-mono-data text-foreground">
                          {gradedCount} / {totalCount} graded ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveSubmissionsAsg(asg);
                          setSubmFilter('all');
                        }}
                        className="text-xs font-700 shadow-glow"
                      >
                        📋 Submissions & Grade ({totalCount})
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setViewingDoc({
                              id: asg.id,
                              title: asg.title,
                              subject: asg.subject,
                              fileName: asg.fileName,
                              fileSize: asg.fileSize,
                              fileData: asg.fileData,
                              extractedText: asg.extractedText || asg.description,
                              semesterNumber: asg.semesterNumber,
                            })
                          }
                          title="Preview Instructions"
                        >
                          👁️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssignment(asg)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Delete Assignment"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── CREATE ASSIGNMENT MODAL ─────────────────────────────────────── */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Course Assignment"
          description="Publish coursework, lab exercises, or project milestones strictly within your authorized subjects."
          maxWidth="lg"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateAssignment}
                disabled={isUploadingFile}
                className="shadow-glow font-700"
              >
                {isUploadingFile ? 'Publishing...' : 'Publish Assignment 🚀'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Page Replacement Simulation & Belady Anomaly Benchmarking"
                className="input-field text-xs font-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Assigned Subject & Semester *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="input-field text-xs font-600 cursor-pointer"
                >
                  {teacherSubjects.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      Semester {sub.semesterNumber} — {sub.subjectName} ({sub.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Maximum Marks *
                </label>
                <input
                  type="number"
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(e.target.value)}
                  className="input-field text-xs font-mono-data"
                  min="5"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input-field text-xs cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="input-field text-xs cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Instructions, Objectives & Deliverables
              </label>
              <textarea
                rows={4}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Detail the algorithm specifications, constraints, expected output format, and grading rubric..."
                className="input-field resize-none text-xs font-mono-data"
              />
            </div>

            {/* File Attachment Upload */}
            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Optional Assignment Attachment (PDF, DOCX, Code, Brief)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.py,.c,.cpp,.java,.zip,.png,.jpg"
                className="input-field text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-700 file:bg-primary file:text-white cursor-pointer"
              />
              {attachedFile && (
                <p className="text-[11px] text-success mt-1 font-600">
                  ✓ Ready to attach: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Status & Options */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLate}
                  onChange={(e) => setAllowLate(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="font-600 text-foreground">Allow Late Submissions</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-600 text-muted-foreground">Publish Status:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-card border border-border text-xs font-700"
                >
                  <option value="active">Active (Published)</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── SUBMISSIONS & GRADING MODAL ─────────────────────────────────── */}
      {activeSubmissionsAsg && (
        <Modal
          isOpen={Boolean(activeSubmissionsAsg)}
          onClose={() => setActiveSubmissionsAsg(null)}
          title={
            <div className="flex items-center gap-2">
              <span>📋</span>
              <div>
                <h3 className="text-base font-800 text-foreground">{activeSubmissionsAsg.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeSubmissionsAsg.subject} · {activeSubmissionsAsg.semester} · Max: {activeSubmissionsAsg.maxScore} marks
                </p>
              </div>
            </div>
          }
          maxWidth="2xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <div className="text-xs text-muted-foreground">
                Total Submissions: <strong className="text-foreground">{currentAsgSubmissions.length}</strong>
              </div>
              <Button variant="primary" size="sm" onClick={() => setActiveSubmissionsAsg(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Filter Submissions */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                {(['all', 'pending', 'graded'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSubmFilter(f)}
                    className={`px-3 py-1 rounded-xl text-xs font-700 cursor-pointer ${
                      submFilter === f
                        ? 'bg-primary text-white'
                        : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'pending' ? 'Needs Grading' : 'Graded'}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono-data">
                {filteredCurrentSubmissions.length} shown
              </span>
            </div>

            {/* Submissions List */}
            {filteredCurrentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm font-700 text-foreground mb-1">No Submissions Found</p>
                <p className="text-xs">No student submissions match the selected filter for this assignment.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCurrentSubmissions.map((subm) => (
                  <div
                    key={subm.id}
                    className="p-4 rounded-2xl border border-border/70 bg-card/60 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-800 text-foreground">{subm.studentName}</h4>
                        <span className="text-xs text-muted-foreground font-mono-data">({subm.rollNumber})</span>
                        <span
                          className={`text-[10px] font-800 px-2 py-0.5 rounded-md ${
                            subm.status === 'graded'
                              ? 'bg-success/15 text-success border border-success/30'
                              : 'bg-warning/15 text-warning border border-warning/30'
                          }`}
                        >
                          {subm.status === 'graded' ? `Graded: ${subm.score}/${subm.maxScore}` : 'Needs Review'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Submitted: <span className="font-mono-data text-foreground">{subm.submittedAt}</span>
                      </p>

                      {subm.textAnswer && (
                        <p className="text-xs text-foreground/90 font-mono-data bg-black/30 p-2 rounded-xl border border-border/40 line-clamp-2">
                          {subm.textAnswer}
                        </p>
                      )}

                      {subm.feedback && (
                        <p className="text-[11px] text-accent mt-1">
                          💬 Feedback: <em>"{subm.feedback}"</em>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {subm.fileName && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setViewingDoc({
                              id: subm.id,
                              title: `${subm.studentName} - ${subm.assignmentTitle}`,
                              subject: subm.subject,
                              fileName: subm.fileName,
                              fileSize: subm.fileSize,
                              fileData: subm.fileData,
                              extractedText: subm.extractedText || subm.textAnswer,
                            })
                          }
                          className="text-xs"
                        >
                          👁️ View File
                        </Button>
                      )}

                      <Button
                        variant={subm.status === 'graded' ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => {
                          setEvalSubm(subm);
                          setScoreInput(subm.score !== undefined ? String(subm.score) : '');
                          setFeedbackInput(subm.feedback || '');
                        }}
                        className="text-xs font-700 shadow-glow"
                      >
                        {subm.status === 'graded' ? '✏️ Edit Grade' : '⭐ Grade Submission'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ─── GRADE EVALUATION MODAL ──────────────────────────────────────── */}
      {evalSubm && (
        <Modal
          isOpen={Boolean(evalSubm)}
          onClose={() => setEvalSubm(null)}
          title={`Grade: ${evalSubm.studentName}`}
          description={`${evalSubm.assignmentTitle} · Roll: ${evalSubm.rollNumber}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" size="sm" onClick={() => setEvalSubm(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEvaluation} className="shadow-glow font-700">
                Save & Post Grade 💾
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Awarded Score (Out of {evalSubm.maxScore}) *
              </label>
              <input
                type="number"
                min="0"
                max={evalSubm.maxScore}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                className="input-field text-base font-bold font-mono-data"
                placeholder={`0 – ${evalSubm.maxScore}`}
                autoFocus
                required
              />
            </div>

            {/* Quick Feedback Suggestions */}
            <div>
              <p className="text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
                Quick Feedback Templates
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Flawless implementation & clear documentation! 🌟',
                  'Good work, minor edge case handling missed.',
                  'Well structured algorithm; review memory allocations.',
                  'Incomplete derivation in Section 2; please revise.',
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFeedbackInput(tpl)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-all cursor-pointer"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Teacher Feedback & Constructive Remarks
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="input-field resize-none text-xs"
                placeholder="Provide constructive feedback, notes on code quality, or recommendations for improvement..."
              />
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
