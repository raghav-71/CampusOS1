/**
 * Campus OS — Faculty Code AI Engine
 * Integrates directly with ProviderChain to execute faculty actions, assignment generation,
 * student submission evaluation, rubric creation, and viva authoring.
 */

import { ProviderChain } from '@/lib/ai/providers/ProviderChain';
import { LLMMessage } from '@/lib/ai/providers/types';
import { CodeAIContext } from '@/types/codelab';
import { FacultyAIMode, DifficultyLevel } from '@/types/facultyCodelab';
import { FacultyPromptBuilder, FacultyAIAction } from './facultyPrompts';
import { CodePromptBuilder } from './codePrompts';

export interface FacultyAIRequestOptions {
  action: FacultyAIAction | string;
  context: CodeAIContext;
  mode?: FacultyAIMode;
  params?: {
    subject?: string;
    semester?: string;
    topic?: string;
    difficulty?: DifficultyLevel;
    numQuestions?: number;
    durationMinutes?: number;
    marks?: number;
    studentCode?: string;
    referenceSolution?: string;
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  signal?: AbortSignal;
}

export class FacultyAIEngine {
  private static buildMessages(
    promptText: string,
    context: CodeAIContext,
    mode: FacultyAIMode = 'developer',
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): LLMMessage[] {
    const systemPrompt = FacultyPromptBuilder.buildSystemPrompt(context, mode);
    const sanitizedSource = CodePromptBuilder.sanitizeCode(context.sourceCode || '');

    const contextPayload = `
### WORKSPACE CODE (${context.fileName} - ${context.language}):
\`\`\`${context.language.toLowerCase()}
${sanitizedSource}
\`\`\`
${context.selectedCode ? `\n### SELECTED CODE:\n\`\`\`${context.language.toLowerCase()}\n${CodePromptBuilder.sanitizeString(context.selectedCode, 1000)}\n\`\`\`` : ''}
${context.stdin ? `\n### STDIN:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.stdin, 500)}\n\`\`\`` : ''}
${context.stdout ? `\n### STDOUT:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.stdout, 600)}\n\`\`\`` : ''}
${context.stderr ? `\n### STDERR:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.stderr, 800)}\n\`\`\`` : ''}
`;

    const cleanHistory = history.slice(-4).map((m) => ({
      role: m.role,
      content: CodePromptBuilder.sanitizeString(m.content, 800),
    }));

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Current workspace context:${contextPayload}` },
      {
        role: 'assistant',
        content: `Understood Professor. I am ready to assist with ${mode} tasks for this ${context.language} codebase.`,
      },
      ...cleanHistory,
      { role: 'user', content: promptText },
    ];
  }

  static async executeAction(options: FacultyAIRequestOptions): Promise<{
    title: string;
    response: string;
    modelUsed?: string;
    provider?: string;
  }> {
    const prompt = FacultyPromptBuilder.buildActionPrompt(
      options.action,
      options.context,
      options.params
    );

    const messages = this.buildMessages(
      prompt,
      options.context,
      options.mode || 'developer',
      options.history || []
    );

    const completion = await ProviderChain.executeCompletion(messages, {
      temperature: 0.2,
      signal: options.signal,
    });

    const actionTitles: Record<string, string> = {
      GENERATE_ASSIGNMENT: 'Programming Assignment Draft',
      GENERATE_QUESTION: 'Coding Examination Question',
      GENERATE_SOLUTION: 'Optimal Reference Solution',
      GENERATE_TESTS: 'Comprehensive Test Suite',
      CREATE_RUBRIC: 'Evaluation Grading Rubric',
      EVALUATE_SUBMISSION: 'Student Submission Evaluation',
      ANALYZE_STUDENT_CODE: 'Student Code Diagnostic',
      GENERATE_VIVA: 'Oral Viva Exam Questions',
      GENERATE_LAB_EXERCISE: '2-Hour Lab Session Plan',
      GENERATE_PRACTICAL_EXAM: 'Practical Exam Paper',
      GENERATE_HINTS: 'Tiered Socratic Hints',
      EXPLAIN_CODE: 'Lecture Code Explanation',
      FIND_BUGS: 'Faculty Code Audit',
      OPTIMIZE_CODE: 'Algorithmic Optimization',
      FREE_CHAT: 'Faculty AI Assistant',
    };

    const actionKey = (options.action || 'EXPLAIN_CODE').toUpperCase();

    return {
      title: actionTitles[actionKey] || 'Faculty AI Response',
      response: completion.text,
      modelUsed: completion.modelUsed,
      provider: completion.provider,
    };
  }
}
