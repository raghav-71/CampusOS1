/**
 * Campus OS AI Action Registry
 * Defines all approved safe UI navigation and interaction actions.
 * Ensures the LLM cannot execute arbitrary code and only approved routes/actions are dispatched.
 */

import { Role } from '@/types/campus';

export interface AIAction {
  type: string;
  label: string;
  route?: string;
  payload?: Record<string, any>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface ActionDefinition {
  type: string;
  description: string;
  allowedRoles: Role[];
  getRoute: (role: Role, payload?: any) => string;
  getLabel: (payload?: any) => string;
  requiresConfirmation?: boolean;
}

export class ActionRegistry {
  private static actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>([
    [
      'navigate_to_timetable',
      {
        type: 'navigate_to_timetable',
        description: 'Navigate to user class timetable or teaching schedule',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) => (role === 'teacher' ? '/teacher-dashboard?tab=timetable' : '/student-dashboard?tab=timetable'),
        getLabel: () => 'Open Timetable',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_attendance',
      {
        type: 'navigate_to_attendance',
        description: 'Navigate to student attendance or faculty attendance register',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) => (role === 'teacher' ? '/teacher-dashboard?tab=attendance' : '/student-dashboard?tab=attendance'),
        getLabel: () => 'Open Attendance',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_exams',
      {
        type: 'navigate_to_exams',
        description: 'Navigate to exam schedule and performance records',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) => (role === 'teacher' ? '/teacher-dashboard?tab=exams' : '/student-dashboard?tab=exams'),
        getLabel: () => 'Open Exam Schedule',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_subjects',
      {
        type: 'navigate_to_subjects',
        description: 'Navigate to curriculum subjects and syllabus progress',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) => (role === 'teacher' ? '/teacher-dashboard?tab=subjects' : '/student-dashboard?tab=subjects'),
        getLabel: (payload: any) => (payload?.subject ? `View ${payload.subject}` : 'Open Subjects'),
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_notes',
      {
        type: 'navigate_to_notes',
        description: 'Navigate to lecture notes and study resources',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) => (role === 'teacher' ? '/teacher-dashboard?tab=notes' : '/student-dashboard?tab=notes'),
        getLabel: () => 'Open Notes Library',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_announcements',
      {
        type: 'navigate_to_announcements',
        description: 'Navigate to campus notices and announcements',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) =>
          role === 'admin'
            ? '/admin-dashboard?tab=announcements'
            : role === 'teacher'
            ? '/teacher-dashboard?tab=announcements'
            : '/student-dashboard?tab=announcements',
        getLabel: () => 'Open Announcements',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_code_lab',
      {
        type: 'navigate_to_code_lab',
        description: 'Open interactive programming environment Code Lab',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: () => '/code-lab',
        getLabel: () => 'Open Code Lab',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_profile',
      {
        type: 'navigate_to_profile',
        description: 'Navigate to user profile and overview dashboard',
        allowedRoles: ['student', 'teacher', 'admin'],
        getRoute: (role: Role) =>
          role === 'admin' ? '/admin-dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard',
        getLabel: () => 'Open Profile Overview',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_papers',
      {
        type: 'navigate_to_papers',
        description: 'Navigate to question paper generator and repository',
        allowedRoles: ['teacher', 'admin'],
        getRoute: () => '/teacher-dashboard?tab=papers',
        getLabel: () => 'Open Question Papers',
        requiresConfirmation: false,
      },
    ],
    [
      'navigate_to_analytics',
      {
        type: 'navigate_to_analytics',
        description: 'Navigate to institutional intelligence and analytics',
        allowedRoles: ['admin', 'teacher'],
        getRoute: (role: Role) => (role === 'admin' ? '/admin-dashboard?tab=analytics' : '/teacher-dashboard?tab=analytics'),
        getLabel: () => 'Open Analytics Dashboard',
        requiresConfirmation: false,
      },
    ],
    [
      'confirm_write_announcement',
      {
        type: 'confirm_write_announcement',
        description: 'Create an official institutional announcement',
        allowedRoles: ['admin', 'teacher'],
        getRoute: () => '/admin-dashboard?tab=announcements',
        getLabel: () => 'Broadcast Announcement',
        requiresConfirmation: true,
      },
    ],
  ]);

  /**
   * Checks if an action type is registered and allowed for the user's role.
   */
  static isAllowedAction(actionType: string, role: Role): boolean {
    const def = this.actions.get(actionType);
    if (!def) return false;
    return def.allowedRoles.includes(role);
  }

  /**
   * Resolves an action into a validated executable AIAction payload.
   */
  static resolveAction(actionType: string, role: Role, payload?: Record<string, any>): AIAction | null {
    const cleanType = actionType.toLowerCase().trim().replace(/^action_/, '');
    const def = this.actions.get(cleanType);
    if (!def || !def.allowedRoles.includes(role)) {
      return null;
    }

    return {
      type: def.type,
      label: def.getLabel(payload),
      route: def.getRoute(role, payload),
      payload,
      requiresConfirmation: def.requiresConfirmation || false,
    };
  }

  /**
   * Returns all available navigation action definitions for a given role.
   */
  static getAvailableActionsForRole(role: Role): ActionDefinition[] {
    return Array.from(this.actions.values()).filter((a) => a.allowedRoles.includes(role));
  }
}
