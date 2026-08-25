/**
 * Hardware Detection Utility
 * Inspects system RAM, CPU cores, and GPU capabilities to recommend optimal local LLM models for Ollama.
 */

import os from 'os';

export interface SystemHardwareInfo {
  totalRamGb: number;
  freeRamGb: number;
  cpuCores: number;
  cpuModel: string;
  recommendedLocalModel: string;
  recommendedAlternativeModels: string[];
  maxContextLength: number;
}

export class HardwareDetector {
  static getHardwareInfo(): SystemHardwareInfo {
    const totalRamBytes = os.totalmem();
    const freeRamBytes = os.freemem();
    const totalRamGb = Math.round((totalRamBytes / (1024 * 1024 * 1024)) * 10) / 10;
    const freeRamGb = Math.round((freeRamBytes / (1024 * 1024 * 1024)) * 10) / 10;
    const cpus = os.cpus();
    const cpuCores = cpus.length;
    const cpuModel = cpus[0]?.model || 'Unknown CPU';

    // Model selection based on memory & compute tiers
    let recommendedLocalModel = 'qwen2.5:7b';
    let recommendedAlternativeModels = ['llama3.1:8b', 'mistral:7b', 'deepseek-r1:8b'];
    let maxContextLength = 8192;

    if (totalRamGb >= 30) {
      recommendedLocalModel = 'qwen2.5:14b';
      recommendedAlternativeModels = ['qwen2.5:14b', 'deepseek-r1:14b', 'llama3.1:8b', 'phi4:14b'];
      maxContextLength = 16384;
    } else if (totalRamGb >= 16) {
      // Ideal for 7B-8B models with full GPU/RAM acceleration
      recommendedLocalModel = 'qwen2.5:7b';
      recommendedAlternativeModels = ['llama3.1:8b', 'deepseek-r1:8b', 'mistral:7b', 'gemma2:9b'];
      maxContextLength = 8192;
    } else if (totalRamGb >= 8) {
      recommendedLocalModel = 'qwen2.5:3b';
      recommendedAlternativeModels = ['llama3.2:3b', 'phi3:mini', 'qwen2.5:7b'];
      maxContextLength = 4096;
    } else {
      recommendedLocalModel = 'qwen2.5:1.5b';
      recommendedAlternativeModels = ['llama3.2:1b', 'smollm2:1.7b'];
      maxContextLength = 2048;
    }

    return {
      totalRamGb,
      freeRamGb,
      cpuCores,
      cpuModel,
      recommendedLocalModel,
      recommendedAlternativeModels,
      maxContextLength,
    };
  }
}
