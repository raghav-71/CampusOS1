/**
 * Campus OS AI Provider Chain
 * Coordinates Groq Cloud (Primary), Google Gemini (RAG/Doc), NVIDIA Nemotron (Reasoning),
 * OpenRouter, and Local Ollama with Intelligent Intent Routing & Seamless Multi-Provider Fallback.
 */

import { localAIProvider } from './LocalAIProvider';
import { groqProvider } from './GroqProvider';
import { openRouterProvider } from './OpenRouterProvider';
import { geminiProvider } from './GeminiProvider';
import { nvidiaNemotronProvider } from './NvidiaNemotronProvider';
import { fallbackProvider } from './FallbackProvider';
import {
  LLMMessage,
  LLMCompletionResult,
  LLMCompletionOptions,
  AIProvider,
  LLMStreamChunk,
  AIQueryIntent,
} from './types';
import { HardwareDetector, SystemHardwareInfo } from './HardwareDetector';

export class ProviderChain {
  /**
   * Identifies if running in cloud serverless (e.g. Vercel, AWS Lambda, Netlify).
   */
  static isCloudServerless(): boolean {
    return Boolean(
      process.env.VERCEL ||
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY
    );
  }


  /**
   * Classifies user query intent to select the optimal model provider.
   */
  static classifyIntent(query: string, options?: LLMCompletionOptions): AIQueryIntent {
    if (options?.intent) return options.intent;

    const q = (query || '').toLowerCase().trim();

    // 1. RAG / Document / Study Material / Syllabus / Question Papers
    if (
      q.includes('[attached document') ||
      /\b(attached file|attached document|lecture notes|syllabus|question paper|question papers|previous year|pyq|pdf|study material|course material|chapter \d+|mid-term|end-term|search notes|from the document|in the attached)\b/i.test(q)
    ) {
      return 'rag_document';
    }

    // 2. Complex Multi-Step Reasoning / Formal Proofs / Deep Analysis
    if (
      /\b(formal proof|prove that|derive |derivation|step-by-step reasoning|complex algorithmic design|architectural analysis|formal verification|complexity proof|mathematical proof|multi-step planning|in-depth theoretical analysis|prove by induction|prove by contradiction)\b/i.test(q)
    ) {
      return 'complex_reasoning';
    }

    // 3. Campus Action & Data Lookups
    if (
      /\b(my attendance|check attendance|attendance rate|low attendance|below 75|my timetable|open timetable|schedule for today|my marks|my grades|my gpa|my cgpa|my classes|start class|official question papers|institutional stats|broadcast notice|broadcast announcement)\b/i.test(q)
    ) {
      return 'campus_action';
    }

    // 4. Default: Normal conversation, explanations, coding, tutoring, Q&A -> Groq (speed-critical)
    return 'normal';
  }

