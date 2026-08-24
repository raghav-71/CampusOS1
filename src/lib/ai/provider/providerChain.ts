import { AIChatMessage, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from './types';
import { OpenRouterProvider } from './openrouter';
import { GroqProvider } from './groq';

export class ProviderChain {
  private openRouter: OpenRouterProvider;
  private groq: GroqProvider;

  constructor() {
    this.openRouter = new OpenRouterProvider();
    this.groq = new GroqProvider();
  }

  isAnyProviderConfigured(): boolean {
    return this.openRouter.isConfigured() || this.groq.isConfigured();
  }

  async getHealthStatus(): Promise<ProviderStatusInfo> {
    if (this.openRouter.isConfigured()) {
      const openRouterHealth = await this.openRouter.checkHealth();
      if (openRouterHealth.status === 'online') {
        return openRouterHealth;
      }
    }

    if (this.groq.isConfigured()) {
      const groqHealth = await this.groq.checkHealth();
      if (groqHealth.status === 'online') {
        return groqHealth;
      }
    }

    return {
      providerName: 'Campus Intelligence (Local)',
      status: 'offline',
      model: 'deterministic-campus-engine',
      isFree: true,
      message: 'Operating in Deterministic Campus OS Mode (Zero external API dependencies)',
      latencyMs: 0,
    };
  }

  async generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse> {
    // 1. Attempt OpenRouter (Primary Free Provider)
    if (this.openRouter.isConfigured()) {
      try {
        return await this.openRouter.generateResponse(messages, tools, context, systemPrompt);
      } catch (err: any) {
        console.warn(
          '[ProviderChain] OpenRouter call failed, trying secondary or deterministic fallback:',
          err.message
        );
      }
    }

    // 2. Attempt Groq (Secondary Free Provider)
    if (this.groq.isConfigured()) {
      try {
        return await this.groq.generateResponse(messages, tools, context, systemPrompt);
      } catch (err: any) {
        console.warn(
          '[ProviderChain] Groq call failed, falling back to deterministic response:',
          err.message
        );
      }
    }

    // 3. If no LLM provider is available, return an honest offline notification
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return {
      content: `### ⚡ Campus OS Intelligence Layer (Offline Mode)\n\nI am currently operating in **Deterministic Campus Mode** because no external AI provider is configured or reachable.\n\nAll campus tools, navigation, timetable lookups, and attendance checks are fully functional using your local Campus OS records.\n\n> To enable deep AI reasoning, question paper generation, and natural language explanations, set \`OPENROUTER_API_KEY\` with \`AI_MODEL=openrouter/free\` in your \`.env\` file.`,
      finishReason: 'stop',
      provider: 'deterministic-local',
      modelUsed: 'deterministic-campus-engine',
      isOfflineFallback: true,
    };
  }

  async generateStructured<T>(
    prompt: string,
    systemPrompt: string,
    schemaHint?: string
  ): Promise<T> {
    if (this.openRouter.isConfigured()) {
      try {
        return await this.openRouter.generateStructured<T>(prompt, systemPrompt, schemaHint);
      } catch (err: any) {
        console.warn('[ProviderChain] OpenRouter structured generation failed:', err.message);
      }
    }

    if (this.groq.isConfigured()) {
      try {
        return await this.groq.generateStructured<T>(prompt, systemPrompt, schemaHint);
      } catch (err: any) {
        console.warn('[ProviderChain] Groq structured generation failed:', err.message);
      }
    }

    throw new Error(
      'Structured AI generation is unavailable because no AI provider (OpenRouter/Groq) is configured or online.'
    );
  }
}

export const providerChain = new ProviderChain();
