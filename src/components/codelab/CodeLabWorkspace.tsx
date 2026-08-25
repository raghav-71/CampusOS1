'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CodeFile,
  CodeWorkspaceState,
  CodeExecutionResult,
  AIMode,
  AIFixPatch,
  TestCase,
  PracticeProblem,
  CodeAIContext,
} from '@/types/codelab';
import { codeWorkspaceRepo } from '@/repositories/codeWorkspaceRepository';
import { getLanguageById, detectLanguageFromFilename } from '@/lib/codelab/languages';
import { CODE_TEMPLATES } from '@/lib/codelab/templates';
import { PRACTICE_PROBLEMS } from '@/lib/codelab/problems';
import CodeHeader from './CodeHeader';
import CodeEditor from './CodeEditor';
import FileExplorer from './FileExplorer';
import CodeOutputPanel from './CodeOutputPanel';
import AITutorPanel from './AITutorPanel';
import CodeDiffModal from './CodeDiffModal';
import ProblemDrawer from './ProblemDrawer';
import { toast } from 'sonner';

export default function CodeLabWorkspace() {
  const [workspace, setWorkspace] = useState<CodeWorkspaceState | null>(null);
  const [activeCode, setActiveCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [targetJumpLine, setTargetJumpLine] = useState<number | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Panel layout toggles
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showTerminal, setShowTerminal] = useState<boolean>(true);
  const [showAiPanel, setShowAiPanel] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'editor' | 'output' | 'ai' | 'files'>('editor');

  // AI Fix Modal & Problems Drawer
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [pendingPatch, setPendingPatch] = useState<AIFixPatch | null>(null);
  const [isProblemDrawerOpen, setIsProblemDrawerOpen] = useState<boolean>(false);
  const [activeProblem, setActiveProblem] = useState<PracticeProblem | null>(null);

  // Cursor & Selection tracking for AI context
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState<string>('');

  // Tests runner state
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Abort controller for execution
  const runAbortController = useRef<AbortController | null>(null);
  const activeFileIdRef = useRef<string>('');

  // Load initial workspace state
  useEffect(() => {
    let mounted = true;
    codeWorkspaceRepo.getWorkspace().then((state) => {
      if (mounted) {
        setWorkspace(state);
        const active = state.files.find((f) => f.id === state.activeFileId) || state.files[0];
        if (active) {
          activeFileIdRef.current = active.id;
          setActiveCode(active.content);
        }
        if (state.lastExecutionResult) {
          setExecutionResult(state.lastExecutionResult);
        }
        if (state.currentProblemId) {
          const prob = PRACTICE_PROBLEMS.find((p) => p.id === state.currentProblemId);
          if (prob) setActiveProblem(prob);
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

  // Debounced auto-save without cyclical state trigger
  useEffect(() => {
    if (!activeFile || activeFile.content === activeCode) return;

    const fileIdToUpdate = activeFile.id;
    const codeToUpdate = activeCode;

    const timer = setTimeout(() => {
      codeWorkspaceRepo.updateFile(fileIdToUpdate, { content: codeToUpdate }).then((updated) => {
        setLastSavedAt(Date.now());
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
        } else if (data.result.status === 'TIMEOUT') {
          toast.error('Execution timed out (10s limit).');
        }
      } else {
        throw new Error(data.error || 'Execution failed');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorResult: CodeExecutionResult = {
          status: 'SYSTEM_ERROR',
          stdout: '',
          stderr: `Execution request error: ${err.message}`,
          exitCode: null,
          executionTimeMs: 0,
          errorType: 'SYSTEM',
          language: getLanguageById(activeFile.languageId).displayName,
          provider: 'CampusOS Client Guard',
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

  // Run Test Cases against Practice Problem
  const handleRunAllTests = async () => {
    if (!activeProblem || isRunningTests || !activeFile) return;

    setIsRunningTests(true);
    const updatedTestCases = [...(workspace?.testCases || [])];

    for (let i = 0; i < updatedTestCases.length; i++) {
      const tc = updatedTestCases[i];
      tc.status = 'RUNNING';
      setWorkspace((prev) => (prev ? { ...prev, testCases: [...updatedTestCases] } : prev));

      try {
        const res = await fetch('/api/code/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: activeFile.languageId,
            sourceCode: activeCode,
            stdin: tc.input,
            timeoutMs: 5000,
          }),
        });
        const data = await res.json();
        if (data.success && data.result) {
          const actual = (data.result.stdout || '').trim();
          const expected = tc.expectedOutput.trim();
          tc.actualOutput = actual;
          tc.executionTimeMs = data.result.executionTimeMs;
          tc.status = actual === expected ? 'PASSED' : 'FAILED';
        } else {
          tc.status = 'ERROR';
          tc.actualOutput = data.result?.stderr || 'Execution Error';
        }
      } catch (err: any) {
        tc.status = 'ERROR';
        tc.actualOutput = err.message;
      }
    }

    setWorkspace((prev) => (prev ? { ...prev, testCases: [...updatedTestCases] } : prev));
    setIsRunningTests(false);

    const passed = updatedTestCases.filter((t) => t.status === 'PASSED').length;
    if (passed === updatedTestCases.length) {
      toast.success(`🎉 All ${passed} test cases passed successfully!`);
    } else {
      toast.error(`${passed} / ${updatedTestCases.length} test cases passed.`);
    }
  };

  // One-Click AI Fix
  const handleRequestAiFix = async () => {
    if (!activeFile) return;

    toast.loading('AI Mentor is diagnosing and synthesizing fix...', { id: 'ai-fix' });

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
      problemStatement: activeProblem?.description,
      aiMode: workspace?.aiMode || 'tutor',
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
      toast.dismiss('ai-fix');

      if (data.success && data.patch) {
        setPendingPatch(data.patch);
        setIsDiffModalOpen(true);
      } else {
        toast.error('AI could not generate a fix: ' + (data.error || 'Check connection'));
      }
    } catch (err: any) {
      toast.dismiss('ai-fix');
      toast.error('AI Fix error: ' + err.message);
    }
  };

  // Apply AI Fix to active code
  const handleApplyAiFix = (correctedCode: string) => {
    setActiveCode(correctedCode);
    setIsDiffModalOpen(false);
    setPendingPatch(null);
    toast.success('AI fix applied to editor. Click Run to verify!');
  };

  // File Operations
  const handleSelectFile = (fileId: string) => {
    if (!workspace || fileId === workspace.activeFileId) return;
    const file = workspace.files.find((f) => f.id === fileId);
    if (file) {
      activeFileIdRef.current = fileId;
      codeWorkspaceRepo.saveWorkspace({ activeFileId: fileId });
      setWorkspace((prev) => (prev ? { ...prev, activeFileId: fileId } : prev));
      setActiveCode(file.content);
      setExecutionResult(null);
      setTargetJumpLine(null);
    }
  };

  const handleCreateFile = async (name: string, languageId: string) => {
    const newFile = await codeWorkspaceRepo.createFile(name, languageId);
    activeFileIdRef.current = newFile.id;
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
        activeFileIdRef.current = nextActive.id;
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
    activeFileIdRef.current = copy.id;
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

  const handleSelectProblem = (problem: PracticeProblem) => {
    setActiveProblem(problem);
    const starter = problem.starterTemplates[activeLanguageId] || CODE_TEMPLATES[activeLanguageId] || '';
    if (starter) {
      setActiveCode(starter);
    }
    const initialTestCases: TestCase[] = problem.testCases.map((tc, idx) => ({
      id: `tc-${idx + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      explanation: tc.explanation,
      status: 'PENDING',
    }));

    codeWorkspaceRepo.saveWorkspace({
      currentProblemId: problem.id,
      stdin: problem.sampleInputs[0] || '',
      expectedOutput: problem.sampleOutputs[0] || '',
      testCases: initialTestCases,
    });

    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            currentProblemId: problem.id,
            stdin: problem.sampleInputs[0] || '',
            expectedOutput: problem.sampleOutputs[0] || '',
            testCases: initialTestCases,
          }
        : prev
    );

    toast.success(`Loaded problem: ${problem.title}`);
  };

  const handleToggleAiMode = () => {
    const nextMode: AIMode = workspace?.aiMode === 'tutor' ? 'solution' : 'tutor';
    codeWorkspaceRepo.saveWorkspace({ aiMode: nextMode });
    setWorkspace((prev) => (prev ? { ...prev, aiMode: nextMode } : prev));
    toast.info(nextMode === 'tutor' ? '🎓 Tutor Mode: Progressive Socratic hints' : '🛠️ Solution Mode: Direct code fixes');
  };

  const handleResetToTemplate = () => {
    const lang = getLanguageById(activeLanguageId);
    setActiveCode(lang.defaultTemplate);
    toast.info('Reset code to starter template.');
  };

  const handleManualSave = () => {
    if (!activeFile) return;
    codeWorkspaceRepo.updateFile(activeFile.id, { content: activeCode }).then(() => {
      setLastSavedAt(Date.now());
      toast.success('Workspace saved.');
    });
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
      problemStatement: activeProblem?.description,
      aiMode: workspace?.aiMode || 'tutor',
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
      activeProblem?.description,
      workspace?.aiMode,
    ]
  );

  if (!workspace) {
    return (
      <div className="w-full h-full min-h-[300px] bg-[#060b18] flex items-center justify-center text-foreground font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading Campus OS Code Lab...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-full min-w-0 bg-[#060b18] text-foreground flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header */}
      <CodeHeader
        languageId={activeLanguageId}
        onLanguageChange={handleLanguageChange}
        isRunning={isRunning}
        onRun={handleRunCode}
        onStop={handleStopExecution}
        onFormat={() => toast.info('Formatted active code.')}
        onSave={handleManualSave}
        onReset={handleResetToTemplate}
        lastSavedAt={lastSavedAt}
        aiMode={workspace.aiMode}
        onToggleAiMode={handleToggleAiMode}
        onOpenProblems={() => setIsProblemDrawerOpen(true)}
        hasActiveProblem={Boolean(activeProblem)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showAiPanel={showAiPanel}
        onToggleAiPanel={() => setShowAiPanel(!showAiPanel)}
        activeFileName={activeFile?.name || 'main.py'}
        executionStatus={executionResult?.status}
      />

      {/* Mobile / Tablet Tab Selector (< 1024px) */}
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
            mobileTab === 'ai' ? 'bg-primary/20 text-accent border border-primary/40' : 'text-muted-foreground'
          }`}
        >
          AI Tutor
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
        {/* Left Column: File Explorer (220px to 250px) */}
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
          {/* Active Problem Banner if loaded */}
          {activeProblem && (
            <div className="bg-primary/10 border-b border-primary/30 px-3.5 py-1.5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-accent">Problem:</span>
                <span className="text-foreground font-semibold truncate">{activeProblem.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                  {activeProblem.difficulty}
                </span>
              </div>
              <button
                onClick={() => setIsProblemDrawerOpen(true)}
                className="text-[11px] text-primary hover:text-accent font-semibold shrink-0 cursor-pointer"
              >
                View Description →
              </button>
            </div>
          )}

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
                onRunTests={handleRunAllTests}
                testCasesCount={workspace.testCases?.length || 0}
              />
            </div>
          )}
        </div>

        {/* Right Column: AI Coding Tutor Panel (320px to 360px) */}
        <div
          className={`h-full shrink-0 min-w-0 transition-all duration-150 overflow-hidden ${
            showAiPanel ? 'w-80 xl:w-92' : 'w-0 hidden'
          } ${mobileTab === 'ai' ? '!block !w-full z-20 absolute inset-0 bg-[#070e22]' : 'hidden lg:block'}`}
        >
          <AITutorPanel
            codeContext={codeAIContext}
            aiMode={workspace.aiMode}
            onToggleAiMode={handleToggleAiMode}
            onRequestFix={handleRequestAiFix}
          />
        </div>
      </div>

      {/* Practice Problem Drawer */}
      <ProblemDrawer
        isOpen={isProblemDrawerOpen}
        onClose={() => setIsProblemDrawerOpen(false)}
        selectedProblemId={activeProblem?.id || null}
        onSelectProblem={handleSelectProblem}
        currentLanguageId={activeLanguageId}
      />

      {/* One-Click AI Diff Modal */}
      <CodeDiffModal
        patch={pendingPatch}
        languageId={activeLanguageId}
        isOpen={isDiffModalOpen}
        onApply={handleApplyAiFix}
        onReject={() => {
          setIsDiffModalOpen(false);
          setPendingPatch(null);
        }}
      />
    </div>
  );
}
