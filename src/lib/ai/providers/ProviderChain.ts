import { AIChatMessage, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from './types';
import { OpenRouterProvider } from './OpenRouterProvider';
import { GroqProvider } from './GroqProvider';
import { FallbackProvider } from './FallbackProvider';

export class ProviderChain {
  private openRouter: OpenRouterProvider;
  private groq: GroqProvider;
  private fallback: FallbackProvider;

  constructor() {
    this.openRouter = new OpenRouterProvider();
    this.groq = new GroqProvider();
    this.fallback = new FallbackProvider();
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
      providerName: 'Local Campus Intelligence',
      status: 'offline',
      model: 'deterministic-offline-engine',
      isFree: true,
      message: 'Operating in Local Deterministic Mode (Zero external API dependencies)',
      latencyMs: 1,
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
          '[ProviderChain] OpenRouter failed, falling back to Groq / Local:',
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
          '[ProviderChain] Groq failed, falling back to Local Intelligence:',
          err.message
        );
      }
    }

    // 3. Deterministic Local Intelligence Fallback (Guaranteed to succeed)
    return await this.fallback.generateResponse(messages, tools, context, systemPrompt);
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

    return await this.fallback.generateStructured<T>(prompt, systemPrompt, schemaHint);
  }
}

// Global Singleton Instance
export const providerChain = new ProviderChain();
