/**
 * Campus OS — Code Lab AI Prompt Builder
 * Educational prompts ensuring deep Socratic tutoring, accurate error diagnosis,
 * structured patch generation, and complexity analysis.
 */

import { CodeAIContext } from '@/types/codelab';

export type AIActionType =
  | 'EXPLAIN_CODE'
  | 'FIX_CODE'
  | 'FIND_BUGS'
  | 'OPTIMIZE_CODE'
  | 'GENERATE_TESTS'
  | 'EXPLAIN_ERROR'
  | 'TUTOR'
  | 'FREE_CHAT';

export class CodePromptBuilder {
  /**
   * Sanitizes and caps context payloads to avoid context explosion.
   */
  static sanitizeCode(code: string, maxLines = 350): string {
    if (!code) return '';
    const lines = code.split('\n');
    if (lines.length <= maxLines) return code;
    return (
      lines.slice(0, maxLines).join('\n') +
      `\n\n// ... [Remaining ${lines.length - maxLines} lines truncated for AI analysis]`
    );
  }

  static sanitizeString(str?: string, maxChars = 2000): string {
    if (!str) return '';
    if (str.length <= maxChars) return str;
    return str.slice(0, maxChars) + '... [truncated]';
  }

  static buildSystemPrompt(context: CodeAIContext): string {
    const isTutorMode = context.aiMode === 'tutor';

    return `You are Campus OS Code Mentor, an elite CS Professor, Lead Software Architect, and Empathetic Programming Tutor integrated into Campus OS Code Lab.

### STUDENT CONTEXT:
- **Language**: ${context.language}
- **Active File**: ${context.fileName}
${context.cursorLine ? `- **Cursor Line**: Line ${context.cursorLine}` : ''}
${context.problemStatement ? `- **Problem Statement**: ${this.sanitizeString(context.problemStatement, 500)}` : ''}
${context.executionStatus ? `- **Execution Status**: ${context.executionStatus}` : ''}
${context.expectedOutput ? `- **Expected Output**: \`${this.sanitizeString(context.expectedOutput, 300)}\`` : ''}
${context.stdout ? `- **Actual stdout**: \`${this.sanitizeString(context.stdout, 500)}\`` : ''}
${context.stderr ? `- **Actual stderr**: \`${this.sanitizeString(context.stderr, 800)}\`` : ''}
${context.compilationOutput ? `- **Compiler Output**: \`${this.sanitizeString(context.compilationOutput, 800)}\`` : ''}

### AI MODE: ${isTutorMode ? '🎓 TUTOR / SOCRATIC MENTOR MODE' : '🛠️ DIRECT SOLUTION / FIX MODE'}

### PEDAGOGICAL DIRECTIVES:
1. **EDUCATIONAL TUTORING FIRST**:
   ${
     isTutorMode
       ? `- When Tutor Mode is enabled, DO NOT immediately output the full corrected code.
   - Explain **what** error category is occurring (Compiler vs Runtime vs Logical vs Performance vs Security).
   - Pinpoint **where** it happens (line numbers).
   - Explain **why** it occurs.
   - Provide a progressive Socratic hint or guiding question.`
       : `- Explain the fix clearly and provide the corrected code snippet.`
   }

2. **CATEGORIZE PROBLEMS ACCURATELY**:
   Distinguish strictly between:
   - **Compiler Errors**: Syntax, unmatched symbols, type mismatches.
   - **Runtime Errors**: Index out of range, null pointers, division by zero.
   - **Logical Errors**: Wrong loop conditions, off-by-one errors, incorrect outputs.
   - **Performance Bottlenecks**: High Big-O time/space complexity.

3. **RESPONSE FORMATTING**:
   - Concise, direct, structured with markdown headings and bullet points.
   - For code fixes, enclose code inside triple backtick blocks \`\`\`${context.language.toLowerCase()}\`\`\`.`;
  }

  static buildActionPrompt(action: AIActionType | string, context: CodeAIContext): string {
    const act = (action || 'EXPLAIN_CODE').toUpperCase();

    switch (act) {
      case 'EXPLAIN_CODE':
        return `Explain the logic, functions, data structures, and overall Time & Space complexity Big-O of this ${context.language} code clearly for a student.`;

      case 'FIND_BUGS':
        return `Perform a static analysis on this ${context.language} code. Identify any syntax errors, potential runtime exceptions, edge cases (0, empty, negative), and logic flaws with exact line numbers.`;

      case 'FIX_CODE':
        return `Analyze the current code and errors:
Compiler/Runtime Output:
\`\`\`
${this.sanitizeString(context.compilationOutput || context.stderr || 'No error output')}
\`\`\`
Explain the root cause, line number, and provide the complete corrected working code.`;

      case 'OPTIMIZE_CODE':
        return `Analyze the Time and Space Complexity of this ${context.language} code. Identify any slow loops or allocations and show how to optimize it to a better Big-O complexity class.`;

      case 'GENERATE_TESTS':
        return `Generate 4-5 high-value test cases for this code:
1. Normal standard cases
2. Edge / Corner cases (empty, single element, boundary values)
3. Stress / Large input cases
For each, provide Input, Expected Output, and Rationale.`;

      case 'EXPLAIN_ERROR':
        return `Explain the following compiler or runtime error in simple, student-friendly terms:
\`\`\`
${this.sanitizeString(context.compilationOutput || context.stderr || 'Unknown error')}
\`\`\`
Explain what it means, why it happened, and how to avoid it.`;

      case 'TUTOR':
        return `I am stuck on this problem. Do NOT give me the full code answer. Give me a progressive Socratic hint pointing me in the right direction.`;

      case 'FREE_CHAT':
      default:
        return `Help me understand, debug, or improve this ${context.language} code.`;
    }
  }
}
