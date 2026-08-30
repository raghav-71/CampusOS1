'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { NoteDocument, TeacherSubjectAssignment, BcaSemester } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { fileStorageService } from '@/services/fileStorageService';
import { DocumentParserService } from '@/services/documentParserService';
import { AuthorizationService } from '@/services/authorizationService';
import { useProfile } from '@/hooks/useProfile';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function TeacherNotesPublisher() {
  const { profile } = useProfile();
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [authorizedSemesters, setAuthorizedSemesters] = useState<BcaSemester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [availableSubjects, setAvailableSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [contentType, setContentType] = useState<'notes' | 'study-material' | 'syllabus'>('notes');
  const [publishStatus, setPublishStatus] = useState<'published' | 'draft'>('published');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [pagesInput, setPagesInput] = useState('24');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    const teacherEmail = profile?.email || 'dr.priya.nair@campusos.edu';
    const sems = AuthorizationService.getFacultyAuthorizedSemesters(teacherEmail);
    const initialSem = sems.length > 0 ? sems[0] : 5;
    setAuthorizedSemesters(sems.length > 0 ? sems : [1, 5, 6]);

    const activeSem = sems.includes(selectedSemester as any) ? selectedSemester : initialSem;
    setSelectedSemester(activeSem);

    const subjs = await campusRepository.getTeacherSubjects(teacherEmail);
    const filteredSubjs = subjs.filter((s) => s.semesterNumber === activeSem);
    setAvailableSubjects(filteredSubjs.length > 0 ? filteredSubjs : subjs);

    if (filteredSubjs.length > 0) {
      setSelectedSubjectId(filteredSubjs[0].subjectId);
    }

    const allNotes = await campusRepository.getNotes();
    const teacherName = profile?.fullName || 'Dr. Priya Nair';
    const scopedNotes = allNotes.filter(
      (n) => n.teacher.includes(teacherName) || teacherName.includes(n.teacher)
    );
    setNotes(scopedNotes.length > 0 ? scopedNotes : allNotes.slice(0, 5));
  }, [profile?.email, profile?.fullName, selectedSemester]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When semester changes in form, update available subjects
  const handleSemesterChange = async (sem: number) => {
    setSelectedSemester(sem);
    const teacherEmail = profile?.email || 'dr.priya.nair@campusos.edu';
    const subjs = await campusRepository.getTeacherSubjects(teacherEmail);
    const filteredSubjs = subjs.filter((s) => s.semesterNumber === sem);
    setAvailableSubjects(filteredSubjs.length > 0 ? filteredSubjs : subjs);
    if (filteredSubjs.length > 0) {
      setSelectedSubjectId(filteredSubjs[0].subjectId);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = fileStorageService.validateFile(file, {
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv'],
      maxSizeBytes: 25 * 1024 * 1024,
    });

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file format');
      return;
    }

    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return;
    }
    if (!selectedFile) {
      toast.error('Please choose a document file (PDF, DOCX, TXT)');
      return;
    }

    const assignedSub =
      availableSubjects.find((s) => s.subjectId === selectedSubjectId) || availableSubjects[0];
    if (!assignedSub) {
      toast.error('Please select an assigned subject for the target semester');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Asynchronously extract text from file
      let extractedText = '';
      try {
        const parsed = await DocumentParserService.parseFile(selectedFile);
        if (parsed.success) {
          extractedText = parsed.extractedText;
        }
      } catch {}

      // 2. Upload file to browser storage
      const storedFile = await fileStorageService.uploadFile(
        selectedFile,
        'notes',
        { allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv'] },
        (pct) => setUploadProgress(pct)
      );

      // 3. Persist document metadata and file data to shared repository
      const created = await campusRepository.uploadNote(
        {
          title,
          description: description || `Published lecture material for ${assignedSub.subjectName} (Semester ${assignedSub.semesterNumber}).`,
          subject: assignedSub.subjectName,
          subjectId: assignedSub.subjectId,
          subjectCode: assignedSub.subjectCode,
          semester: `Semester ${assignedSub.semesterNumber}`,
          semesterNumber: assignedSub.semesterNumber,
          targetSemester: assignedSub.semesterNumber,
          department: 'BCA',
          teacher: profile?.fullName || 'Dr. Priya Nair',
          teacherId: profile?.id || 'usr-003',
          tags: tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          pages: parseInt(pagesInput, 10) || 20,
          size: storedFile.fileSize,
          fileSize: storedFile.fileSize,
          fileName: storedFile.fileName,
          fileType: storedFile.fileType,
          fileUrl: storedFile.previewUrl,
          fileData: storedFile.dataUrl || storedFile.previewUrl,
          extractedText: extractedText || `Topic Summary for ${title}\nSubject: ${assignedSub.subjectName}\nInstructor: ${profile?.fullName || 'Dr. Priya Nair'}`,
          category: contentType,
          status: publishStatus,
          rating: 5.0,
          views: 1,
        },
        profile || undefined
      );

      setNotes((prev) => [created, ...prev]);
      toast.success(
        `Successfully published "${title}" for BCA Semester ${assignedSub.semesterNumber} (${assignedSub.subjectName})!`
      );
      setUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setTagsInput('');
    } catch (err: any) {
      toast.error('Failed to upload document: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string, noteTitle: string) => {
    await campusRepository.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success(`Removed document: "${noteTitle}" from repository`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight">
              BCA Course Notes & Study Material Publishing
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload verified lecture slides, laboratory manuals, and revision cheat sheets for your students
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="text-xs font-700 shadow-glow"
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            }
          >
            Upload Material
          </Button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((n) => (
            <div
              key={n.id}
              className="glass-card rounded-3xl p-5 border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm hover:shadow-glow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="cyan">{n.subject}</Badge>
                  <span className="text-xs text-muted-foreground font-mono-data">{n.size}</span>
                </div>

                <h3 className="text-base font-800 text-foreground mb-1.5 line-clamp-1">
                  {n.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {n.semester} · {n.pages} pages · Uploaded {n.uploadedAt}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40 font-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono-data">
                  <span>📥 {n.downloads} downloads</span>
                  <span className="text-warning">★ {n.rating || 4.9}</span>
                </div>
                <button
                  onClick={() => handleDelete(n.id, n.title)}
                  className="text-xs text-danger hover:underline cursor-pointer font-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => !isUploading && setUploadModalOpen(false)}
          title="Upload BCA Course Material"
          description="Publish verified lecture notes, lab manuals, and formula cheat sheets"
          footer={
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={isUploading}
                onClick={() => setUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isUploading}
                onClick={handleUploadSubmit}
                className="shadow-glow font-700"
              >
                {isUploading ? 'Uploading...' : 'Upload & Publish'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
                selectedFile
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-primary/60 bg-muted/10'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 text-xl">
                📚
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-xs font-700 text-foreground mb-0.5">
                    Attached: {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-accent font-mono-data">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to publish
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-700 text-foreground mb-0.5">
                    Click to select course document file
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports PDF, DOCX, PPTX formats up to 25MB
                  </p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-1.5 p-3 rounded-2xl bg-card border border-primary/40 animate-pulse">
                <div className="flex justify-between text-xs font-700 text-foreground">
                  <span>Uploading to Campus OS Repository...</span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="input-field cursor-pointer"
                >
                  <option value="notes">Lecture Notes</option>
                  <option value="study-material">Study Material / Cheatsheet</option>
                  <option value="syllabus">Syllabus & Lab Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Target Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(Number(e.target.value))}
                  className="input-field cursor-pointer font-700 text-primary"
                >
                  {authorizedSemesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem} (Assigned)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Assigned Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.subjectId} value={s.subjectId}>
                      {s.subjectName} ({s.subjectCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Audience Banner */}
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span className="font-600 text-foreground">
                  Target Audience: <strong className="text-primary">BCA Semester {selectedSemester}</strong> (
                  {availableSubjects.find((s) => s.subjectId === selectedSubjectId)?.subjectName || 'Course'} Cohort)
                </span>
              </div>
              <Badge variant="cyan">Semester Isolated</Badge>
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 8 — File Systems & Storage Subsystems"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Description / Overview
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of concepts covered in this document for student revision..."
                className="input-field resize-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Publishing Status
                </label>
                <select
                  value={publishStatus}
                  onChange={(e) => setPublishStatus(e.target.value as any)}
                  className="input-field cursor-pointer font-600"
                >
                  <option value="published">Published (Visible to Students)</option>
                  <option value="draft">Draft (Faculty Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Estimated Pages
                </label>
                <input
                  type="number"
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  className="input-field font-mono-data"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="OS, FileSystems, Inodes, Storage"
                className="input-field"
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
