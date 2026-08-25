'use client';

import React, { useState } from 'react';
import { PracticeProblem } from '@/types/codelab';
import { PRACTICE_PROBLEMS } from '@/lib/codelab/problems';
import {
  BookOpen,
  CheckCircle2,
  X,
  Sparkles,
  ChevronRight,
  Code2,
  ListCheck,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface ProblemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProblemId: string | null;
  onSelectProblem: (problem: PracticeProblem) => void;
  currentLanguageId: string;
}

export default function ProblemDrawer({
  isOpen,
  onClose,
  selectedProblemId,
  onSelectProblem,
  currentLanguageId,
}: ProblemDrawerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'details'>('list');
  const [viewingProblem, setViewingProblem] = useState<PracticeProblem | null>(
    PRACTICE_PROBLEMS.find((p) => p.id === selectedProblemId) || PRACTICE_PROBLEMS[0]
  );

  if (!isOpen) return null;

  const handleOpenProblem = (problem: PracticeProblem) => {
    setViewingProblem(problem);
    setActiveTab('details');
  };

  const handleLoadToWorkspace = (problem: PracticeProblem) => {
    onSelectProblem(problem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-[#0a142f] border-l border-primary/40 shadow-glow flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="p-4 bg-[#070e22] border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-800 text-foreground">Practice Problem Arena</h3>
              <p className="text-[11px] text-muted-foreground">
                Solve algorithms with automated test verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'details' && (
              <button
                onClick={() => setActiveTab('list')}
                className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ← All Problems
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Select a problem to practice data structures & algorithms with real test evaluation:
              </div>

              {PRACTICE_PROBLEMS.map((problem) => {
                const isCurrent = problem.id === selectedProblemId;
                return (
                  <div
                    key={problem.id}
                    onClick={() => handleOpenProblem(problem)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-primary/20 border-primary/60 shadow-glow'
                        : 'bg-[#060b18] border-border/60 hover:border-primary/40 hover:bg-[#070f26]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{problem.title}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-accent/20 text-accent border border-accent/40">
                            Active
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          problem.difficulty === 'Easy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground line-clamp-2 mb-2 font-sans">
                      {problem.description}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span className="text-accent">{problem.category}</span>
                      <span className="flex items-center gap-1 text-primary">
                        View Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewingProblem ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-800 text-foreground">{viewingProblem.title}</h2>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      viewingProblem.difficulty === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {viewingProblem.difficulty}
                  </span>
                </div>
                <span className="text-xs text-accent font-semibold">{viewingProblem.category}</span>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-[#060b18] border border-border/60 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {viewingProblem.description}
              </div>

              {/* Input & Output format */}
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-xl bg-[#070e22] border border-border/60 text-xs">
                  <div className="font-bold text-muted-foreground text-[10px] uppercase mb-1">
                    Input Format
                  </div>
                  <div className="font-mono text-muted-foreground">{viewingProblem.inputFormat}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070e22] border border-border/60 text-xs">
                  <div className="font-bold text-muted-foreground text-[10px] uppercase mb-1">
                    Output Format
                  </div>
                  <div className="font-mono text-muted-foreground">{viewingProblem.outputFormat}</div>
                </div>
              </div>

              {/* Sample test cases */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Sample Test Cases
                </div>
                {viewingProblem.testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#060b18] border border-border/60 text-xs space-y-1.5 font-mono">
                    <div className="text-[11px] font-bold text-accent">Sample Case {idx + 1}:</div>
                    <div className="text-muted-foreground">Input:</div>
                    <pre className="p-2 rounded bg-black/40 text-foreground overflow-x-auto text-[11px]">{tc.input}</pre>
                    <div className="text-muted-foreground">Expected Output:</div>
                    <pre className="p-2 rounded bg-black/40 text-emerald-400 overflow-x-auto text-[11px]">{tc.expectedOutput}</pre>
                    {tc.explanation && (
                      <div className="text-[11px] text-muted-foreground italic mt-1 font-sans">
                        💡 {tc.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleLoadToWorkspace(viewingProblem)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white font-bold text-xs shadow-glow hover:shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer btn-press"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Load Starter Template into Editor</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
