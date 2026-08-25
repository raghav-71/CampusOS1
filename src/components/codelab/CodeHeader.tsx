'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES, getLanguageById } from '@/lib/codelab/languages';
import { AIMode, ExecutionStatus } from '@/types/codelab';
import {
  Play,
  Square,
  Sparkles,
  BookOpen,
  Save,
  Code2,
  FolderTree,
  Terminal,
  Bot,
  RotateCcw,
} from 'lucide-react';

interface CodeHeaderProps {
  languageId: string;
  onLanguageChange: (newLangId: string) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onFormat: () => void;
  onSave: () => void;
  onReset: () => void;
  lastSavedAt: number | null;
  aiMode: AIMode;
  onToggleAiMode: () => void;
  onOpenProblems: () => void;
  hasActiveProblem?: boolean;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  showAiPanel: boolean;
  onToggleAiPanel: () => void;
  activeFileName: string;
  executionStatus?: ExecutionStatus | null;
}

export default function CodeHeader({
  languageId,
  onLanguageChange,
  isRunning,
  onRun,
  onStop,
  onFormat,
  onSave,
  onReset,
  lastSavedAt,
  aiMode,
  onToggleAiMode,
  onOpenProblems,
  hasActiveProblem,
  showSidebar,
  onToggleSidebar,
  showTerminal,
  onToggleTerminal,
  showAiPanel,
  onToggleAiPanel,
  activeFileName,
  executionStatus,
}: CodeHeaderProps) {
  const currentLang = getLanguageById(languageId);

  return (
    <header className="w-full h-13 min-h-[52px] max-h-[52px] bg-[#0a142f]/95 backdrop-blur-xl border-b border-border/80 px-3 flex items-center justify-between gap-2 select-none shrink-0 min-w-0 overflow-x-auto overflow-y-hidden">
      {/* Left section: App Brand & Explorer Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSidebar}
          title={showSidebar ? 'Hide File Explorer' : 'Show File Explorer'}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            showSidebar
              ? 'bg-primary/20 border-primary/40 text-accent shadow-sm'
              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <FolderTree className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-glow shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              <span className="font-800 text-xs tracking-tight text-foreground">Code Lab</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-primary/20 text-accent border border-primary/30">
                IDE
              </span>
            </div>
          </div>
        </div>

        {/* Active File Pill */}
        <div className="px-2 py-1 rounded-lg bg-black/40 border border-border/60 text-[11px] font-mono text-muted-foreground truncate max-w-[110px] md:max-w-[150px]">
          {activeFileName}
        </div>

        {/* Practice Problems Button */}
        <button
          onClick={onOpenProblems}
          className={`px-2 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            hasActiveProblem
              ? 'bg-accent/20 border-accent/40 text-accent shadow-glow'
              : 'bg-secondary/60 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Problems</span>
        </button>
      </div>

      {/* Middle section: Language Selector & Run Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <select
            value={languageId}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-[#060b18] text-xs font-semibold text-foreground border border-border hover:border-primary/40 rounded-xl px-2.5 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300d8f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.4rem center',
              backgroundSize: '0.9rem',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-[#0a142f] text-foreground">
                {lang.displayName.split(' ')[0]} {lang.compileRequired ? '⚙️' : '⚡'}
              </option>
            ))}
          </select>
        </div>

        {/* RUN / STOP Button */}
        {isRunning ? (
          <button
            onClick={onStop}
            className="px-3.5 py-1.5 rounded-xl bg-danger/20 border border-danger/50 text-danger hover:bg-danger/30 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-pulse shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            title="Run Code (Ctrl + Enter)"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-glow hover:shadow-glow-cyan transition-all cursor-pointer btn-press shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
            <kbd className="hidden xl:inline text-[9px] bg-black/30 px-1 py-0.5 rounded font-mono text-white/80">
              Ctrl+↵
            </kbd>
          </button>
        )}

        {/* Save */}
        <button
          onClick={onSave}
          title="Save Workspace (Ctrl + S)"
          className="p-1.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs transition-all cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset to Template"
          className="p-1.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right section: AI Tutor Mode Toggle & Panel Toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Tutor Mode vs Solution Mode Toggle */}
        <button
          onClick={onToggleAiMode}
          title={aiMode === 'tutor' ? 'Switch to Solution Mode' : 'Switch to Tutor Mode'}
          className={`px-2 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
            aiMode === 'tutor'
              ? 'bg-primary/20 border-primary/50 text-accent'
              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">
            {aiMode === 'tutor' ? 'Tutor Mode' : 'Solution Mode'}
          </span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={onToggleTerminal}
          title={showTerminal ? 'Hide Terminal' : 'Show Terminal'}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            showTerminal
              ? 'bg-primary/20 border-primary/40 text-accent shadow-sm'
              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* AI Tutor Panel Toggle */}
        <button
          onClick={onToggleAiPanel}
          title={showAiPanel ? 'Hide AI Tutor' : 'Show AI Tutor'}
          className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
            showAiPanel
              ? 'bg-gradient-to-r from-primary/30 to-accent/30 border-accent/50 text-accent shadow-glow'
              : 'bg-secondary/60 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-accent" />
          <span className="hidden md:inline">AI Tutor</span>
        </button>
      </div>
    </header>
  );
}
