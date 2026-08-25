'use client';

import React, { useState } from 'react';
import { CodeExecutionResult, ParsedErrorMarker } from '@/types/codelab';
import {
  Terminal as TerminalIcon,
  AlertTriangle,
  Play,
  Copy,
  Trash2,
  Clock,
  HardDrive,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Keyboard,
  ListCheck,
  Check,
} from 'lucide-react';

interface CodeOutputPanelProps {
  executionResult: CodeExecutionResult | null;
  isRunning: boolean;
  stdin: string;
  onStdinChange: (val: string) => void;
  onJumpToLine: (line: number) => void;
  onFixWithAi: () => void;
  onRunTests?: () => void;
  testCasesCount?: number;
}

export default function CodeOutputPanel({
  executionResult,
  isRunning,
  stdin,
  onStdinChange,
  onJumpToLine,
  onFixWithAi,
  onRunTests,
  testCasesCount = 0,
}: CodeOutputPanelProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'errors' | 'stdin' | 'console' | 'tests'>('output');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasErrors =
    executionResult &&
    (executionResult.status === 'COMPILATION_ERROR' ||
      executionResult.status === 'RUNTIME_ERROR' ||
      executionResult.stderr.length > 0 ||
      (executionResult.errorMarkers && executionResult.errorMarkers.length > 0));

  const errorMarkers: ParsedErrorMarker[] = executionResult?.errorMarkers || [];

  return (
    <div className="w-full h-full flex flex-col bg-[#050914] border-t border-border/80 text-foreground font-mono select-text">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a142f]/80 border-b border-border/60 select-none">
        <div className="flex items-center gap-1">
          {/* Output Tab */}
          <button
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'output'
                ? 'bg-primary/20 text-accent border border-primary/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>OUTPUT</span>
            {executionResult && (
              <span
                className={`w-2 h-2 rounded-full ${
                  executionResult.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              />
            )}
          </button>

          {/* Errors Tab */}
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'errors'
                ? 'bg-danger/20 text-danger border border-danger/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ERRORS</span>
            {hasErrors && (
              <span className="px-1.5 py-0.2 bg-danger text-white text-[10px] font-extrabold rounded-full">
                {errorMarkers.length || '!'}
              </span>
            )}
          </button>

          {/* Stdin Tab */}
          <button
            onClick={() => setActiveTab('stdin')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stdin'
                ? 'bg-primary/20 text-accent border border-primary/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>INPUT (stdin)</span>
            {stdin.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </button>

          {/* Tests Tab */}
          {testCasesCount > 0 && (
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <ListCheck className="w-3.5 h-3.5" />
              <span>TESTS ({testCasesCount})</span>
            </button>
          )}
        </div>

        {/* Status telemetry & copy buttons */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {isRunning ? (
            <div className="flex items-center gap-2 text-accent animate-pulse font-semibold">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span>Executing in sandbox...</span>
            </div>
          ) : executionResult ? (
            <div className="hidden sm:flex items-center gap-3">
              {executionResult.executionTimeMs !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{executionResult.executionTimeMs} ms</span>
                </div>
              )}
              {executionResult.memoryUsedBytes !== undefined && (
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-accent" />
                  <span>{Math.round(executionResult.memoryUsedBytes / 1024)} KB</span>
                </div>
              )}
              <div
                className={`flex items-center gap-1 font-bold ${
                  executionResult.status === 'SUCCESS' ? 'text-emerald-400' : 'text-danger'
                }`}
              >
                {executionResult.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{executionResult.status}</span>
              </div>
            </div>
          ) : null}

          {/* Copy output */}
          <button
            onClick={() =>
              handleCopy(
                (executionResult?.stdout || '') + '\n' + (executionResult?.stderr || '')
              )
            }
            title="Copy Terminal Output"
            className="p-1 rounded hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
        {/* OUTPUT TAB */}
        {activeTab === 'output' && (
          <div>
            {isRunning ? (
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
                <span>Running compilation and execution in secure sandbox...</span>
              </div>
            ) : executionResult ? (
              <div className="space-y-3">
                {/* Compiler Output if any */}
                {executionResult.compilationOutput && (
                  <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/30 text-rose-300 whitespace-pre-wrap font-mono">
                    <div className="text-[11px] font-bold text-danger uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Compilation Messages:</span>
                    </div>
                    {executionResult.compilationOutput}
                  </div>
                )}

                {/* Standard Output */}
                {executionResult.stdout && (
                  <div className="whitespace-pre-wrap text-emerald-300">
                    {executionResult.stdout}
                  </div>
                )}

                {/* Standard Error */}
                {executionResult.stderr && (
                  <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/30 text-rose-300 whitespace-pre-wrap font-mono">
                    <div className="text-[11px] font-bold text-danger uppercase tracking-wider mb-1">
                      Stderr / Exception:
                    </div>
                    {executionResult.stderr}
                  </div>
                )}

                {!executionResult.stdout &&
                  !executionResult.stderr &&
                  !executionResult.compilationOutput && (
                    <div className="text-muted-foreground italic">
                      Program finished with exit code {executionResult.exitCode ?? 0} (No output printed).
                    </div>
                  )}

                {/* Quick AI Fix Banner if error occurred */}
                {hasErrors && (
                  <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-900/20 to-accent/20 border border-accent/40 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                        ⚡
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-xs">AI Error Diagnosis Ready</div>
                        <div className="text-[11px] text-muted-foreground">
                          Inspect root cause, line location, and preview one-click fix.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onFixWithAi}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow cursor-pointer transition-all btn-press"
                    >
                      Fix with AI →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground/70 flex flex-col items-center justify-center h-32 text-center">
                <TerminalIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p>Click &quot;Run&quot; or press Ctrl + Enter to execute your code in the sandbox.</p>
              </div>
            )}
          </div>
        )}

        {/* ERRORS TAB */}
        {activeTab === 'errors' && (
          <div className="space-y-3">
            {errorMarkers.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-danger flex items-center justify-between">
                  <span>Detected {errorMarkers.length} Error(s) in Code:</span>
                  <button
                    onClick={onFixWithAi}
                    className="px-2.5 py-1 rounded-lg bg-primary/20 text-accent border border-primary/40 hover:bg-primary/30 text-xs font-semibold cursor-pointer"
                  >
                    Auto-Fix with AI
                  </button>
                </div>

                {errorMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-danger/10 border border-danger/30 flex items-start justify-between gap-3 hover:border-danger/60 transition-all"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-danger/20 text-danger text-[10px] font-extrabold uppercase">
                          Line {marker.line}
                          {marker.column ? `:${marker.column}` : ''}
                        </span>
                        <span className="text-muted-foreground text-[11px]">[{marker.source || 'Compiler'}]</span>
                      </div>
                      <p className="text-rose-200 text-xs font-mono">{marker.message}</p>
                      {marker.rawLine && (
                        <div className="p-1.5 rounded bg-black/40 text-muted-foreground text-[11px] font-mono border border-border/40">
                          {marker.rawLine}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onJumpToLine(marker.line)}
                      className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary/40 text-accent text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                    >
                      <span>Jump</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : executionResult?.stderr ? (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-rose-300 whitespace-pre-wrap">
                {executionResult.stderr}
              </div>
            ) : (
              <div className="text-muted-foreground/70 flex flex-col items-center justify-center h-28 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400/40 mb-1" />
                <p>No compilation or runtime errors detected.</p>
              </div>
            )}
          </div>
        )}

        {/* INPUT (STDIN) TAB */}
        {activeTab === 'stdin' && (
          <div className="h-full flex flex-col space-y-2">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Standard Input (stdin) passed to your program upon execution:</span>
              <button
                onClick={() => onStdinChange('')}
                className="text-[10px] text-muted-foreground hover:text-danger cursor-pointer"
              >
                Clear Input
              </button>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="e.g.&#10;5&#10;10 20 30 40 50"
              rows={5}
              className="w-full bg-[#060b18] text-foreground text-xs font-mono p-3 rounded-xl border border-border focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}
