import { AIChatMessage } from './aiTypes';

export interface ConversationSession {
  sessionId: string;
  userId: string;
  messages: AIChatMessage[];
  lastUpdated: number;
}

// In-memory conversation store on server
const sessionStore = new Map<string, ConversationSession>();

export class AIMemoryManager {
  /**
   * Retrieves conversation history for a given session.
   */
  static getSessionHistory(sessionId: string): AIChatMessage[] {
    const session = sessionStore.get(sessionId);
    return session ? session.messages : [];
  }

  /**
   * Appends messages to the session memory.
   */
  static appendMessages(sessionId: string, userId: string, newMessages: AIChatMessage[]): void {
    const existing = sessionStore.get(sessionId) || {
      sessionId,
      userId,
      messages: [],
      lastUpdated: Date.now(),
    };

    existing.messages.push(...newMessages);
    // Keep max 20 messages in memory per session
    if (existing.messages.length > 20) {
      existing.messages = existing.messages.slice(existing.messages.length - 20);
    }
    existing.lastUpdated = Date.now();
    sessionStore.set(sessionId, existing);
  }

  /**
   * Clears a session.
   */
  static clearSession(sessionId: string): void {
    sessionStore.delete(sessionId);
  }
}
