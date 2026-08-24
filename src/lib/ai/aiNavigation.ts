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
  'student:attendance': {
    route: '/student-dashboard?tab=attendance',
    tab: 'attendance',
    title: 'Student Attendance',
    allowedRoles: ['student', 'admin'],
  },
  'student:assignments': {
    route: '/student-dashboard?tab=assignments',
    tab: 'assignments',
    title: 'Student Assignments',
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
  static resolveNavigation(
    target: string,
    userRole: Role
  ): { valid: boolean; route?: string; title?: string; message?: string } {
    const normalized = target.toLowerCase().trim();

    if (VALID_CAMPUS_ROUTES[target]) {
      const match = VALID_CAMPUS_ROUTES[target];
      if (match.allowedRoles.includes(userRole)) {
        return { valid: true, route: match.route, title: match.title };
      }
    }

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
        normalized.includes('attendance') ||
        normalized.includes('present') ||
        normalized.includes('percentage')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=attendance',
          title: 'Student Attendance',
        };
      }
      if (
        normalized.includes('assignment') ||
        normalized.includes('homework') ||
        normalized.includes('submission')
      ) {
        return {
          valid: true,
          route: '/student-dashboard?tab=assignments',
          title: 'Student Assignments',
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
        normalized.includes('class') ||
        normalized.includes('course') ||
        normalized.includes('batch')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=classes',
          title: 'My Classes & Courses',
        };
      }
      if (
        normalized.includes('assignment') ||
        normalized.includes('submission') ||
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
        normalized.includes('exam archive')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=papers',
          title: 'Question Papers Archive',
        };
      }
      if (
        normalized.includes('ai') ||
        normalized.includes('generator') ||
        normalized.includes('assessment')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=aigen',
          title: 'AI Assessment Generator',
        };
      }
      if (
        normalized.includes('note') ||
        normalized.includes('upload') ||
        normalized.includes('slide')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=notes',
          title: 'Upload Notes & Materials',
        };
      }
      if (
        normalized.includes('timetable') ||
        normalized.includes('schedule') ||
        normalized.includes('lecture')
      ) {
        return {
          valid: true,
          route: '/teacher-dashboard?tab=timetable',
          title: 'Faculty Teaching Schedule',
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

    const safeDefault =
      userRole === 'admin'
        ? '/admin-dashboard'
        : userRole === 'teacher'
          ? '/teacher-dashboard'
          : '/student-dashboard';
    return { valid: true, route: safeDefault, title: 'Dashboard' };
  }

  static parseNavigationIntent(input: string, role: Role): { label: string; route: string } | null {
    const q = input.toLowerCase().trim();
    const isExplicitNav =
      q.startsWith('open ') ||
      q.startsWith('go to ') ||
      q.startsWith('take me to ') ||
      q.startsWith('navigate to ') ||
      q.startsWith('jump to ') ||
      q.includes('open my timetable') ||
      q.includes('open timetable') ||
      q.includes('open attendance') ||
      q.includes('take me to my attendance') ||
      q.includes('open notes') ||
      q.includes('open exams');

    if (!isExplicitNav) {
      return null;
    }

    if (q.includes('timetable')) {
      return { label: 'Class Timetable', route: '/student-dashboard?tab=timetable' };
    }
    if (q.includes('attendance')) {
      return {
        label: 'Attendance Register',
        route:
          role === 'teacher'
            ? '/teacher-dashboard?tab=attendance'
            : '/student-dashboard?tab=attendance',
      };
    }
    if (q.includes('note')) {
      return {
        label: 'Notes & Materials',
        route: role === 'teacher' ? '/teacher-dashboard?tab=notes' : '/student-dashboard?tab=notes',
      };
    }
    if (q.includes('exam')) {
      return { label: 'Exam Schedule', route: '/student-dashboard?tab=exams' };
    }
    if (q.includes('assignment')) {
      return {
        label: 'Assignments Portal',
        route:
          role === 'teacher'
            ? '/teacher-dashboard?tab=assignments'
            : '/student-dashboard?tab=assignments',
      };
    }
    if (q.includes('copilot') || (q.includes('admin') && q.includes('surveillance'))) {
      return { label: 'Admin Copilot', route: '/admin-dashboard?tab=copilot' };
    }

    const res = this.resolveNavigation(input, role);
    if (res.valid && res.route && res.title && res.title !== 'Dashboard') {
      return { label: res.title, route: res.route };
    }

    return null;
  }

  static resolveSafeRoute(route: string, role: string): string | null {
    if (!route.startsWith('/')) return null;
    const clean = route.split('#')[0];
    if (
      clean.startsWith('/student-dashboard') ||
      clean.startsWith('/teacher-dashboard') ||
      clean.startsWith('/admin-dashboard')
    ) {
      return route;
    }
    return null;
  }

  static getRouteLabel(route: string): string {
    if (route.includes('tab=timetable')) return 'Class Timetable';
    if (route.includes('tab=attendance')) return 'Attendance';
    if (route.includes('tab=notes')) return 'Notes Explorer';
    if (route.includes('tab=exams')) return 'Exam Schedule';
    if (route.includes('tab=assignments')) return 'Assignments';
    if (route.includes('tab=classes')) return 'My Classes';
    if (route.includes('tab=copilot')) return 'Admin Copilot';
    if (route.includes('tab=students')) return 'Student Directory';
    return 'View';
  }
}
