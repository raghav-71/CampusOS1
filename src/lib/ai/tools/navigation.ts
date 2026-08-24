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
    title: 'Student Dashboard Overview',
    allowedRoles: ['student', 'admin'],
  },
  'student:timetable': {
    route: '/student-dashboard?tab=timetable',
    tab: 'timetable',
    title: 'Class Timetable',
    allowedRoles: ['student', 'admin'],
  },
  'student:attendance': {
    route: '/student-dashboard?tab=attendance',
    tab: 'attendance',
    title: 'Attendance Sheet',
    allowedRoles: ['student', 'admin'],
  },
  'student:assignments': {
    route: '/student-dashboard?tab=assignments',
    tab: 'assignments',
    title: 'Student Assignments',
    allowedRoles: ['student', 'admin'],
  },
  'student:exams': {
    route: '/student-dashboard?tab=exams',
    tab: 'exams',
    title: 'Examination Schedule',
    allowedRoles: ['student', 'admin'],
  },
  'student:notes': {
    route: '/student-dashboard?tab=notes',
    tab: 'notes',
    title: 'Lecture Notes Library',
    allowedRoles: ['student', 'admin'],
  },
  'student:subjects': {
    route: '/student-dashboard?tab=subjects',
    tab: 'subjects',
    title: 'Enrolled Subjects',
    allowedRoles: ['student', 'admin'],
  },
  'student:flashcards': {
    route: '/student-dashboard?tab=flashcards',
    tab: 'flashcards',
    title: 'Revision Flashcards',
    allowedRoles: ['student', 'admin'],
  },
  'student:announcements': {
    route: '/student-dashboard?tab=announcements',
    tab: 'announcements',
    title: 'Announcements Feed',
    allowedRoles: ['student', 'admin'],
  },
  'student:events': {
    route: '/student-dashboard?tab=events',
    tab: 'events',
    title: 'Campus Events',
    allowedRoles: ['student', 'admin'],
  },
  'student:profile': {
    route: '/student-dashboard?tab=profile',
    tab: 'profile',
    title: 'Student Profile',
    allowedRoles: ['student', 'admin'],
  },

  // Faculty routes
  'teacher:overview': {
    route: '/teacher-dashboard?tab=overview',
    tab: 'overview',
    title: 'Faculty Dashboard Overview',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:classes': {
    route: '/teacher-dashboard?tab=classes',
    tab: 'classes',
    title: 'My Classes & Courses',
    allowedRoles: ['teacher', 'admin'],
  },
  'teacher:timetable': {
    route: '/teacher-dashboard?tab=timetable',
    tab: 'timetable',
    title: 'Teaching Schedule',
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
    title: 'Upload Study Materials',
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
    title: 'Institutional Administration Overview',
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
  'admin:departments': {
    route: '/admin-dashboard?tab=departments',
    tab: 'departments',
    title: 'Academic Departments',
    allowedRoles: ['admin'],
  },
  'admin:attendance': {
    route: '/admin-dashboard?tab=attendance',
    tab: 'attendance',
    title: 'Campus Attendance Monitoring',
    allowedRoles: ['admin'],
  },
  'admin:announcements': {
    route: '/admin-dashboard?tab=announcements',
    tab: 'announcements',
    title: 'Campus Circulars & Broadcasts',
    allowedRoles: ['admin'],
  },
  'admin:analytics': {
    route: '/admin-dashboard?tab=analytics',
    tab: 'analytics',
    title: 'Institutional Analytics',
    allowedRoles: ['admin'],
  },
  'admin:audit': {
    route: '/admin-dashboard?tab=audit',
    tab: 'audit',
    title: 'Security & Audit Logs',
    allowedRoles: ['admin'],
  },
  'admin:copilot': {
    route: '/admin-dashboard?tab=copilot',
    tab: 'copilot',
    title: 'Admin AI Copilot',
    allowedRoles: ['admin'],
  },
};

