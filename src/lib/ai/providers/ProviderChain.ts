/**
 * Campus OS AI Provider Chain
 * Coordinates Local Ollama, Groq Cloud, OpenRouter, and Streaming.
 */

import { localAIProvider } from './LocalAIProvider';
import { groqProvider } from './GroqProvider';
import { openRouterProvider } from './OpenRouterProvider';
import { LLMMessage, LLMCompletionResult, LLMCompletionOptions, AIProvider, LLMStreamChunk } from './types';
import { HardwareDetector, SystemHardwareInfo } from './HardwareDetector';

export class ProviderChain {
  /**
   * Identifies if running in cloud serverless (e.g. Vercel, AWS Lambda, Netlify).
   */
  static isCloudServerless(): boolean {
    return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
  }

  /**
   * Discovers and returns the highest-priority active provider.
   */
  static async getActiveProvider(): Promise<{ provider: AIProvider | null; name: string; isLocal: boolean }> {
    const forcedProvider = process.env.AI_PROVIDER?.toLowerCase().trim();

    if (forcedProvider === 'ollama') {
      if (await localAIProvider.isAvailable()) {
        return { provider: localAIProvider, name: localAIProvider.name, isLocal: true };
      }
    }

    if (forcedProvider === 'groq') {
      if (groqProvider.isConfigured() && (await groqProvider.isAvailable())) {
        return { provider: groqProvider, name: groqProvider.name, isLocal: false };
      }
    }

    if (forcedProvider === 'openrouter') {
      if (openRouterProvider.isConfigured() && (await openRouterProvider.isAvailable())) {
        return { provider: openRouterProvider, name: openRouterProvider.name, isLocal: false };
      }
    }

    // Default "auto" priority
    // 1. In local development only, check Ollama first
    if (!this.isCloudServerless()) {
      const isOllamaRunning = await localAIProvider.isAvailable();
      if (isOllamaRunning) {
        return { provider: localAIProvider, name: localAIProvider.name, isLocal: true };
      }
    }

    // 2. Check Groq Free Tier
    if (groqProvider.isConfigured()) {
      const isGroqReachable = await groqProvider.isAvailable();
      if (isGroqReachable) {
        return { provider: groqProvider, name: groqProvider.name, isLocal: false };
      }
    }

    // 3. Check OpenRouter Free Tier
    if (openRouterProvider.isConfigured()) {
      const isOrReachable = await openRouterProvider.isAvailable();
      if (isOrReachable) {
        return { provider: openRouterProvider, name: openRouterProvider.name, isLocal: false };
      }
    }

    return { provider: null, name: 'No Functional LLM Connected', isLocal: false };
  }

  /**
   * Executes a direct LLM completion with automatic provider fallback.
   */
  static async executeCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const errors: string[] = [];

    // 1. Try Local Ollama if not in cloud
    if (!this.isCloudServerless()) {
      if (await localAIProvider.isAvailable()) {
        try {
          return await localAIProvider.chatCompletion(messages, options);
        } catch (err: any) {
          errors.push(`Ollama: ${err.message}`);
          console.warn('[ProviderChain] Local Ollama failed, falling back to cloud:', err);
        }
      }
    }

    // 2. Try Groq
    if (groqProvider.isConfigured()) {
      try {
        return await groqProvider.chatCompletion(messages, options);
      } catch (err: any) {
        errors.push(`Groq: ${err.message}`);
        console.warn('[ProviderChain] Groq failed, falling back to OpenRouter:', err);
      }
    }

    // 3. Try OpenRouter
    if (openRouterProvider.isConfigured()) {
      try {
        return await openRouterProvider.chatCompletion(messages, options);
      } catch (err: any) {
        errors.push(`OpenRouter: ${err.message}`);
        console.warn('[ProviderChain] OpenRouter failed:', err);
      }
    }

