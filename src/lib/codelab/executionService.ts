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

    try {
      const provider = await ExecutionProviderRegistry.getActiveProvider();
      const rawResult = await provider.execute(request);

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
        provider: provider.name,
        ranAt: Date.now(),
      };
    } catch (err: any) {
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: `Execution Service Error: ${err?.message || 'Unknown server error'}`,
        exitCode: null,
        executionTimeMs: Date.now() - startTime,
        errorType: 'SYSTEM',
        language: langDef.displayName,
        version: langDef.version,
        provider: 'Execution Service Guard',
        ranAt: Date.now(),
      };
    }
  }
}
