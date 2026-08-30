/**
 * NVIDIA Nemotron provider using NVIDIA's OpenAI-compatible API.
 */

import {
  AIProvider,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMMessage,
  LLMStreamChunk,
  LLMToolCall,
} from './types';
import { StreamingThinkFilter } from './StreamingThinkFilter';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'nvidia/nemotron-3-nano-30b-a3b';

function formatMessages(messages: LLMMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content || '',
    ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
    ...(message.tool_call_id ? { tool_call_id: message.tool_call_id } : {}),
  }));
}

function formatToolCalls(toolCalls: any[] | undefined): LLMToolCall[] | undefined {
  if (!Array.isArray(toolCalls) || toolCalls.length === 0) return undefined;

  return toolCalls.map((toolCall, index) => ({
    id: toolCall.id || `nvidia_call_${Date.now()}_${index}`,
    type: 'function' as const,
    function: {
      name: toolCall.function?.name || '',
      arguments:
        typeof toolCall.function?.arguments === 'string'
          ? toolCall.function.arguments
          : JSON.stringify(toolCall.function?.arguments || {}),
    },
  }));
}

export class NvidiaNemotronProvider implements AIProvider {
  name = 'NVIDIA Nemotron';

  private getApiKey(): string {
    return (process.env.NVIDIA_API_KEY || '').trim();
  }

  private getModel(options?: LLMCompletionOptions): string {
    const envModel = (process.env.NVIDIA_MODEL || '').trim();
    if (envModel.includes('nemotron-3.5-lightning-30b-a3b')) {
      return NVIDIA_MODEL;
    }
    return options?.model || envModel || NVIDIA_MODEL;
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key) && !key.includes('your-nvidia-key') && key.length > 10;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(`${NVIDIA_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${this.getApiKey()}` },
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return [
      'nvidia/nemotron-3-nano-30b-a3b',
      'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      'nvidia/nemotron-4-340b-instruct',
    ];
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('NVIDIA Nemotron is not configured. NVIDIA_API_KEY is missing.');
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const model = this.getModel(options);
    const enableThinking = options?.enableThinking ?? false;

    const payload: Record<string, unknown> = {
      model,
      messages: formatMessages(messages),
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2048,
      chat_template_kwargs: { enable_thinking: enableThinking },
      stream: false,
    };

    if (options?.tools?.length) {
      payload.tools = options.tools;
      payload.tool_choice = options.toolChoice || 'auto';
    }

    try {
      const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify(payload),
        signal: options?.signal || controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`NVIDIA Nemotron returned HTTP ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message || {};
      const cleaned = StreamingThinkFilter.cleanStaticText(message.content || '');

      return {
        text: cleaned,
        toolCalls: formatToolCalls(message.tool_calls),
        modelUsed: data.model || model,
        provider: this.name,
        tokensUsed: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0,
        },
        durationMs: Date.now() - startTime,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async chatCompletionStream(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('NVIDIA Nemotron is not configured. NVIDIA_API_KEY is missing.');
    }

    const startTime = Date.now();
    const controller = new AbortController();
    let activityTimeoutId = setTimeout(() => controller.abort(), 25000);
    const model = this.getModel(options);
    const enableThinking = options?.enableThinking ?? false;

    const payload: Record<string, unknown> = {
      model,
      messages: formatMessages(messages),
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2048,
      chat_template_kwargs: { enable_thinking: enableThinking },
      stream: true,
    };

    if (options?.tools?.length) {
      payload.tools = options.tools;
      payload.tool_choice = options.toolChoice || 'auto';
    }

    const abortHandler = () => controller.abort();
    if (options?.signal) {
      options.signal.addEventListener('abort', abortHandler, { once: true });
    }

    try {
      const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`NVIDIA Nemotron returned HTTP ${response.status}: ${errBody.slice(0, 200)}`);
      }
      if (!response.body) {
        throw new Error('NVIDIA Nemotron returned an empty response body.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const thinkFilter = new StreamingThinkFilter();
      let buffer = '';
      let fullText = '';
      const toolCallParts: Record<number, LLMToolCall> = {};
      let usage: any;

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

        if (data.usage) {
          usage = data.usage;
        }

        const choice = data.choices?.[0];
        const delta = choice?.delta;
        if (!delta) return;

        // Reset activity timeout on each chunk
        clearTimeout(activityTimeoutId);
        activityTimeoutId = setTimeout(() => controller.abort(), 15000);

        // Process visible content safely with thinkFilter
        if (typeof delta.content === 'string' && delta.content.length > 0) {
          const visible = thinkFilter.process(delta.content);
          if (visible) {
            fullText += visible;
            onChunk?.({
              text: visible,
              modelUsed: data.model || model,
              provider: this.name,
            });
          }
        }

        // Process streamed tool calls
        if (Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const index = tc.index ?? 0;
            if (!toolCallParts[index]) {
              toolCallParts[index] = {
                id: tc.id || `nvidia_call_${Date.now()}_${index}`,
                type: 'function',
                function: { name: '', arguments: '' },
              };
            }
            if (tc.function?.name) {
              toolCallParts[index].function.name += tc.function.name;
            }
            if (tc.function?.arguments) {
              toolCallParts[index].function.arguments += tc.function.arguments;
            }
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
        fullText += flushed;
        onChunk?.({
          text: flushed,
          modelUsed: model,
          provider: this.name,
        });
      }

      clearTimeout(activityTimeoutId);

      const toolCalls = Object.values(toolCallParts);
      onChunk?.({ done: true, modelUsed: model, provider: this.name });

      return {
        text: fullText,
        toolCalls: toolCalls.length ? toolCalls : undefined,
        modelUsed: model,
        provider: this.name,
        tokensUsed: {
          prompt: usage?.prompt_tokens || 0,
          completion: usage?.completion_tokens || 0,
          total: usage?.total_tokens || 0,
        },
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      clearTimeout(activityTimeoutId);
      throw err;
    } finally {
      if (options?.signal) {
        options.signal.removeEventListener('abort', abortHandler);
      }
    }
  }
}

export const nvidiaNemotronProvider = new NvidiaNemotronProvider();