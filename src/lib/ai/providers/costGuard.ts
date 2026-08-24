/**
 * Cost Guard & Free Model Verification Subsystem
 *
 * Ensures Campus OS never accidentally uses a paid AI model.
 * Whitelists known free models on OpenRouter and Groq.
 */

export const KNOWN_FREE_OPENROUTER_MODELS = [
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
  'openrouter/free',
  'openrouter/auto',
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
    if (clean.endsWith(':free') || clean === 'openrouter/free') {
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
   * Throws an error if model is not free.
   */
  static ensureFreeOpenRouterModel(modelName: string): string {
    if (this.isOpenRouterFree(modelName)) {
      return modelName;
    }
    throw new Error(
      `[CostGuard Violation] Model "${modelName}" is NOT recognized as a free OpenRouter model. Campus OS strictly forbids paid models to protect against unwanted API charges. Use a model with ':free' suffix or 'openrouter/free'.`
    );
  }

  static ensureFreeGroqModel(modelName: string): string {
    if (this.isGroqFree(modelName)) {
      return modelName;
    }
    throw new Error(
      `[CostGuard Violation] Model "${modelName}" is NOT recognized as a free Groq model. Allowed: ${KNOWN_FREE_GROQ_MODELS.join(', ')}`
    );
  }
}
