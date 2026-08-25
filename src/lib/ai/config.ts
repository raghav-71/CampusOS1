/**
 * Campus OS AI Configuration
 * Centralized settings for local model providers (Ollama), remote providers, and execution parameters.
 */

import { HardwareDetector, SystemHardwareInfo } from './providers/HardwareDetector';

export interface AIConfig {
  provider: 'local' | 'remote' | 'auto';
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  contextLimit: number;
  enableTools: boolean;
  debugMode: boolean;
}

const hardwareInfo: SystemHardwareInfo = HardwareDetector.getHardwareInfo();

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: (process.env.AI_PROVIDER as any) || 'auto',
  model: process.env.AI_MODEL || hardwareInfo.recommendedLocalModel,
  baseUrl: process.env.AI_BASE_URL || 'http://127.0.0.1:11434',
  temperature: 0.3,
  maxTokens: 2048,
  contextLimit: hardwareInfo.maxContextLength,
  enableTools: true,
  debugMode: process.env.NODE_ENV === 'development',
};

class AIConfigStore {
  private config: AIConfig = { ...DEFAULT_AI_CONFIG };

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AIConfig>): AIConfig {
    this.config = { ...this.config, ...updates };
    return { ...this.config };
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  getModel(): string {
    return this.config.model;
  }

  getHardwareInfo(): SystemHardwareInfo {
    return HardwareDetector.getHardwareInfo();
  }
}

export const aiConfigStore = new AIConfigStore();
