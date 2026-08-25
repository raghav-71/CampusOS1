/**
 * Campus OS — Code Lab Error Parser
 * Extracts file, line, column, and error messages from compiler output and runtime stack traces.
 */

import { ParsedErrorMarker, ErrorCategory } from '@/types/codelab';

export class CodeErrorParser {
  /**
   * Parses raw compiler/runtime stderr/compileOutput into structured error markers.
   */
  static parseErrors(
    rawOutput: string,
    languageId: string,
    activeFileName: string = 'main'
  ): ParsedErrorMarker[] {
    if (!rawOutput || rawOutput.trim().length === 0) {
      return [];
    }

    const markers: ParsedErrorMarker[] = [];
    const lines = rawOutput.split('\n');

    // 1. Python Error Parsing (SyntaxError, IndentationError, Traceback line numbers)
    if (languageId === 'python') {
      let currentTracebackLine: number | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match: File "script.py", line 12, in <module>
        const fileLineMatch = line.match(/File\s+["'](.+?)["'],\s+line\s+(\d+)/i);
        if (fileLineMatch) {
          currentTracebackLine = parseInt(fileLineMatch[2], 10);
        }

        // Match: SyntaxError / TypeError / IndexError / ZeroDivisionError / NameError / etc.
        const errorTypeMatch = line.match(
          /^([A-Za-z]+Error|[A-Za-z]+Exception):\s*(.*)$/
        );
        if (errorTypeMatch) {
          const errName = errorTypeMatch[1];
          const errDetail = errorTypeMatch[2] || errName;
          const targetLine = currentTracebackLine || 1;

          markers.push({
            line: targetLine,
            message: `${errName}: ${errDetail}`,
            severity: 'error',
            source: 'Python Runtime',
            rawLine: line,
          });
          currentTracebackLine = null;
        }

        // SyntaxError: invalid syntax pointing with caret ^
        if (line.includes('^') && i > 0 && currentTracebackLine) {
          const col = line.indexOf('^') + 1;
          const prevLine = lines[i - 1];
          markers.push({
            line: currentTracebackLine,
            column: col,
            message: `Syntax error near '${prevLine.trim()}'`,
            severity: 'error',
            source: 'Python Compiler',
            rawLine: prevLine,
          });
        }
      }
    }

    // 2. C / C++ Error Parsing (GCC/Clang format: main.cpp:14:10: error: ...)
    else if (languageId === 'cpp' || languageId === 'c') {
      for (const line of lines) {
        // Match: filename:line:col: error/warning: message
        const match = line.match(
          /(?:[a-zA-Z0-9_\-\.\/]+):(\d+):(?:(\d+):)?\s+(error|fatal error|warning|note):\s*(.+)/i
        );
        if (match) {
          const lineNum = parseInt(match[1], 10);
          const colNum = match[2] ? parseInt(match[2], 10) : undefined;
          const level = match[3].toLowerCase().includes('warning') ? 'warning' : 'error';
          const msg = match[4].trim();

          markers.push({
            line: lineNum,
            column: colNum,
            message: msg,
            severity: level,
            source: languageId === 'cpp' ? 'G++' : 'GCC',
            rawLine: line,
          });
        }
      }
    }

    // 3. Java Error Parsing (javac Main.java:14: error: ... / Exception in thread "main" ... at Main.main(Main.java:14))
    else if (languageId === 'java') {
      for (const line of lines) {
        // javac compiler error: Main.java:14: error: ';' expected
        const javacMatch = line.match(
          /(?:[a-zA-Z0-9_\-\.\/]+):(\d+):\s+(error|warning):\s*(.+)/i
        );
        if (javacMatch) {
          markers.push({
            line: parseInt(javacMatch[1], 10),
            message: javacMatch[3].trim(),
            severity: javacMatch[2].toLowerCase() === 'warning' ? 'warning' : 'error',
            source: 'javac',
            rawLine: line,
          });
          continue;
        }

        // JVM runtime stack trace: at Main.main(Main.java:14)
        const jvmMatch = line.match(/at\s+[a-zA-Z0-9_\.]+\(([a-zA-Z0-9_]+)\.java:(\d+)\)/i);
        if (jvmMatch) {
          markers.push({
            line: parseInt(jvmMatch[2], 10),
            message: `Runtime exception in ${jvmMatch[1]}.java`,
            severity: 'error',
            source: 'Java JVM',
            rawLine: line,
          });
        }
      }
    }

    // 4. Rust Error Parsing (error[E0425]: ... --> src/main.rs:14:5)
    else if (languageId === 'rust') {
      let pendingMessage = '';
      for (const line of lines) {
        if (line.startsWith('error[') || line.startsWith('error:')) {
          pendingMessage = line;
        }
        const locMatch = line.match(/-->\s*(?:[a-zA-Z0-9_\-\.\/]+):(\d+):(\d+)/);
        if (locMatch && pendingMessage) {
          markers.push({
            line: parseInt(locMatch[1], 10),
            column: parseInt(locMatch[2], 10),
            message: pendingMessage,
            severity: 'error',
            source: 'rustc',
            rawLine: line,
          });
          pendingMessage = '';
        }
      }
    }

    // 5. Go Error Parsing (./main.go:14:2: undefined: fmt.Printlnn)
    else if (languageId === 'go') {
      for (const line of lines) {
        const goMatch = line.match(/(?:[a-zA-Z0-9_\-\.\/]+):(\d+):(\d+):\s*(.+)/i);
        if (goMatch) {
          markers.push({
            line: parseInt(goMatch[1], 10),
            column: parseInt(goMatch[2], 10),
            message: goMatch[3].trim(),
            severity: 'error',
            source: 'go compiler',
            rawLine: line,
          });
        }
      }
    }

    // 6. JavaScript / TypeScript (Node.js stack trace or tsc errors)
    else if (languageId === 'javascript' || languageId === 'typescript') {
      for (const line of lines) {
        // TypeScript tsc: index.ts(14,5): error TS2304: Cannot find name 'x'.
        const tsMatch = line.match(/(?:[a-zA-Z0-9_\-\.\/]+)\((\d+),(\d+)\):\s*(error|warning)\s*TS\d+:\s*(.+)/i);
        if (tsMatch) {
          markers.push({
            line: parseInt(tsMatch[1], 10),
            column: parseInt(tsMatch[2], 10),
            message: tsMatch[4].trim(),
            severity: 'error',
            source: 'TypeScript',
            rawLine: line,
          });
          continue;
        }

        // Node.js stack trace: at solution (/app/index.js:14:9)
        const nodeMatch = line.match(/at\s+.*?\((?:.*?):(\d+):(\d+)\)/i);
        if (nodeMatch) {
          markers.push({
            line: parseInt(nodeMatch[1], 10),
            column: parseInt(nodeMatch[2], 10),
            message: 'Runtime exception',
            severity: 'error',
            source: 'Node.js',
            rawLine: line,
          });
        }
      }
    }

    // Deduplicate markers on same line and message
    const uniqueMarkers: ParsedErrorMarker[] = [];
    const seen = new Set<string>();

    for (const m of markers) {
      const key = `${m.line}:${m.column || 0}:${m.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMarkers.push(m);
      }
    }

    return uniqueMarkers;
  }

  /**
   * Categorizes the error type.
   */
  static categorizeError(status: string, stderr: string, compilationOutput?: string): ErrorCategory {
    if (status === 'COMPILATION_ERROR' || (compilationOutput && compilationOutput.length > 0)) {
      return 'COMPILATION';
    }
    if (status === 'TIMEOUT') {
      return 'TIMEOUT';
    }
    if (status === 'MEMORY_LIMIT') {
      return 'MEMORY';
    }
    if (status === 'SYSTEM_ERROR') {
      return 'SYSTEM';
    }

    const err = (stderr || '').toLowerCase();
    if (err.includes('memory') || err.includes('out of memory') || err.includes('heap')) {
      return 'MEMORY';
    }
    if (err.includes('timed out') || err.includes('time limit')) {
      return 'TIMEOUT';
    }
    if (
      err.includes('syntaxerror') ||
      err.includes('expected') ||
      err.includes('undefined reference') ||
      err.includes('cannot find symbol')
    ) {
      return 'COMPILATION';
    }

    return 'RUNTIME';
  }
}
