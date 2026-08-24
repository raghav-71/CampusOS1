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
      'searchCampusData',
      'getStudentSubjects',
      'getStudentTimetable',
      'getStudentExams',
      'getAnnouncements',
      'getEvents',
      'getNotes',
      'getFlashcards',
      'navigateToRoute',
      'generateStudyPlan',
      'generateQuiz',
    ];

    if (publicTools.includes(toolName)) {
      return { allowed: true };
    }

    // Student specific permissions
    if (role === 'student') {
      const studentOnlyTools = [
        'getStudentProfile',
        'getStudentAttendance',
        'getStudentAssignments',
        'getStudentGrades',
      ];
      if (studentOnlyTools.includes(toolName)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          'Students do not have permission to access faculty grading records or administrative institutional analytics.',
      };
    }

    // Faculty specific permissions
    if (role === 'teacher') {
      const facultyTools = [
        'getStudentProfile',
        'getStudentAttendance',
        'getStudentAssignments',
        'getFacultyClasses',
        'getFacultyStudents',
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
