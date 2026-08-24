import { Role } from '@/types/campus';

export interface RouteTarget {
  route: string;
  tab?: string;
  title: string;
  allowedRoles: Role[];
}

export const VALID_CAMPUS_ROUTES: Record<string, RouteTarget> = {
  // Student routes
  'student:overview': {
    route: '/student-dashboard?tab=overview',
    tab: 'overview',
    title: 'Student Dashboard',
    allowedRoles: ['student', 'admin'],
  },
  'student:timetable': {
    route: '/student-dashboard?tab=timetable',
    tab: 'timetable',
    title: 'Class Timetable',
    allowedRoles: ['student', 'admin'],
  },
  'student:notes': {
    route: '/student-dashboard?tab=notes',
    tab: 'notes',
    title: 'Notes & Study Materials',
    allowedRoles: ['student', 'admin'],
  },
  'student:subjects': {
    route: '/student-dashboard?tab=subjects',
    tab: 'subjects',
    title: 'Enrolled Subjects',
    allowedRoles: ['student', 'admin'],
  },
  'student:exams': {
    route: '/student-dashboard?tab=exams',
    tab: 'exams',
    title: 'Exam Timetable & Schedule',
    allowedRoles: ['student', 'admin'],
  },
  'student:events': {
    route: '/student-dashboard?tab=events',
    tab: 'events',
    title: 'Campus Events',
    allowedRoles: ['student', 'admin'],
  },
  'student:announcements': {
    route: '/student-dashboard?tab=announcements',
    tab: 'announcements',
    title: 'Announcements',
    allowedRoles: ['student', 'admin'],
  },
  'student:flashcards': {
    route: '/student-dashboard?tab=flashcards',
    tab: 'flashcards',
    title: 'Revision Flashcards',
    allowedRoles: ['student', 'admin'],
  },
  'student:profile': {
    route: '/student-dashboard?tab=profile',
    tab: 'profile',
    title: 'Student Profile',
    allowedRoles: ['student', 'admin'],
  },

  // Teacher routes
  'teacher:overview': {
    route: '/teacher-dashboard?tab=overview',
    tab: 'overview',
    title: 'Faculty Dashboard',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:classes': {
    route: '/teacher-dashboard?tab=classes',
    tab: 'classes',
    title: 'My Classes & Courses',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:attendance': {
    route: '/teacher-dashboard?tab=attendance',
    tab: 'attendance',
    title: 'Attendance Register',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:assignments': {
    route: '/teacher-dashboard?tab=assignments',
    tab: 'assignments',
    title: 'Assignments & Grading',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:notes': {
    route: '/teacher-dashboard?tab=notes',
    tab: 'notes',
    title: 'Upload Notes & Materials',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:papers': {
    route: '/teacher-dashboard?tab=papers',
    tab: 'papers',
    title: 'Question Papers Archive',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:aigen': {
    route: '/teacher-dashboard?tab=aigen',
    tab: 'aigen',
    title: 'AI Assessment Generator',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:timetable': {
    route: '/teacher-dashboard?tab=timetable',
    tab: 'timetable',
    title: 'Faculty Teaching Schedule',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:profile': {
    route: '/teacher-dashboard?tab=profile',
    tab: 'profile',
    title: 'Faculty Profile',
    allowedRoles: ['teacher', 'admin'],
  },

  // Admin routes
  'admin:overview': {
    route: '/admin-dashboard?tab=overview',
    tab: 'overview',
    title: 'Institutional Dashboard',
    allowedRoles: ['admin'],
  },
  'admin:students': {
    route: '/admin-dashboard?tab=students',
    tab: 'students',
    title: 'Student Directory',
    allowedRoles: ['admin'],
  },
  'admin:teachers': {
    route: '/admin-dashboard?tab=teachers',
    tab: 'teachers',
    title: 'Faculty Directory',
    allowedRoles: ['admin'],
  },
  'admin:subjects': {
    route: '/admin-dashboard?tab=subjects',
    tab: 'subjects',
    title: 'Departments & Subjects',
    allowedRoles: ['admin'],
  },
  'admin:announcements': {
    route: '/admin-dashboard?tab=announcements',
    tab: 'announcements',
    title: 'Campus Announcements Management',
    allowedRoles: ['admin'],
  },
  'admin:events': {
    route: '/admin-dashboard?tab=events',
    tab: 'events',
    title: 'Events Calendar Management',
    allowedRoles: ['admin'],
  },
  'admin:reports': {
    route: '/admin-dashboard?tab=reports',
    tab: 'reports',
    title: 'Institutional Reports',
    allowedRoles: ['admin'],
  },
  'admin:copilot': {
    route: '/admin-dashboard?tab=copilot',
    tab: 'copilot',
    title: 'Admin AI Surveillance Copilot',
    allowedRoles: ['admin'],
  },
  'admin:settings': {
    route: '/admin-dashboard?tab=settings',
    tab: 'settings',
    title: 'Platform Settings',
    allowedRoles: ['admin'],
  },
};

