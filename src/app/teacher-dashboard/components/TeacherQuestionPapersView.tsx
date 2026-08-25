'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { QuestionPaperDocument, TeacherSubjectAssignment } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { fileStorageService } from '@/services/fileStorageService';
import { useProfile } from '@/hooks/useProfile';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AnimatedCard from '@/components/motion/AnimatedCard';

export default function TeacherQuestionPapersView() {
  const { profile } = useProfile();
  const [papers, setPapers] = useState<QuestionPaperDocument[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [previewPaper, setPreviewPaper] = useState<QuestionPaperDocument | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examType, setExamType] = useState<'Mid-Term' | 'End-Term' | 'Quiz' | 'Practical'>('Mid-Term');
  const [totalMarks, setTotalMarks] = useState('50');
  const [duration, setDuration] = useState('90 Minutes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replacePaperId, setReplacePaperId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    const teacherId = profile?.id || 'usr-003';
    const teacherEmail = profile?.email || 'dr.priya.nair@campusos.edu';
    const [qps, subjs] = await Promise.all([
      campusRepository.getQuestionPapers(teacherId),
      campusRepository.getTeacherSubjects(teacherEmail),
    ]);
    setPapers(qps);
    setTeacherSubjects(subjs);
    if (subjs.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjs[0].subjectId);
    }
  }, [profile?.id, profile?.email, selectedSubjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenUpload = (paperToReplace?: QuestionPaperDocument) => {
    if (paperToReplace) {
      setReplacePaperId(paperToReplace.id);
      setTitle(paperToReplace.title);
      setSelectedSubjectId(paperToReplace.subjectId);
      setExamType(paperToReplace.examType);
      setTotalMarks(String(paperToReplace.totalMarks));
      setDuration(paperToReplace.duration);
    } else {
      setReplacePaperId(null);
      setTitle('');
      setSelectedFile(null);
      setTotalMarks('50');
      setDuration('90 Minutes');
    }
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = fileStorageService.validateFile(file, {
      allowedExtensions: ['pdf', 'doc', 'docx'],
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
    if (!selectedFile && !replacePaperId) {
      toast.error('Please select a question paper PDF document to upload');
      return;
    }
    if (!title.trim()) {
      toast.error('Please provide an official paper title');
      return;
    }

    const assignedSub = teacherSubjects.find((s) => s.subjectId === selectedSubjectId) || teacherSubjects[0];
    if (!assignedSub) {
      toast.error('Please select an assigned BCA subject');
      return;
    }

    setIsUploading(true);
    try {
      let storedFile = null;
      if (selectedFile) {
        storedFile = await fileStorageService.uploadFile(
          selectedFile,
          'question-paper',
          { allowedExtensions: ['pdf', 'doc', 'docx'] },
          (pct) => setUploadProgress(pct)
        );
      }

      if (replacePaperId) {
        await campusRepository.deleteQuestionPaper(replacePaperId);
      }

      await campusRepository.uploadQuestionPaper({
        teacherId: profile?.id || 'usr-003',
        teacherName: profile?.fullName || 'Dr. Priya Nair',
        subjectId: assignedSub.subjectId,
        subject: assignedSub.subjectName,
        subjectCode: assignedSub.subjectCode,
        semester: assignedSub.semester,
        semesterNumber: assignedSub.semesterNumber,
        year: assignedSub.year,
        examType,
        title,
        fileName: storedFile?.fileName || 'Official_QuestionPaper.pdf',
        fileSize: storedFile?.fileSize || '1.8 MB',
        fileUrl: storedFile?.previewUrl,
        totalMarks: parseInt(totalMarks, 10) || 50,
        duration,
      });

      await loadData();
      toast.success(
        replacePaperId
          ? `Question paper "${title}" replaced successfully!`
          : `Question paper "${title}" uploaded and published for ${assignedSub.subjectName}!`
      );
      setUploadModalOpen(false);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setReplacePaperId(null);
    }
  };

  const handleDelete = async (id: string, paperTitle: string) => {
    if (confirm(`Are you sure you want to remove question paper "${paperTitle}"?`)) {
      await campusRepository.deleteQuestionPaper(id);
      await loadData();
      toast.info(`Question paper "${paperTitle}" deleted.`);
    }
  };

  const handleDownload = (qp: QuestionPaperDocument) => {
    toast.success(`Downloaded ${qp.fileName} (${qp.fileSize})`);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight">
              BCA Examination Question Papers & Blueprints
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload, review, and manage verified university question papers for your assigned courses
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenUpload()}
              className="text-xs font-700 shadow-glow"
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              }
            >
              Upload PDF
            </Button>
          </div>
        </div>

        {papers.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground border border-border/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl mx-auto text-primary">
              📑
            </div>
            <p className="text-base font-700 text-foreground">No Question Papers Uploaded Yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Upload your semester mid-term or end-term question paper PDF for official COE archiving.
            </p>
            <Button variant="primary" size="sm" onClick={() => handleOpenUpload()}>
              Upload First PDF
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {papers.map((qp) => (
              <AnimatedCard
                key={qp.id}
                className="p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-glow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge
                      variant={
                        qp.examType === 'Mid-Term'
                          ? 'violet'
                          : qp.examType === 'End-Term'
                            ? 'warning'
                            : 'cyan'
                      }
                    >
                      {qp.examType}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono-data">
                      {qp.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-800 text-foreground mb-1.5 line-clamp-2">
                    {qp.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {qp.subject} ({qp.subjectCode}) · {qp.semester} · Max Marks: {qp.totalMarks}
                  </p>

                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Document</span>
                      <span className="font-mono-data text-foreground">{qp.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-success font-700">{qp.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span className="text-foreground">{qp.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewPaper(qp)}
                      className="w-full text-xs font-600"
                    >
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(qp)}
                      className="w-full text-xs font-600"
                    >
                      Download
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenUpload(qp)}
                      className="w-full text-xs font-600"
                    >
                      🔄 Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(qp.id, qp.title)}
                      className="w-full text-xs text-danger hover:bg-danger/10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>

      {/* Upload Question Paper Modal */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => !isUploading && setUploadModalOpen(false)}
          maxWidth="lg"
          title={replacePaperId ? 'Replace Question Paper PDF' : 'Upload Question Paper PDF'}
          description="Upload verified university evaluation paper in PDF format (up to 25MB)"
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
                {isUploading ? 'Uploading...' : replacePaperId ? 'Replace PDF' : 'Upload & Publish PDF'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx"
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
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 text-2xl">
                📄
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-xs font-700 text-foreground mb-0.5">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-accent font-mono-data">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-700 text-foreground mb-0.5">
                    Click to browse or drop Question Paper PDF
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports official PDF, DOC, DOCX documents up to 25MB
                  </p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-1.5 p-3 rounded-2xl bg-card border border-primary/40 animate-pulse">
                <div className="flex justify-between text-xs font-700 text-foreground">
                  <span>Uploading document...</span>
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

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Official Examination Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operating Systems Mid-Semester Assessment Paper 2026"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Subject (Your Assigned Courses)
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {teacherSubjects.map((s) => (
                    <option key={s.subjectId} value={s.subjectId}>
                      {s.subjectName} ({s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as any)}
                  className="input-field cursor-pointer"
                >
                  <option value="Mid-Term">Mid-Term (Internal)</option>
                  <option value="End-Term">End-Term (University)</option>
                  <option value="Quiz">Special Quiz</option>
                  <option value="Practical">Lab Practical Examination</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="input-field font-mono-data"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="90 Minutes or 3 Hours"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Question Paper Preview Modal */}
      {previewPaper && (
        <Modal
          isOpen={Boolean(previewPaper)}
          onClose={() => setPreviewPaper(null)}
          maxWidth="xl"
          title={previewPaper.title}
          description={`${previewPaper.subjectCode} · Duration: ${previewPaper.duration} · Max Marks: ${previewPaper.totalMarks}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-muted-foreground font-mono-data">
                Uploaded: {previewPaper.uploadedAt}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewPaper(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleDownload(previewPaper);
                    setPreviewPaper(null);
                  }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-6 rounded-3xl border border-border bg-card/90 space-y-4 font-mono-data text-xs leading-relaxed">
            <div className="text-center border-b border-border pb-3">
              <h4 className="font-800 text-sm text-foreground uppercase tracking-wide">
                UNIVERSITY DEPARTMENT OF COMPUTER APPLICATIONS (BCA)
              </h4>
              <p className="text-muted-foreground mt-0.5">
                {previewPaper.examType} Assessment — {previewPaper.subject} ({previewPaper.subjectCode})
              </p>
              <p className="text-[10px] text-accent font-700 mt-1">
                Verified Cryptographic Faculty Signature: {previewPaper.teacherName}
              </p>
            </div>

            <div>
              <p className="font-700 text-primary mb-1">
                PART A (Answer all compulsory questions — 10 x 2 = 20 Marks)
              </p>
              <p>1. Define Virtual Memory and explain the function of the Translation Lookaside Buffer (TLB).</p>
              <p>2. Differentiate preemptive vs non-preemptive CPU scheduling with algorithmic trade-offs.</p>
              <p>3. State Coffman&apos;s four necessary and sufficient conditions for system deadlock.</p>
            </div>

            <div className="pt-2 border-t border-border/40">
              <p className="font-700 text-accent mb-1">
                PART B (Answer any 4 major sections — 4 x 20 = 80 Marks)
              </p>
              <p>
                4. Given a set of 5 processes and 3 resource instances, demonstrate Banker&apos;s Safety Algorithm and determine safe execution sequences.
              </p>
              <p>
                5. Formulate Page Replacement benchmarks for FIFO, LRU, and Optimal algorithms under given reference strings.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
