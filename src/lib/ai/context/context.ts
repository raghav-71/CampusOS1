import { UserProfile } from '@/types/campus';
import { AIContextData } from '../aiTypes';
import { PageContextManager } from './pageContext';

export class AIContextBuilder {
  /**
   * Constructs runtime context for the agent, planner, and LLM reasoning.
   */
  static async buildContext(
    userProfile: UserProfile,
    currentPath: string = '/student-dashboard',
    currentTab: string = 'overview',
    selectedEntity?: Record<string, any>,
    recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIContextData> {
    const role = userProfile.role || 'student';

    const pageIntelligence = await PageContextManager.extractPageContext(
      currentPath,
      currentTab,
      selectedEntity,
      role
    );

    const userName = userProfile.fullName || (userProfile as any).name || 'Campus Member';
    const email = userProfile.email || `${userName.toLowerCase().replace(/\s+/g, '.')}@campusos.edu`;

    return {
      userId: userProfile.id || 'usr-default',
      userName,
      userRole: role,
      department: userProfile.department || 'BCA',
      semester: userProfile.semester || 'Sem 5',
      user: {
        id: userProfile.id || 'usr-default',
        email,
        name: userName,
        role,
        department: userProfile.department || 'BCA',
        semester: userProfile.semester || 'Sem 5',
        rollNumber: userProfile.rollNumber || 'BCA2401',
        subjects: userProfile.subjects || [
          'Operating Systems',
          'DBMS',
          'Computer Networks',
          'Java Programming',
          'DAA',
        ],
      },
      currentPage: {
        route: currentPath,
        tab: currentTab,
        title: pageIntelligence.title,
      },
      selectedEntityContext: selectedEntity,
      visibleDataContext: pageIntelligence.visibleDataSummary,
      selectedContext: selectedEntity,
      recentHistory,
    };
  }
}
