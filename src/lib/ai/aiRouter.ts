import { UserProfile } from '@/types/campus';
import { AIChatMessage, AIResponsePayload } from './aiTypes';
import { AIContextBuilder } from './aiContext';
import { AIPromptsManager } from './aiPrompts';
import { CAMPUS_AI_TOOL_DEFINITIONS, AIToolsExecutor } from './aiTools';
import { providerChain } from './providers/ProviderChain';
import { AIMemoryManager } from './aiMemory';
import { AINavigationManager } from './aiNavigation';

export interface AIRouterRequest {
  message: string;
  userProfile: UserProfile;
  currentPath?: string;
  currentTab?: string;
  sessionId?: string;
  selectedEntity?: Record<string, any>;
  mode?: string;
}

export type AIIntent =
  | 'navigation'
  | 'search'
  | 'data_lookup'
  | 'analysis'
  | 'academic_help'
  | 'generation'
  | 'recommendation'
  | 'action'
  | 'general_question';

export class AIRouter {
  /**
   * Classifies user query into actionable intent category.
   */
  static classifyIntent(message: string): AIIntent {
    const q = message.toLowerCase();

    if (
      q.startsWith('open ') ||
      q.startsWith('go to ') ||
      q.startsWith('take me to ') ||
      q.startsWith('navigate to ') ||
      q.includes('open my timetable') ||
      q.includes('open timetable') ||
      q.includes('open attendance')
    ) {
      return 'navigation';
    }

    if (
      q.includes('generate ') ||
      q.includes('create paper') ||
      q.includes('create quiz') ||
      q.includes('draft question') ||
      q.includes('create assignment')
    ) {
      return 'generation';
    }

    if (
      q.includes('what should i study') ||
      q.includes('recommend') ||
      q.includes('which subjects should i worry about') ||
      q.includes('how can i prepare')
    ) {
      return 'recommendation';
    }

    if (
      q.includes('why is this') ||
      q.includes('why is my') ||
      q.includes('analyze') ||
      q.includes('breakdown') ||
      q.includes('anomaly') ||
      q.includes('compliance')
    ) {
      return 'analysis';
    }

    if (
      q.includes('what is my attendance') ||
      q.includes("what's my attendance") ||
      q.includes('when is my next exam') ||
      q.includes('what is my next class') ||
      q.includes('pending assignments') ||
      q.includes('my grades') ||
      q.includes('my classes') ||
      q.includes('show my classes')
    ) {
      return 'data_lookup';
    }

    if (
      q.includes('find ') ||
      q.includes('search ') ||
      q.includes('lookup ') ||
      q.includes('show notes')
    ) {
      return 'search';
    }

    if (
      q.includes('explain ') ||
      q.includes('teach me ') ||
      q.includes('how does ') ||
      q.includes('what is dijkstra') ||
      q.includes('what is paging') ||
      q.includes('what is deadlock') ||
      q.includes('what is normalization')
    ) {
      return 'academic_help';
    }

    return 'general_question';
  }

