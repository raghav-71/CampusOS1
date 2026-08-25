/**
 * Local AI Provider (Ollama Integration)
 * Provides local-first, free model execution and native function-calling via Ollama.
 */

import { AIProvider, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall } from './types';
import { aiConfigStore } from '../config';

export class LocalAIProvider implements AIProvider {
  name = 'Local Ollama';

  private get baseUrl(): string {
    return aiConfigStore.getBaseUrl().replace(/\/+$/, '');
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      return res.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data.models)) {
        return data.models.map((m: any) => m.name || m.model);
      }
      return [];
    } catch {
      return [];
    }
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const startTime = Date.now();
    const config = aiConfigStore.getConfig();
    const model = options?.model || config.model || 'qwen2.5:7b';

    // Format tools for Ollama API
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

    const payload: Record<string, any> = {
      model,
      messages: messages.map((m) => {
        const msgObj: Record<string, any> = {
          role: m.role,
          content: m.content || '',
        };
        if (m.tool_calls) {
          msgObj.tool_calls = m.tool_calls;
        }
        if (m.tool_call_id) {
          msgObj.tool_call_id = m.tool_call_id;
        }
        return msgObj;
      }),
      stream: false,
      options: {
        temperature: options?.temperature ?? config.temperature,
        num_predict: options?.maxTokens ?? config.maxTokens,
      },
    };

    if (ollamaTools && ollamaTools.length > 0) {
      payload.tools = ollamaTools;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const message = data.message || {};
      const durationMs = Date.now() - startTime;

      let toolCalls: LLMToolCall[] | undefined = undefined;
      if (Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
        toolCalls = message.tool_calls.map((tc: any, index: number) => ({
          id: tc.id || `call_${Date.now()}_${index}`,
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

      // Clean think tags if present
      let cleanedText = message.content || '';
      if (cleanedText.includes('</think>')) {
        cleanedText = cleanedText.split('</think>')[1]?.trim() || cleanedText;
      }

      return {
        text: cleanedText,
        toolCalls,
        modelUsed: data.model || model,
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
      throw new Error(`Local Ollama execution failed: ${err.message}`);
    }
  }
}

export const localAIProvider = new LocalAIProvider();
