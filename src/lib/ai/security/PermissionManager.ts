/**
 * Campus OS AI Permission Manager
 * Enforces Read vs Write vs Navigation permission levels and role-based data boundaries.
 */

import { Role } from '@/types/campus';

export type PermissionLevel = 'READ' | 'NAVIGATION' | 'WRITE' | 'ADMIN';

export interface PermissionEvaluation {
  allowed: boolean;
  level: PermissionLevel;
  requiresUserConfirmation: boolean;
  reason?: string;
}

export class PermissionManager {
  /**
   * Evaluates permissions for a requested operation or tool call.
   */
  static evaluate(operationName: string, role: Role = 'student'): PermissionEvaluation {
    const op = operationName.toLowerCase().trim();

    // 1. Navigation operations -> Allowed automatically for all authenticated roles
    if (
      op.startsWith('navigate') ||
      op.includes('open_tab') ||
      op.includes('go_to') ||
      op === 'navigate_to_page'
    ) {
      return {
        allowed: true,
        level: 'NAVIGATION',
        requiresUserConfirmation: false,
      };
    }

    // 2. Read-Only Academic Operations -> Allowed automatically within role scope
    const readOperations = [
      'get_student_profile',
      'get_subjects',
      'get_student_attendance',
      'get_exam_schedule',
      'get_marks_and_performance',
      'get_today_timetable',
      'get_next_class',
      'search_academic_documents',
      'get_question_papers',
      'calculate_academic_study_plan',
      'calculate_expression',
      'explain_code',
      'find_bugs',
      'optimize_code',
      'generate_tests',
      'explain_error',
    ];

    if (readOperations.some((ro) => op.includes(ro.toLowerCase()))) {
      return {
        allowed: true,
        level: 'READ',
        requiresUserConfirmation: false,
      };
    }

    // 3. Faculty-Scoped Read Tools
    const facultyReadOperations = [
      'get_teacher_assigned_classes',
      'get_students_at_attendance_risk',
      'generate_question_paper',
      'generate_viva_questions',
      'get_class_attendance_summary',
    ];

    if (facultyReadOperations.some((fo) => op.includes(fo.toLowerCase()))) {
      const allowed = role === 'teacher' || role === 'admin';
      return {
        allowed,
        level: 'READ',
        requiresUserConfirmation: false,
        reason: allowed ? undefined : 'Student accounts are not authorized to access faculty-scoped class registers.',
      };
    }

    // 4. Admin Read Tools
    const adminReadOperations = ['get_institutional_metrics', 'get_audit_logs', 'get_department_analytics'];
    if (adminReadOperations.some((ao) => op.includes(ao.toLowerCase()))) {
      const allowed = role === 'admin';
      return {
        allowed,
        level: 'ADMIN',
        requiresUserConfirmation: false,
        reason: allowed ? undefined : 'Institutional metrics require Administrator role permissions.',
      };
    }

    // 5. Write Operations -> Require User Confirmation
    const writeOperations = [
      'create_announcement',
      'submit_assignment',
      'grade_submission',
      'start_class',
      'upload_question_paper',
      'delete_note',
      'modify_record',
    ];

    if (writeOperations.some((wo) => op.includes(wo.toLowerCase()))) {
      const isTeacherOrAdmin = role === 'teacher' || role === 'admin';
      if (op.includes('announcement') && !isTeacherOrAdmin) {
        return {
          allowed: false,
          level: 'WRITE',
          requiresUserConfirmation: true,
          reason: 'Only faculty and administrators can broadcast campus announcements.',
        };
      }

      return {
        allowed: true,
        level: 'WRITE',
        requiresUserConfirmation: true, // Write actions MUST require explicit confirmation
      };
    }

    // Default safe fallback
    return {
      allowed: true,
      level: 'READ',
      requiresUserConfirmation: false,
    };
  }

  /**
   * Sanitizes query intent to prevent unauthorized role escalation or prompt injection.
   */
  static isQuerySafe(query: string): boolean {
    const dangerousPatterns = [
      /\b(eval\(|process\.env|__dirname|<script|drop table|delete from users|format c:)\b/i,
      /\b(steal tokens|bypass auth|show me all passwords|dump database)\b/i,
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(query));
  }
}