  /**
   * Main orchestrator for all Campus OS AI requests.
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

    // 1. Build dynamic runtime context with page awareness
    const context = await AIContextBuilder.buildContext(
      userProfile,
      currentPath,
      currentTab,
      selectedEntity
    );

    // 2. Classify intent
    const intent = this.classifyIntent(message);

    // 3. Fast-path for direct deterministic navigation
    if (intent === 'navigation') {
      const navIntent = AINavigationManager.parseNavigationIntent(message, context.user.role);
      if (navIntent) {
        return {
          answer: `📍 **Opening ${navIntent.label}**\n\nNavigating to \`${navIntent.route}\`...`,
          category: 'navigation',
          action: {
            type: 'navigate',
            label: navIntent.label,
            route: navIntent.route,
          },
          toolsUsed: ['navigateToRoute'],
          suggestedPrompts: this.getSuggestedPrompts(context.user.role, message),
        };
      }
    }

    // 4. Fetch session history
    const sessionKey = sessionId || `sess_${userProfile.id || 'guest'}`;
    const pastHistory = AIMemoryManager.getSessionHistory(sessionKey);

    const newUserMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const messages: AIChatMessage[] = [...pastHistory, newUserMessage];

    // 5. Filter allowed tools
    const availableTools = CAMPUS_AI_TOOL_DEFINITIONS.filter((t) =>
      t.allowedRoles.includes(context.user.role)
    );

    // 6. Generate system prompt
    const systemPrompt = AIPromptsManager.getSystemPrompt(context);

    // 7. Invoke Provider Chain (OpenRouter -> Groq -> Fallback)
    let response = await providerChain.generateResponse(
      messages,
      availableTools,
      context,
      systemPrompt
    );

    const toolsUsed: string[] = [];
    let detectedAction = response.action;
    let quizData = response.quizData;
    let studyPlan = response.studyPlan;

    // 8. Tool execution loop if LLM requested tool calls (max 3 cycles)
    let cycles = 0;
    while (response.toolCalls && response.toolCalls.length > 0 && cycles < 3) {
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

      // Re-invoke provider with tool outputs
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

    // 9. If navigation cues present in prompt and not yet attached, auto-attach navigation action
    if (!detectedAction) {
      const q = message.toLowerCase();
      if (
        q.includes('timetable') &&
        (q.includes('open') || q.includes('show') || q.includes('view'))
      ) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Class Timetable',
          route: '/student-dashboard?tab=timetable',
        };
      } else if (
        q.includes('attendance') &&
        (q.includes('open') || q.includes('view') || q.includes('sheet'))
      ) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Attendance Register',
          route:
            context.user.role === 'teacher'
              ? '/teacher-dashboard?tab=attendance'
              : '/student-dashboard?tab=attendance',
        };
      } else if (
        q.includes('notes') &&
        (q.includes('open') || q.includes('browse') || q.includes('find'))
      ) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Notes Explorer',
          route: '/student-dashboard?tab=notes',
        };
      } else if (
        q.includes('exam') &&
        (q.includes('schedule') || q.includes('timetable') || q.includes('dates'))
      ) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Exam Schedule',
          route: '/student-dashboard?tab=exams',
        };
      }
    }

    // 10. Save updated conversation in memory
    const finalAssistantMsg: AIChatMessage = {
      id: `ai_${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      action: detectedAction,
      quiz: quizData,
    };

    AIMemoryManager.appendMessages(sessionKey, context.user.id, [
      newUserMessage,
      finalAssistantMsg,
    ]);

    // 11. Format return payload
    return {
      answer: response.content || 'I have processed your request.',
      category: quizData ? 'quiz' : studyPlan ? 'study_plan' : intent,
      action: detectedAction,
      quizData,
      studyPlan,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      suggestedPrompts: this.getSuggestedPrompts(context.user.role, message),
    };
  }

  private static getSuggestedPrompts(role: string, lastMsg: string): string[] {
    const lower = lastMsg.toLowerCase();
    if (role === 'student') {
      if (lower.includes('exam') || lower.includes('study')) {
        return [
          'Generate 5 practice questions on OS',
          'Create a 3-day revision plan',
          'When is my next exam?',
        ];
      }
      return [
        'What is my attendance rate?',
        'Open my timetable',
        'Which assignments are pending?',
        'Explain Dijkstra Algorithm',
        'Find lecture notes on Virtual Memory',
      ];
    }
    if (role === 'teacher') {
      return [
        'Which students have low attendance?',
        'Generate a 100-mark OS question paper',
        'Show my teaching schedule',
        'Create assignment on Normalization',
      ];
    }
    return [
      'Give me a campus overview',
      'Which department has the lowest attendance?',
      'Show recent announcements',
      'Analyze academic performance',
    ];
  }
}
