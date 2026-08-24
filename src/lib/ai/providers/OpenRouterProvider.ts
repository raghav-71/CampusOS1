import { AIChatMessage, AIToolCall, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from './types';
import { CostGuard } from './costGuard';

export class OpenRouterProvider implements AIProvider {
  name: 'openrouter' = 'openrouter';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    const configuredModel =
      model || process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
    this.model = configuredModel;
  }

  isConfigured(): boolean {
    return (
      Boolean(this.apiKey) &&
      !this.apiKey.includes('your-openrouter-key') &&
      this.apiKey.trim().length > 10
    );
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 2
  ): Promise<Response> {
    let attempt = 0;
    let delay = 1000;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, options);

        if (response.status === 429 && attempt < maxRetries) {
          attempt++;
          // Exponential backoff with jitter
          const jitter = Math.random() * 500;
          await new Promise((r) => setTimeout(r, delay + jitter));
          delay *= 2;
          continue;
        }

        return response;
      } catch (err) {
        if (attempt >= maxRetries) throw err;
        attempt++;
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }

    throw new Error('OpenRouter max retries exceeded');
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

    // Strictly enforce free model usage
    const safeModel = CostGuard.ensureFreeOpenRouterModel(this.model);

    const openRouterMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((m) => {
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
      }),
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
        'X-Title': 'Campus OS Intelligent Academic Core',
      },
      body: JSON.stringify({
        model: safeModel,
        messages: openRouterMessages,
        tools: openRouterTools.length > 0 ? openRouterTools : undefined,
        tool_choice: openRouterTools.length > 0 ? 'auto' : undefined,
        temperature: 0.4,
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
            content: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid, parseable JSON matching this schema:\n${schemaHint || 'JSON Object'}\nDo NOT include markdown backticks or commentary.`,
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
        providerName: 'OpenRouter (Free)',
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
          message: 'Active & Connected',
          latencyMs: latency,
        };
      }

      return {
        providerName: 'OpenRouter (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: `API Key validation failed (${res.status})`,
      };
    } catch (err: any) {
      return {
        providerName: 'OpenRouter (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: err.message || 'Network error',
      };
    }
  }
}
