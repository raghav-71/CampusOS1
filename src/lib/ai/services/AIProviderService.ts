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
import { nvidiaNemotronProvider } from '../providers/NvidiaNemotronProvider';
import { ProviderChain } from '../providers/ProviderChain';

import {
  LLMMessage,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMStreamChunk,
  LLMToolCall,
} from '../providers/types';


export interface NormalizedAIResponse {
  success: boolean;
  message: string;
  toolCalls?: LLMToolCall[];
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
    if (nvidiaNemotronProvider.isConfigured()) configuredProviders.push('NVIDIA Nemotron');

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
        : 'CampusOS AI is not configured on this environment. Copy .env.example to .env.local and add an AI provider key.';
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
    try {
      const userQuery = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
      const intent = options?.intent || ProviderChain.classifyIntent(userQuery, options);
      const res = await ProviderChain.executeCompletion(messages, { ...options, intent });

      return {
        success: true,
        message: res.text,
        toolCalls: res.toolCalls,
        provider: res.provider,
        model: res.modelUsed,
        usage: res.tokensUsed
          ? {
              promptTokens: res.tokensUsed.prompt,
              completionTokens: res.tokensUsed.completion,
              totalTokens: res.tokensUsed.total,
            }
          : undefined,
        isConfigured: true,
      };
    } catch (err: any) {
      const status = this.getConfigurationStatus();
      return {
        success: false,
        errorCode: status.isConfigured ? 'PROVIDER_UNAVAILABLE' : 'NOT_CONFIGURED',
        message: err?.message || status.guidance || 'AI service is temporarily unavailable.',
        isConfigured: status.isConfigured,
      };
    }
  }
}

