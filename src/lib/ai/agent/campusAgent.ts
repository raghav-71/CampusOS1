/**
 * Campus OS Main AI Agent
 * Orchestrates intent detection, role security, tool calling, memory tracking, and multi-step execution.
 */

import {
  AIRouterRequest,
  AIResponsePayload,
  AIChatMessage,
} from '../aiTypes';
import { CampusEngine } from './campusEngine';
import { AIMemoryManager } from '../memory/sessionMemory';
import { AIExecutionContext } from '../tools/ToolRegistry';

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

    const userRole = (userProfile.role || 'student') as 'student' | 'teacher' | 'admin';

    // 1. Build runtime execution context
    const executionContext: AIExecutionContext = {
      userId: userProfile.id || 'usr-001',
      userRole,
      userName: userProfile.fullName || userProfile.name || 'Campus Member',
      department: userProfile.department || 'BCA',
      semester: parseInt(String(userProfile.semester || '5').replace(/[^0-9]/g, ''), 10) || 5,
      currentPath,
      currentTab,
      selectedEntity: typeof selectedEntity === 'string' ? selectedEntity : undefined,
    };

    const sessionKey = sessionId || `sess_${userProfile.id || 'guest'}`;
    const pastHistory = AIMemoryManager.getSessionHistory(sessionKey);

    // 2. Execute via CampusEngine (ReAct Loop + LLM provider chain)
    const result = await CampusEngine.process(
      message,
      executionContext,
      pastHistory.map((m) => ({
        role: m.role as any,
        content: m.content,
      }))
    );

    // 3. Save to conversation memory
    const newUserMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let actionObj: any = undefined;
    if (result.actionRequired) {
      actionObj = {
        type: 'navigate',
        label: result.actionRequired.label,
        route: result.actionRequired.payload?.tab
          ? `/${userRole}-dashboard?tab=${result.actionRequired.payload.tab}`
          : currentPath,
      };
    }

    const finalAssistantMsg: AIChatMessage = {
      id: `ai_${Date.now()}`,
      role: 'assistant',
      content: result.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionObj,
    };

    AIMemoryManager.appendMessages(sessionKey, executionContext.userId, [
      newUserMessage,
      finalAssistantMsg,
    ]);

    return {
      answer: result.answer,
      category: result.category,
      action: actionObj,
      toolsUsed: result.toolsUsed,
      executionSteps: result.executionSteps,
      modelUsed: result.modelUsed,
      provider: result.provider,
      suggestedPrompts: result.suggestedPrompts,
      isOfflineFallback: result.isOfflineFallback,
    };
  }
}
