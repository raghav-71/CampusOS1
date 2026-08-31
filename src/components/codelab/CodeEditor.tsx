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

    // Register Java IntelliSense
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          {
            label: 'sout',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'System.out.println(${1:text});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'System.out.println() statement',
            range,
          },
          {
            label: 'psvm',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'public static void main(String[] args) {\n\t${1}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Main method snippet',
            range,
          },
          {
            label: 'scanner',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'Scanner scanner = new Scanner(System.in);\n${1}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Scanner input initialization',
            range,
          },
          {
            label: 'fori',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Indexed for loop',
            range,
          },
          {
            label: 'ArrayList',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'ArrayList<${1:String}> ${2:list} = new ArrayList<>();',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'java.util.ArrayList declaration',
            range,
          },
          {
            label: 'HashMap',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'HashMap<${1:String}, ${2:Integer}> ${3:map} = new HashMap<>();',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'java.util.HashMap declaration',
            range,
          },
        ];
        return { suggestions };
      },
    });

    // Register Python IntelliSense
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'print() function',
            range,
          },
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:func_name}(${2:params}):\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Function definition',
            range,
          },
          {
            label: 'main',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if __name__ == '__main__':\n    ${1:main()}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Python main entry point',
            range,
          },
          {
            label: 'forin',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'For-in loop',
            range,
          },
        ];
        return { suggestions };
      },
    });

    // Register C/C++ IntelliSense
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          {
            label: 'cout',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'std::cout << ${1:value} << std::endl;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'std::cout output stream',
            range,
          },
          {
            label: 'cin',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'std::cin >> ${1:variable};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'std::cin input stream',
            range,
          },
          {
            label: 'main',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'int main() {\n    ${1}\n    return 0;\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Main function',
            range,
          },
          {
            label: 'include_iostream',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Common C++ Headers',
            range,
          },
        ];
        return { suggestions };
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
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          tabCompletion: 'on',
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'smart',
          snippetSuggestions: 'top',
          folding: true,
          foldingHighlight: true,
          matchBrackets: 'always',
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
});

export default CodeEditor;
