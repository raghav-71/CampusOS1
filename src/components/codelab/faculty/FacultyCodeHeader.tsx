'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES, getLanguageById } from '@/lib/codelab/languages';
import { FacultyAIMode } from '@/types/facultyCodelab';
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
  GraduationCap,
  FileCode2,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface FacultyCodeHeaderProps {
  languageId: string;
  onLanguageChange: (newLangId: string) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onReset: () => void;
  facultyMode: FacultyAIMode;
  onModeChange: (mode: FacultyAIMode) => void;
  onOpenAssignmentBuilder: () => void;
  onOpenQuestionBuilder: () => void;
  onOpenEvaluator: () => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  showAiPanel: boolean;
  onToggleAiPanel: () => void;
  activeFileName: string;
}

export default function FacultyCodeHeader({
  languageId,
  onLanguageChange,
  isRunning,
  onRun,
  onStop,
  onSave,
  onReset,
  facultyMode,
  onModeChange,
  onOpenAssignmentBuilder,
  onOpenQuestionBuilder,
  onOpenEvaluator,
  showSidebar,
  onToggleSidebar,
  showTerminal,
  onToggleTerminal,
  showAiPanel,
  onToggleAiPanel,
  activeFileName,
}: FacultyCodeHeaderProps) {
  return (
    <header className="w-full h-13 min-h-[52px] max-h-[52px] bg-white/90 backdrop-blur-md border-b border-black/[0.08] px-3 flex items-center justify-between gap-2 select-none shrink-0 min-w-0 overflow-x-auto overflow-y-hidden">
      {/* Left section: Faculty Branding & File Explorer Toggle */}
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
          <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              <span className="font-800 text-xs tracking-tight text-foreground">Faculty Code Lab</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-brand-50 text-primary-dark border border-brand-200">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Active File Pill */}
        <div className="px-2 py-1 rounded-lg bg-card border border-border text-[11px] font-mono text-muted-foreground truncate max-w-[100px] md:max-w-[140px]">
          {activeFileName}
        </div>

        {/* Action Builders */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAssignmentBuilder}
            className="px-2 py-1 rounded-xl bg-card hover:bg-brand-50 border border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-primary-dark flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="hidden md:inline">Assignment Builder</span>
          </button>

          <button
            onClick={onOpenQuestionBuilder}
            className="px-2 py-1 rounded-xl bg-card hover:bg-brand-50 border border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-primary-dark flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <FileCode2 className="w-3.5 h-3.5 text-primary" />
            <span className="hidden lg:inline">Save as Question</span>
          </button>

          <button
            onClick={onOpenEvaluator}
            className="px-2 py-1 rounded-xl bg-card hover:bg-brand-50 border border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-primary-dark flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-primary-dark" />
            <span className="hidden lg:inline">Evaluate Submissions</span>
          </button>
        </div>
      </div>

      {/* Middle section: Language & Run Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative">
          <select
            value={languageId}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-card text-xs font-semibold text-foreground border border-border hover:border-primary rounded-xl px-2.5 py-1.5 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2322C55E'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.4rem center',
              backgroundSize: '0.9rem',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-card text-foreground">
                {lang.displayName.split(' ')[0]} {lang.compileRequired ? '⚙️' : '⚡'}
              </option>
            ))}
          </select>
        </div>

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
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer btn-press shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
            <kbd className="hidden xl:inline text-[9px] bg-black/20 px-1 py-0.5 rounded font-mono text-white/90">
              Ctrl+↵
            </kbd>
          </button>
        )}

        <button
          onClick={onSave}
          title="Save Workspace"
          className="p-1.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs transition-all cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onReset}
          title="Reset"
          className="p-1.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right section: Faculty Mode Selector & Panel Toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={facultyMode}
          onChange={(e) => onModeChange(e.target.value as FacultyAIMode)}
          className="bg-[#060b18] text-xs font-bold text-accent border border-primary/40 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none"
        >
          <option value="developer">💻 Developer Mode</option>
          <option value="teaching">🎓 Teaching Mode</option>
          <option value="assessment">📝 Assessment Mode</option>
          <option value="exam">🏆 Exam Mode</option>
        </select>

        <button
          onClick={onToggleTerminal}
          title="Toggle Terminal"
          className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            showTerminal
              ? 'bg-primary/20 border-primary/40 text-accent shadow-sm'
              : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Terminal className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleAiPanel}
          title="Toggle Faculty AI"
          className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
            showAiPanel
              ? 'bg-gradient-to-r from-purple-500/30 to-accent/30 border-accent/50 text-accent shadow-glow'
              : 'bg-secondary/60 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-accent" />
          <span className="hidden md:inline">Faculty AI</span>
        </button>
      </div>
    </header>
  );
}
