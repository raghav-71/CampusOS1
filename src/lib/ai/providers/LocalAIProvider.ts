/**
 * Local AI Provider: Ollama Integration
 * Supports local Ollama (/api/chat) with tool calling and streaming.
 */

import { AIProvider, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall, LLMStreamChunk } from './types';
import { HardwareDetector } from './HardwareDetector';

export class LocalAIProvider implements AIProvider {
  name = 'Local Ollama Engine';
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl?: string, defaultModel?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    this.defaultModel = defaultModel || process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  }

  getBaseUrl(): string {
    return (process.env.OLLAMA_BASE_URL || this.baseUrl || 'http://127.0.0.1:11434').replace(/\/$/, '');
  }

  async isAvailable(): Promise<boolean> {
    // If in cloud environment without explicit remote URL, skip local Ollama immediately
    if (this.isCloudServerless()) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.getBaseUrl()}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  private isCloudServerless(): boolean {
    const isVercel = Boolean(process.env.VERCEL);
    const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
    const isNetlify = Boolean(process.env.NETLIFY);
    const isDefaultLocalhost = this.getBaseUrl().includes('127.0.0.1') || this.getBaseUrl().includes('localhost');
    return (isVercel || isLambda || isNetlify) && isDefaultLocalhost;
  }

  async getAvailableModels(): Promise<string[]> {
    if (this.isCloudServerless()) return [];
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/tags`);
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data.models)) {
        return data.models.map((m: any) => m.name);
      }
      return [];
    } catch {
      return [];
    }
  }

  async getPreferredModel(): Promise<string> {
    if (process.env.OLLAMA_MODEL) return process.env.OLLAMA_MODEL;
    const installed = await this.getAvailableModels();
    if (installed.length === 0) {
      return HardwareDetector.getHardwareInfo().recommendedLocalModel;
    }

    const priorityList = [
      'qwen2.5:7b',
      'llama3.1:8b',
      'deepseek-r1:8b',
      'mistral:7b',
      'gemma2:9b',
      'qwen2.5:14b',
      'qwen2.5:3b',
      'llama3.2:3b',
    ];

    for (const p of priorityList) {
      const match = installed.find((m) => m.startsWith(p));
      if (match) return match;
    }

    return installed[0];
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const startTime = Date.now();
    const model = options?.model || (await this.getPreferredModel());

    const ollamaTools = options?.tools && options.tools.length > 0
      ? options.tools.map((t) => ({
          type: 'function',
          function: {
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          },
        }))
      : undefined;

    const formattedMessages = messages.map((m) => {
      const msg: Record<string, any> = {
        role: m.role,
        content: m.content || '',
      };
      if (m.tool_calls) msg.tool_calls = m.tool_calls;
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      return msg;
    });

    const bodyPayload: Record<string, any> = {
      model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 2048,
      },
    };

    if (ollamaTools && ollamaTools.length > 0) {
      bodyPayload.tools = ollamaTools;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: options?.signal || controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama returned status ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      let toolCalls: LLMToolCall[] | undefined = undefined;
      if (Array.isArray(data.message?.tool_calls) && data.message.tool_calls.length > 0) {
        toolCalls = data.message.tool_calls.map((tc: any, idx: number) => ({
          id: `ollama_call_${Date.now()}_${idx}`,
          type: 'function',
          function: {
            name: tc.function?.name || '',
            arguments:
              typeof tc.function?.arguments === 'string'
                ? tc.function.arguments
                : JSON.stringify(tc.function?.arguments || {}),
          },
        }));
      }

      let cleanedText = data.message?.content || '';
      if (cleanedText.includes('</think>')) {
        cleanedText = cleanedText.split('</think>')[1]?.trim() || cleanedText;
      }

      return {
        text: cleanedText,
        toolCalls,
        modelUsed: model,
        provider: this.name,
        tokensUsed: {
          prompt: data.prompt_eval_count || 0,
          completion: data.eval_count || 0,
          total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        durationMs,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async chatCompletionStream(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    const startTime = Date.now();
    const model = options?.model || (await this.getPreferredModel());

    const ollamaTools = options?.tools && options.tools.length > 0
      ? options.tools.map((t) => ({
          type: 'function',
          function: {
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          },
        }))
      : undefined;

    const formattedMessages = messages.map((m) => {
      const msg: Record<string, any> = {
        role: m.role,
        content: m.content || '',
      };
      if (m.tool_calls) msg.tool_calls = m.tool_calls;
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      return msg;
    });

    const bodyPayload: Record<string, any> = {
      model,
      messages: formattedMessages,
      stream: true,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 2048,
      },
    };

    if (ollamaTools && ollamaTools.length > 0) {
      bodyPayload.tools = ollamaTools;
    }

    const res = await fetch(`${this.getBaseUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: options?.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama streaming returned status ${res.status}: ${errText}`);
    }

    if (!res.body) {
      throw new Error('Ollama response body is empty.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let toolCalls: LLMToolCall[] | undefined = undefined;

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const data = JSON.parse(trimmed);
          const chunkContent = data.message?.content || '';
          if (chunkContent) {
            accumulatedText += chunkContent;
            onChunk?.({ text: chunkContent, modelUsed: model, provider: this.name });
          }

          if (Array.isArray(data.message?.tool_calls) && data.message.tool_calls.length > 0) {
            toolCalls = data.message.tool_calls.map((tc: any, idx: number) => ({
              id: `ollama_call_${Date.now()}_${idx}`,
              type: 'function',
              function: {
                name: tc.function?.name || '',
                arguments:
                  typeof tc.function?.arguments === 'string'
                    ? tc.function.arguments
                    : JSON.stringify(tc.function?.arguments || {}),
              },
            }));
          }
        } catch {
          // Ignore incomplete JSON chunks
        }
      }
    }

    return {
      text: accumulatedText,
      toolCalls,
      modelUsed: model,
      provider: this.name,
      durationMs: Date.now() - startTime,
    };
  }
}

export const localAIProvider = new LocalAIProvider();
