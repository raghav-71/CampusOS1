'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockSubmissions } from '@/repositories/mockData';
import { Submission } from '@/types/campus';

export default function TeacherSubmissionsFeed() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [selectedSubm, setSelectedSubm] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const handleOpenGradeModal = (subm: Submission) => {
    setSelectedSubm(subm);
    setGradeInput(subm.score ? String(subm.score) : '');
    setFeedbackInput(subm.feedback || '');
  };

  const handleSaveGrade = () => {
    if (!selectedSubm) return;
    const numericScore = parseFloat(gradeInput);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > selectedSubm.maxScore) {
      toast.error(`Score must be between 0 and ${selectedSubm.maxScore}`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSubm.id
          ? { ...s, score: numericScore, feedback: feedbackInput, status: 'graded' }
          : s
      )
    );
    toast.success(`Graded ${selectedSubm.studentName}: ${numericScore}/${selectedSubm.maxScore}`);
    setSelectedSubm(null);
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-5 border border-border h-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-600 text-foreground">Recent Submissions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {submissions.filter((s) => s.status !== 'graded').length} pending evaluations
            </p>
          </div>
          <button
            onClick={() => toast.info('All submissions view')}
            className="text-xs text-primary hover:underline font-500"
          >
            View all →
          </button>
        </div>

        <div className="space-y-3">
          {submissions.map((subm) => (
            <div
              key={subm.id}
              className={`p-3.5 rounded-xl border transition-all ${
                subm.status === 'graded'
                  ? 'border-border/40 bg-muted/10 opacity-75'
                  : 'border-border bg-muted/25 hover:border-accent/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-600 ${
                      subm.status === 'graded' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {subm.status === 'graded' ? `Graded: ${subm.score}/${subm.maxScore}` : 'Needs Review'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono-data">
                    {subm.rollNumber}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{subm.submittedAt}</span>
              </div>

              <p className="text-sm font-600 text-foreground mb-0.5">{subm.studentName}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{subm.assignmentTitle}</p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground font-500">{subm.subject}</span>
                <button
                  onClick={() => handleOpenGradeModal(subm)}
                  className="text-xs btn-secondary px-2.5 py-1"
                >
                  {subm.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Modal */}
      {selectedSubm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSubm(null)} />
          <div className="relative glass-card rounded-2xl p-6 border border-border max-w-md w-full animate-fade-in-up">
            <h3 className="text-base font-700 text-foreground mb-1">
              Grade Submission: {selectedSubm.studentName}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedSubm.assignmentTitle} &nbsp;·&nbsp; Roll: {selectedSubm.rollNumber}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Score (Out of {selectedSubm.maxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubm.maxScore}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="input-field"
                  placeholder={`0 - ${selectedSubm.maxScore}`}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Feedback to Student
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="input-field resize-none"
                  placeholder="Optional notes or critique..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedSubm(null)}
                className="btn-ghost flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGrade}
                className="btn-primary flex-1 py-2.5"
              >
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
