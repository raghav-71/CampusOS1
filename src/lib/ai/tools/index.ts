import { AIToolDefinition } from '../aiTypes';
import { AIPermissionsManager } from '../security/permissions';
import { AINavigationManager } from './navigation';
import { AISearchEngine } from './search';
import { StudentTools } from './student';
import { FacultyTools } from './faculty';
import { AdminTools } from './admin';
import { CampusAnalyticsEngine } from './analytics';
import { AcademicsTools } from './academics';
import { campusRepository } from '@/repositories/campusRepository';
import { mockEvents } from '@/repositories/mockData';

export const CAMPUS_AI_TOOL_DEFINITIONS: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'searchCampusData',
      description:
        'Universal campus search across subjects, lecture notes, timetable slots, announcements, events, assignments, and users.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword or subject name' },
        },
        required: ['query'],
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getCurrentUser',
      description: 'Get profile details, enrolled semester, and role of current user.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentProfile',
      description: 'Get student academic profile, enrolled degree program, semester, and roll number.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Optional student user ID' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentAttendance',
      description:
        'Get attendance statistics, percentages, and cutoff compliance for a student across enrolled subjects.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject name or code' },
          studentId: { type: 'string', description: 'Optional student ID' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentSubjects',
      description: 'Get list of enrolled subjects, instructor details, credits, and syllabus coverage.',
      parameters: {
        type: 'object',
        properties: {
          department: { type: 'string', description: 'Filter by department code e.g. BCA, MCA' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentAssignments',
      description: 'Get active assignments, submission status, deadlines, and maximum scores.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject filter' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentExams',
      description: 'Get registered examination schedule, dates, timings, and hall allocations.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject filter' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentTimetable',
      description: 'Get daily and weekly class lecture schedule with room numbers and timings.',
      parameters: {
        type: 'object',
        properties: {
          dayOfWeek: { type: 'string', description: 'Optional day of week e.g. Monday, Friday' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentGrades',
      description: 'Get GPA, academic standing, and internal score breakdown.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentNotes',
      description: 'Search lecture notes, study documents, chapter PDFs, and revision materials.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword or topic' },
          subject: { type: 'string', description: 'Subject filter' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentFlashcards',
      description: 'Retrieve revision flashcards for exam preparation.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Subject name' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAnnouncements',
      description: 'Get official campus announcements, notices, circulars, and alerts.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number to retrieve' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getEvents',
      description: 'Get upcoming campus events, hackathons, guest lectures, and competitions.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number to retrieve' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyClasses',
      description: 'Get teaching classes, courses, student counts, and lecture halls for faculty.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyStudents',
      description: 'Get roster of enrolled students in classes with attendance percentages.',
      parameters: {
        type: 'object',
        properties: {
          classId: { type: 'string', description: 'Class identifier' },
        },
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyAssignments',
      description: 'Get assignments created by faculty with submission statistics.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getSubmissions',
      description: 'Get student assignment submissions awaiting grading.',
      parameters: {
        type: 'object',
        properties: {
          assignmentId: { type: 'string', description: 'Optional assignment ID' },
        },
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAdminUsers',
      description: 'Get directory of students, faculty, and administrators.',
      parameters: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['student', 'teacher', 'admin', 'all'] },
          department: { type: 'string', description: 'Department filter' },
        },
      },
    },
    allowedRoles: ['admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAdminAnalytics',
      description: 'Get institutional compliance metrics, attendance risks, and curriculum velocity.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    allowedRoles: ['admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getDepartments',
      description: 'Get university academic departments, student counts, and HODs.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAuditLogs',
      description: 'Get security audit logs and administrative events.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of logs' },
        },
      },
    },
    allowedRoles: ['admin'],
  },
  {
    type: 'function',
    function: {
      name: 'navigateToRoute',
      description: 'Navigate the user interface to an authorized internal Campus OS dashboard route or tab.',
      parameters: {
        type: 'object',
        properties: {
          route: { type: 'string', description: 'Internal route path e.g. /student-dashboard?tab=timetable' },
          label: { type: 'string', description: 'Action title e.g. Open Timetable' },
        },
        required: ['route'],
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
];

export class AIToolsExecutor {
  static async executeTool(
    toolName: string,
    args: Record<string, any>,
    userRole: string
  ): Promise<{ success: boolean; data?: any; error?: string; action?: any }> {
    const isAllowed = AIPermissionsManager.canRoleAccessTool(userRole, toolName);
    if (!isAllowed) {
      return {
        success: false,
        error: `Permission Denied: Role '${userRole}' is not authorized to execute '${toolName}'.`,
      };
    }

    try {
      switch (toolName) {
        case 'searchCampusData':
        case 'searchCampus': {
          const results = await AISearchEngine.searchAll(args.query || '', userRole as any);
          return { success: true, data: results };
        }

        case 'getCurrentUser':
        case 'getStudentProfile': {
          const profile = await StudentTools.getStudentProfile(args.studentId);
          return { success: true, data: profile };
        }

        case 'getStudentAttendance': {
          const attendance = await StudentTools.getStudentAttendance(args.subject, args.studentId);
          return { success: true, data: attendance };
        }

        case 'getStudentSubjects': {
          const subjects = await StudentTools.getStudentSubjects(args.department);
          return { success: true, data: subjects };
        }

        case 'getStudentTimetable': {
          const timetable = await StudentTools.getStudentTimetable(args.dayOfWeek);
          return { success: true, data: timetable };
        }

        case 'getStudentExams': {
          const exams = await StudentTools.getStudentExams(args.subject);
          return { success: true, data: exams };
        }

        case 'getStudentAssignments': {
          const assignments = await StudentTools.getStudentAssignments(args.subject);
          return { success: true, data: assignments };
        }

        case 'getStudentGrades': {
          const grades = await StudentTools.getStudentGrades(args.studentId);
          return { success: true, data: grades };
        }

        case 'getStudentNotes':
        case 'getNotes': {
          const notes = await StudentTools.getStudentNotes(args.query, args.subject);
          return { success: true, data: notes };
        }

        case 'getStudentFlashcards': {
          const flashcards = await StudentTools.getStudentFlashcards(args.subject);
          return { success: true, data: flashcards };
        }

        case 'getAnnouncements': {
          const announcements = await campusRepository.getAnnouncements(userRole as any);
          return { success: true, data: announcements.slice(0, args.limit || 5) };
        }

        case 'getEvents': {
          return { success: true, data: mockEvents.slice(0, args.limit || 5) };
        }

        case 'getFacultyClasses': {
          const classes = await FacultyTools.getFacultyClasses(args.facultyId);
          return { success: true, data: classes };
        }

        case 'getFacultyStudents': {
          const students = await FacultyTools.getFacultyStudents(args.classId);
          return { success: true, data: students };
        }

        case 'getFacultyAssignments': {
          const assignments = await FacultyTools.getFacultyAssignments(args.facultyId);
          return { success: true, data: assignments };
        }

        case 'getSubmissions': {
          const submissions = await FacultyTools.getSubmissions(args.assignmentId);
          return { success: true, data: submissions };
        }

        case 'getAdminUsers': {
          const users = await AdminTools.getAdminUsers(args.role, args.department);
          return { success: true, data: users };
        }

        case 'getAdminAnalytics': {
          const analytics = await AdminTools.getAdminAnalytics();
          return { success: true, data: analytics };
        }

        case 'getDepartments': {
          const depts = await AdminTools.getDepartments();
          return { success: true, data: depts };
        }

        case 'getAuditLogs': {
          const logs = await AdminTools.getAuditLogs(args.limit || 10);
          return { success: true, data: logs };
        }

        case 'navigateToRoute': {
          const route = args.route;
          const label = args.label || AINavigationManager.getRouteLabel(route);
          const sanitized = AINavigationManager.resolveSafeRoute(route, userRole);

          if (!sanitized) {
            return {
              success: false,
              error: `Navigation route '${route}' is invalid or unauthorized for role '${userRole}'.`,
            };
          }

          return {
            success: true,
            data: { navigatedTo: sanitized, label },
            action: {
              type: 'navigate',
              route: sanitized,
              label,
            },
          };
        }

        default:
          return {
            success: false,
            error: `Unknown AI Tool '${toolName}'.`,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Tool execution error: ${err.message}`,
      };
    }
  }
}
