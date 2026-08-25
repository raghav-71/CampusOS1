/**
 * Campus OS — Code Execution Provider Interface
 */

import { CodeExecutionRequest, CodeExecutionResult } from '@/types/codelab';

export interface ICodeExecutionProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  execute(request: CodeExecutionRequest): Promise<CodeExecutionResult>;
}
