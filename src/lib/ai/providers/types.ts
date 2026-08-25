/**
 * Provider Types for Campus OS AI Engine
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_calls?: LLMToolCall[];
  tool_call_id?: string;
}

export interface LLMToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string | Record<string, any>;
  };
}

export interface LLMToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface LLMCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: LLMToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required';
  signal?: AbortSignal;
}

export interface LLMCompletionResult {
  text: string;
  toolCalls?: LLMToolCall[];
  modelUsed: string;
  provider: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  durationMs: number;
}

export interface LLMStreamChunk {
  text?: string;
  toolCalls?: LLMToolCall[];
  done?: boolean;
  modelUsed?: string;
  provider?: string;
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  getAvailableModels(): Promise<string[]>;
  chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult>;
  chatCompletionStream?(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult>;
}
