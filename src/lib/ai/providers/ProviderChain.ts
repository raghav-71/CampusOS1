/**
 * Campus OS AI Provider Chain
 * Coordinates Groq Cloud, OpenRouter, Google Gemini, and Local Ollama.
 */

import { localAIProvider } from './LocalAIProvider';
import { groqProvider } from './GroqProvider';
import { openRouterProvider } from './OpenRouterProvider';
import { geminiProvider } from './GeminiProvider';
import { LLMMessage, LLMCompletionResult, LLMCompletionOptions, AIProvider, LLMStreamChunk } from './types';
import { HardwareDetector, SystemHardwareInfo } from './HardwareDetector';
import { AIProviderService } from '../services/AIProviderService';

export class ProviderChain {
  /**
   * Identifies if running in cloud serverless (e.g. Vercel, AWS Lambda, Netlify).
   */
  static isCloudServerless(): boolean {
    return AIProviderService.isCloudServerless();
  }

  /**
   * Discovers and returns the highest-priority active provider.
   */
  static async getActiveProvider(): Promise<{ provider: AIProvider | null; name: string; isLocal: boolean }> {
    const forcedProvider = process.env.AI_PROVIDER?.toLowerCase().trim();

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

    if (forcedProvider === 'gemini') {
      if (geminiProvider.isConfigured() && (await geminiProvider.isAvailable())) {
        return { provider: geminiProvider, name: geminiProvider.name, isLocal: false };
      }
    }

    if (forcedProvider === 'ollama') {
      if (await localAIProvider.isAvailable()) {
        return { provider: localAIProvider, name: localAIProvider.name, isLocal: true };
      }
    }

    // Default "auto" cloud-first priority
    // 1. Check Groq Free Tier
    if (groqProvider.isConfigured()) {
      const isGroqReachable = await groqProvider.isAvailable();
      if (isGroqReachable) {
        return { provider: groqProvider, name: groqProvider.name, isLocal: false };
      }
    }

    // 2. Check OpenRouter Free Tier
    if (openRouterProvider.isConfigured()) {
      const isOrReachable = await openRouterProvider.isAvailable();
      if (isOrReachable) {
        return { provider: openRouterProvider, name: openRouterProvider.name, isLocal: false };
      }
    }

    // 3. Check Google Gemini
    if (geminiProvider.isConfigured()) {
      const isGeminiReachable = await geminiProvider.isAvailable();
      if (isGeminiReachable) {
        return { provider: geminiProvider, name: geminiProvider.name, isLocal: false };
      }
    }

    // 4. In local development only, check Ollama
    if (!this.isCloudServerless()) {
      const isOllamaRunning = await localAIProvider.isAvailable();
      if (isOllamaRunning) {
        return { provider: localAIProvider, name: localAIProvider.name, isLocal: true };
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
    const startTime = Date.now();
    const result = await AIProviderService.executeChat(messages, options);

    if (result.success) {
      return {
        text: result.message,
        modelUsed: result.model || 'auto',
        provider: result.provider || 'Campus AI',
        durationMs: Date.now() - startTime,
      };
    }

    throw new Error(result.message);
  }

  /**
   * Executes a streaming LLM completion with real-time token chunks.
   */
  static async streamCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    const res = await this.executeCompletion(messages, options);
    onChunk?.({
      text: res.text,
      modelUsed: res.modelUsed,
      provider: res.provider,
    });
    return res;
  }

  /**
   * Health status inspection for UI badges and diagnostics (safe, no keys exposed).
   */
  static async getStatus() {
    const isCloud = this.isCloudServerless();
    const isLocalAvailable = !isCloud && (await localAIProvider.isAvailable());
    const isGroqAvailable = groqProvider.isConfigured() && (await groqProvider.isAvailable());
    const isOrAvailable = openRouterProvider.isConfigured() && (await openRouterProvider.isAvailable());
    const isGeminiAvailable = geminiProvider.isConfigured() && (await geminiProvider.isAvailable());
    const hardware: SystemHardwareInfo = HardwareDetector.getHardwareInfo();

    let activeProviderName = 'No LLM Provider Connected';
    let activeModel = 'none';
    let status: 'online' | 'unconfigured' | 'offline' = 'unconfigured';

    if (isGroqAvailable) {
      activeProviderName = 'Groq Cloud (High Speed)';
      activeModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      status = 'online';
    } else if (isOrAvailable) {
      activeProviderName = 'OpenRouter Free Cloud';
      activeModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
      status = 'online';
    } else if (isGeminiAvailable) {
      activeProviderName = 'Google Gemini Free Cloud';
      activeModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      status = 'online';
    } else if (isLocalAvailable) {
      activeProviderName = localAIProvider.name;
      activeModel = await localAIProvider.getPreferredModel();
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
        groq: {
          configured: groqProvider.isConfigured(),
          available: isGroqAvailable,
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        },
        openrouter: {
          configured: openRouterProvider.isConfigured(),
          available: isOrAvailable,
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
        },
        gemini: {
          configured: geminiProvider.isConfigured(),
          available: isGeminiAvailable,
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        },
        ollama: {
          available: isLocalAvailable,
          baseUrl: isCloud ? 'Disabled on cloud serverless' : localAIProvider.getBaseUrl(),
          recommendedModel: hardware.recommendedLocalModel,
        },
      },
      toolsRegistered: 17,
    };
  }
}
