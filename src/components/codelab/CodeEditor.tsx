'use client';

import React, { useRef, useEffect, memo } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { ParsedErrorMarker } from '@/types/codelab';
import { getLanguageById } from '@/lib/codelab/languages';

const MonacoEditor = Editor as any;

interface CodeEditorProps {
  code: string;
  languageId: string;
  fontSize?: number;
  minimap?: boolean;
  wordWrap?: boolean;
  errorMarkers?: ParsedErrorMarker[];
  targetJumpLine?: number | null;
  onChange: (newCode: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  onCursorChange?: (line: number, column: number) => void;
  onSelectionChange?: (selectedText: string) => void;
}

const CodeEditor = memo(function CodeEditor({
  code,
  languageId,
  fontSize = 14,
  minimap = false,
  wordWrap = true,
  errorMarkers = [],
  targetJumpLine = null,
  onChange,
  onRun,
  onSave,
  onCursorChange,
  onSelectionChange,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const langDef = getLanguageById(languageId);

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;

    // Define CampusOS 3D Cyber Dark Theme
    monaco.editor.defineTheme('campusos-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', background: '060b18', foreground: 'e0ebfd' },
        { token: 'comment', foreground: '627b9f', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00d8f6', fontStyle: 'bold' },
        { token: 'string', foreground: '00e599' },
        { token: 'number', foreground: 'ffb300' },
        { token: 'type', foreground: '1e6bff', fontStyle: 'bold' },
        { token: 'function', foreground: '7aa2f7' },
        { token: 'variable', foreground: 'e0ebfd' },
        { token: 'delimiter', foreground: '89a0c7' },
      ],
      colors: {
        'editor.background': '#060b18',
        'editor.foreground': '#e0ebfd',
        'editor.lineHighlightBackground': '#0b1638',
        'editor.selectionBackground': '#1e6bff40',
        'editor.inactiveSelectionBackground': '#1e6bff20',
        'editorLineNumber.foreground': '#384d72',
        'editorLineNumber.activeForeground': '#00d8f6',
        'editorCursor.foreground': '#00d8f6',
        'editorWhitespace.foreground': '#172958',
        'editorIndentGuide.background': '#132145',
        'editorIndentGuide.activeBackground': '#1e6bff',
        'editorGutter.background': '#060b18',
        'editorWidget.background': '#0a142f',
        'editorWidget.border': '#172958',
        'input.background': '#060b18',
        'dropdown.background': '#0a142f',
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.focus();

    // Listen to cursor position
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column);
    });

    // Listen to selection
    editor.onDidChangeCursorSelection((e) => {
      const model = editor.getModel();
      if (model) {
        const text = model.getValueInRange(e.selection);
        onSelectionChange?.(text);
      }
    });

    // Register Keybindings
    // Ctrl+Enter or Cmd+Enter -> Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    // Ctrl+S or Cmd+S -> Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });
  };

  // Auto-resize observer to notify Monaco on panel expansions/collapses
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync error markers
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    if (errorMarkers && errorMarkers.length > 0) {
      const markers = errorMarkers.map((marker) => ({
        startLineNumber: Math.max(1, marker.line),
        startColumn: marker.column || 1,
        endLineNumber: Math.max(1, marker.line),
        endColumn: (marker.column || 1) + 20,
        message: marker.message,
        severity:
          marker.severity === 'warning'
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Error,
        source: marker.source || 'Compiler',
      }));
      monaco.editor.setModelMarkers(model, 'campusos-compiler', markers);
    } else {
      monaco.editor.setModelMarkers(model, 'campusos-compiler', []);
    }
  }, [errorMarkers]);

  // Jump to line when triggered
  useEffect(() => {
    if (!editorRef.current || !targetJumpLine) return;
    const editor = editorRef.current;
    editor.revealLineInCenter(targetJumpLine);
    editor.setPosition({ lineNumber: targetJumpLine, column: 1 });
    editor.focus();
  }, [targetJumpLine]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-w-0 min-h-0 bg-[#060b18] overflow-hidden rounded-2xl border border-border/70 shadow-inner flex flex-col"
    >
      <MonacoEditor
        height="100%"
        width="100%"
        language={langDef.editorLanguage}
        value={code}
        theme="campusos-dark"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={(val?: string) => onChange(val || '')}
        options={{
          fontSize,
          minimap: { enabled: minimap },
          wordWrap: wordWrap ? 'on' : 'off',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          renderLineHighlight: 'all',
          tabSize: 4,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
});

export default CodeEditor;
