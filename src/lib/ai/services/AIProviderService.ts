/**
 * Campus OS — Master AI Provider Service
 * Centralized, secure, server-side AI execution service for Campus OS.
 * Manages provider selection, priority routing, timeouts, normalized responses,
 * and friendly configuration status across Local and Vercel environments.
 */

import { groqProvider } from '../providers/GroqProvider';
import { openRouterProvider } from '../providers/OpenRouterProvider';
import { geminiProvider } from '../providers/GeminiProvider';
import { localAIProvider } from '../providers/LocalAIProvider';
import {
  LLMMessage,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMStreamChunk,
} from '../providers/types';

export interface NormalizedAIResponse {
  success: boolean;
  message: string;
  provider?: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  errorCode?: string;
  isConfigured: boolean;
}

export interface AIConfigurationStatus {
  isConfigured: boolean;
  activeProvider: string;
  configuredProviders: string[];
  isCloudEnvironment: boolean;
  environmentType: 'local' | 'vercel' | 'serverless';
  guidance?: string;
}

export class AIProviderService {
  /**
   * Identifies if running in cloud serverless (e.g. Vercel, AWS, Netlify).
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
   * Safe startup and health configuration inspector.
   * NEVER prints or exposes actual API keys.
   */
  static getConfigurationStatus(): AIConfigurationStatus {
    const isCloud = this.isCloudServerless();
    const configuredProviders: string[] = [];

    if (groqProvider.isConfigured()) configuredProviders.push('Groq Cloud');
    if (openRouterProvider.isConfigured()) configuredProviders.push('OpenRouter');
    if (geminiProvider.isConfigured()) configuredProviders.push('Google Gemini');

    const isLocalOllamaConfigured =
      !isCloud && Boolean(process.env.OLLAMA_BASE_URL || process.env.ENABLE_OLLAMA === 'true');
    if (isLocalOllamaConfigured) configuredProviders.push('Local Ollama (Optional)');

    const isConfigured = configuredProviders.length > 0;
    const activeProvider = isConfigured
      ? configuredProviders[0]
      : 'No AI Provider Configured';

    let guidance: string | undefined;
    if (!isConfigured) {
      guidance = isCloud
        ? 'CampusOS AI provider is not configured on the production server. Please add GROQ_API_KEY to your Vercel Project Settings (Settings -> Environment Variables) and redeploy.'
        : 'CampusOS AI is not configured on this environment. Copy .env.example to .env.local and add your GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY.';
    }

    return {
      isConfigured,
      activeProvider,
      configuredProviders,
      isCloudEnvironment: isCloud,
      environmentType: process.env.VERCEL ? 'vercel' : isCloud ? 'serverless' : 'local',
      guidance,
    };
  }

  /**
   * Executes a direct LLM completion with automatic provider fallback and normalized output.
   */
  static async executeChat(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<NormalizedAIResponse> {
    const forcedProvider = process.env.AI_PROVIDER?.toLowerCase().trim();
    const errors: string[] = [];
    const isCloud = this.isCloudServerless();

    // 1. Explicitly forced provider
    if (forcedProvider === 'groq' && groqProvider.isConfigured()) {
      try {
        const res = await groqProvider.chatCompletion(messages, options);
        return {
          success: true,
          message: res.text,
          provider: res.provider,
          model: res.modelUsed,
          isConfigured: true,
        };
      } catch (err: any) {
        errors.push(`Groq: ${err.message}`);
      }
    }

    if (forcedProvider === 'openrouter' && openRouterProvider.isConfigured()) {
      try {
        const res = await openRouterProvider.chatCompletion(messages, options);
        return {
          success: true,
          message: res.text,
          provider: res.provider,
          model: res.modelUsed,
          isConfigured: true,
        };
      } catch (err: any) {
        errors.push(`OpenRouter: ${err.message}`);
      }
    }

    if (forcedProvider === 'gemini' && geminiProvider.isConfigured()) {
      try {
        const res = await geminiProvider.chatCompletion(messages, options);
        return {
          success: true,
          message: res.text,
          provider: res.provider,
          model: res.modelUsed,
          isConfigured: true,
        };
      } catch (err: any) {
        errors.push(`Gemini: ${err.message}`);
      }
    }

    // 2. Default Priority Fallback Chain (Cloud First -> Optional Local)
    // Priority 1: Groq Cloud
    if (groqProvider.isConfigured()) {
      try {
        const res = await groqProvider.chatCompletion(messages, options);
        return {
          success: true,
          message: res.text,
          provider: res.provider,
          model: res.modelUsed,
          isConfigured: true,
        };
      } catch (err: any) {
        errors.push(`Groq: ${err.message}`);
        console.warn('[AIProviderService] Groq failed, trying fallback:', err.message);
      }
    }

    // Priority 2: OpenRouter Cloud
    if (openRouterProvider.isConfigured()) {
      try {
        const res = await openRouterProvider.chatCompletion(messages, options);
        return {
          success: true,
          message: res.text,
          provider: res.provider,
          model: res.modelUsed,
          isConfigured: true,
        };
      } catch (err: any) {
        errors.push(`OpenRouter: ${err.message}`);
        console.warn('[AIProviderService] OpenRouter failed, trying fallback:', err.message);
      }
    }

    // Priority 3: Google Gemini
    if (geminiProvider.isConfigured()) {
      try {
        const res = await geminiProvider.chatCompletion(messages, options);
        return {
          success: true,
          message: res.text,
          provider: res.provider,
          model: res.modelUsed,
          isConfigured: true,
        };
      } catch (err: any) {
        errors.push(`Gemini: ${err.message}`);
        console.warn('[AIProviderService] Gemini failed, trying fallback:', err.message);
      }
    }

    // Priority 4: Local Ollama (Only if explicitly running in local dev)
    if (!isCloud) {
      if (await localAIProvider.isAvailable()) {
        try {
          const res = await localAIProvider.chatCompletion(messages, options);
          return {
            success: true,
            message: res.text,
            provider: res.provider,
            model: res.modelUsed,
            isConfigured: true,
          };
        } catch (err: any) {
          errors.push(`Ollama: ${err.message}`);
        }
      }
    }

    // 3. No Provider Configured / All Providers Failed
    const status = this.getConfigurationStatus();

    return {
      success: false,
      errorCode: status.isConfigured ? 'PROVIDER_UNAVAILABLE' : 'NOT_CONFIGURED',
      message: status.guidance || 'AI service is temporarily unavailable. Please check provider keys.',
      isConfigured: status.isConfigured,
    };
  }
}
