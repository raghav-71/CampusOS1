import { AIChatMessage } from '../aiTypes';

export interface ConversationSession {
  sessionId: string;
  userId: string;
  messages: AIChatMessage[];
  lastUpdated: number;
}

const sessionStore = new Map<string, ConversationSession>();

export class AIMemoryManager {
  /**
   * Retrieves bounded conversation history for a given session.
   */
  static getSessionHistory(sessionId: string): AIChatMessage[] {
    const session = sessionStore.get(sessionId);
    return session ? session.messages : [];
  }

  /**
   * Appends messages to the session memory, maintaining a max window of 16 messages.
   */
  static appendMessages(sessionId: string, userId: string, newMessages: AIChatMessage[]): void {
    const existing = sessionStore.get(sessionId) || {
      sessionId,
      userId,
      messages: [],
      lastUpdated: Date.now(),
    };

    existing.messages.push(...newMessages);

    // Keep bounded context (max 16 messages) to prevent token overflows on free router
    if (existing.messages.length > 16) {
      existing.messages = existing.messages.slice(existing.messages.length - 16);
    }

    existing.lastUpdated = Date.now();
    sessionStore.set(sessionId, existing);
  }

  /**
   * Clears a session's conversational memory.
   */
  static clearSession(sessionId: string): void {
    sessionStore.delete(sessionId);
  }
}