  /**
   * Returns an ordered cascade of AI providers tailored to the specific query intent.
   */
  static getProviderCascade(intent: AIQueryIntent = 'normal'): AIProvider[] {
    const forced = (process.env.AI_PROVIDER || '').toLowerCase().trim();
    const isCloud = this.isCloudServerless();

    // If an explicit provider is forced (and not 'auto')
    if (forced && forced !== 'auto') {
      if (forced === 'groq' && groqProvider.isConfigured()) {
        return [groqProvider, openRouterProvider, geminiProvider, nvidiaNemotronProvider, fallbackProvider];
      }
      if (forced === 'gemini' && geminiProvider.isConfigured()) {
        return [geminiProvider, groqProvider, openRouterProvider, nvidiaNemotronProvider, fallbackProvider];
      }
      if ((forced === 'nvidia' || forced === 'nemotron') && nvidiaNemotronProvider.isConfigured()) {
        return [nvidiaNemotronProvider, groqProvider, openRouterProvider, geminiProvider, fallbackProvider];
      }
      if (forced === 'openrouter' && openRouterProvider.isConfigured()) {
        return [openRouterProvider, groqProvider, geminiProvider, nvidiaNemotronProvider, fallbackProvider];
      }
      if (forced === 'ollama' && !isCloud) {
        return [localAIProvider, groqProvider, openRouterProvider, fallbackProvider];
      }
    }

    // Dynamic Intent-based Priority Cascade:
    switch (intent) {
      case 'rag_document':
        // RAG / Document Analysis -> Gemini (Large context & document precision) -> Groq -> OpenRouter -> Nemotron
        return [
          geminiProvider,
          groqProvider,
          openRouterProvider,
          nvidiaNemotronProvider,
          ...(!isCloud ? [localAIProvider] : []),
          fallbackProvider,
        ];

      case 'complex_reasoning':
        // Complex Multi-Step Reasoning -> NVIDIA Nemotron -> Groq -> OpenRouter -> Gemini
        return [
          nvidiaNemotronProvider,
          groqProvider,
          openRouterProvider,
          geminiProvider,
          ...(!isCloud ? [localAIProvider] : []),
          fallbackProvider,
        ];

      case 'campus_action':
      case 'normal':
      default:
        // Normal conversation, coding, fast Q&A -> Groq (Ultra-high speed) -> OpenRouter -> Gemini -> Nemotron
        return [
          groqProvider,
          openRouterProvider,
          geminiProvider,
          nvidiaNemotronProvider,
          ...(!isCloud ? [localAIProvider] : []),
          fallbackProvider,
        ];
    }
  }

  /**
   * Discovers and returns the highest-priority active provider for a given intent.
   */
  static async getActiveProvider(intent: AIQueryIntent = 'normal'): Promise<{ provider: AIProvider; name: string; isLocal: boolean }> {
    const cascade = this.getProviderCascade(intent);

    for (const p of cascade) {
      if (p === fallbackProvider) {
        return { provider: fallbackProvider, name: fallbackProvider.name, isLocal: true };
      }
      if ('isConfigured' in p && typeof (p as any).isConfigured === 'function') {
        if (!(p as any).isConfigured()) continue;
      }
      const available = await p.isAvailable().catch(() => false);
      if (available) {
        const isLocal = p === localAIProvider || p === fallbackProvider;
        return { provider: p, name: p.name, isLocal };
      }
    }

    return { provider: fallbackProvider, name: fallbackProvider.name, isLocal: true };
  }

  /**
   * Executes a direct LLM completion with intelligent routing & multi-provider fallback cascade.
   */
  static async executeCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const userQuery = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const intent = options?.intent || this.classifyIntent(userQuery, options);
    const cascade = this.getProviderCascade(intent);
    const errors: string[] = [];

    for (const provider of cascade) {
      // Check configuration if applicable
      if ('isConfigured' in provider && typeof (provider as any).isConfigured === 'function') {
        if (!(provider as any).isConfigured()) continue;
      }

      try {
        const result = await provider.chatCompletion(messages, { ...options, intent });
        if (result && typeof result.text === 'string' && result.text.trim().length > 0) {
          return result;
        }
      } catch (err: any) {
        errors.push(`${provider.name}: ${err?.message || err}`);
        console.warn(`[ProviderChain] ${provider.name} failed (${intent}), falling back to next provider:`, err?.message || err);
      }
    }

