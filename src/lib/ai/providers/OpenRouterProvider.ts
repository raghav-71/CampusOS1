/**
 * Remote Free AI Provider: OpenRouter
 * Accesses high quality free-tier models on OpenRouter with tool calling support.
 */

import { AIProvider, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall } from './types';

const CANDIDATE_OPENROUTER_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'liquid/lfm-2.5-2.6b:free',
  'openrouter/free',
];

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter (Free Tier)';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  private getCleanKey(): string {
    return (this.apiKey || process.env.OPENROUTER_API_KEY || '').trim();
  }

  isConfigured(): boolean {
    const key = this.getCleanKey();
    return Boolean(key) && !key.includes('your-openrouter-key') && key.length > 10;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${this.getCleanKey()}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    if (!this.isConfigured()) return [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${this.getCleanKey()}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return CANDIDATE_OPENROUTER_MODELS;
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const free = data.data
          .filter((m: any) => m.id?.includes(':free') || m.pricing?.prompt === 0 || m.pricing?.prompt === '0')
          .map((m: any) => m.id);
        return free.length > 0 ? free : CANDIDATE_OPENROUTER_MODELS;
      }
      return CANDIDATE_OPENROUTER_MODELS;
    } catch {
      return CANDIDATE_OPENROUTER_MODELS;
    }
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter provider is not configured. OPENROUTER_API_KEY is missing.');
    }

    const startTime = Date.now();
    const key = this.getCleanKey();
    const model = options?.model || (process.env.AI_MODEL && !process.env.AI_MODEL.includes('qwen') ? process.env.AI_MODEL : 'google/gemma-4-31b-it:free');

    const tools = options?.tools && options.tools.length > 0
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

    const candidateModels = [model, ...CANDIDATE_OPENROUTER_MODELS.filter((m) => m !== model)];
    let lastError: any = null;

    for (const currentModel of candidateModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const payload: Record<string, any> = {
          model: currentModel,
          messages: formattedMessages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 2048,
        };

        if (tools && tools.length > 0) {
          payload.tools = tools;
          payload.tool_choice = options?.toolChoice || 'auto';
        }

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'HTTP-Referer': 'https://campusos.edu',
            'X-Title': 'Campus OS AI Assistant',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          lastError = new Error(`OpenRouter (${currentModel}) returned ${res.status}: ${errText}`);
          continue;
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        const message = choice?.message || {};
        const durationMs = Date.now() - startTime;

        let toolCalls: LLMToolCall[] | undefined = undefined;
        if (Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
          toolCalls = message.tool_calls.map((tc: any, idx: number) => ({
            id: tc.id || `call_${Date.now()}_${idx}`,
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

        let cleanedText = message.content || '';
        if (cleanedText.includes('</think>')) {
          cleanedText = cleanedText.split('</think>')[1]?.trim() || cleanedText;
        }

        return {
          text: cleanedText,
          toolCalls,
          modelUsed: data.model || currentModel,
          provider: this.name,
          tokensUsed: {
            prompt: data.usage?.prompt_tokens || 0,
            completion: data.usage?.completion_tokens || 0,
            total: data.usage?.total_tokens || 0,
          },
          durationMs,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate OpenRouter models failed.');
  }
}

export const openRouterProvider = new OpenRouterProvider();
