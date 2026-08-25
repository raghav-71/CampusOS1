/**
 * Campus OS AI Provider Chain
 * Coordinates Local Ollama, Groq Cloud, OpenRouter, and Deterministic Fallback.
 */

import { localAIProvider } from './LocalAIProvider';
import { groqProvider } from './GroqProvider';
import { openRouterProvider } from './OpenRouterProvider';
import { DeterministicEngine, AgentExecutionResponse } from './DeterministicEngine';
import { toolRegistry, AIExecutionContext } from '../tools/ToolRegistry';
import { LLMMessage, LLMCompletionResult, LLMCompletionOptions, AIProvider } from './types';
import { HardwareDetector, SystemHardwareInfo } from './HardwareDetector';

export class ProviderChain {
  /**
   * Discovers and returns the highest-priority active provider.
   */
  static async getActiveProvider(): Promise<{ provider: AIProvider | null; name: string; isLocal: boolean }> {
    // 1. Check Local Ollama first (Local-First philosophy)
    const isOllamaRunning = await localAIProvider.isAvailable();
    if (isOllamaRunning) {
      return { provider: localAIProvider, name: localAIProvider.name, isLocal: true };
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

    return { provider: null, name: 'Deterministic Campus Engine (Offline)', isLocal: true };
  }

  /**
   * Executes a direct LLM completion through the active provider.
   */
  static async executeCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    // Try Local Ollama
    if (await localAIProvider.isAvailable()) {
      try {
        return await localAIProvider.chatCompletion(messages, options);
      } catch (err) {
        console.warn('[ProviderChain] Local Ollama call failed, falling back to remote provider:', err);
      }
    }

    // Try Groq
    if (groqProvider.isConfigured()) {
      try {
        return await groqProvider.chatCompletion(messages, options);
      } catch (err) {
        console.warn('[ProviderChain] Groq call failed, falling back to OpenRouter:', err);
      }
    }

    // Try OpenRouter
    if (openRouterProvider.isConfigured()) {
      try {
        return await openRouterProvider.chatCompletion(messages, options);
      } catch (err) {
        console.warn('[ProviderChain] OpenRouter call failed:', err);
      }
    }

    throw new Error('No functional LLM provider available.');
  }

  /**
   * Health status inspection for UI badges and diagnostics.
   */
  static async getStatus() {
    const isLocalAvailable = await localAIProvider.isAvailable();
    const isGroqAvailable = groqProvider.isConfigured() && (await groqProvider.isAvailable());
    const isOrAvailable = openRouterProvider.isConfigured() && (await openRouterProvider.isAvailable());
    const hardware: SystemHardwareInfo = HardwareDetector.getHardwareInfo();

    let activeProviderName = 'Campus Deterministic Agent (Offline)';
    let activeModel = 'deterministic-offline-engine';
    let status: 'online' | 'local-deterministic' | 'offline' = 'local-deterministic';

    if (isLocalAvailable) {
      activeProviderName = localAIProvider.name;
      activeModel = hardware.recommendedLocalModel;
      status = 'online';
    } else if (isGroqAvailable) {
      activeProviderName = 'Groq Cloud (High Speed)';
      activeModel = 'openai/gpt-oss-120b';
      status = 'online';
    } else if (isOrAvailable) {
      activeProviderName = 'OpenRouter Free Tier';
      activeModel = 'google/gemma-4-31b-it:free';
      status = 'online';
    }

    return {
      status,
      activeProvider: activeProviderName,
      activeModel,
      hardware,
      providers: {
        ollama: {
          available: isLocalAvailable,
          baseUrl: 'http://127.0.0.1:11434',
          recommendedModel: hardware.recommendedLocalModel,
        },
        groq: {
          configured: groqProvider.isConfigured(),
          available: isGroqAvailable,
        },
        openrouter: {
          configured: openRouterProvider.isConfigured(),
          available: isOrAvailable,
        },
      },
      toolsRegistered: toolRegistry.getAllTools().length,
    };
  }
}