    // Final deterministic fallback
    try {
      return await fallbackProvider.chatCompletion(messages, options);
    } catch {
      throw new Error(`All AI providers failed. Errors: ${errors.join('; ')}`);
    }
  }

  /**
   * Executes a streaming LLM completion with intelligent routing, live token streaming,
   * zero-leak thinking filter, and automatic fallback if the primary provider fails to connect.
   */
  static async streamCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    const userQuery = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const intent = options?.intent || this.classifyIntent(userQuery, options);
    const cascade = this.getProviderCascade(intent);
    const errors: string[] = [];

    for (const provider of cascade) {
      if ('isConfigured' in provider && typeof (provider as any).isConfigured === 'function') {
        if (!(provider as any).isConfigured()) continue;
      }

      let tokensEmitted = 0;
      let accumulatedText = '';

      const chunkInterceptor = (chunk: LLMStreamChunk) => {
        if (chunk.text) {
          tokensEmitted++;
          accumulatedText += chunk.text;
        }
        onChunk?.(chunk);
      };

      try {
        if (provider.chatCompletionStream) {
          const res = await provider.chatCompletionStream(messages, { ...options, intent }, chunkInterceptor);
          if (res && (res.text?.trim().length > 0 || tokensEmitted > 0)) {
            return res;
          }
        } else {
          // If provider only supports non-streaming completion
          const res = await provider.chatCompletion(messages, { ...options, intent });
          if (res && res.text?.trim().length > 0) {
            onChunk?.({ text: res.text, modelUsed: res.modelUsed, provider: res.provider, done: true });
            return res;
          }
        }
      } catch (err: any) {
        errors.push(`${provider.name}: ${err?.message || err}`);
        console.warn(`[ProviderChain] Stream failed on ${provider.name} (${intent}):`, err?.message || err);

        // If tokens were ALREADY sent to the client, we cannot seamlessly switch provider mid-sentence
        if (tokensEmitted > 0) {
          onChunk?.({ done: true, provider: provider.name });
          return {
            text: accumulatedText,
            modelUsed: 'stream-partial',
            provider: provider.name,
            durationMs: 0,
          };
        }

        // If zero tokens were emitted, continue loop to seamlessly try the next provider
      }
    }

    // Fallback if all streams failed
    const fallbackRes = await fallbackProvider.chatCompletion(messages, options);
    onChunk?.({ text: fallbackRes.text, modelUsed: fallbackRes.modelUsed, provider: fallbackRes.provider, done: true });
    return fallbackRes;
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
    const isNvidiaAvailable = nvidiaNemotronProvider.isConfigured() && (await nvidiaNemotronProvider.isAvailable());
    const hardware: SystemHardwareInfo = HardwareDetector.getHardwareInfo();
    const forcedProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

    let activeProviderName = 'No LLM Provider Connected';
    let activeModel = 'none';
    let status: 'online' | 'unconfigured' | 'offline' = 'unconfigured';

    if (forcedProvider === 'groq' && isGroqAvailable) {
      activeProviderName = groqProvider.name;
      activeModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      status = 'online';
    } else if (forcedProvider === 'openrouter' && isOrAvailable) {
      activeProviderName = openRouterProvider.name;
      activeModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
      status = 'online';
    } else if (forcedProvider === 'gemini' && isGeminiAvailable) {
      activeProviderName = geminiProvider.name;
      activeModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      status = 'online';
    } else if ((forcedProvider === 'nvidia' || forcedProvider === 'nemotron') && isNvidiaAvailable) {
      activeProviderName = nvidiaNemotronProvider.name;
      activeModel = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-30b-a3b';
      status = 'online';
    } else if (forcedProvider === 'ollama' && isLocalAvailable) {
      activeProviderName = localAIProvider.name;
      activeModel = await localAIProvider.getPreferredModel();
      status = 'online';
    } else if (isGroqAvailable) {
      activeProviderName = 'Groq Cloud (Primary High-Speed)';
      activeModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      status = 'online';
    } else if (isOrAvailable) {
      activeProviderName = 'OpenRouter Free Cloud';
      activeModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
      status = 'online';
    } else if (isGeminiAvailable) {
      activeProviderName = 'Google Gemini (RAG & Study)';
      activeModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      status = 'online';
    } else if (isNvidiaAvailable) {
      activeProviderName = nvidiaNemotronProvider.name;
      activeModel = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-30b-a3b';
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
      routing: {
        normal: 'Groq Cloud (Speed-first)',
        rag_document: 'Google Gemini (Precision RAG)',
        complex_reasoning: 'NVIDIA Nemotron (Reasoning Engine)',
        campus_action: 'Groq + Campus Tools',
      },
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
        nvidia: {
          configured: nvidiaNemotronProvider.isConfigured(),
          available: isNvidiaAvailable,
          model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-30b-a3b',
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
