import { AIChatMessage, AIToolDefinition, AIContextData, AIActionPayload, AIQuizData, AIStudyPlan, AIQuestionPaper } from '../aiTypes';

export interface ProviderStatusInfo {
  providerName: string;
  status: 'online' | 'offline' | 'degraded';
  model: string;
  isFree: boolean;
  message: string;
  latencyMs?: number;
}

export interface AIProviderResponse {
  content: string;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  action?: AIActionPayload;
  quizData?: AIQuizData;
  studyPlan?: AIStudyPlan;
  questionPaper?: AIQuestionPaper;
  finishReason?: string;
  provider: string;
  modelUsed: string;
  isOfflineFallback?: boolean;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse>;
  generateStructured<T>(
    prompt: string,
    systemPrompt: string,
    schemaHint?: string
  ): Promise<T>;
  checkHealth(): Promise<ProviderStatusInfo>;
}
