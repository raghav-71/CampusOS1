import { Role } from '@/types/campus';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export class AIPermissionsManager {
  /**
   * Validates if a user role is authorized to execute a given tool.
   */
  static checkToolPermission(toolName: string, role: Role): PermissionCheckResult {
    // Universal tools accessible to all roles
    const universalTools = [
      'searchCampusData',
      'searchCampus',
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
      'getAnnouncements',
      'getEvents',
      'getDepartments',
      'navigateToRoute',
      'generateStudyPlan',
      'generateQuiz',
    ];

    if (universalTools.includes(toolName)) {
      return { allowed: true };
    }

    // Faculty-specific tools
    if (role === 'teacher') {
      const facultyTools = [
        'getFacultyClasses',
        'getFacultyStudents',
        'getFacultyAssignments',
        'getSubmissions',
        'generateQuestionPaper',
        'analyzeClassAttendance',
        'getAuditLogs',
      ];
      if (facultyTools.includes(toolName)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Faculty members are not authorized to view root institutional settings or modify system administrator records.',
      };
    }

    // Admin has access to all tools
    if (role === 'admin') {
      return { allowed: true };
    }

    // Students are denied faculty/admin tools
    return {
      allowed: false,
      reason: `Access Denied: Your role '${role}' is not authorized to execute administrative or faculty tool '${toolName}'.`,
    };
  }

  static canRoleAccessTool(role: string, toolName: string): boolean {
    const res = this.checkToolPermission(toolName, role as Role);
    return res.allowed;
  }

  /**
   * Sanitizes target student ID to enforce strict student privacy.
   * A student can NEVER query another student's data.
   */
  static sanitizeTargetStudent(
    requestedStudentId: string | undefined,
    currentUserId: string,
    role: Role
  ): string {
    if (role === 'student') {
      return currentUserId;
    }
    return requestedStudentId || currentUserId;
  }

  /**
   * Inspects a query for cross-user permission violations before any LLM processing.
   */
  static checkQueryPermission(query: string, role: Role): PermissionCheckResult {
    const q = query.toLowerCase();

    if (role === 'student') {
      if (
        (q.includes('another student') ||
          q.includes('other student') ||
          q.includes("someone else's") ||
          q.includes("friend's marks") ||
          q.includes("classmate's marks") ||
          q.includes("other's attendance") ||
          q.includes("classmate's attendance") ||
          q.includes('another student’s')) &&
        (q.includes('marks') ||
          q.includes('attendance') ||
          q.includes('grades') ||
          q.includes('records') ||
          q.includes('profile'))
      ) {
        return {
          allowed: false,
          reason: 'Privacy Policy Violation: You are not authorized to view another student’s private grades, attendance, or academic records.',
        };
      }

      if (
        q.includes('audit log') ||
        q.includes('security log') ||
        q.includes('server log') ||
        q.includes('admin settings') ||
        q.includes('delete user')
      ) {
        return {
          allowed: false,
          reason: 'Access Denied: Administrative system logs and controls require Administrator role privileges.',
        };
      }
    }

    return { allowed: true };
  }
}
