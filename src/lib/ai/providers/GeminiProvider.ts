/**
 * Remote Free AI Provider: Google Gemini
 * High-speed inference using Google AI Gemini 1.5 Flash / 2.0 Flash REST API with streaming support.
 */

import {
  AIProvider,
  LLMMessage,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMStreamChunk,
} from './types';
import { StreamingThinkFilter } from './StreamingThinkFilter';

const CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
];

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini (Free Tier)';
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    this.defaultModel = defaultModel || CANDIDATE_GEMINI_MODELS[0];
  }

  private getCleanKey(): string {
    return (
      this.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ''
    ).trim();
  }

  isConfigured(): boolean {
    const key = this.getCleanKey();
    return Boolean(key) && !key.includes('your-gemini-key') && key.length > 10;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.getCleanKey()}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return CANDIDATE_GEMINI_MODELS;
  }

  private formatContents(messages: LLMMessage[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini provider is not configured. GEMINI_API_KEY is missing.');
    }

    const key = this.getCleanKey();
    const requestedModel = options?.model || process.env.GEMINI_MODEL;
    const modelChain = requestedModel
      ? [requestedModel, ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== requestedModel)]
      : CANDIDATE_GEMINI_MODELS;

    const contents = this.formatContents(messages);
    const systemInstruction = messages.find((m) => m.role === 'system')?.content;

    const payload: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 3000,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const startTime = Date.now();
    let lastError: any = null;

    for (const model of modelChain) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: options?.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          lastError = new Error(
            err.error?.message || `Google Gemini (${model}) returned status HTTP ${res.status}`
          );
          continue;
        }

        const data = await res.json();
        const rawText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          '';

        const cleanedText = StreamingThinkFilter.cleanStaticText(rawText);

        return {
          text: cleanedText,
          modelUsed: model,
          provider: this.name,
          durationMs: Date.now() - startTime,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate Gemini models failed to execute.');
  }

  async chatCompletionStream(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini provider is not configured. GEMINI_API_KEY is missing.');
    }

    const startTime = Date.now();
    const key = this.getCleanKey();
    const requestedModel = options?.model || process.env.GEMINI_MODEL;
    const modelChain = requestedModel
      ? [requestedModel, ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== requestedModel)]
      : CANDIDATE_GEMINI_MODELS;

    const contents = this.formatContents(messages);
    const systemInstruction = messages.find((m) => m.role === 'system')?.content;

    const payload: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 3000,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    let lastError: any = null;

    for (const model of modelChain) {
      const controller = new AbortController();
      let activityTimeoutId = setTimeout(() => controller.abort(), 20000);

      const abortHandler = () => controller.abort();
      if (options?.signal) {
        options.signal.addEventListener('abort', abortHandler, { once: true });
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          lastError = new Error(
            err.error?.message || `Google Gemini stream (${model}) returned status HTTP ${res.status}`
          );
          clearTimeout(activityTimeoutId);
          continue;
        }

        if (!res.body) {
          lastError = new Error('Gemini response body is empty.');
          clearTimeout(activityTimeoutId);
          continue;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        const thinkFilter = new StreamingThinkFilter();
        let fullAccumulatedText = '';
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

          const chunkText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (chunkText) {
            clearTimeout(activityTimeoutId);
            activityTimeoutId = setTimeout(() => controller.abort(), 15000);

            const visible = thinkFilter.process(chunkText);
            if (visible) {
              fullAccumulatedText += visible;
              onChunk?.({ text: visible, modelUsed: model, provider: this.name });
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

        const flushed = thinkFilter.flush();
        if (flushed) {
          fullAccumulatedText += flushed;
          onChunk?.({ text: flushed, modelUsed: model, provider: this.name });
        }

        clearTimeout(activityTimeoutId);
        onChunk?.({ done: true, modelUsed: model, provider: this.name });

        return {
          text: fullAccumulatedText,
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

    throw lastError || new Error('All candidate Gemini models failed to stream.');
  }
}

export const geminiProvider = new GeminiProvider();

