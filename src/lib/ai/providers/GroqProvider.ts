/**
 * Remote Free AI Provider: Groq
 * High-speed inference using free-tier models with streaming, tool calling,
 * active timeouts, and zero-leak thinking filter.
 */

import { AIProvider, LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMToolCall, LLMStreamChunk } from './types';
import { StreamingThinkFilter } from './StreamingThinkFilter';

const CANDIDATE_GROQ_MODELS = [
  process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
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
      const timeoutId = setTimeout(() => controller.abort(), 3000);
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

  private cachedModels: string[] | null = null;
  private lastModelFetchTime = 0;

  async getAvailableModels(): Promise<string[]> {
    if (!this.isConfigured()) return CANDIDATE_GROQ_MODELS;
    
    // Return cached models if retrieved in the last 10 minutes
    if (this.cachedModels && Date.now() - this.lastModelFetchTime < 10 * 60 * 1000) {
      return this.cachedModels;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${this.getCleanKey()}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) return this.cachedModels || CANDIDATE_GROQ_MODELS;
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const available = data.data.map((m: any) => m.id as string);
        const activeChatModels = available.filter(
          (id: string) =>
            !id.includes('whisper') &&
            !id.includes('guard') &&
            !id.includes('vision') &&
            !id.includes('audio') &&
            !id.includes('embedding') &&
            !id.includes('tts') &&
            !id.includes('moderation')
        );
        if (activeChatModels.length > 0) {
          this.cachedModels = activeChatModels;
          this.lastModelFetchTime = Date.now();
          return activeChatModels;
        }
      }
      return CANDIDATE_GROQ_MODELS;
    } catch {
      return this.cachedModels || CANDIDATE_GROQ_MODELS;
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

    const available = await this.getAvailableModels();
    const requestedModel = options?.model || process.env.GROQ_MODEL;
    const modelChain = requestedModel
      ? [requestedModel, ...available.filter((m) => m !== requestedModel)]
      : available;


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
      const timeoutId = setTimeout(() => controller.abort(), 20000);

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
          lastError = new Error(`Groq model ${model} returned ${res.status}: ${errText.slice(0, 200)}`);
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

        const cleanedText = StreamingThinkFilter.cleanStaticText(message.content || '');

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
    const available = await this.getAvailableModels();
    const requestedModel = options?.model || process.env.GROQ_MODEL;
    const modelChain = requestedModel
      ? [requestedModel, ...available.filter((m) => m !== requestedModel)]
      : available;


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
      let activityTimeoutId = setTimeout(() => controller.abort(), 20000);

      // Connect combined abort signal if provided
      const abortHandler = () => controller.abort();
      if (options?.signal) {
        options.signal.addEventListener('abort', abortHandler, { once: true });
      }

      try {
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
          signal: controller.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          lastError = new Error(`Groq model ${model} streaming error ${res.status}: ${errText.slice(0, 200)}`);
          clearTimeout(activityTimeoutId);
          continue;
        }

        if (!res.body) {
          lastError = new Error('Groq response body is empty.');
          clearTimeout(activityTimeoutId);
          continue;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        const thinkFilter = new StreamingThinkFilter();
        let fullAccumulatedText = '';
        let toolCallsMap: Record<number, { id: string; name: string; arguments: string }> = {};
        let buffer = '';

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) return;
          if (trimmed === 'data: [DONE]') return;
          if (!trimmed.startsWith('data:')) return;

          const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5).trim();
          if (!jsonStr) return;

          let data: any;
          try {
            data = JSON.parse(jsonStr);
          } catch {
            return;
          }

          const delta = data.choices?.[0]?.delta;
          if (!delta) return;

          // Reset idle activity timeout on each received valid chunk
          clearTimeout(activityTimeoutId);
          activityTimeoutId = setTimeout(() => controller.abort(), 15000);

          if (typeof delta.content === 'string' && delta.content.length > 0) {
            const visibleChunk = thinkFilter.process(delta.content);
            if (visibleChunk) {
              fullAccumulatedText += visibleChunk;
              onChunk?.({ text: visibleChunk, modelUsed: model, provider: this.name });
            }
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
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            processLine(line);
          }
        }

        if (buffer.trim()) {
          processLine(buffer);
        }

        // Flush any remaining buffered tokens
        const finalChunk = thinkFilter.flush();
        if (finalChunk) {
          fullAccumulatedText += finalChunk;
          onChunk?.({ text: finalChunk, modelUsed: model, provider: this.name });
        }

        clearTimeout(activityTimeoutId);

        const toolCalls: LLMToolCall[] | undefined = Object.keys(toolCallsMap).length > 0
          ? Object.values(toolCallsMap).map((tc) => ({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: tc.arguments },
            }))
          : undefined;

        onChunk?.({ done: true, modelUsed: model, provider: this.name });

        return {
          text: fullAccumulatedText,
          toolCalls,
          modelUsed: model,
          provider: this.name,
          durationMs: Date.now() - startTime,
        };
      } catch (err: any) {
        clearTimeout(activityTimeoutId);
        if (options?.signal?.aborted) throw err;
        lastError = err;
      } finally {
        if (options?.signal) {
          options.signal.removeEventListener('abort', abortHandler);
        }
      }
    }

    throw lastError || new Error('All candidate Groq models failed to stream.');
  }
}

export const groqProvider = new GroqProvider();

