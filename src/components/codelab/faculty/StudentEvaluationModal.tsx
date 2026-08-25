'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StudentCodeSubmission } from '@/types/facultyCodelab';
import { facultyCodeRepo } from '@/repositories/facultyCodeRepository';
import {
  GraduationCap,
  X,
  Sparkles,
  Save,
  Check,
  Code2,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  User,
  Clock,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

import { DiffEditor } from '@monaco-editor/react';

const MonacoDiffEditor = DiffEditor as any;

interface StudentEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceSolutionCode: string;
  languageId: string;
}

export default function StudentEvaluationModal({
  isOpen,
  onClose,
  referenceSolutionCode,
  languageId,
}: StudentEvaluationModalProps) {
  const [submissions, setSubmissions] = useState<StudentCodeSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<StudentCodeSubmission | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string>('');
  const [assignedScore, setAssignedScore] = useState<number>(8);

  useEffect(() => {
    if (isOpen) {
      facultyCodeRepo.getSubmissions().then((list) => {
        setSubmissions(list);
        if (list.length > 0) {
          setSelectedSub(list[0]);
          if (list[0].evaluation) {
            setEvaluationFeedback(list[0].evaluation.feedback);
            setAssignedScore(list[0].evaluation.suggestedScore);
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSubmission = (sub: StudentCodeSubmission) => {
    setSelectedSub(sub);
    if (sub.evaluation) {
      setEvaluationFeedback(sub.evaluation.feedback);
      setAssignedScore(sub.evaluation.suggestedScore);
    } else {
      setEvaluationFeedback('');
      setAssignedScore(8);
    }
  };

  const handleRunAiEvaluation = async () => {
    if (!selectedSub) return;
    setIsEvaluating(true);
    toast.loading('AI is analyzing student submission correctness and complexity...', { id: 'eval' });

    try {
      const response = await fetch('/api/code/faculty-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EVALUATE_SUBMISSION',
          mode: 'assessment',
          context: {
            language: languageId,
            fileName: 'reference.py',
            sourceCode: referenceSolutionCode,
          },
          params: {
            studentCode: selectedSub.submittedCode,
            marks: 10,
          },
        }),
      });

      const data = await response.json();
      toast.dismiss('eval');

      if (data.success && data.response) {
        setEvaluationFeedback(data.response);
        toast.success('AI evaluation generated! Review score & feedback.');
      } else {
        toast.error(data.error || 'Evaluation failed.');
      }
    } catch (err: any) {
      toast.dismiss('eval');
      toast.error('AI error: ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedSub) return;
    const updated: StudentCodeSubmission = {
      ...selectedSub,
      status: 'EVALUATED',
      evaluation: {
        suggestedScore: assignedScore,
        maxScore: 10,
        correctness: 'Analyzed',
        strengths: [],
        problems: [],
        suggestions: [],
        feedback: evaluationFeedback,
        complexityAnalysis: 'Verified',
        evaluatedAt: Date.now(),
      },
    };

    await facultyCodeRepo.saveSubmission(updated);
    toast.success(`Saved evaluation for ${selectedSub.studentName} (${assignedScore}/10)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#0a142f] border border-primary/40 rounded-3xl shadow-glow flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0b1736] to-[#060b18] border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-800 text-foreground tracking-tight">
                Student Code Submission Evaluator
              </h3>
              <p className="text-xs text-muted-foreground">
                Compare reference solution vs student code & generate constructive feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Submissions List */}
          <div className="w-full md:w-64 bg-[#070e22] border-r border-border/70 p-3 space-y-2 overflow-y-auto shrink-0 select-none">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
              Submissions ({submissions.length})
            </div>
            {submissions.map((sub) => {
              const isSelected = sub.id === selectedSub?.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-primary/20 border-primary/60 text-accent font-semibold shadow-sm'
                      : 'bg-[#060b18] border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground truncate">{sub.studentName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                      {sub.studentId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{sub.questionTitle}</span>
                    {sub.testResults && (
                      <span className="text-emerald-400 font-mono">
                        {sub.testResults.passed}/{sub.testResults.total} Passed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center / Right Evaluation Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {selectedSub ? (
              <>
                {/* Submission Header Card */}
                <div className="p-3.5 rounded-2xl bg-[#060b18] border border-border/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-accent" />
                    <div>
                      <div className="font-bold text-foreground">
                        {selectedSub.studentName} ({selectedSub.studentId})
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunAiEvaluation}
                      disabled={isEvaluating}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5 cursor-pointer disabled:opacity-50 btn-press"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isEvaluating ? 'Evaluating...' : 'Run AI Evaluation'}</span>
                    </button>
                  </div>
                </div>

                {/* Monaco Diff Viewer: Reference vs Student */}
                <div className="h-56 bg-[#060b18] rounded-2xl overflow-hidden border border-border/70">
                  <MonacoDiffEditor
                    height="100%"
                    language={languageId}
                    original={referenceSolutionCode}
                    modified={selectedSub.submittedCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                {/* AI Assessment & Feedback Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Evaluation Feedback & Score
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Assigned Score:</span>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={assignedScore}
                        onChange={(e) => setAssignedScore(parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-[#060b18] text-accent font-bold text-xs p-1 rounded-lg border border-primary text-center focus:outline-none"
                      />
                      <span className="text-muted-foreground text-xs">/ 10</span>
                    </div>
                  </div>
                  <textarea
                    value={evaluationFeedback}
                    onChange={(e) => setEvaluationFeedback(e.target.value)}
                    placeholder="Click 'Run AI Evaluation' or type personalized student feedback here..."
                    rows={6}
                    className="w-full bg-[#060b18] text-foreground text-xs p-3 rounded-2xl border border-border focus:outline-none focus:border-primary font-mono resize-none leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Code2 className="w-8 h-8 opacity-30 mb-2" />
                <p>Select a student submission from the left list to begin evaluation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070e22] border-t border-border/80 flex items-center justify-between select-none">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEvaluation}
            disabled={!selectedSub}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 btn-press"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Student Evaluation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
