/**
 * Campus OS — Code AI Engine
 * Integrates directly with ProviderChain (Groq, OpenRouter, Ollama) to provide
 * stable AI tutoring, structured bug fixes, and action execution.
 */

import { ProviderChain } from '@/lib/ai/providers/ProviderChain';
import { LLMMessage } from '@/lib/ai/providers/types';
import { CodeAIContext, AIFixPatch, ErrorCategory } from '@/types/codelab';
import { CodePromptBuilder, AIActionType } from './codePrompts';

export interface AIActionResult {
  title: string;
  response: string;
  category?: ErrorCategory;
  modelUsed?: string;
  provider?: string;
}

export class CodeAIEngine {
  /**
   * Builds the message array for LLM completion with strictly bounded context.
   */
  private static buildMessages(
    userMessage: string,
    context: CodeAIContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): LLMMessage[] {
    const systemPrompt = CodePromptBuilder.buildSystemPrompt(context);
    const sanitizedSource = CodePromptBuilder.sanitizeCode(context.sourceCode || '');

    const contextPayload = `
### ACTIVE SOURCE CODE (${context.fileName} - ${context.language}):
\`\`\`${context.language.toLowerCase()}
${sanitizedSource}
\`\`\`
${context.selectedCode ? `\n### SELECTED CODE SNIPPET:\n\`\`\`${context.language.toLowerCase()}\n${CodePromptBuilder.sanitizeString(context.selectedCode, 1000)}\n\`\`\`` : ''}
${context.stdin ? `\n### STDIN:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.stdin, 500)}\n\`\`\`` : ''}
${context.stdout ? `\n### STDOUT:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.stdout, 600)}\n\`\`\`` : ''}
${context.stderr ? `\n### STDERR:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.stderr, 800)}\n\`\`\`` : ''}
${context.compilationOutput ? `\n### COMPILER OUTPUT:\n\`\`\`\n${CodePromptBuilder.sanitizeString(context.compilationOutput, 800)}\n\`\`\`` : ''}
`;

    // Keep only last 4 messages to avoid token bloat
    const cleanHistory = history.slice(-4).map((m) => ({
      role: m.role,
      content: CodePromptBuilder.sanitizeString(m.content, 800),
    }));

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Current code context:${contextPayload}` },
      {
        role: 'assistant',
        content: `Understood. I have inspected your ${context.language} code and runtime output. How can I assist you?`,
      },
      ...cleanHistory,
      { role: 'user', content: userMessage },
    ];

    return messages;
  }

  /**
   * Executes atomic chat completion for interactive tutoring.
   */
  static async chat(
    userMessage: string,
    context: CodeAIContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    signal?: AbortSignal
  ): Promise<{ response: string; modelUsed?: string; provider?: string }> {
    const messages = this.buildMessages(userMessage, context, history);
    const result = await ProviderChain.executeCompletion(messages, {
      temperature: 0.2,
      signal,
    });

    return {
      response: result.text,
      modelUsed: result.modelUsed,
      provider: result.provider,
    };
  }

  /**
   * Generates a structured fix patch with corrected code and diff details.
   */
  static async generateFixPatch(
    context: CodeAIContext,
    signal?: AbortSignal
  ): Promise<AIFixPatch> {
    const sanitizedSource = CodePromptBuilder.sanitizeCode(context.sourceCode || '');

    const systemPrompt = `You are a precision code repair engine for ${context.language}.
Analyze the provided code and any compiler/runtime error.
You must return your analysis as a valid JSON object with the following schema:
{
  "explanation": "Clear 2-3 sentence explanation of the bug and why it occurred",
  "category": "COMPILATION" | "RUNTIME" | "LOGICAL" | "TIMEOUT" | "MEMORY" | "STYLE",
  "problemLine": 1,
  "changesSummary": "Brief description of changes made",
  "correctedCode": "FULL COMPLETE REPLACEMENT CODE HERE (no markdown backticks inside this JSON field)"
}

IMPORTANT:
- Return ONLY the raw valid JSON object. Do not include markdown code fences or conversational text.
- correctedCode must be the complete, working file so it can replace the student's code cleanly when applied.`;

    const userPrompt = `Source Code:
\`\`\`${context.language}
${sanitizedSource}
\`\`\`
${context.compilationOutput ? `Compiler Output:\n${CodePromptBuilder.sanitizeString(context.compilationOutput, 800)}\n` : ''}
${context.stderr ? `Runtime Stderr:\n${CodePromptBuilder.sanitizeString(context.stderr, 800)}\n` : ''}
${context.stdout ? `Runtime Stdout:\n${CodePromptBuilder.sanitizeString(context.stdout, 600)}\n` : ''}
Fix all bugs and return the JSON patch.`;

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const completion = await ProviderChain.executeCompletion(messages, {
        temperature: 0.1,
        signal,
      });
      const rawText = completion.text.trim();

      // Extract JSON payload
      let jsonStr = rawText;
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(jsonStr);

      return {
        explanation: parsed.explanation || 'Fixed syntax and runtime issues in code.',
        category: (parsed.category as ErrorCategory) || 'COMPILATION',
        problemLine: parsed.problemLine || 1,
        changesSummary: parsed.changesSummary || 'Applied bug fixes',
        originalCode: context.sourceCode,
        correctedCode: parsed.correctedCode || context.sourceCode,
        edgeCases: parsed.edgeCases,
      };
    } catch {
      // Fallback: Use standard prompt to extract code block
      const fallbackPrompt = CodePromptBuilder.buildActionPrompt('FIX_CODE', context);
      const messagesFallback = this.buildMessages(fallbackPrompt, context);
      const res = await ProviderChain.executeCompletion(messagesFallback, { signal });

      let extractedCode = context.sourceCode;
      const codeBlockMatch = res.text.match(/```[a-zA-Z0-9_\+\#]*\n([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        extractedCode = codeBlockMatch[1].trim();
      }

      return {
        explanation: res.text.slice(0, 300) + '...',
        category: 'COMPILATION',
        problemLine: 1,
        changesSummary: 'AI generated fix from code analysis',
        originalCode: context.sourceCode,
        correctedCode: extractedCode,
      };
    }
  }

  /**
   * Executes a controlled quick AI action (e.g. explain, optimize, test cases).
   */
  static async executeQuickAction(
    action: AIActionType | string,
    context: CodeAIContext,
    signal?: AbortSignal
  ): Promise<AIActionResult> {
    const prompt = CodePromptBuilder.buildActionPrompt(action, context);
    const messages = this.buildMessages(prompt, context);
    const completion = await ProviderChain.executeCompletion(messages, {
      temperature: 0.2,
      signal,
    });

    const titles: Record<string, string> = {
      EXPLAIN_CODE: 'Code Explanation & Complexity',
      FIND_BUGS: 'Bug & Vulnerability Scan',
      FIX_CODE: 'Bug Fix Proposal',
      OPTIMIZE_CODE: 'Optimization & Big-O Analysis',
      GENERATE_TESTS: 'Edge-Case Test Suite',
      EXPLAIN_ERROR: 'Error Diagnostic',
      TUTOR: 'Socratic Tutor Hint',
      FREE_CHAT: 'Code Analysis',
    };

    const actionKey = (action || 'EXPLAIN_CODE').toUpperCase();

    return {
      title: titles[actionKey] || 'AI Code Analysis',
      response: completion.text,
      modelUsed: completion.modelUsed,
      provider: completion.provider,
    };
  }
}