export class AINavigationManager {
  /**
   * Resolves a user's natural language command into an authorized internal route.
   */
  static parseNavigationIntent(
    query: string,
    role: Role
  ): { route: string; label: string } | null {
    const q = query.toLowerCase().trim();

    // Student / General matches
    if (q.includes('timetable') || q.includes('schedule') || q.includes('routine')) {
      if (role === 'teacher') {
        return { route: '/teacher-dashboard?tab=timetable', label: 'Teaching Schedule' };
      }
      return { route: '/student-dashboard?tab=timetable', label: 'Class Timetable' };
    }

    if (q.includes('attendance') || q.includes('attendance sheet') || q.includes('register')) {
      if (role === 'teacher') {
        return { route: '/teacher-dashboard?tab=attendance', label: 'Attendance Register' };
      }
      if (role === 'admin') {
        return { route: '/admin-dashboard?tab=attendance', label: 'Institutional Attendance' };
      }
      return { route: '/student-dashboard?tab=attendance', label: 'Attendance Portal' };
    }

    if (q.includes('exam') || q.includes('test dates') || q.includes('finals')) {
      return { route: '/student-dashboard?tab=exams', label: 'Exam Schedule' };
    }

    if (q.includes('assignment') || q.includes('homework') || q.includes('submission')) {
      if (role === 'teacher') {
        return { route: '/teacher-dashboard?tab=assignments', label: 'Assignments Portal' };
      }
      return { route: '/student-dashboard?tab=assignments', label: 'My Assignments' };
    }

    if (q.includes('note') || q.includes('pdf') || q.includes('slides') || q.includes('study material')) {
      if (role === 'teacher') {
        return { route: '/teacher-dashboard?tab=notes', label: 'Notes Management' };
      }
      return { route: '/student-dashboard?tab=notes', label: 'Notes Library' };
    }

    if (q.includes('subject') || q.includes('course') || q.includes('curriculum')) {
      if (role === 'teacher') {
        return { route: '/teacher-dashboard?tab=classes', label: 'My Classes' };
      }
      return { route: '/student-dashboard?tab=subjects', label: 'Enrolled Subjects' };
    }

    if (q.includes('flashcard') || q.includes('revision card')) {
      return { route: '/student-dashboard?tab=flashcards', label: 'Flashcards Revision' };
    }

    if (q.includes('announcement') || q.includes('notice') || q.includes('circular')) {
      if (role === 'admin') {
        return { route: '/admin-dashboard?tab=announcements', label: 'Announcements Manager' };
      }
      return { route: '/student-dashboard?tab=announcements', label: 'Campus Announcements' };
    }

    if (q.includes('event') || q.includes('fest') || q.includes('hackathon')) {
      return { route: '/student-dashboard?tab=events', label: 'Campus Events' };
    }

    if (q.includes('question paper') || q.includes('paper generator') || q.includes('assessment engine')) {
      return { route: '/teacher-dashboard?tab=aigen', label: 'AI Assessment Generator' };
    }

    if (q.includes('student directory') || (role === 'admin' && q.includes('students'))) {
      return { route: '/admin-dashboard?tab=students', label: 'Student Directory' };
    }

    if (q.includes('faculty directory') || (role === 'admin' && q.includes('teachers'))) {
      return { route: '/admin-dashboard?tab=teachers', label: 'Faculty Directory' };
    }

    if (q.includes('department') || (role === 'admin' && q.includes('depts'))) {
      return { route: '/admin-dashboard?tab=departments', label: 'Department Overview' };
    }

    if (q.includes('audit') || q.includes('log')) {
      return { route: '/admin-dashboard?tab=audit', label: 'Audit Logs' };
    }

    if (q.includes('copilot') || (role === 'admin' && q.includes('admin ai'))) {
      return { route: '/admin-dashboard?tab=copilot', label: 'Admin Copilot' };
    }

    if (q.includes('profile') || q.includes('my account')) {
      if (role === 'teacher') return { route: '/teacher-dashboard?tab=profile', label: 'Faculty Profile' };
      return { route: '/student-dashboard?tab=profile', label: 'Student Profile' };
    }

    if (q.includes('dashboard') || q.includes('home')) {
      if (role === 'teacher') return { route: '/teacher-dashboard?tab=overview', label: 'Faculty Dashboard' };
      if (role === 'admin') return { route: '/admin-dashboard?tab=overview', label: 'Admin Central' };
      return { route: '/student-dashboard?tab=overview', label: 'Student Dashboard' };
    }

    return null;
  }

  /**
   * Sanitizes and verifies that a target route is an authorized internal route.
   */
  static resolveSafeRoute(route: string, userRole: string): string | null {
    if (!route || typeof route !== 'string') return null;
    if (route.startsWith('http://') || route.startsWith('https://') || route.startsWith('//')) {
      return null; // Forbid external redirects
    }

    for (const key in VALID_CAMPUS_ROUTES) {
      const target = VALID_CAMPUS_ROUTES[key];
      if (route.startsWith(target.route) || target.route.startsWith(route)) {
        if (target.allowedRoles.includes(userRole as Role)) {
          return target.route;
        }
      }
    }

    // Role dashboard fallback
    if (route.startsWith('/student-dashboard') && (userRole === 'student' || userRole === 'admin')) {
      return route;
    }
    if (route.startsWith('/teacher-dashboard') && (userRole === 'teacher' || userRole === 'admin')) {
      return route;
    }
    if (route.startsWith('/admin-dashboard') && userRole === 'admin') {
      return route;
    }

    return null;
  }

  static getRouteLabel(route: string): string {
    for (const key in VALID_CAMPUS_ROUTES) {
      if (VALID_CAMPUS_ROUTES[key].route === route) {
        return VALID_CAMPUS_ROUTES[key].title;
      }
    }
    return 'Campus OS View';
  }
}
