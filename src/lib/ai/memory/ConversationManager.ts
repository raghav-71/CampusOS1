/**
 * Campus OS AI Conversation Manager
 * Manages in-session conversation history, token budgeting, and multi-turn conversational continuity.
 */

import { LLMMessage } from '../providers/types';

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp?: number | string;
  action?: any;
}

export class ConversationManager {
  private static MAX_TURNS = 10;
  private static MAX_CHAR_PER_MESSAGE = 2000;

  /**
   * Cleans, truncates, and bounds history messages to fit safely into model context.
   */
  static prepareHistoryPayload(
    history: ChatHistoryItem[] = [],
    maxTurns: number = ConversationManager.MAX_TURNS
  ): LLMMessage[] {
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }

    // Take the most recent turns
    const recent = history.slice(-maxTurns);

    return recent.map((item) => {
      let content = item.content || '';
      if (content.length > ConversationManager.MAX_CHAR_PER_MESSAGE) {
        content = content.slice(-ConversationManager.MAX_CHAR_PER_MESSAGE);
      }

      return {
        role: item.role,
        content,
      };
    });
  }

  /**
   * Detects if the current user message is a follow-up referring to previous turns.
   * e.g., "Give me a Java example", "Now make it simpler", "Explain that more", "Why?"
   */
  static isFollowUpQuery(query: string): boolean {
    const q = query.toLowerCase().trim();
    const followUpPatterns = [
      /^(and|also|now|so|then|give me|show me|explain it|make it|why|how about)\b/i,
      /\b(it|that|this|these|those|the example|the previous|again|simpler|more details)\b/i,
    ];

    return followUpPatterns.some((pattern) => pattern.test(q));
  }
}
