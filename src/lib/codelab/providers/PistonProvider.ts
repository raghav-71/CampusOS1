/**
 * Campus OS — Piston Sandboxed Execution Provider
 * Connects to Piston sandbox runner instances (Self-hosted Docker or Whitelisted instances).
 */

import { ICodeExecutionProvider } from './types';
import { CodeExecutionRequest, CodeExecutionResult, ExecutionStatus, ErrorCategory } from '@/types/codelab';
import { getLanguageById } from '../languages';

export class PistonProvider implements ICodeExecutionProvider {
  readonly name = 'Piston Sandbox';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/runtimes`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async execute(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const langDef = getLanguageById(request.language);

    const payload = {
      language: langDef.id === 'cpp' ? 'c++' : langDef.id,
      version: '*',
      files: [
        {
          name: request.fileName || `main${langDef.fileExtension}`,
          content: request.sourceCode,
        },
      ],
      stdin: request.stdin || '',
      run_timeout: Math.min((request.timeoutMs || 10000) / 1000, 15),
      compile_timeout: 10,
    };

    const controller = new AbortController();
    const clientTimeout = setTimeout(() => controller.abort(), (request.timeoutMs || 10000) + 3000);

    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'SYSTEM_ERROR',
          stdout: '',
          stderr: `Piston Sandbox error: ${errorText}`,
          exitCode: null,
          executionTimeMs: Date.now() - startTime,
          errorType: 'SYSTEM',
          language: langDef.displayName,
          version: langDef.version,
          provider: this.name,
          ranAt: Date.now(),
        };
      }

      const data = await response.json();

      const compileOutput = data.compile?.output || data.compile?.stderr || '';
      const compileCode = data.compile?.code;
      const runOutput = data.run?.stdout || '';
      const runStderr = data.run?.stderr || data.run?.output || '';
      const runCode = data.run?.code;
      const runSignal = data.run?.signal;

      let status: ExecutionStatus = 'SUCCESS';
      let errorType: ErrorCategory | null = null;

      if (compileCode && compileCode !== 0) {
        status = 'COMPILATION_ERROR';
        errorType = 'COMPILATION';
      } else if (runSignal === 'SIGKILL' || runSignal === 'SIGXCPU') {
        status = 'TIMEOUT';
        errorType = 'TIMEOUT';
      } else if (runCode && runCode !== 0) {
        status = 'RUNTIME_ERROR';
        errorType = 'RUNTIME';
      }

      return {
        status,
        stdout: runOutput,
        stderr: runStderr,
        exitCode: runCode !== undefined ? runCode : compileCode,
        executionTimeMs: Date.now() - startTime,
        compilationOutput: compileOutput || undefined,
        errorType,
        language: langDef.displayName,
        version: data.version || langDef.version,
        provider: this.name,
        ranAt: Date.now(),
      };
    } catch (err: any) {
      clearTimeout(clientTimeout);
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: `Piston execution failed: ${err.message}`,
        exitCode: null,
        executionTimeMs: Date.now() - startTime,
        errorType: 'SYSTEM',
        language: langDef.displayName,
        version: langDef.version,
        provider: this.name,
        ranAt: Date.now(),
      };
    }
  }
}