    throw new Error(
      `No functional LLM provider available.\n${errors.join('\n') || 'Please configure GROQ_API_KEY or OPENROUTER_API_KEY in your environment variables.'}`
    );
  }

  /**
   * Executes a streaming LLM completion with real-time token chunks.
   */
  static async streamCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    const errors: string[] = [];

    // 1. Try Local Ollama if not in cloud
    if (!this.isCloudServerless()) {
      if (await localAIProvider.isAvailable()) {
        try {
          if (localAIProvider.chatCompletionStream) {
            return await localAIProvider.chatCompletionStream(messages, options, onChunk);
          }
          const res = await localAIProvider.chatCompletion(messages, options);
          onChunk?.({ text: res.text, modelUsed: res.modelUsed, provider: res.provider });
          return res;
        } catch (err: any) {
          errors.push(`Ollama: ${err.message}`);
        }
      }
    }

    // 2. Try Groq
    if (groqProvider.isConfigured()) {
      try {
        if (groqProvider.chatCompletionStream) {
          return await groqProvider.chatCompletionStream(messages, options, onChunk);
        }
        const res = await groqProvider.chatCompletion(messages, options);
        onChunk?.({ text: res.text, modelUsed: res.modelUsed, provider: res.provider });
        return res;
      } catch (err: any) {
        errors.push(`Groq: ${err.message}`);
      }
    }

    // 3. Try OpenRouter
    if (openRouterProvider.isConfigured()) {
      try {
        if (openRouterProvider.chatCompletionStream) {
          return await openRouterProvider.chatCompletionStream(messages, options, onChunk);
        }
        const res = await openRouterProvider.chatCompletion(messages, options);
        onChunk?.({ text: res.text, modelUsed: res.modelUsed, provider: res.provider });
        return res;
      } catch (err: any) {
        errors.push(`OpenRouter: ${err.message}`);
      }
    }

    throw new Error(
      `No functional LLM provider available for streaming.\n${errors.join('\n') || 'Please configure GROQ_API_KEY or OPENROUTER_API_KEY in your environment variables.'}`
    );
  }

  /**
   * Health status inspection for UI badges and diagnostics (safe, no keys exposed).
   */
  static async getStatus() {
    const isCloud = this.isCloudServerless();
    const isLocalAvailable = !isCloud && (await localAIProvider.isAvailable());
    const isGroqAvailable = groqProvider.isConfigured() && (await groqProvider.isAvailable());
    const isOrAvailable = openRouterProvider.isConfigured() && (await openRouterProvider.isAvailable());
    const hardware: SystemHardwareInfo = HardwareDetector.getHardwareInfo();

    let activeProviderName = 'No LLM Provider Connected';
    let activeModel = 'none';
    let status: 'online' | 'unconfigured' | 'offline' = 'unconfigured';

    if (isLocalAvailable) {
      activeProviderName = localAIProvider.name;
      activeModel = await localAIProvider.getPreferredModel();
      status = 'online';
    } else if (isGroqAvailable) {
      activeProviderName = 'Groq Cloud (High Speed)';
      activeModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      status = 'online';
    } else if (isOrAvailable) {
      activeProviderName = 'OpenRouter Free Cloud';
      activeModel = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';
      status = 'online';
    } else {
      status = 'unconfigured';
    }

    return {
      status,
      activeProvider: activeProviderName,
      activeModel,
      isCloudEnvironment: isCloud,
      hardware: isCloud ? undefined : hardware,
      providers: {
        ollama: {
          available: isLocalAvailable,
          baseUrl: isCloud ? 'Disabled on cloud serverless' : localAIProvider.getBaseUrl(),
          recommendedModel: hardware.recommendedLocalModel,
        },
        groq: {
          configured: groqProvider.isConfigured(),
          available: isGroqAvailable,
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        },
        openrouter: {
          configured: openRouterProvider.isConfigured(),
          available: isOrAvailable,
          model: process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free',
        },
      },
      toolsRegistered: 17,
    };
  }
}
