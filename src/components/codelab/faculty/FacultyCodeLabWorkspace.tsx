'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CodeFile,
  CodeWorkspaceState,
  CodeExecutionResult,
  CodeAIContext,
} from '@/types/codelab';
import { FacultyAIMode } from '@/types/facultyCodelab';
import { codeWorkspaceRepo } from '@/repositories/codeWorkspaceRepository';
import { getLanguageById, detectLanguageFromFilename } from '@/lib/codelab/languages';
import { CODE_TEMPLATES } from '@/lib/codelab/templates';
import CodeEditor from '../CodeEditor';
import FileExplorer from '../FileExplorer';
import CodeOutputPanel from '../CodeOutputPanel';
import CodeDiffModal from '../CodeDiffModal';
import FacultyCodeHeader from './FacultyCodeHeader';
import FacultyAIPanel from './FacultyAIPanel';
import AssignmentBuilderModal from './AssignmentBuilderModal';
import QuestionBuilderModal from './QuestionBuilderModal';
import StudentEvaluationModal from './StudentEvaluationModal';
import { toast } from 'sonner';

export default function FacultyCodeLabWorkspace() {
  const [workspace, setWorkspace] = useState<CodeWorkspaceState | null>(null);
  const [activeCode, setActiveCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [targetJumpLine, setTargetJumpLine] = useState<number | null>(null);

  // AI Fix Patch & Diff Modal
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [pendingPatch, setPendingPatch] = useState<any>(null);

  // Faculty AI Mode
  const [facultyMode, setFacultyMode] = useState<FacultyAIMode>('developer');

  // Panel layout toggles
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showTerminal, setShowTerminal] = useState<boolean>(true);
  const [showAiPanel, setShowAiPanel] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'editor' | 'output' | 'ai' | 'files'>('editor');

  // Modals
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isEvaluatorModalOpen, setIsEvaluatorModalOpen] = useState(false);

  // Selection tracking
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState<string>('');

  const runAbortController = useRef<AbortController | null>(null);

  // Load initial workspace state
  useEffect(() => {
    let mounted = true;
    codeWorkspaceRepo.getWorkspace().then((state) => {
      if (mounted) {
        setWorkspace(state);
        const active = state.files.find((f) => f.id === state.activeFileId) || state.files[0];
        if (active) {
          setActiveCode(active.content);
        }
        if (state.lastExecutionResult) {
          setExecutionResult(state.lastExecutionResult);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeFile = useMemo(() => {
    if (!workspace) return null;
    return workspace.files.find((f) => f.id === workspace.activeFileId) || workspace.files[0];
  }, [workspace]);

  const activeLanguageId = activeFile?.languageId || 'python';

  // Debounced auto-save
  useEffect(() => {
    if (!activeFile || activeFile.content === activeCode) return;

    const fileIdToUpdate = activeFile.id;
    const codeToUpdate = activeCode;

    const timer = setTimeout(() => {
      codeWorkspaceRepo.updateFile(fileIdToUpdate, { content: codeToUpdate }).then((updated) => {
        setWorkspace((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            files: prev.files.map((f) => (f.id === updated.id ? updated : f)),
          };
        });
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeCode, activeFile]);

  // Execute Code in Real Sandbox
  const handleRunCode = async () => {
    if (isRunning || !activeFile) return;

    setIsRunning(true);
    setShowTerminal(true);
    setMobileTab('output');
    setTargetJumpLine(null);

    const controller = new AbortController();
    runAbortController.current = controller;

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeFile.languageId,
          sourceCode: activeCode,
          stdin: workspace?.stdin || '',
          timeoutMs: 10000,
          fileName: activeFile.name,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.success && data.result) {
        setExecutionResult(data.result);
        codeWorkspaceRepo.recordRun(data.result);

        if (data.result.status === 'SUCCESS') {
          toast.success(`Execution finished in ${data.result.executionTimeMs || 0} ms`);
        } else if (data.result.status === 'COMPILATION_ERROR') {
          toast.error('Compilation failed. Check error output.');
        } else if (data.result.status === 'RUNTIME_ERROR') {
          toast.error('Runtime exception encountered.');
        }
      } else {
        throw new Error(data.error || 'Execution failed');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorResult: CodeExecutionResult = {
          status: 'SYSTEM_ERROR',
          stdout: '',
          stderr: `Execution error: ${err.message}`,
          exitCode: null,
          executionTimeMs: 0,
          errorType: 'SYSTEM',
          language: getLanguageById(activeFile.languageId).displayName,
          provider: 'CampusOS Execution Guard',
          ranAt: Date.now(),
        };
        setExecutionResult(errorResult);
        toast.error('Execution failed: ' + err.message);
      }
    } finally {
      setIsRunning(false);
      runAbortController.current = null;
    }
  };

  const handleStopExecution = () => {
    if (runAbortController.current) {
      runAbortController.current.abort();
      setIsRunning(false);
      toast.info('Execution cancelled.');
    }
  };

  // File Operations
  const handleSelectFile = (fileId: string) => {
    if (!workspace || fileId === workspace.activeFileId) return;
    const file = workspace.files.find((f) => f.id === fileId);
    if (file) {
      codeWorkspaceRepo.saveWorkspace({ activeFileId: fileId });
      setWorkspace((prev) => (prev ? { ...prev, activeFileId: fileId } : prev));
      setActiveCode(file.content);
      setExecutionResult(null);
      setTargetJumpLine(null);
    }
  };

  const handleCreateFile = async (name: string, languageId: string) => {
    const newFile = await codeWorkspaceRepo.createFile(name, languageId);
    setWorkspace((prev) => (prev ? { ...prev, files: [...prev.files, newFile], activeFileId: newFile.id } : prev));
    setActiveCode(newFile.content);
    setTargetJumpLine(null);
    toast.success(`Created file ${name}`);
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    const detectedLang = detectLanguageFromFilename(newName);
    const updated = await codeWorkspaceRepo.updateFile(fileId, {
      name: newName,
      languageId: detectedLang.id,
    });
    setWorkspace((prev) =>
      prev ? { ...prev, files: prev.files.map((f) => (f.id === fileId ? updated : f)) } : prev
    );
    toast.success(`Renamed file to ${newName}`);
  };

  const handleDeleteFile = async (fileId: string) => {
    const ok = await codeWorkspaceRepo.deleteFile(fileId);
    if (ok) {
      const updatedWs = await codeWorkspaceRepo.getWorkspace();
      setWorkspace(updatedWs);
      const nextActive = updatedWs.files.find((f) => f.id === updatedWs.activeFileId) || updatedWs.files[0];
      if (nextActive) {
        setActiveCode(nextActive.content);
      }
      toast.success('File deleted');
    }
  };

  const handleDuplicateFile = async (fileId: string) => {
    const orig = workspace?.files.find((f) => f.id === fileId);
    if (!orig) return;
    const newName = `copy_${orig.name}`;
    const copy = await codeWorkspaceRepo.duplicateFile(fileId, newName);
    setWorkspace((prev) => (prev ? { ...prev, files: [...prev.files, copy], activeFileId: copy.id } : prev));
    setActiveCode(copy.content);
    toast.success(`Duplicated to ${newName}`);
  };

  const handleLanguageChange = (newLangId: string) => {
    if (!activeFile) return;
    const newLang = getLanguageById(newLangId);
    const ext = newLang.fileExtension;
    const baseName = activeFile.name.substring(0, activeFile.name.lastIndexOf('.')) || 'main';
    const updatedName = `${baseName}${ext}`;

    codeWorkspaceRepo
      .updateFile(activeFile.id, {
        languageId: newLangId,
        name: updatedName,
        content: activeCode.trim().length < 30 ? newLang.defaultTemplate : activeCode,
      })
      .then((updated) => {
        setWorkspace((prev) =>
          prev ? { ...prev, files: prev.files.map((f) => (f.id === updated.id ? updated : f)) } : prev
        );
        setActiveCode(updated.content);
        toast.info(`Switched language to ${newLang.displayName}`);
      });
  };

  const handleManualSave = () => {
    if (!activeFile) return;
    codeWorkspaceRepo.updateFile(activeFile.id, { content: activeCode }).then(() => {
      toast.success('Saved to faculty workspace.');
    });
  };

  const handleResetToTemplate = () => {
    const lang = getLanguageById(activeLanguageId);
    setActiveCode(lang.defaultTemplate);
    toast.info('Reset code to starter template.');
  };

  // One-Click AI Fix for Faculty
  const handleRequestAiFix = async () => {
    if (!activeFile) return;

    toast.loading('CampusOS AI is diagnosing and synthesizing fix...', { id: 'faculty-ai-fix' });

    const codeContext: CodeAIContext = {
      language: getLanguageById(activeFile.languageId).displayName,
      fileName: activeFile.name,
      sourceCode: activeCode,
      selectedCode: selectedText || undefined,
      cursorLine: cursorPosition.line,
      stdin: workspace?.stdin,
      stdout: executionResult?.stdout,
      stderr: executionResult?.stderr,
      compilationOutput: executionResult?.compilationOutput,
      executionStatus: executionResult?.status,
      expectedOutput: workspace?.expectedOutput,
      aiMode: 'solution',
    };

    try {
      const response = await fetch('/api/code/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'fix',
          context: codeContext,
        }),
      });

      const data = await response.json();
      toast.dismiss('faculty-ai-fix');

      if (data.success && data.patch) {
        setPendingPatch(data.patch);
        setIsDiffModalOpen(true);
      } else {
        toast.error('AI could not generate a fix: ' + (data.error || 'Check connection'));
      }
    } catch (err: any) {
      toast.dismiss('faculty-ai-fix');
      toast.error('AI Fix error: ' + err.message);
    }
  };

  const handleApplyFix = (newCode: string) => {
    setActiveCode(newCode);
    if (activeFile) {
      codeWorkspaceRepo.updateFile(activeFile.id, { content: newCode }).then((updated) => {
        setWorkspace((prev) =>
          prev ? { ...prev, files: prev.files.map((f) => (f.id === updated.id ? updated : f)) } : prev
        );
      });
    }
    toast.success('Applied AI patch to editor.');
    setIsDiffModalOpen(false);
  };

  const codeAIContext: CodeAIContext = useMemo(
    () => ({
      language: getLanguageById(activeLanguageId).displayName,
      fileName: activeFile?.name || 'main.py',
      sourceCode: activeCode,
      selectedCode: selectedText || undefined,
      cursorLine: cursorPosition.line,
      stdin: workspace?.stdin,
      stdout: executionResult?.stdout,
      stderr: executionResult?.stderr,
      compilationOutput: executionResult?.compilationOutput,
      executionStatus: executionResult?.status,
      expectedOutput: workspace?.expectedOutput,
      aiMode: 'solution',
    }),
    [
      activeLanguageId,
      activeFile?.name,
      activeCode,
      selectedText,
      cursorPosition.line,
      workspace?.stdin,
      executionResult?.stdout,
      executionResult?.stderr,
      executionResult?.compilationOutput,
      executionResult?.status,
      workspace?.expectedOutput,
    ]
  );

  if (!workspace) {
    return (
      <div className="w-full h-full min-h-[300px] bg-[#060b18] flex items-center justify-center text-foreground font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading Faculty Code Lab...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-full min-w-0 bg-[#060b18] text-foreground flex flex-col overflow-hidden font-sans select-none">
      {/* Faculty Code Header */}
      <FacultyCodeHeader
        languageId={activeLanguageId}
        onLanguageChange={handleLanguageChange}
        isRunning={isRunning}
        onRun={handleRunCode}
        onStop={handleStopExecution}
        onSave={handleManualSave}
        onReset={handleResetToTemplate}
        facultyMode={facultyMode}
        onModeChange={(mode) => setFacultyMode(mode)}
        onOpenAssignmentBuilder={() => setIsAssignmentModalOpen(true)}
        onOpenQuestionBuilder={() => setIsQuestionModalOpen(true)}
        onOpenEvaluator={() => setIsEvaluatorModalOpen(true)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showAiPanel={showAiPanel}
        onToggleAiPanel={() => setShowAiPanel(!showAiPanel)}
        activeFileName={activeFile?.name || 'main.py'}
      />

      {/* Mobile Tab Selector */}
      <div className="lg:hidden flex items-center justify-around bg-[#0a142f] border-b border-border/80 p-1 text-xs shrink-0 select-none">
        <button
          onClick={() => setMobileTab('editor')}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            mobileTab === 'editor' ? 'bg-primary/20 text-accent border border-primary/40' : 'text-muted-foreground'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            mobileTab === 'output' ? 'bg-primary/20 text-accent border border-primary/40' : 'text-muted-foreground'
          }`}
        >
          Terminal {executionResult ? '•' : ''}
        </button>
        <button
          onClick={() => setMobileTab('ai')}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            mobileTab === 'ai' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-muted-foreground'
          }`}
        >
          Faculty AI
        </button>
        <button
          onClick={() => setMobileTab('files')}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            mobileTab === 'files' ? 'bg-primary/20 text-accent border border-primary/40' : 'text-muted-foreground'
          }`}
        >
          Files
        </button>
      </div>

      {/* Main 3-Column Desktop Workspace Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative min-w-0 w-full">
        {/* Left Column: File Explorer */}
        <div
          className={`h-full shrink-0 transition-all duration-150 overflow-hidden ${
            showSidebar ? 'w-56 xl:w-60' : 'w-0 hidden'
          } ${mobileTab === 'files' ? '!block !w-full z-20 absolute inset-0 bg-[#070e22]' : 'hidden lg:block'}`}
        >
          <FileExplorer
            files={workspace.files}
            activeFileId={workspace.activeFileId}
            onSelectFile={(id) => {
              handleSelectFile(id);
              if (mobileTab === 'files') setMobileTab('editor');
            }}
            onCreateFile={handleCreateFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            onDuplicateFile={handleDuplicateFile}
          />
        </div>

        {/* Center Column: Monaco Editor + Terminal Output Drawer */}
        <div
          className={`flex-1 min-w-0 flex flex-col h-full overflow-hidden ${
            mobileTab === 'editor' || mobileTab === 'output' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Monaco Editor Container */}
          <div
            className={`flex-1 min-h-0 min-w-0 relative p-1.5 overflow-hidden ${
              mobileTab === 'output' ? 'hidden lg:block' : 'block'
            }`}
          >
            <CodeEditor
              code={activeCode}
              languageId={activeLanguageId}
              fontSize={workspace.fontSize}
              minimap={workspace.minimap}
              wordWrap={workspace.wordWrap}
              errorMarkers={executionResult?.errorMarkers || []}
              targetJumpLine={targetJumpLine}
              onChange={(val) => setActiveCode(val)}
              onRun={handleRunCode}
              onSave={handleManualSave}
              onCursorChange={(line, col) => setCursorPosition({ line, column: col })}
              onSelectionChange={(text) => setSelectedText(text)}
            />
          </div>

          {/* Bottom Terminal Output Drawer */}
          {showTerminal && (
            <div
              className={`border-t border-border/80 shrink-0 min-w-0 overflow-hidden ${
                mobileTab === 'output' ? 'h-full flex-1' : 'h-48 md:h-52 xl:h-56'
              } ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}
            >
              <CodeOutputPanel
                executionResult={executionResult}
                isRunning={isRunning}
                stdin={workspace.stdin}
                onStdinChange={(val) => {
                  codeWorkspaceRepo.saveWorkspace({ stdin: val });
                  setWorkspace((prev) => (prev ? { ...prev, stdin: val } : prev));
                }}
                onJumpToLine={(line) => {
                  setTargetJumpLine(line);
                  if (mobileTab === 'output') setMobileTab('editor');
                }}
                onFixWithAi={handleRequestAiFix}
              />
            </div>
          )}
        </div>

        {/* Right Column: Faculty AI Panel */}
        <div
          className={`h-full shrink-0 min-w-0 transition-all duration-150 overflow-hidden ${
            showAiPanel ? 'w-80 xl:w-92' : 'w-0 hidden'
          } ${mobileTab === 'ai' ? '!block !w-full z-20 absolute inset-0 bg-[#070e22]' : 'hidden lg:block'}`}
        >
          <FacultyAIPanel
            codeContext={codeAIContext}
            facultyMode={facultyMode}
            onModeChange={(mode) => setFacultyMode(mode)}
            onOpenAssignmentBuilder={() => setIsAssignmentModalOpen(true)}
            onOpenQuestionBuilder={() => setIsQuestionModalOpen(true)}
            onOpenEvaluator={() => setIsEvaluatorModalOpen(true)}
            onRequestFix={handleRequestAiFix}
          />
        </div>
      </div>

      {/* Assignment Builder Modal */}
      <AssignmentBuilderModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        initialCode={activeCode}
        languageId={activeLanguageId}
      />

      {/* Question Builder Modal */}
      <QuestionBuilderModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        initialCode={activeCode}
        languageId={activeLanguageId}
      />

      {/* Student Evaluation Modal */}
      <StudentEvaluationModal
        isOpen={isEvaluatorModalOpen}
        onClose={() => setIsEvaluatorModalOpen(false)}
        referenceSolutionCode={activeCode}
        languageId={activeLanguageId}
      />

      {/* AI Diff & One-Click Fix Review Modal */}
      <CodeDiffModal
        isOpen={isDiffModalOpen}
        onReject={() => setIsDiffModalOpen(false)}
        patch={pendingPatch}
        languageId={activeLanguageId}
        onApply={handleApplyFix}
      />
    </div>
  );
}
