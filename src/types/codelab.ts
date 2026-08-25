/**
 * Campus OS — Student Code Lab Types
 * Full Online IDE, Compiler/Runner & AI Coding Tutor
 */

export type ExecutionStatus =
  | 'QUEUED'
  | 'COMPILING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'MEMORY_LIMIT'
  | 'SYSTEM_ERROR';

export type ErrorCategory =
  | 'COMPILATION'
  | 'RUNTIME'
  | 'LOGICAL'
  | 'TIMEOUT'
  | 'MEMORY'
  | 'SECURITY'
  | 'STYLE'
  | 'SYSTEM';

export type AIMode = 'tutor' | 'solution' | 'debug' | 'test';

export interface LanguageDefinition {
  id: string; // e.g. 'python', 'cpp', 'java', 'javascript'
  displayName: string; // e.g. 'Python 3.12'
  version: string;
  editorLanguage: string; // Monaco editor language identifier
  fileExtension: string; // e.g. '.py'
  compileRequired: boolean;
  compilerCommand?: string;
  runCommand?: string;
  defaultTemplate: string;
  iconName?: string;
  color?: string;
  judge0LanguageId?: number;
  pistonLanguage?: string;
  pistonVersion?: string;
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  languageId: string;
  isEntry?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ParsedErrorMarker {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
  rawLine?: string;
}

export interface CodeExecutionRequest {
  language: string; // Language id
  sourceCode: string;
  stdin?: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
  fileName?: string;
  files?: Array<{ name: string; content: string }>;
}

export interface CodeExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs?: number;
  memoryUsedBytes?: number;
  compilationOutput?: string;
  errorType?: ErrorCategory | null;
  errorMarkers?: ParsedErrorMarker[];
  language: string;
  version?: string;
  provider: string;
  rawError?: string;
  ranAt: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status?: 'PASSED' | 'FAILED' | 'ERROR' | 'RUNNING' | 'PENDING';
  executionTimeMs?: number;
  error?: string;
  isCustom?: boolean;
  explanation?: string;
}

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints?: string[];
  sampleInputs: string[];
  sampleOutputs: string[];
  testCases: Array<{ input: string; expectedOutput: string; explanation?: string }>;
  starterTemplates: Record<string, string>; // languageId -> code
}

export interface AIFixPatch {
  explanation: string;
  category: ErrorCategory;
  problemLine?: number;
  changesSummary: string;
  originalCode: string;
  correctedCode: string;
  diffSummary?: string;
  edgeCases?: string[];
}

export interface CodeAIContext {
  language: string;
  fileName: string;
  sourceCode: string;
  selectedCode?: string;
  cursorLine?: number;
  stdin?: string;
  stdout?: string;
  stderr?: string;
  compilationOutput?: string;
  executionStatus?: ExecutionStatus;
  expectedOutput?: string;
  problemStatement?: string;
  aiMode: AIMode;
}

export interface CodeWorkspaceState {
  id: string;
  name: string;
  activeFileId: string;
  files: CodeFile[];
  stdin: string;
  expectedOutput: string;
  currentProblemId?: string | null;
  aiMode: AIMode;
  lastExecutionResult?: CodeExecutionResult | null;
  testCases?: TestCase[];
  fontSize: number;
  minimap: boolean;
  wordWrap: boolean;
  createdAt: number;
  updatedAt: number;
}
