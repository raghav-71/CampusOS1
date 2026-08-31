/**
 * Campus OS — Code Execution Service
 * Master execution service coordinating sandboxed runners, error extraction,
 * output sanitization, and execution telemetry.
 */

import { CodeExecutionRequest, CodeExecutionResult } from '@/types/codelab';
import { ExecutionProviderRegistry } from './providers';
import { CodeErrorParser } from './errorParser';
import { getLanguageById } from './languages';

const MAX_OUTPUT_SIZE_CHARS = 65536; // 64 KB output limit to protect browser memory

export class CodeExecutionService {
  static async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const langDef = getLanguageById(request.language);

    // Enforce reasonable input limits
    if (!request.sourceCode || request.sourceCode.trim().length === 0) {
      return {
        status: 'SUCCESS',
        stdout: '',
        stderr: '',
        exitCode: 0,
        executionTimeMs: 0,
        language: langDef.displayName,
        version: langDef.version,
        provider: 'Local Validator',
        ranAt: Date.now(),
      };
    }

    const providers = ExecutionProviderRegistry.getAllProviders();
    let rawResult: CodeExecutionResult | null = null;
    let lastError: string = '';
    let executedProviderName = 'Execution Service';

    for (const provider of providers) {
      try {
        const res = await provider.execute(request);
        if (res && res.status !== 'SYSTEM_ERROR') {
          rawResult = res;
          executedProviderName = provider.name;
          break;
        } else if (res && res.status === 'SYSTEM_ERROR') {
          lastError = res.stderr || 'System error';
          // Try next provider
        }
      } catch (err: any) {
        lastError = err?.message || 'Connection error';
        // Try next provider
      }
    }

    // If all remote sandboxes were unreachable, return clear diagnostics
    if (!rawResult) {
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: `Code Execution Sandboxes unavailable: ${lastError || 'Could not connect to sandbox runner.'}`,
        exitCode: null,
        executionTimeMs: Date.now() - startTime,
        errorType: 'SYSTEM',
        language: langDef.displayName,
        version: langDef.version,
        provider: 'Execution Guard',
        ranAt: Date.now(),
      };
    }

    // Truncate output if exceeding safety limits
    let stdout = rawResult.stdout || '';
    let stderr = rawResult.stderr || '';
    let compilationOutput = rawResult.compilationOutput;

    if (stdout.length > MAX_OUTPUT_SIZE_CHARS) {
      stdout = stdout.slice(0, MAX_OUTPUT_SIZE_CHARS) + '\n\n... [Output truncated: Exceeded 64KB limit]';
    }
    if (stderr.length > MAX_OUTPUT_SIZE_CHARS) {
      stderr = stderr.slice(0, MAX_OUTPUT_SIZE_CHARS) + '\n\n... [Error output truncated]';
    }
    if (compilationOutput && compilationOutput.length > MAX_OUTPUT_SIZE_CHARS) {
      compilationOutput = compilationOutput.slice(0, MAX_OUTPUT_SIZE_CHARS) + '\n\n... [Compiler output truncated]';
    }

    // Parse and attach structured error markers
    const rawErrCombined = (compilationOutput || '') + '\n' + stderr;
    const markers = CodeErrorParser.parseErrors(rawErrCombined, langDef.id, request.fileName || 'main');

    const errorCategory =
      rawResult.status !== 'SUCCESS'
        ? CodeErrorParser.categorizeError(rawResult.status, stderr, compilationOutput)
        : null;

    return {
      ...rawResult,
      stdout,
      stderr,
      compilationOutput,
      errorType: errorCategory,
      errorMarkers: markers,
      language: langDef.displayName,
      version: langDef.version,
      provider: executedProviderName,
      ranAt: Date.now(),
    };
  }
}
