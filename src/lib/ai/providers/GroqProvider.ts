/**
 * Remote Free AI Provider: Groq
 * High-speed inference using free-tier models with streaming and tool calling.
 */

import { AIProvider, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall, LLMStreamChunk } from './types';

const CANDIDATE_GROQ_MODELS = [
  process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

export class GroqProvider implements AIProvider {
  name = 'Groq Cloud (Free Tier)';
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    this.defaultModel = defaultModel || CANDIDATE_GROQ_MODELS[0];
  }

  private getCleanKey(): string {
    return (this.apiKey || process.env.GROQ_API_KEY || '').trim();
  }

  isConfigured(): boolean {
    const key = this.getCleanKey();
    return Boolean(key) && !key.includes('your-groq-key') && key.length > 10;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://api.groq.com/openai/v1/models', {
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
    if (!this.isConfigured()) return CANDIDATE_GROQ_MODELS;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${this.getCleanKey()}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return CANDIDATE_GROQ_MODELS;
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const available = data.data.map((m: any) => m.id);
        const filtered = CANDIDATE_GROQ_MODELS.filter((m) => available.includes(m));
        return filtered.length > 0 ? filtered : CANDIDATE_GROQ_MODELS;
      }
      return CANDIDATE_GROQ_MODELS;
    } catch {
      return CANDIDATE_GROQ_MODELS;
    }
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('Groq provider is not configured. GROQ_API_KEY is missing.');
    }

    const startTime = Date.now();
    const key = this.getCleanKey();

    const requestedModel = options?.model || process.env.GROQ_MODEL;
    const modelChain = requestedModel
      ? [requestedModel, ...CANDIDATE_GROQ_MODELS.filter((m) => m !== requestedModel)]
      : CANDIDATE_GROQ_MODELS;

    const groqTools = options?.tools && options.tools.length > 0
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

    let lastError: any = null;

    for (const model of modelChain) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      try {
        const bodyPayload: Record<string, any> = {
          model,
          messages: formattedMessages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 2048,
        };

        if (groqTools && groqTools.length > 0) {
          bodyPayload.tools = groqTools;
          bodyPayload.tool_choice = options?.toolChoice || 'auto';
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify(bodyPayload),
          signal: options?.signal || controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          lastError = new Error(`Groq model ${model} returned ${res.status}: ${errText}`);
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
          modelUsed: data.model || model,
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

    throw lastError || new Error('All candidate Groq models failed to execute.');
  }

  async chatCompletionStream(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('Groq provider is not configured. GROQ_API_KEY is missing.');
    }

    const startTime = Date.now();
    const key = this.getCleanKey();
    const model = options?.model || process.env.GROQ_MODEL || CANDIDATE_GROQ_MODELS[0];

    const groqTools = options?.tools && options.tools.length > 0
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
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2048,
      stream: true,
    };

    if (groqTools && groqTools.length > 0) {
      bodyPayload.tools = groqTools;
      bodyPayload.tool_choice = options?.toolChoice || 'auto';
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: options?.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq streaming returned ${res.status}: ${errText}`);
    }

    if (!res.body) {
      throw new Error('Groq response body is empty.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let toolCallsMap: Record<number, { id: string; name: string; arguments: string }> = {};

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.content) {
              accumulatedText += delta.content;
              onChunk?.({ text: delta.content, modelUsed: model, provider: this.name });
            }

            if (Array.isArray(delta.tool_calls)) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                if (!toolCallsMap[idx]) {
                  toolCallsMap[idx] = { id: tc.id || `call_${Date.now()}_${idx}`, name: '', arguments: '' };
                }
                if (tc.function?.name) toolCallsMap[idx].name += tc.function.name;
                if (tc.function?.arguments) toolCallsMap[idx].arguments += tc.function.arguments;
              }
            }
          } catch {
            // Ignore parse errors on partial lines
          }
        }
      }
    }

    const toolCalls: LLMToolCall[] | undefined = Object.keys(toolCallsMap).length > 0
      ? Object.values(toolCallsMap).map((tc) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments },
        }))
      : undefined;

    return {
      text: accumulatedText,
      toolCalls,
      modelUsed: model,
      provider: this.name,
      durationMs: Date.now() - startTime,
    };
  }
}

export const groqProvider = new GroqProvider();
