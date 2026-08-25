'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AIFixPatch } from '@/types/codelab';
import { getLanguageById } from '@/lib/codelab/languages';
import {
  Check,
  X,
  Copy,
  Sparkles,
  GitCompare,
  AlertCircle,
  FileCode,
  ArrowRight,
} from 'lucide-react';

import { DiffEditor } from '@monaco-editor/react';

const MonacoDiffEditor = DiffEditor as any;

interface CodeDiffModalProps {
  patch: AIFixPatch | null;
  languageId: string;
  isOpen: boolean;
  onApply: (correctedCode: string) => void;
  onReject: () => void;
}

export default function CodeDiffModal({
  patch,
  languageId,
  isOpen,
  onApply,
  onReject,
}: CodeDiffModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !patch) return null;

  const langDef = getLanguageById(languageId);

  const handleCopy = () => {
    navigator.clipboard.writeText(patch.correctedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a142f] border border-primary/40 rounded-3xl shadow-glow flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0b1736] to-[#060b18] border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-800 text-foreground tracking-tight">
                  AI Fix Proposed
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-accent/20 text-accent border border-accent/30">
                  {patch.category}
                </span>
                {patch.problemLine && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-danger/20 text-danger border border-danger/30">
                    Line {patch.problemLine}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{patch.changesSummary}</p>
            </div>
          </div>

          <button
            onClick={onReject}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation Card */}
        <div className="p-4 bg-[#070e22] border-b border-border/60">
          <div className="flex items-start gap-2.5 text-xs text-foreground leading-relaxed">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-accent">AI Mentor Explanation: </span>
              <span>{patch.explanation}</span>
            </div>
          </div>
        </div>

        {/* Monaco Diff Viewer */}
        <div className="flex-1 min-h-[300px] max-h-[420px] bg-[#060b18] p-2">
          <div className="w-full h-full rounded-2xl overflow-hidden border border-border/70">
            <MonacoDiffEditor
              height="100%"
              language={langDef.editorLanguage}
              original={patch.originalCode}
              modified={patch.correctedCode}
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                renderIndicators: true,
                originalEditable: false,
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#070e22] border-t border-border/80 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>Review the diff before applying. This will replace active editor code.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-primary/40 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Fix'}</span>
            </button>

            <button
              onClick={onReject}
              className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Reject / Keep Mine
            </button>

            <button
              onClick={() => onApply(patch.correctedCode)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-accent text-white text-xs font-bold shadow-glow hover:shadow-glow-cyan flex items-center gap-1.5 transition-all cursor-pointer btn-press"
            >
              <Check className="w-4 h-4" />
              <span>Apply AI Fix</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
