import { UserProfile } from '@/types/campus';
import { AIChatMessage, AIResponsePayload, AIToolCall } from './aiTypes';
import { AIContextBuilder } from './aiContext';
import { AIPromptsManager } from './aiPrompts';
import { CAMPUS_AI_TOOL_DEFINITIONS, AIToolsExecutor } from './aiTools';
import { AIClientFactory } from './aiClient';
import { AIMemoryManager } from './aiMemory';

export interface AIRouterRequest {
  message: string;
  userProfile: UserProfile;
  currentPath?: string;
  currentTab?: string;
  sessionId?: string;
  selectedContext?: Record<string, any>;
  mode?: string;
}

export class AIRouter {
  /**
   * Main entry point for all campus AI requests.
   */
  static async handleRequest(req: AIRouterRequest): Promise<AIResponsePayload> {
    const { message, userProfile, currentPath, currentTab, sessionId, selectedContext } = req;

    // 1. Build dynamic runtime context
    const context = AIContextBuilder.buildContext(
      userProfile,
      currentPath,
      currentTab,
      selectedContext
    );

    // 2. Fetch or initialize conversation history
    const sessionKey = sessionId || `sess_${userProfile.id || 'guest'}`;
    const pastHistory = AIMemoryManager.getSessionHistory(sessionKey);

    const newUserMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const messages: AIChatMessage[] = [...pastHistory, newUserMessage];

    // 3. Filter tools allowed for the current role
    const availableTools = CAMPUS_AI_TOOL_DEFINITIONS.filter((t) =>
      t.allowedRoles.includes(context.user.role)
    );

    // 4. Generate system prompt
    const systemPrompt = AIPromptsManager.getSystemPrompt(context);

    // 5. Invoke AI provider
    const provider = AIClientFactory.getProvider();
    let response = await provider.generateResponse(messages, availableTools, context, systemPrompt);

    const toolsUsed: string[] = [];
    let detectedAction: any = undefined;
    let quizData = response.quizData;
    let studyPlan = response.studyPlan;

    // 6. Handle tool call loop (max 3 tool cycles)
    let cycles = 0;
    while (response.toolCalls && response.toolCalls.length > 0 && cycles < 3) {
      cycles++;
      const currentToolCalls = response.toolCalls;

      // Add assistant tool call message
      messages.push({
        id: `ai_tc_${Date.now()}_${cycles}`,
        role: 'assistant',
        content: response.content || '',
        toolCalls: currentToolCalls,
      });

      // Execute each tool call
      for (const tc of currentToolCalls) {
        toolsUsed.push(tc.function.name);
        let parsedArgs: Record<string, any> = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments || '{}');
        } catch {
          parsedArgs = {};
        }

        const toolResult = await AIToolsExecutor.executeTool(tc.function.name, parsedArgs, context);

        if (toolResult.action) {
          detectedAction = toolResult.action;
        }

        // Push tool output message
        messages.push({
          id: `tool_${Date.now()}_${tc.id}`,
          role: 'tool',
          tool_call_id: tc.id,
          name: tc.function.name,
          content: JSON.stringify(toolResult.data || { error: toolResult.error }),
        });
      }

      // Re-invoke provider with tool results
      response = await provider.generateResponse(messages, availableTools, context, systemPrompt);
      if (response.quizData) quizData = response.quizData;
      if (response.studyPlan) studyPlan = response.studyPlan;
    }

    // 7. Extract action from navigation if content includes navigation cues
    if (!detectedAction) {
      const lower = message.toLowerCase();
      if (lower.includes('timetable') && (lower.includes('open') || lower.includes('show'))) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Class Timetable',
          route: '/student-dashboard?tab=timetable',
        };
      } else if (lower.includes('note') && (lower.includes('open') || lower.includes('show'))) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Notes Library',
          route: '/student-dashboard?tab=notes',
        };
      } else if (lower.includes('exam') && (lower.includes('open') || lower.includes('show'))) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Exam Schedule',
          route: '/student-dashboard?tab=exams',
        };
      } else if (
        lower.includes('attendance') &&
        (lower.includes('open') || lower.includes('show'))
      ) {
        detectedAction = {
          type: 'navigate',
          label: 'Open Attendance Register',
          route:
            context.user.role === 'teacher'
              ? '/teacher-dashboard?tab=attendance'
              : '/student-dashboard?tab=overview',
        };
      }
    }

    // 8. Save updated conversation in memory
    const finalAssistantMsg: AIChatMessage = {
      id: `ai_${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: detectedAction,
      quiz: quizData,
    };

    AIMemoryManager.appendMessages(sessionKey, context.user.id, [
      newUserMessage,
      finalAssistantMsg,
    ]);

    // 9. Format return payload
    return {
      answer: response.content || 'I have processed your query.',
      category: quizData ? 'quiz' : studyPlan ? 'study_plan' : 'general',
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
          'Practice 5 questions on OS',
          'Create a 3-day revision checklist',
          'When is my next exam?',
        ];
      }
      return [
        'What is my next class?',
        'Check my attendance in Java',
        'Explain Dijkstra Algorithm',
        'Pending assignments',
      ];
    }
    if (role === 'teacher') {
      return [
        'Students below 75% attendance',
        'Generate 100-mark OS question paper',
        'Create assignment on BCNF',
        'My class schedule today',
      ];
    }
    return [
      'Campus attendance compliance',
      'At-risk students overview',
      'Curriculum velocity alerts',
      'Generate audit report',
    ];
  }
}
