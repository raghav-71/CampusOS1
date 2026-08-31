import { AIChatMessage, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProviderResponse, ProviderStatusInfo } from '../provider/types';
import {
  AIProvider as IUnifiedAIProvider,
  LLMMessage,
  LLMCompletionOptions,
  LLMCompletionResult,
  LLMStreamChunk,
} from './types';
import { CampusAgent } from '../agent/campusAgent';
import { UserProfile } from '@/types/campus';
import { DeterministicEngine } from './DeterministicEngine';

export class FallbackProvider implements IUnifiedAIProvider {
  name = 'Campus OS Fallback Engine';

  isConfigured(): boolean {
    return true; // Always available offline
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getAvailableModels(): Promise<string[]> {
    return ['deterministic-campus-engine'];
  }

  async chatCompletion(
    messages: LLMMessage[],
    _options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';

    let userName = 'Arjun Sharma';
    const nameMatch = systemMsg.match(/User:\s*([^|\n]+)/i);
    if (nameMatch && nameMatch[1]?.trim()) {
      userName = nameMatch[1].trim();
    }

    let userRole: any = 'student';
    if (systemMsg.includes('Role: TEACHER')) userRole = 'teacher';
    else if (systemMsg.includes('Role: ADMIN')) userRole = 'admin';

    let selectedEntity: any = undefined;
    if (systemMsg.includes('Active Document Content:') || systemMsg.includes('Authentic Extracted Document Text:')) {
      const titleMatch = systemMsg.match(/Active Document Content:\s*"([^"]+)"/i);
      const textMatch = systemMsg.match(/Authentic Extracted Document Text:\s*"""([\s\S]*?)"""/i);
      const subjectMatch = systemMsg.match(/Active Document Content:[^\n]*\(([^)]+)\)/i);
      selectedEntity = {
        title: titleMatch ? titleMatch[1] : 'Active Document',
        subject: subjectMatch ? subjectMatch[1] : 'Computer Applications',
        extractedText: textMatch ? textMatch[1].trim() : '',
      };
    }

    const res = await DeterministicEngine.process(latestUserMsg, {
      userId: 'usr-001',
      userRole,
      userName,
      department: 'BCA (Bachelor of Computer Applications)',
      semester: 5,
      currentPath: '/student-dashboard',
      currentTab: 'overview',
      selectedEntity,
    });

    return {
      text: res.answer,
      modelUsed: res.modelUsed,
      provider: 'CampusOS AI',
      durationMs: res.durationMs,
    };
  }

  async chatCompletionStream(
    messages: LLMMessage[],
    options?: LLMCompletionOptions,
    onChunk?: (chunk: LLMStreamChunk) => void
  ): Promise<LLMCompletionResult> {
    const res = await this.chatCompletion(messages, options);
    onChunk?.({ text: res.text, modelUsed: res.modelUsed, provider: this.name, done: true });
    return res;
  }

  // Legacy provider methods for backwards compatibility
  async generateResponse(
    messages: AIChatMessage[],
    _tools: AIToolDefinition[],
    context: AIContextData,
    _systemPrompt: string
  ): Promise<AIProviderResponse> {
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const userProfile: UserProfile = {
      id: context.user.id,
      email: context.user.email,
      role: context.user.role,
      fullName: context.user.name,
      name: context.user.name,
      initials: context.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CO',
      department: (context.user.department as 'BCA') || 'BCA',
      semester: context.user.semester,
      rollNumber: context.user.rollNumber,
      subjects: context.user.subjects,
    };

    const result = await CampusAgent.handleRequest({
      message: latestUserMsg,
      userProfile,
      currentPath: context.currentPage.route,
      currentTab: context.currentPage.tab,
      selectedEntity: context.selectedEntityContext,
    });

    return {
      content: result.answer,
      action: result.action,
      quizData: result.quizData,
      studyPlan: result.studyPlan,
      finishReason: 'stop',
      provider: 'fallback',
      modelUsed: 'deterministic-campus-engine',
      isOfflineFallback: true,
    };
  }

  async generateStructured<T>(
    _prompt: string,
    _systemPrompt: string,
    _schemaHint?: string
  ): Promise<T> {
    throw new Error(
      'Structured AI generation is unavailable in offline fallback mode. Please configure an active AI provider key.'
    );
  }

  async checkHealth(): Promise<ProviderStatusInfo> {
    return {
      providerName: 'Campus Intelligence (Local)',
      status: 'online',
      model: 'deterministic-campus-engine',
      isFree: true,
      message: '100% Offline Capable & Deterministic',
      latencyMs: 0,
    };
  }
}

export const fallbackProvider = new FallbackProvider();

