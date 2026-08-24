import {
  AIChatMessage,
  AIToolCall,
  AIToolDefinition,
  AIContextData,
  AIQuizData,
  AIStudyPlan,
  AIActionPayload,
} from '../aiTypes';

export interface AIProviderResponse {
  content: string;
  toolCalls?: AIToolCall[];
  finishReason: string;
  provider: 'openrouter' | 'groq' | 'fallback';
  modelUsed: string;
  quizData?: AIQuizData;
  studyPlan?: AIStudyPlan;
  action?: AIActionPayload;
  isOfflineFallback?: boolean;
}

export type ProviderStatusType = 'online' | 'offline' | 'degraded';

export interface ProviderStatusInfo {
  providerName: string;
  status: ProviderStatusType;
  model: string;
  isFree: boolean;
  message: string;
  latencyMs?: number;
}

export interface AIProvider {
  name: 'openrouter' | 'groq' | 'fallback';
  isConfigured(): boolean;
  generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse>;
  generateStructured<T>(prompt: string, systemPrompt: string, schemaHint?: string): Promise<T>;
  checkHealth(): Promise<ProviderStatusInfo>;
}
