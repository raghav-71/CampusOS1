/**
 * Campus OS Agent Engine
 * Core ReAct loop supporting General AI conversation, streaming, semantic tool calling, role security,
 * and Intelligent Routing (Groq speed-first, Gemini RAG, Nemotron reasoning).
 */

import { SystemPromptBuilder } from '../prompts/system';
import { ProviderChain } from '../providers/ProviderChain';
import { DeterministicEngine, AgentExecutionResponse, AgentStepExecution } from '../providers/DeterministicEngine';
import { toolRegistry, AIExecutionContext } from '../tools/ToolRegistry';
import { AIPermissionsManager } from '../security/permissions';
import { LLMMessage, LLMStreamChunk, AIQueryIntent } from '../providers/types';
import { documentPipeline } from '../rag/documentPipeline';

const MAX_AGENT_STEPS = 5;
const DEFAULT_MAX_TOKENS = 2048;

function getExecutionOptions(query: string, signal?: AbortSignal) {
  const intent = ProviderChain.classifyIntent(query);
  return {
    temperature: intent === 'complex_reasoning' ? 0.2 : 0.3,
    maxTokens: intent === 'complex_reasoning' ? 3072 : intent === 'rag_document' ? 3000 : DEFAULT_MAX_TOKENS,
    enableThinking: false, // Keep thinking disabled for reliable, fast token streaming
    intent,
    signal,
  };
}

export interface StreamEvent {
  type: 'token' | 'step' | 'action' | 'done' | 'error';
  content?: string;
  step?: string;
  toolName?: string;
  action?: any;
  modelUsed?: string;
  provider?: string;
  suggestedPrompts?: string[];
  category?: string;
}

export class CampusEngine {
  /**
   * Enriches prompt messages with local RAG document context if relevant to academic/study query.
   */
  private static enrichWithRAGContext(query: string, messages: LLMMessage[], intent: AIQueryIntent): LLMMessage[] {
    if (intent !== 'rag_document') return messages;

    try {
      const ragResults = documentPipeline.search(query, undefined, 3);
      if (ragResults.length > 0) {
        const ragContextText = ragResults
          .map((r, i) => `[Source ${i + 1}: ${r.chunk.docTitle} (${r.chunk.subject})]\n${r.chunk.text}`)
          .join('\n\n');

        return [
          messages[0], // System prompt
          {
            role: 'system',
            content: `Relevant Campus OS Study & Document Material:\n${ragContextText}\n\nUse this authentic document information to accurately answer the user query.`,
          },
          ...messages.slice(1),
        ];
      }
    } catch {
      // Gracefully continue without RAG enrichment if indexing has issues
    }

    return messages;
  }