export class AINavigationManager {
  /**
   * Resolves a natural-language navigation request or key to a validated internal route.
   */
  static resolveNavigation(
    target: string,
    userRole: Role
  ): { valid: boolean; route?: string; title?: string; message?: string } {
    const normalized = target.toLowerCase().trim();

    // 1. Direct match with keys
    if (VALID_CAMPUS_ROUTES[target]) {
      const match = VALID_CAMPUS_ROUTES[target];
      if (match.allowedRoles.includes(userRole)) {
        return { valid: true, route: match.route, title: match.title };
      }
    }

    // 2. Keyword heuristic mapping
    if (userRole === 'student') {
      if (
        normalized.includes('timetable') ||
        normalized.includes('schedule') ||
        normalized.includes('class time')
      ) {
        return { valid: true, route: '/student-dashboard?tab=timetable', title: 'Class Timetable' };
      }
      if (
        normalized.includes('note') ||
        normalized.includes('doc') ||
        normalized.includes('material') ||
        normalized.includes('pdf')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=notes',
          title: 'Notes & Study Materials',
        };
      }
      if (
        normalized.includes('subject') ||
        normalized.includes('course') ||
        normalized.includes('syllabus')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=subjects',
          title: 'Enrolled Subjects',
        };
      }
      if (
        normalized.includes('exam') ||
        normalized.includes('test date') ||
        normalized.includes('hall ticket')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=exams',
          title: 'Exam Timetable & Schedule',
        };
      }
      if (
        normalized.includes('event') ||
        normalized.includes('hackathon') ||
        normalized.includes('fest')
      ) {
        return { valid: true, route: '/student-dashboard?tab=events', title: 'Campus Events' };
      }
      if (
        normalized.includes('announcement') ||
        normalized.includes('notice') ||
        normalized.includes('news')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=announcements',
          title: 'Announcements',
        };
      }
      if (
        normalized.includes('flashcard') ||
        normalized.includes('revision') ||
        normalized.includes('card')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=flashcards',
          title: 'Revision Flashcards',
        };
      }
      if (
        normalized.includes('profile') ||
        normalized.includes('account') ||
        normalized.includes('my info')
      ) {
        return { valid: true, route: '/student-dashboard?tab=profile', title: 'Student Profile' };
      }
      if (
        normalized.includes('dashboard') ||
        normalized.includes('home') ||
        normalized.includes('overview')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=overview',
          title: 'Student Dashboard',
        };
      }
    }

    if (userRole === 'teacher') {
      if (
        normalized.includes('attendance') ||
        normalized.includes('register') ||
        normalized.includes('roll call')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=attendance',
          title: 'Attendance Register',
        };
      }
      if (
        normalized.includes('assignment') ||
        normalized.includes('submission') ||
        normalized.includes('grade') ||
        normalized.includes('grading')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=assignments',
          title: 'Assignments & Grading',
        };
      }
      if (
        normalized.includes('paper') ||
        normalized.includes('question paper') ||
        normalized.includes('exam question')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=papers',
          title: 'Question Papers Archive',
        };
      }
      if (
        normalized.includes('aigen') ||
        normalized.includes('generate paper') ||
        normalized.includes('generator')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=aigen',
          title: 'AI Assessment Generator',
        };
      }
      if (
        normalized.includes('class') ||
        normalized.includes('student list') ||
        normalized.includes('batches')
      ) {
        return { valid: true, route: '/teacher-dashboard?tab=classes', title: 'My Classes' };
      }
      if (
        normalized.includes('note') ||
        normalized.includes('upload') ||
        normalized.includes('publish')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=notes',
          title: 'Upload Notes & Materials',
        };
      }
      if (
        normalized.includes('schedule') ||
        normalized.includes('timetable') ||
        normalized.includes('slots')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=timetable',
          title: 'Teaching Schedule',
        };
      }
      if (
        normalized.includes('dashboard') ||
        normalized.includes('home') ||
        normalized.includes('overview')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=overview',
          title: 'Faculty Dashboard',
        };
      }
    }

    if (userRole === 'admin') {
      if (
        normalized.includes('user') ||
        normalized.includes('student') ||
        normalized.includes('directory')
      ) {
        return { valid: true, route: '/admin-dashboard?tab=students', title: 'Student Directory' };
      }
      if (normalized.includes('teacher') || normalized.includes('faculty')) {
        return { valid: true, route: '/admin-dashboard?tab=teachers', title: 'Faculty Directory' };
      }
      if (
        normalized.includes('department') ||
        normalized.includes('subject') ||
        normalized.includes('branch')
      ) {
        return {
          valid: true,
          route: '/admin-dashboard?tab=subjects',
          title: 'Departments & Subjects',
        };
      }
      if (
        normalized.includes('report') ||
        normalized.includes('analytics') ||
        normalized.includes('metric')
      ) {
        return {
          valid: true,
          route: '/admin-dashboard?tab=reports',
          title: 'Institutional Reports',
        };
      }
      if (
        normalized.includes('copilot') ||
        normalized.includes('anomaly') ||
        normalized.includes('surveillance')
      ) {
        return {
          valid: true,
          route: '/admin-dashboard?tab=copilot',
          title: 'Admin AI Surveillance Copilot',
        };
      }
      if (
        normalized.includes('setting') ||
        normalized.includes('config') ||
        normalized.includes('system')
      ) {
        return { valid: true, route: '/admin-dashboard?tab=settings', title: 'Platform Settings' };
      }
      if (normalized.includes('announcement') || normalized.includes('broadcast')) {
        return {
          valid: true,
          route: '/admin-dashboard?tab=announcements',
          title: 'Announcements Management',
        };
      }
      if (
        normalized.includes('dashboard') ||
        normalized.includes('home') ||
        normalized.includes('overview')
      ) {
        return {
          valid: true,
          route: '/admin-dashboard?tab=overview',
          title: 'Institutional Dashboard',
        };
      }
    }

    // Safety fallback: only internal dashboard route
    const safeDefault =
      userRole === 'admin'
        ? '/admin-dashboard'
        : userRole === 'teacher'
          ? '/teacher-dashboard'
          : '/student-dashboard';
    return { valid: true, route: safeDefault, title: 'Dashboard' };
  }
}
