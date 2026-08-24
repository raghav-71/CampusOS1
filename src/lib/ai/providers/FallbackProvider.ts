import { AIChatMessage, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from '../provider/types';
import { CampusAgent } from '../agent/campusAgent';
import { UserProfile } from '@/types/campus';

export class FallbackProvider implements AIProvider {
  name = 'fallback';

  isConfigured(): boolean {
    return true; // Always available offline
  }

  async generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse> {
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const userProfile: UserProfile = {
      id: context.user.id,
      email: context.user.email,
      role: context.user.role,
      fullName: context.user.name,
      name: context.user.name,
      initials: context.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CO',
      department: context.user.department,
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
    prompt: string,
    systemPrompt: string,
    schemaHint?: string
  ): Promise<T> {
    throw new Error(
      'Structured AI generation is unavailable in offline fallback mode. Please configure OPENROUTER_API_KEY.'
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
