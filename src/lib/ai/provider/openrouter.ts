import { AIChatMessage, AIToolCall, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from './types';
import { CostGuard } from './costGuard';

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  private apiKey: string;
  private model: string;
  private lastRequestTime = 0;
  private minIntervalMs = 500; // Throttling: minimum 500ms between calls

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.model = model || process.env.AI_MODEL || 'openrouter/free';
  }

  isConfigured(): boolean {
    return (
      Boolean(this.apiKey) &&
      !this.apiKey.includes('your-openrouter-key') &&
      this.apiKey.trim().length > 10
    );
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((r) => setTimeout(r, this.minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 2,
    timeoutMs = 15000
  ): Promise<Response> {
    let attempt = 0;
    let delay = 1200;

    while (attempt <= maxRetries) {
      await this.throttle();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Handle rate limiting with exponential backoff and jitter
        if (response.status === 429 && attempt < maxRetries) {
          attempt++;
          const jitter = Math.random() * 600;
          await new Promise((r) => setTimeout(r, delay + jitter));
          delay *= 2;
          continue;
        }

        return response;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('OpenRouter request timed out. Provider is currently slow.');
        }
        if (attempt >= maxRetries) throw err;
        attempt++;
        const jitter = Math.random() * 400;
        await new Promise((r) => setTimeout(r, delay + jitter));
        delay *= 2;
      }
    }

    throw new Error('OpenRouter maximum retries exceeded.');
  }

  async generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse> {
    if (!this.isConfigured()) {
      throw new Error('OPENROUTER_API_KEY is not configured in environment variables.');
    }

    const safeModel = CostGuard.ensureFreeOpenRouterModel(this.model);

    // Keep context bounded (last 8-10 messages max)
    const boundedMessages = messages.slice(-10).map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'tool',
          content: m.content,
          tool_call_id: m.tool_call_id,
        };
      }
      if (m.role === 'assistant' && m.toolCalls) {
        return {
          role: 'assistant',
          content: m.content || '',
          tool_calls: m.toolCalls,
        };
      }
      return {
        role: m.role,
        content: m.content,
      };
    });

    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...boundedMessages,
    ];

    const openRouterTools = tools.map((t) => ({
      type: 'function',
      function: t.function,
    }));

    const response = await this.fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:4028',
        'X-Title': 'Campus OS Academic Intelligence',
      },
      body: JSON.stringify({
        model: safeModel,
        messages: openRouterMessages,
        tools: openRouterTools.length > 0 ? openRouterTools : undefined,
        tool_choice: openRouterTools.length > 0 ? 'auto' : undefined,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message;

    let toolCalls: AIToolCall[] | undefined = undefined;
    if (message?.tool_calls && message.tool_calls.length > 0) {
      toolCalls = message.tool_calls.map((tc: any) => ({
        id: tc.id || `tc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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

    return {
      content: message?.content || '',
      toolCalls,
      finishReason: choice?.finish_reason || 'stop',
      provider: 'openrouter',
      modelUsed: safeModel,
      isOfflineFallback: false,
    };
  }

  async generateStructured<T>(
    prompt: string,
    systemPrompt: string,
    schemaHint?: string
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('OPENROUTER_API_KEY is not configured.');
    }

    const safeModel = CostGuard.ensureFreeOpenRouterModel(this.model);

    const response = await this.fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:4028',
        'X-Title': 'Campus OS Structured Generator',
      },
      body: JSON.stringify({
        model: safeModel,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nCRITICAL: Respond ONLY with valid, parseable JSON strictly matching this schema:\n${schemaHint || 'JSON Object'}\nDo NOT wrap in markdown explanation or conversational text. Output pure JSON only.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter Structured API error: ${err}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    try {
      const cleaned = rawContent
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(
        `Failed to parse structured JSON response from OpenRouter: ${rawContent.slice(0, 150)}`
      );
    }
  }

  async checkHealth(): Promise<ProviderStatusInfo> {
    if (!this.isConfigured()) {
      return {
        providerName: 'OpenRouter (Free Router)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: 'No OPENROUTER_API_KEY configured.',
      };
    }

    const start = Date.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const latency = Date.now() - start;
      if (res.ok) {
        return {
          providerName: 'OpenRouter (Free)',
          status: 'online',
          model: this.model,
          isFree: true,
          message: 'Connected to OpenRouter Free Router',
          latencyMs: latency,
        };
      }

      return {
        providerName: 'OpenRouter (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: `API Key verification failed (${res.status})`,
      };
    } catch (err: any) {
      return {
        providerName: 'OpenRouter (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: err.message || 'Network unreachable',
      };
    }
  }
}
