/**
 * Cost Guard & Free Model Verification Subsystem
 *
 * Ensures Campus OS never accidentally calls a paid AI model.
 * Whitelists genuine free models on OpenRouter (and Groq).
 */

export const KNOWN_FREE_OPENROUTER_MODELS = [
  'openrouter/free',
  'openrouter/auto',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash-thinking-exp:free',
  'deepseek/deepseek-chat:free',
  'deepseek/deepseek-r1:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.2-1b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

export const KNOWN_FREE_GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

export class CostGuard {
  /**
   * Validates if a model name is safely free on OpenRouter.
   */
  static isOpenRouterFree(modelName: string): boolean {
    if (!modelName) return false;
    const clean = modelName.trim().toLowerCase();
    if (clean.endsWith(':free') || clean === 'openrouter/free' || clean === 'openrouter/auto') {
      return true;
    }
    return KNOWN_FREE_OPENROUTER_MODELS.some((m) => m.toLowerCase() === clean);
  }

  /**
   * Validates if a model name is on Groq's free tier.
   */
  static isGroqFree(modelName: string): boolean {
    if (!modelName) return false;
    const clean = modelName.trim().toLowerCase();
    return KNOWN_FREE_GROQ_MODELS.some((m) => m.toLowerCase() === clean);
  }

  /**
   * Enforces cost safety before making an API call.
   * Returns a valid free model name or falls back to 'openrouter/free'.
   */
  static ensureFreeOpenRouterModel(modelName?: string): string {
    const target = modelName || process.env.AI_MODEL || 'openrouter/free';
    if (this.isOpenRouterFree(target)) {
      return target;
    }
    // Fall back to openrouter/free router to prevent failure
    console.warn(`[CostGuard] Non-free model requested (${target}), safely falling back to 'openrouter/free'.`);
    return 'openrouter/free';
  }

  static ensureFreeGroqModel(modelName?: string): string {
    const target = modelName || 'llama-3.3-70b-versatile';
    if (this.isGroqFree(target)) {
      return target;
    }
    return 'llama-3.3-70b-versatile';
  }
}
