'use client';

import React, { useState } from 'react';
import { TestCase, CodeExecutionRequest } from '@/types/codelab';
import {
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ListCheck,
  RotateCcw,
} from 'lucide-react';

interface TestCaseRunnerProps {
  testCases: TestCase[];
  onAddTestCase: (input: string, expectedOutput: string) => void;
  onRemoveTestCase: (id: string) => void;
  onRunTestCases: () => Promise<void>;
  isRunningTests: boolean;
}

export default function TestCaseRunner({
  testCases,
  onAddTestCase,
  onRemoveTestCase,
  onRunTestCases,
  isRunningTests,
}: TestCaseRunnerProps) {
  const [newCustomInput, setNewCustomInput] = useState('');
  const [newCustomExpected, setNewCustomExpected] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const passedCount = testCases.filter((tc) => tc.status === 'PASSED').length;
  const totalRun = testCases.filter((tc) => tc.status && tc.status !== 'PENDING').length;

  const handleCreate = () => {
    if (newCustomInput.trim()) {
      onAddTestCase(newCustomInput.trim(), newCustomExpected.trim());
      setNewCustomInput('');
      setNewCustomExpected('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050914] text-foreground font-mono text-xs select-text overflow-y-auto p-3 space-y-3">
      {/* Header with Run All button & scorecard */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0a142f] border border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
            <ListCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs">Automated Test Evaluation</div>
            <div className="text-[11px] text-muted-foreground">
              {totalRun > 0
                ? `${passedCount} of ${testCases.length} Tests Passed`
                : `${testCases.length} Test cases configured`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-muted border border-border text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Case</span>
          </button>

          <button
            onClick={onRunTestCases}
            disabled={isRunningTests || testCases.length === 0}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer btn-press"
          >
            {isRunningTests ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run All Tests</span>
          </button>
        </div>
      </div>

      {/* Add Custom Case Form */}
      {isAdding && (
        <div className="p-3 rounded-2xl bg-[#070e22] border border-primary/40 space-y-2 animate-fade-in">
          <div className="font-bold text-xs text-accent">New Custom Test Case</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Standard Input (stdin)
              </label>
              <textarea
                value={newCustomInput}
                onChange={(e) => setNewCustomInput(e.target.value)}
                placeholder="e.g. 4&#10;2 7 11 15&#10;9"
                rows={3}
                className="w-full bg-[#060b18] text-foreground text-xs p-2 rounded-xl border border-border focus:outline-none focus:border-primary font-mono resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">
                Expected Output
              </label>
              <textarea
                value={newCustomExpected}
                onChange={(e) => setNewCustomExpected(e.target.value)}
                placeholder="e.g. 0 1"
                rows={3}
                className="w-full bg-[#060b18] text-foreground text-xs p-2 rounded-xl border border-border focus:outline-none focus:border-primary font-mono resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-3 py-1 bg-primary text-white font-bold rounded-lg text-xs cursor-pointer shadow-glow"
            >
              Add Case
            </button>
          </div>
        </div>
      )}

      {/* Test Cases List */}
      <div className="space-y-2.5">
        {testCases.map((tc, idx) => {
          const isPassed = tc.status === 'PASSED';
          const isFailed = tc.status === 'FAILED';
          const isRunning = tc.status === 'RUNNING';

          return (
            <div
              key={tc.id}
              className={`p-3 rounded-2xl border transition-all ${
                isPassed
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isFailed
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : isRunning
                  ? 'bg-primary/10 border-primary/40 animate-pulse'
                  : 'bg-[#060b18] border-border/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">Case {idx + 1}</span>
                  {tc.isCustom && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-sans">
                      Custom
                    </span>
                  )}
                  {tc.executionTimeMs !== undefined && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {tc.executionTimeMs} ms
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isPassed && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passed
                    </span>
                  )}
                  {isFailed && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                  {isRunning && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-accent">
                      Running...
                    </span>
                  )}
                  {tc.isCustom && (
                    <button
                      onClick={() => onRemoveTestCase(tc.id)}
                      className="p-1 text-muted-foreground hover:text-danger rounded hover:bg-black/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Input, Expected, and Actual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-black/40 border border-border/40">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                    Input:
                  </div>
                  <pre className="text-foreground overflow-x-auto">{tc.input}</pre>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-border/40">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                    Expected:
                  </div>
                  <pre className="text-emerald-400 overflow-x-auto">{tc.expectedOutput}</pre>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-border/40">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                    Actual Output:
                  </div>
                  <pre
                    className={`overflow-x-auto ${
                      isPassed ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-muted-foreground'
                    }`}
                  >
                    {tc.actualOutput || (isRunning ? '...' : 'Not executed yet')}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