  /**
   * Main intelligent query handler for all user messages (non-streaming).
   */
  static async process(
    query: string,
    context: AIExecutionContext,
    chatHistory: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }> = []
  ): Promise<AgentExecutionResponse> {
    const startTime = Date.now();
    const steps: AgentStepExecution[] = [];
    const toolsUsed: string[] = [];
    let lastActionRequired: any = undefined;

    const recordStep = (step: string, toolName?: string, status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'COMPLETED') => {
      steps.push({ step, toolName, status, durationMs: 25 });
      if (toolName && !toolsUsed.includes(toolName)) {
        toolsUsed.push(toolName);
      }
    };

    // 1. Role Security Check on raw query
    const securityCheck = AIPermissionsManager.checkQueryPermission(query, context.userRole);
    if (!securityCheck.allowed) {
      return {
        answer: `🛡️ **Access Denied**\n\n${securityCheck.reason || 'You are not authorized to perform this operation under your current role.'}`,
        category: 'ACTION',
        toolsUsed: [],
        executionSteps: [{ step: 'Role security validation', status: 'FAILED', durationMs: 5 }],
        suggestedPrompts: ['What is my attendance?', 'When is my next exam?', 'Open my timetable'],
        modelUsed: 'campus-security-guard',
        provider: 'Campus OS Security',
        durationMs: Date.now() - startTime,
      };
    }

    // 2. Build system prompt & bounded conversation history
    const systemPrompt = SystemPromptBuilder.getBaseSystemPrompt({
      userName: context.userName,
      userRole: context.userRole,
      department: context.department,
      semester: context.semester,
      currentPath: context.currentPath,
      currentTab: context.currentTab,
      selectedEntity: context.selectedEntity,
    });

    let messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-4).map((m) => ({
        role: m.role,
        content: (m.content || '').slice(-1200),
      })),
      { role: 'user', content: query },
    ];

    const intent = ProviderChain.classifyIntent(query);
    messages = this.enrichWithRAGContext(query, messages, intent);
    const tools = toolRegistry.getLLMDefinitionsForRole(context.userRole);

    try {
      // 3. ReAct Agent Loop for Action/Tool Requests
      if (intent === 'campus_action') {
        let iteration = 0;
        while (iteration < MAX_AGENT_STEPS) {
          iteration++;

          const completion = await ProviderChain.executeCompletion(messages, {
            tools: tools.length > 0 ? tools : undefined,
            ...getExecutionOptions(query),
          });

          // If no tool calls, model has answered directly
          if (!completion.toolCalls || completion.toolCalls.length === 0) {
            return {
              answer: completion.text || 'I have processed your request.',
              category: toolsUsed.length > 0 ? 'ACADEMIC' : 'GENERAL',
              toolsUsed,
              executionSteps: steps,
              actionRequired: lastActionRequired,
              suggestedPrompts: this.generateSuggestions(context.userRole, toolsUsed),
              modelUsed: completion.modelUsed,
              provider: completion.provider,
              durationMs: Date.now() - startTime,
            };
          }

          // Handle tool calls generated by LLM
          messages.push({
            role: 'assistant',
            content: completion.text || '',
            tool_calls: completion.toolCalls,
          });

          for (const tc of completion.toolCalls) {
            const toolName = tc.function.name;
            let parsedArgs = {};

            try {
              parsedArgs = typeof tc.function.arguments === 'string'
                ? JSON.parse(tc.function.arguments || '{}')
                : tc.function.arguments || {};
            } catch {
              parsedArgs = {};
            }

            recordStep(`Accessing ${toolName.replace(/_/g, ' ')}`, toolName, 'COMPLETED');

            const isAllowed = AIPermissionsManager.canRoleAccessTool(context.userRole, toolName);
            if (!isAllowed) {
              messages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: JSON.stringify({ error: `Permission denied: Role ${context.userRole} cannot execute ${toolName}` }),
              });
              continue;
            }

            const toolResult = await toolRegistry.executeTool(toolName, parsedArgs, context);

            if (toolResult.actionRequired) {
              lastActionRequired = {
                type: toolResult.actionRequired.type,
                label: `Open ${toolResult.actionRequired.payload?.tab || 'View'}`,
                payload: toolResult.actionRequired.payload,
              };
            }

            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(toolResult.success ? toolResult.data : { error: toolResult.error }),
            });
          }
        }
      }

      // 4. Direct General / Reasoning / RAG Completion
      const completion = await ProviderChain.executeCompletion(messages, getExecutionOptions(query));
      return {
        answer: completion.text,
        category: intent === 'rag_document' ? 'ACADEMIC' : 'GENERAL',
        toolsUsed,
        executionSteps: steps,
        actionRequired: lastActionRequired,
        suggestedPrompts: this.generateSuggestions(context.userRole, toolsUsed),
        modelUsed: completion.modelUsed,
        provider: completion.provider,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      console.warn('[CampusEngine] LLM provider error:', err?.message || err);

      const lowerQ = query.toLowerCase();
      const isCampusSpecific = lowerQ.includes('attendance') || lowerQ.includes('timetable') || lowerQ.includes('schedule') || lowerQ.includes('marks') || lowerQ.includes('grades') || lowerQ.includes('notes');

      if (isCampusSpecific) {
        return await DeterministicEngine.process(query, context);
      }

      const status = await ProviderChain.getStatus();
      return {
        answer: `### ⚠️ Campus AI: Service Notice\n\nI was unable to complete this query through remote language models. Please check your provider configuration.\n\n**Provider Connectivity:**\n- **Groq Cloud (High Speed)**: ${status.providers.groq.configured ? (status.providers.groq.available ? 'Connected' : 'Configured but unreachable') : 'Not configured'}\n- **Google Gemini (Study/RAG)**: ${status.providers.gemini.configured ? (status.providers.gemini.available ? 'Connected' : 'Configured but unreachable') : 'Not configured'}\n- **NVIDIA Nemotron (Reasoning)**: ${status.providers.nvidia.configured ? (status.providers.nvidia.available ? 'Connected' : 'Configured but unreachable') : 'Not configured'}`,
        category: 'GENERAL',
        toolsUsed: [],
        executionSteps: [{ step: 'LLM Connection Check', status: 'FAILED', durationMs: 10 }],
        suggestedPrompts: ['What is my attendance?', 'Open my timetable'],
        modelUsed: 'none',
        provider: 'Campus OS Diagnostics',
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Streaming ReAct query handler that emits live SSE events.
   */
  static async processStream(
    query: string,
    context: AIExecutionContext,
    chatHistory: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }> = [],
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    // 1. Role Security Check
    const securityCheck = AIPermissionsManager.checkQueryPermission(query, context.userRole);
    if (!securityCheck.allowed) {
      onEvent({
        type: 'token',
        content: `🛡️ **Access Denied**\n\n${securityCheck.reason || 'You are not authorized to perform this operation.'}`,
      });
      onEvent({
        type: 'done',
        category: 'ACTION',
        modelUsed: 'campus-security-guard',
        provider: 'Campus OS Security',
        suggestedPrompts: ['What is my attendance?', 'When is my next exam?'],
      });
      return;
    }

    // 2. Build system prompt & bounded conversation history
    const systemPrompt = SystemPromptBuilder.getBaseSystemPrompt({
      userName: context.userName,
      userRole: context.userRole,
      department: context.department,
      semester: context.semester,
      currentPath: context.currentPath,
      currentTab: context.currentTab,
      selectedEntity: context.selectedEntity,
    });

    let messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-4).map((m) => ({
        role: m.role,
        content: (m.content || '').slice(-1200),
      })),
      { role: 'user', content: query },
    ];

    const intent = ProviderChain.classifyIntent(query);
    messages = this.enrichWithRAGContext(query, messages, intent);

    const tools = toolRegistry.getLLMDefinitionsForRole(context.userRole);
    const toolsUsed: string[] = [];
    let lastAction: any = undefined;
    let tokensEmittedCount = 0;

    const emitToken = (text: string) => {
      tokensEmittedCount++;
      onEvent({ type: 'token', content: text });
    };

    try {
      // Fast Path: Non-action queries (Normal, RAG, Complex Reasoning) stream directly via ProviderChain
      if (intent !== 'campus_action') {
        const directResult = await ProviderChain.streamCompletion(
          messages,
          getExecutionOptions(query, signal),
          (chunk) => {
            if (chunk.text) emitToken(chunk.text);
          }
        );

        onEvent({
          type: 'done',
          category: intent === 'rag_document' ? 'ACADEMIC' : 'GENERAL',
          modelUsed: directResult.modelUsed,
          provider: directResult.provider,
          suggestedPrompts: this.generateSuggestions(context.userRole, []),
        });
        return;
      }

      // Campus Action Path: Execute tool calling then stream synthesized answer
      const initialCompletion = await ProviderChain.executeCompletion(messages, {
        tools: tools.length > 0 ? tools : undefined,
        ...getExecutionOptions(query, signal),
      });

      // If no tools called, stream direct answer
      if (!initialCompletion.toolCalls || initialCompletion.toolCalls.length === 0) {
        if (initialCompletion.text) {
          emitToken(initialCompletion.text);
        }
        onEvent({
          type: 'done',
          category: 'GENERAL',
          modelUsed: initialCompletion.modelUsed,
          provider: initialCompletion.provider,
          suggestedPrompts: this.generateSuggestions(context.userRole, []),
        });
        return;
      }

      // If tools were called, execute tools
      messages.push({
        role: 'assistant',
        content: initialCompletion.text || '',
        tool_calls: initialCompletion.toolCalls,
      });

      for (const tc of initialCompletion.toolCalls) {
        const toolName = tc.function.name;
        toolsUsed.push(toolName);
        onEvent({ type: 'step', step: `Accessing ${toolName.replace(/_/g, ' ')}`, toolName });

        let parsedArgs = {};
        try {
          parsedArgs = typeof tc.function.arguments === 'string'
            ? JSON.parse(tc.function.arguments || '{}')
            : tc.function.arguments || {};
        } catch {
          parsedArgs = {};
        }

        const isAllowed = AIPermissionsManager.canRoleAccessTool(context.userRole, toolName);
        if (!isAllowed) {
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify({ error: `Permission denied: Role ${context.userRole} cannot execute ${toolName}` }),
          });
          continue;
        }

        const toolResult = await toolRegistry.executeTool(toolName, parsedArgs, context);
        if (toolResult.actionRequired) {
          lastAction = {
            type: toolResult.actionRequired.type,
            label: `Open ${toolResult.actionRequired.payload?.tab || 'View'}`,
            payload: toolResult.actionRequired.payload,
          };
          onEvent({ type: 'action', action: lastAction });
        }

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult.success ? toolResult.data : { error: toolResult.error }),
        });
      }

      // Stream the final synthesized reasoning from LLM
      const finalResult = await ProviderChain.streamCompletion(
        messages,
        getExecutionOptions(query, signal),
        (chunk: LLMStreamChunk) => {
          if (chunk.text) {
            emitToken(chunk.text);
          }
        }
      );

      onEvent({
        type: 'done',
        category: 'ACADEMIC',
        action: lastAction,
        modelUsed: finalResult.modelUsed,
        provider: finalResult.provider,
        suggestedPrompts: this.generateSuggestions(context.userRole, toolsUsed),
      });
    } catch (err: any) {
      if (signal?.aborted) {
        onEvent({ type: 'done', category: 'GENERAL', modelUsed: 'aborted', provider: 'user' });
        return;
      }

      console.error('[CampusEngine] Stream error:', err?.message || err);

      if (tokensEmittedCount > 0) {
        onEvent({
          type: 'done',
          category: 'GENERAL',
          modelUsed: 'stream-terminated',
          provider: 'Campus OS',
        });
        return;
      }

      // If no tokens were emitted yet, attempt deterministic fallback
      try {
        const res = await this.process(query, context, chatHistory);
        onEvent({ type: 'token', content: res.answer });
        onEvent({
          type: 'done',
          category: res.category,
          action: res.actionRequired,
          modelUsed: res.modelUsed,
          provider: res.provider,
          suggestedPrompts: res.suggestedPrompts,
        });
      } catch {
        onEvent({
          type: 'error',
          content: 'Sorry, the response was interrupted. Please try again.',
        });
      }
    }
  }

  private static generateSuggestions(role: string, toolsUsed: string[]): string[] {
    if (toolsUsed.includes('get_student_attendance')) {
      return ['Which subject am I weakest in?', 'When is my next exam?', 'Create a study plan'];
    }
    if (toolsUsed.includes('get_marks_and_performance')) {
      return ['Create a personalized study plan', 'When is my next exam?', 'Open my timetable'];
    }
    if (toolsUsed.includes('get_exam_schedule')) {
      return ['What is my attendance?', 'Which subject am I weakest in?', 'Search DBMS notes'];
    }
    if (role === 'teacher') {
      return ['Show students below 75% attendance', 'Show my assigned classes', 'Start my next class'];
    }
    if (role === 'admin') {
      return ['Show institutional metrics', 'Broadcast an announcement', 'Open analytics'];
    }
    return ['What is my attendance?', 'When is my next exam?', 'What is my next class?'];
  }
}

