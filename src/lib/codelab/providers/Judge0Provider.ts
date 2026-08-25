/**
 * Campus OS — Judge0 Sandboxed Execution Provider
 * Communicates with isolated Judge0 CE Sandbox with Base64 payloads and timeout/memory limits.
 */

import { ICodeExecutionProvider } from './types';
import { CodeExecutionRequest, CodeExecutionResult, ExecutionStatus, ErrorCategory } from '@/types/codelab';
import { getLanguageById } from '../languages';

export class Judge0Provider implements ICodeExecutionProvider {
  readonly name = 'Judge0 CE Sandbox';
  private baseUrl: string;
  private apiKey?: string;
  private apiHost?: string;

  constructor() {
    this.baseUrl = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
    this.apiHost = process.env.JUDGE0_API_HOST;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/system_info`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      // If system_info endpoint is restricted, check standard root or assume available
      return true;
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-Auth-Token'] = this.apiKey;
    }
    if (this.apiHost) {
      headers['X-RapidAPI-Host'] = this.apiHost;
    }
    return headers;
  }

  private toBase64(str: string): string {
    return Buffer.from(str || '', 'utf-8').toString('base64');
  }

  private fromBase64(b64?: string | null): string {
    if (!b64) return '';
    try {
      return Buffer.from(b64, 'base64').toString('utf-8');
    } catch {
      return b64;
    }
  }

  async execute(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const langDef = getLanguageById(request.language);

    if (!langDef.judge0LanguageId) {
      throw new Error(`Language ${request.language} does not have a mapped execution runtime.`);
    }

    const payload = {
      language_id: langDef.judge0LanguageId,
      source_code: this.toBase64(request.sourceCode),
      stdin: request.stdin ? this.toBase64(request.stdin) : undefined,
      cpu_time_limit: Math.min(Math.max((request.timeoutMs || 10000) / 1000, 1), 15),
      memory_limit: Math.min(Math.max(request.memoryLimitMb || 128, 16), 256) * 1024, // KB
    };

    const endpoint = `${this.baseUrl}/submissions?base64_encoded=true&wait=true`;

    const controller = new AbortController();
    const clientTimeout = setTimeout(() => controller.abort(), (request.timeoutMs || 10000) + 4000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'SYSTEM_ERROR',
          stdout: '',
          stderr: `Execution server returned HTTP ${response.status}: ${errorText}`,
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

      const stdout = this.fromBase64(data.stdout);
      const stderr = this.fromBase64(data.stderr);
      const compileOutput = this.fromBase64(data.compile_output);
      const message = this.fromBase64(data.message);

      const statusId = data.status?.id;
      const statusDesc = data.status?.description || 'Unknown';

      let status: ExecutionStatus = 'SUCCESS';
      let errorType: ErrorCategory | null = null;

      if (statusId === 3 || statusId === 4) {
        // Accepted / Output matches
        status = 'SUCCESS';
      } else if (statusId === 5) {
        // Time Limit Exceeded
        status = 'TIMEOUT';
        errorType = 'TIMEOUT';
      } else if (statusId === 6) {
        // Compilation Error
        status = 'COMPILATION_ERROR';
        errorType = 'COMPILATION';
      } else if (statusId >= 7 && statusId <= 12) {
        // Runtime Errors (NZEC, SIGSEGV, SIGXFSZ, etc.)
        status = 'RUNTIME_ERROR';
        errorType = 'RUNTIME';
      } else if (statusId === 13 || statusId === 14) {
        status = 'SYSTEM_ERROR';
        errorType = 'SYSTEM';
      } else if (statusId === 1 || statusId === 2) {
        status = 'RUNNING';
      }

      const executionTimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : Date.now() - startTime;
      const memoryUsedBytes = data.memory ? data.memory * 1024 : undefined;

      return {
        status,
        stdout,
        stderr: stderr || message || '',
        exitCode: data.exit_code !== undefined ? data.exit_code : null,
        executionTimeMs,
        memoryUsedBytes,
        compilationOutput: compileOutput || undefined,
        errorType,
        language: langDef.displayName,
        version: langDef.version,
        provider: this.name,
        ranAt: Date.now(),
      };
    } catch (err: any) {
      clearTimeout(clientTimeout);

      if (err.name === 'AbortError') {
        return {
          status: 'TIMEOUT',
          stdout: '',
          stderr: 'Execution timed out after ' + ((request.timeoutMs || 10000) / 1000) + 's.',
          exitCode: null,
          executionTimeMs: request.timeoutMs || 10000,
          errorType: 'TIMEOUT',
          language: langDef.displayName,
          version: langDef.version,
          provider: this.name,
          ranAt: Date.now(),
        };
      }

      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: `Failed to connect to code execution sandbox: ${err.message}`,
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
