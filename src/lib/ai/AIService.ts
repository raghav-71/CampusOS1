/**
 * Campus OS AI Service
 * Unified agent orchestrator connecting ContextBuilder, ConversationManager,
 * ActionRegistry, PermissionManager, and CampusEngine.
 */

import { CampusEngine, StreamEvent } from './agent/campusEngine';
import { ContextBuilder, CampusAIContextOptions } from './context/ContextBuilder';
import { ActionRegistry, AIAction } from './actions/ActionRegistry';
import { PermissionManager } from './security/PermissionManager';
import { ConversationManager, ChatHistoryItem } from './memory/ConversationManager';
import { AgentExecutionResponse } from './providers/DeterministicEngine';

export interface AIServiceRequest {
  message: string;
  userProfile?: any;
  currentPath?: string;
  currentTab?: string;
  selectedEntity?: any;
  codeLabContext?: any;
  history?: ChatHistoryItem[];
  stream?: boolean;
}

export class AIService {
  /**
   * Evaluates user query for direct safe navigation actions.
   */
  static detectNavigationAction(query: string, role: any): AIAction | null {
    const q = query.toLowerCase().trim();

    if (/\b(open|show|view|go to|take me to|check)\s+(my\s+)?(timetable|schedule|class schedule)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_timetable', role);
    }
    if (/\b(open|show|view|go to|take me to|check)\s+(my\s+)?(attendance|attendance rate|attendance report)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_attendance', role);
    }
    if (/\b(open|show|view|go to|take me to|check)\s+(my\s+)?(exams|exam schedule|exam dates|upcoming exams)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_exams', role);
    }
    if (/\b(open|show|view|go to|take me to|check)\s+(my\s+)?(subjects|curriculum|syllabus)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_subjects', role);
    }
    if (/\b(open|show|view|go to|take me to|check)\s+(my\s+)?(notes|study notes|lecture notes|resources)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_notes', role);
    }
    if (/\b(open|show|view|go to|take me to|check)\s+(notices|announcements|broadcasts)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_announcements', role);
    }
    if (/\b(open|go to|take me to|launch)\s+(code lab|compiler|ide|editor|programming)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_code_lab', role);
    }
    if (/\b(open|show|view|go to)\s+(my profile|overview|dashboard|home)\b/i.test(q)) {
      return ActionRegistry.resolveAction('navigate_to_profile', role);
    }
    if (/\b(open|show|view)\s+(question papers|exam papers|pyq archive)\b/i.test(q) && (role === 'teacher' || role === 'admin')) {
      return ActionRegistry.resolveAction('navigate_to_papers', role);
    }
    if (/\b(open|show|view)\s+(analytics|institutional metrics|copilot analytics)\b/i.test(q) && (role === 'admin' || role === 'teacher')) {
      return ActionRegistry.resolveAction('navigate_to_analytics', role);
    }

    return null;
  }

  /**
   * Main entry point for non-streaming AI requests.
   */
  static async handleRequest(req: AIServiceRequest): Promise<AgentExecutionResponse> {
    const campusContext = await ContextBuilder.buildCampusAIContext({
      userProfile: req.userProfile,
      currentPath: req.currentPath,
      currentTab: req.currentTab,
      selectedEntity: req.selectedEntity,
      codeLabContext: req.codeLabContext,
      history: req.history,
    });

    const executionContext = {
      userId: campusContext.rawContext.userId || 'usr-001',
      userName: campusContext.rawContext.userName || 'Student',
      userRole: campusContext.role,
      department: campusContext.rawContext.department || 'BCA',
      semester: Number(String(campusContext.rawContext.semester || '5').replace(/[^0-9]/g, '')) || 5,
      currentPath: campusContext.rawContext.path || '/student-dashboard',
      currentTab: campusContext.rawContext.tab || 'overview',
      selectedEntity: req.selectedEntity,
      codeLabContext: req.codeLabContext,
    };

    const historyPayload = ConversationManager.prepareHistoryPayload(req.history || []);
    const directAction = this.detectNavigationAction(req.message, campusContext.role);

    const response = await CampusEngine.process(req.message, executionContext, historyPayload);

    if (directAction && !response.actionRequired) {
      response.actionRequired = {
        type: directAction.requiresConfirmation ? 'CONFIRM_WRITE' : 'NAVIGATE',
        label: directAction.label,
        payload: {
          route: directAction.route,
          tab: directAction.type.replace('navigate_to_', ''),
          label: directAction.label,
        },
      };
    }

    return response;
  }

  /**
   * Main entry point for streaming SSE AI requests.
   */
  static async handleStreamRequest(
    req: AIServiceRequest,
    onEvent: (event: StreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const campusContext = await ContextBuilder.buildCampusAIContext({
      userProfile: req.userProfile,
      currentPath: req.currentPath,
      currentTab: req.currentTab,
      selectedEntity: req.selectedEntity,
      codeLabContext: req.codeLabContext,
      history: req.history,
    });

    const executionContext = {
      userId: campusContext.rawContext.userId || 'usr-001',
      userName: campusContext.rawContext.userName || 'Student',
      userRole: campusContext.role,
      department: campusContext.rawContext.department || 'BCA',
      semester: Number(String(campusContext.rawContext.semester || '5').replace(/[^0-9]/g, '')) || 5,
      currentPath: campusContext.rawContext.path || '/student-dashboard',
      currentTab: campusContext.rawContext.tab || 'overview',
      selectedEntity: req.selectedEntity,
      codeLabContext: req.codeLabContext,
    };

    const historyPayload = ConversationManager.prepareHistoryPayload(req.history || []);
    const directAction = this.detectNavigationAction(req.message, campusContext.role);

    await CampusEngine.processStream(
      req.message,
      executionContext,
      historyPayload,
      (event) => {
        if (event.type === 'done' && directAction && !event.action) {
          event.action = directAction;
        }
        onEvent(event);
      },
      signal
    );

    if (directAction) {
      onEvent({ type: 'action', action: directAction });
    }
  }
}
