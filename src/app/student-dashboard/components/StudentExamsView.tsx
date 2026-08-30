'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { mockExams } from '@/repositories/mockData';
import { campusRepository } from '@/repositories/campusRepository';
import { useProfile } from '@/hooks/useProfile';
import { ExamCategory, ExamType, PROGRAM_SEMESTERS, getSemesterInfo } from '@/lib/academicModel';
import { getSubjectColor } from '@/lib/academicColors';
import { QuestionPaper } from '@/types/campus';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AnimatedCard from '@/components/motion/AnimatedCard';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';

export default function StudentExamsView() {
  const { profile } = useProfile();
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ExamType | 'ALL'>('ALL');
  const [hallTicketOpen, setHallTicketOpen] = useState(false);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    async function loadPapers() {
      try {
        const papers = await campusRepository.getQuestionPapers(
          undefined,
          undefined,
          selectedSemester,
          profile || undefined
        );
        setQuestionPapers(papers);
      } catch {}
    }
    loadPapers();
  }, [selectedSemester, profile]);

  const handleDownloadPaper = (paper: QuestionPaper) => {
    try {
      const fileName = paper.fileName || `${paper.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      let downloadUrl = paper.fileData || paper.fileUrl;

      if (!downloadUrl) {
        const textContent =
          paper.extractedText ||
          `CampusOS University Examination Paper\nTitle: ${paper.title}\nSubject: ${paper.subject}\nYear: ${paper.year} · Semester ${paper.semesterNumber}\n\nMaximum Marks: ${paper.maxMarks || 100}\n\n${paper.description || 'Official end-term university question paper.'}`;
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        downloadUrl = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Downloaded: "${fileName}" (${paper.fileSize || '1.8 MB'})`);
    } catch {
      toast.error('Failed to download question paper');
    }
  };

  const handleAskAIAboutPaper = (paper: QuestionPaper) => {
    setSelectedPaper(null);
    window.dispatchEvent(
      new CustomEvent('campusos:open-ai', {
        detail: {
          query: `Analyze this question paper for ${paper.subject} (${paper.year}): "${paper.title}". Provide sample step-by-step solutions and key recurring patterns.`,
          selectedDocument: {
            id: paper.id,
            title: paper.title,
            subject: paper.subject,
            semester: `Semester ${paper.semesterNumber}`,
            extractedText: paper.extractedText || paper.description,
          },
        },
      })
    );
    toast.info(`Campus AI is analyzing "${paper.title}"...`);
  };

  const studentName = profile?.fullName ?? 'Arjun Sharma';
  const rollNumber = profile?.rollNumber ?? '2024-BCA-042';
  const department = 'Bachelor of Computer Applications (BCA)';

  // Filter exams based on selected Semester, Category, and Type
  const filteredExams = mockExams.filter((e) => {
    if (e.semesterNumber !== selectedSemester) return false;
    if (selectedCategory !== 'ALL' && e.examCategory !== selectedCategory) return false;
    if (selectedType !== 'ALL' && e.examType !== selectedType) return false;
    return true;
  });

  const theoryExams = filteredExams.filter((e) => e.examType === 'THEORY');
  const labExams = filteredExams.filter((e) => e.examType === 'LAB');

  const currentSemInfo = getSemesterInfo(selectedSemester);

  const getCategoryBadge = (cat?: ExamCategory) => {
    switch (cat) {
      case 'INTERNAL_1':
        return <span className="badge-cyan text-xs px-2.5 py-0.5 rounded-lg font-700">1st Internal</span>;
      case 'INTERNAL_2':
        return <span className="badge-warning text-xs px-2.5 py-0.5 rounded-lg font-700">2nd Internal</span>;
      case 'LAB_INTERNAL_1':
        return <span className="badge-cyan text-xs px-2.5 py-0.5 rounded-lg font-700">1st Lab Internal</span>;
      case 'LAB_INTERNAL_2':
        return <span className="badge-warning text-xs px-2.5 py-0.5 rounded-lg font-700">2nd Lab Internal</span>;
      case 'END_SEMESTER':
        return <span className="badge-violet text-xs px-2.5 py-0.5 rounded-lg font-700">End Semester Exam</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight flex items-center gap-2">
              <span>📅</span> Examination Timetable & Hall Ticket
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentSemInfo.label} Assessment Timetable · Theory & Laboratory Examinations
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => setHallTicketOpen(true)}
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            }
          >
            Download Hall Ticket
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <AnimatedCard className="p-4 sm:p-5 border-primary/30 space-y-4 shadow-glass">
          {/* Row 1: Semester Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-700 text-muted-foreground whitespace-nowrap mr-2">
              Semester:
            </span>
            {PROGRAM_SEMESTERS.map((sem) => (
              <button
                key={sem.semester}
                onClick={() => setSelectedSemester(sem.semester)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                  selectedSemester === sem.semester
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-glow border border-primary/50'
                    : 'glass-card border border-border/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                {sem.shortLabel} {sem.isCurrent && '⚡'}
              </button>
            ))}
          </div>

          {/* Row 2: Category & Type Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { key: 'ALL', label: 'All Assessment Cycles' },
                { key: 'INTERNAL_1', label: '1st Internal' },
                { key: 'INTERNAL_2', label: '2nd Internal' },
                { key: 'END_SEMESTER', label: 'End Semester' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap btn-press ${
                    selectedCategory === tab.key
                      ? 'bg-accent/20 text-accent border border-accent/40 font-800 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Type Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[
                { key: 'ALL', label: 'All Types' },
                { key: 'THEORY', label: '📝 Theory' },
                { key: 'LAB', label: '🧪 Lab Practical' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-700 transition-all cursor-pointer btn-press ${
                    selectedType === t.key
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Empty State */}
        {filteredExams.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-muted-foreground border border-border/80 space-y-2 animate-fade-in">
            <p className="text-base font-700 text-foreground">No Examinations Found</p>
            <p className="text-xs">
              No examination schedules match your selected filters for {currentSemInfo.label}.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Theory Examinations Section */}
            {theoryExams.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📝</span>
                  <h3 className="text-base font-800 text-foreground">Theory Examinations</h3>
                  <Badge variant="cyan">{theoryExams.length} Scheduled</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {theoryExams.map((exam, index) => {
                    const colorDef = getSubjectColor(exam.subject);
                    return (
                      <AnimatedCard
                        key={exam.id}
                        className={`p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-glow ${
                          index === 0 && selectedSemester === 5
                            ? 'border-warning/50 bg-warning/5'
                            : 'border-border/80 hover:border-primary/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-lg font-700 border ${colorDef.badgeBg} ${colorDef.badgeBorder} ${colorDef.badgeText}`}
                              >
                                {exam.subjectCode}
                              </span>
                              {getCategoryBadge(exam.examCategory)}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-700">
                              Max: {exam.maxMarks || 50} Marks
                            </span>
                          </div>

                          <h4 className="text-lg font-800 text-foreground mb-1 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: colorDef.hex }}
                            />
                            {exam.subject}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3 font-500">
                            Location: <span className="text-foreground font-700">{exam.room}</span> · Faculty: {exam.faculty}
                          </p>

                          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/20 border border-border/40 text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Exam Date:</span>
                              <span className="font-800 text-foreground">{exam.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time & Duration:</span>
                              <span className="font-800 text-foreground font-mono-data">
                                {exam.time} ({exam.duration})
                              </span>
                            </div>
                            {exam.syllabusCovered && (
                              <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                <span className="font-700 text-foreground">Syllabus Scope: </span>
                                {exam.syllabusCovered}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                          <button
                            onClick={() => toast.info(`Viewing curriculum syllabus for ${exam.subject}`)}
                            className="text-xs text-primary hover:underline font-700 cursor-pointer btn-press"
                          >
                            View Exam Syllabus →
                          </button>
                          <Badge variant="cyan">Seating Verified</Badge>
                        </div>
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Laboratory Practical Examinations Section */}
            {labExams.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🧪</span>
                  <h3 className="text-base font-800 text-foreground">Laboratory Practical Examinations</h3>
                  <Badge variant="violet">{labExams.length} Scheduled</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {labExams.map((exam) => {
                    const colorDef = getSubjectColor(exam.subject);
                    return (
                      <AnimatedCard
                        key={exam.id}
                        className="p-6 border border-primary/40 bg-primary/5 transition-all flex flex-col justify-between shadow-sm hover:shadow-glow"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-lg font-700 border ${colorDef.badgeBg} ${colorDef.badgeBorder} ${colorDef.badgeText}`}
                              >
                                {exam.subjectCode}
                              </span>
                              {getCategoryBadge(exam.examCategory)}
                              <span className="badge-violet text-[10px] px-2 py-0.5 rounded font-800">
                                Practical
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-700">
                              Max: {exam.maxMarks || 50} Marks
                            </span>
                          </div>

                          <h4 className="text-lg font-800 text-foreground mb-1 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: colorDef.hex }}
                            />
                            {exam.subject}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3 font-500">
                            Laboratory Venue: <span className="text-foreground font-700">{exam.room}</span>
                          </p>

                          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/20 border border-border/40 text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Lab Date:</span>
                              <span className="font-800 text-foreground">{exam.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Practical Slot:</span>
                              <span className="font-800 text-foreground font-mono-data">
                                {exam.time} ({exam.duration})
                              </span>
                            </div>
                            {exam.syllabusCovered && (
                              <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                <span className="font-700 text-foreground">Lab Experiments: </span>
                                {exam.syllabusCovered}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-500">Internal & External Viva Included</span>
                          <Badge variant="success">Lab Ready</Badge>
                        </div>
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Question Papers Section */}
            {questionPapers.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">📑</span>
                    <h3 className="text-base font-800 text-foreground">
                      Previous Years & Model Question Papers
                    </h3>
                    <Badge variant="cyan">{questionPapers.length} Available</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Semester {selectedSemester} Archives</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {questionPapers.map((paper) => (
                    <AnimatedCard
                      key={paper.id}
                      className="p-5 border border-border/80 bg-card/60 transition-all flex flex-col justify-between shadow-sm hover:shadow-glow group cursor-pointer"
                      onClick={() => setSelectedPaper(paper)}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="badge-cyan text-[11px] px-2.5 py-0.5 rounded-lg font-700">
                            {paper.subject}
                          </span>
                          <span className="text-[11px] font-mono-data text-muted-foreground font-700">
                            {paper.year}
                          </span>
                        </div>

                        <h4 className="text-base font-800 text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                          {paper.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          {paper.examType || 'End Semester'} · Max Marks: {paper.maxMarks || 100}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAskAIAboutPaper(paper);
                          }}
                          className="text-xs text-primary font-700 hover:underline flex items-center gap-1"
                        >
                          ✨ Solve with AI
                        </button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPaper(paper);
                          }}
                        >
                          Download 📥
                        </Button>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Universal Document Viewer & AI Study Modal for Question Papers */}
      <DocumentViewerModal
        isOpen={Boolean(selectedPaper)}
        onClose={() => setSelectedPaper(null)}
        document={selectedPaper}
        onAskAI={(prompt, doc) => handleAskAIAboutPaper(doc as QuestionPaper || selectedPaper!)}
        onDownload={(doc) => handleDownloadPaper(doc as QuestionPaper || selectedPaper!)}
      />

      {/* Hall Ticket Admit Card Modal */}
      {hallTicketOpen && (
        <Modal
          isOpen={hallTicketOpen}
          onClose={() => setHallTicketOpen(false)}
          maxWidth="xl"
          title="Official Examination Hall Ticket"
          description={`University Examination Board · ${currentSemInfo.label} (${currentSemInfo.term})`}
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setHallTicketOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success('Official examination hall ticket PDF downloaded');
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
                <p className="text-xs text-muted-foreground font-500">
                  {department} · {currentSemInfo.label} ({currentSemInfo.term})
                </p>
                <p className="text-xs font-mono-data text-primary font-800 mt-0.5">
                  Roll No: {rollNumber}
                </p>
              </div>
              <div className="w-16 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground text-center font-700 shadow-sm">
                Photo ID
              </div>
            </div>

            {/* Exam Table in Admit Card */}
            <div>
              <p className="text-xs font-800 uppercase tracking-wider text-muted-foreground mb-2">
                Authorized Examinations ({filteredExams.length} Total)
              </p>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="py-2 px-1">Code</th>
                      <th className="py-2 px-1">Subject</th>
                      <th className="py-2 px-1">Type</th>
                      <th className="py-2 px-1">Date</th>
                      <th className="py-2 px-1 text-right">Venue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredExams.map((e) => (
                      <tr key={`ht-${e.id}`} className="row-hover-glow transition-all">
                        <td className="py-2 px-1 font-mono-data font-800 text-foreground">
                          {e.subjectCode}
                        </td>
                        <td className="py-2 px-1 text-foreground font-700">{e.subject}</td>
                        <td className="py-2 px-1 text-muted-foreground font-600">
                          {e.examType === 'LAB' ? '🧪 Lab' : '📝 Theory'}
                        </td>
                        <td className="py-2 px-1 text-muted-foreground">{e.date}</td>
                        <td className="py-2 px-1 text-right font-800 text-accent">{e.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Seal */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-muted-foreground">
              <span>Barcode ID: 8829-1029-4401</span>
              <span className="text-success font-700">
                ✓ Verified by Controller of Examinations
              </span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
