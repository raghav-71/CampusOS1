import { Role } from '@/types/campus';

export type Permission =
  // Student permissions
  | 'student:read_notes'
  | 'student:view_schedule'
  | 'student:submit_assignment'
  | 'student:ask_ai'
  | 'student:view_announcements'
  | 'student:view_exams'
  // Teacher permissions
  | 'teacher:mark_attendance'
  | 'teacher:upload_notes'
  | 'teacher:create_assignment'
  | 'teacher:grade_submissions'
  | 'teacher:generate_ai_papers'
  | 'teacher:manage_classes'
  // Admin permissions
  | 'admin:manage_users'
  | 'admin:manage_curriculum'
  | 'admin:publish_announcements'
  | 'admin:view_audit_logs'
  | 'admin:system_settings'
  | 'admin:export_reports';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: [
    'student:read_notes',
    'student:view_schedule',
    'student:submit_assignment',
    'student:ask_ai',
    'student:view_announcements',
    'student:view_exams',
  ],
  teacher: [
    'student:read_notes',
    'student:view_schedule',
    'student:view_announcements',
    'teacher:mark_attendance',
    'teacher:upload_notes',
    'teacher:create_assignment',
    'teacher:grade_submissions',
    'teacher:generate_ai_papers',
    'teacher:manage_classes',
  ],
  admin: [
    'student:read_notes',
    'student:view_schedule',
    'student:view_announcements',
    'student:view_exams',
    'teacher:mark_attendance',
    'teacher:upload_notes',
    'teacher:create_assignment',
    'teacher:grade_submissions',
    'teacher:generate_ai_papers',
    'teacher:manage_classes',
    'admin:manage_users',
    'admin:manage_curriculum',
    'admin:publish_announcements',
    'admin:view_audit_logs',
    'admin:system_settings',
    'admin:export_reports',
  ],
};

export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getRoleHomeRoute(role: Role | undefined | null): string {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'teacher':
      return '/teacher-dashboard';
    case 'student':
    default:
      return '/student-dashboard';
  }
}

export function canAccessRoute(role: Role | undefined | null, pathname: string): boolean {
  if (!role) return false;

  if (pathname.startsWith('/admin-dashboard')) {
    return role === 'admin';
  }
  if (pathname.startsWith('/teacher-dashboard')) {
    return role === 'teacher' || role === 'admin';
  }
  if (pathname.startsWith('/student-dashboard')) {
    return role === 'student' || role === 'teacher' || role === 'admin';
  }
  return true;
}
