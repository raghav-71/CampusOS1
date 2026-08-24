import { UserProfile } from '@/types/campus';
import { AIContextData } from './aiTypes';

export class AIContextBuilder {
  /**
   * Constructs dynamic runtime context for the AI prompt and tool execution.
   */
  static buildContext(
    userProfile: UserProfile,
    currentPath: string = '/student-dashboard',
    currentTab: string = 'overview',
    selectedContext?: Record<string, any>,
    recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AIContextData {
    return {
      user: {
        id: userProfile.id || 'usr-default',
        email: userProfile.email || 'student@campusos.edu',
        name: userProfile.fullName || userProfile.name || 'Campus Member',
        role: userProfile.role || 'student',
        department: userProfile.department || 'Computer Applications (BCA)',
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
        title: this.getPageTitle(currentPath, currentTab),
      },
      selectedContext,
      recentHistory,
    };
  }

  private static getPageTitle(path: string, tab: string): string {
    if (path.includes('admin')) return `Admin Dashboard (${tab})`;
    if (path.includes('teacher')) return `Faculty Dashboard (${tab})`;
    return `Student Dashboard (${tab})`;
  }
}
