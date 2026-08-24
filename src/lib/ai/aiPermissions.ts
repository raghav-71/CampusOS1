import { Role } from '@/types/campus';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export class AIPermissionsManager {
  /**
   * Validates if a user with a given role can invoke a specific tool.
   */
  static checkToolPermission(toolName: string, role: Role): PermissionCheckResult {
    // Universal tools accessible to all authenticated users
    const publicTools = [
      'searchCampus',
      'searchCampusData',
      'getCurrentUser',
      'getStudentProfile',
      'getStudentSubjects',
      'getStudentTimetable',
      'getStudentExams',
      'getStudentAttendance',
      'getStudentAssignments',
      'getStudentGrades',
      'getStudentNotes',
      'getStudentFlashcards',
      'getNotes',
      'getFlashcards',
      'getAnnouncements',
      'getEvents',
      'getDepartments',
      'navigateToRoute',
      'generateStudyPlan',
      'generateQuiz',
    ];

    if (publicTools.includes(toolName)) {
      return { allowed: true };
    }

    // Faculty specific permissions
    if (role === 'teacher') {
      const facultyTools = [
        'getFacultyClasses',
        'getFacultyStudents',
        'getFacultyAssignments',
        'getSubmissions',
        'getGrades',
        'generateQuestionPaper',
        'analyzeClassAttendance',
      ];
      if (facultyTools.includes(toolName)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          'Faculty members do not have permission to view institutional root settings or financial/audit administration logs.',
      };
    }

    // Admin has access to all tools
    if (role === 'admin') {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Invalid or unauthorized role.' };
  }

  static canRoleAccessTool(role: string, toolName: string): boolean {
    const res = this.checkToolPermission(toolName, role as Role);
    return res.allowed;
  }

  /**
   * Sanitizes tool queries so students cannot query another student's data.
   */
  static sanitizeTargetStudent(
    requestedStudentId: string | undefined,
    currentUserId: string,
    role: Role
  ): string {
    if (role === 'student') {
      // Force student to only query their own data
      return currentUserId;
    }
    return requestedStudentId || currentUserId;
  }
}
