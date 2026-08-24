import { AIChatMessage, AIToolCall, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from './types';
import { CostGuard } from './costGuard';

export class GroqProvider implements AIProvider {
  name = 'groq';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    this.model = model || 'llama-3.3-70b-versatile';
  }

  isConfigured(): boolean {
    return (
      Boolean(this.apiKey) &&
      !this.apiKey.includes('your-groq-key') &&
      this.apiKey.trim().length > 10
    );
  }

  async generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse> {
    if (!this.isConfigured()) {
      throw new Error('GROQ_API_KEY is not configured in environment variables.');
    }

    const safeModel = CostGuard.ensureFreeGroqModel(this.model);

    const groqMessages = [
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

    const groqTools = tools.map((t) => ({
      type: 'function',
      function: t.function,
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: safeModel,
        messages: groqMessages,
        tools: groqTools.length > 0 ? groqTools : undefined,
        tool_choice: groqTools.length > 0 ? 'auto' : undefined,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error (${response.status}): ${err}`);
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
      provider: 'groq',
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
      throw new Error('GROQ_API_KEY is not configured.');
    }

    const safeModel = CostGuard.ensureFreeGroqModel(this.model);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: safeModel,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nRespond ONLY with valid, parseable JSON strictly matching this schema:\n${schemaHint || 'JSON Object'}`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq Structured API error: ${err}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    try {
      return JSON.parse(rawContent) as T;
    } catch {
      throw new Error(`Failed to parse structured JSON from Groq: ${rawContent.slice(0, 150)}`);
    }
  }

  async checkHealth(): Promise<ProviderStatusInfo> {
    if (!this.isConfigured()) {
      return {
        providerName: 'Groq (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: 'No GROQ_API_KEY configured.',
      };
    }

    const start = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      const latency = Date.now() - start;
      if (res.ok) {
        return {
          providerName: 'Groq (Free)',
          status: 'online',
          model: this.model,
          isFree: true,
          message: 'Active & Connected',
          latencyMs: latency,
        };
      }
      return {
        providerName: 'Groq (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: `Groq verification failed (${res.status})`,
      };
    } catch (err: any) {
      return {
        providerName: 'Groq (Free)',
        status: 'offline',
        model: this.model,
        isFree: true,
        message: err.message || 'Groq unreachable',
      };
    }
  }
}
