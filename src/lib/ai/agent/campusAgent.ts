import {
  AIRouterRequest,
  AIResponsePayload,
  AIChatMessage,
  AIToolCall,
} from '../aiTypes';
import { AIContextBuilder } from '../context/context';
import { IntentClassifier } from './intent';
import { AgentPlanner } from './planner';
import { AgentExecutor } from './executor';
import { AIPermissionsManager } from '../security/permissions';
import { AIPromptsManager } from '../prompts';
import { CAMPUS_AI_TOOL_DEFINITIONS, AIToolsExecutor } from '../tools';
import { providerChain } from '../provider/providerChain';
import { AIMemoryManager } from '../memory/sessionMemory';
import { AINavigationManager } from '../tools/navigation';

export class CampusAgent {
  /**
   * Main entry point for all Campus OS AI requests.
   */
  static async handleRequest(req: AIRouterRequest): Promise<AIResponsePayload> {
    const {
      message,
      userProfile,
      currentPath = '/student-dashboard',
      currentTab = 'overview',
      sessionId,
      selectedEntity,
    } = req;

    const userRole = userProfile.role || 'student';

    // 1. Role Security Check on Query
    const securityCheck = AIPermissionsManager.checkQueryPermission(message, userRole);
    if (!securityCheck.allowed) {
      return {
        answer: `🛡️ **Access Denied**\n\n${securityCheck.reason || 'You are not authorized to perform this operation.'}`,
        category: 'ACTION',
        toolsUsed: [],
        suggestedPrompts: [
          'What is my attendance?',
          'When is my next exam?',
          'Open my timetable',
        ],
      };
    }

    // 2. Build runtime context with page and entity awareness
    const context = await AIContextBuilder.buildContext(
      userProfile,
      currentPath,
      currentTab,
      selectedEntity
    );

    // 3. Classify intent
    const intent = IntentClassifier.classify(message);

    // 4. Create execution plan
    const plan = AgentPlanner.createPlan(message, intent, context);

    // 5. Fast deterministic execution if no LLM reasoning is required
    if (!plan.requiresLLM && plan.deterministicHandler) {
      const deterministicResponse = await AgentExecutor.executeDeterministic(
        plan.deterministicHandler,
        message,
        context
      );

      // Save to conversation memory
      const sessionKey = sessionId || `sess_${userProfile.id || 'guest'}`;
      AIMemoryManager.appendMessages(sessionKey, context.user.id, [
        {
          id: `usr_${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: deterministicResponse.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: deterministicResponse.action,
        },
      ]);

      return deterministicResponse;
    }

    // 6. LLM Reasoning Path
    const sessionKey = sessionId || `sess_${userProfile.id || 'guest'}`;
    const pastHistory = AIMemoryManager.getSessionHistory(sessionKey);

    const newUserMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const messages: AIChatMessage[] = [...pastHistory, newUserMessage];

    // Filter tools permitted for user's role
    const availableTools = CAMPUS_AI_TOOL_DEFINITIONS.filter((t) =>
      t.allowedRoles.includes(context.user.role)
    );

    // Build role-tailored system prompt
    const systemPrompt = AIPromptsManager.getSystemPrompt(context);

    // Pre-execute context tools to augment LLM context
    if (plan.preFetchTools && plan.preFetchTools.length > 0) {
      for (const toolName of plan.preFetchTools.slice(0, 2)) {
        try {
          const preFetchResult = await AIToolsExecutor.executeTool(
            toolName,
            { query: message, studentId: context.user.id },
            context.user.role
          );
          if (preFetchResult.success && preFetchResult.data) {
            messages.push({
              id: `tool_ctx_${Date.now()}`,
              role: 'tool',
              name: toolName,
              tool_call_id: `call_${toolName}`,
              content: JSON.stringify(preFetchResult.data),
            });
          }
        } catch {
          // Continue if pre-fetch fails
        }
      }
    }

    // Invoke Provider Chain (OpenRouter Free Router)
    let response = await providerChain.generateResponse(
      messages,
      availableTools,
      context,
      systemPrompt
    );

    const toolsUsed: string[] = [...(plan.preFetchTools || [])];
    let detectedAction = response.action;
    let quizData = response.quizData;
    let studyPlan = response.studyPlan;

    // Tool execution loop if LLM emitted tool calls (max 2 cycles)
    let cycles = 0;
    while (response.toolCalls && response.toolCalls.length > 0 && cycles < 2) {
      cycles++;
      const currentToolCalls = response.toolCalls;

      messages.push({
        id: `ai_tc_${Date.now()}_${cycles}`,
        role: 'assistant',
        content: response.content || '',
        toolCalls: currentToolCalls,
      });

      for (const tc of currentToolCalls) {
        toolsUsed.push(tc.function.name);
        let parsedArgs: Record<string, any> = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments || '{}');
        } catch {
          parsedArgs = {};
        }

        const toolResult = await AIToolsExecutor.executeTool(
          tc.function.name,
          parsedArgs,
          context.user.role
        );

        if (toolResult.action) {
          detectedAction = toolResult.action;
        }

        messages.push({
          id: `tool_${Date.now()}_${tc.id}`,
          role: 'tool',
          tool_call_id: tc.id,
          name: tc.function.name,
          content: JSON.stringify(toolResult.data || { error: toolResult.error }),
        });
      }

      response = await providerChain.generateResponse(
        messages,
        availableTools,
        context,
        systemPrompt
      );

      if (response.quizData) quizData = response.quizData;
      if (response.studyPlan) studyPlan = response.studyPlan;
      if (response.action) detectedAction = response.action;
    }

    // Auto-attach navigation actions if user asked to open a specific view
    if (!detectedAction) {
      const navTarget = AINavigationManager.parseNavigationIntent(message, context.user.role);
      if (navTarget && (message.toLowerCase().includes('open') || message.toLowerCase().includes('take me'))) {
        detectedAction = {
          type: 'navigate',
          label: navTarget.label,
          route: navTarget.route,
        };
      }
    }

    // Format final response
    const finalAssistantMsg: AIChatMessage = {
      id: `ai_${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: detectedAction,
      quiz: quizData,
      studyPlan,
    };

    AIMemoryManager.appendMessages(sessionKey, context.user.id, [
      newUserMessage,
      finalAssistantMsg,
    ]);

    return {
      answer: response.content || 'I have analyzed your request using Campus OS intelligence.',
      category: quizData ? 'quiz' : studyPlan ? 'study_plan' : intent,
      action: detectedAction,
      quizData,
      studyPlan,
      toolsUsed: toolsUsed.length > 0 ? Array.from(new Set(toolsUsed)) : undefined,
      modelUsed: response.modelUsed,
      provider: response.provider,
      isOfflineFallback: response.isOfflineFallback,
      suggestedPrompts: this.getSuggestedPrompts(context.user.role, message),
    };
  }

  private static getSuggestedPrompts(role: string, lastMsg: string): string[] {
    const lower = lastMsg.toLowerCase();
    if (role === 'student') {
      if (lower.includes('exam') || lower.includes('study')) {
        return [
          'Create a 3-day revision plan for OS',
          'Explain Deadlock Banker’s algorithm',
          'When is my next exam?',
        ];
      }
      return [
        'What is my attendance?',
        'When is my next exam?',
        'What should I study today?',
        'Open my timetable',
        'Find my DBMS notes',
      ];
    }
    if (role === 'teacher') {
      return [
        'Show my classes',
        'Which students have low attendance?',
        'Generate a DBMS question paper',
        'Summarize my submissions',
      ];
    }
    return [
      'Give me an overview of campus performance',
      'Which department has the lowest attendance?',
      'Show recent announcements',
      'Analyze attendance trends',
    ];
  }
}
