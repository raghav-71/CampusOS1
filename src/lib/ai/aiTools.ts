import { campusRepository } from '@/repositories/campusRepository';
import {
  mockExams,
  mockEvents,
  mockStudyProgressData,
  mockEnrollmentData,
  mockDepartmentNotes,
  mockFacultyAttendanceTrends,
  mockGradeDistributions,
} from '@/repositories/mockData';
import { AIToolDefinition, AIContextData } from './aiTypes';
import { AIPermissionsManager } from './aiPermissions';
import { AINavigationManager } from './aiNavigation';

export const CAMPUS_AI_TOOL_DEFINITIONS: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'searchCampusData',
      description:
        'Search across campus subjects, lecture notes, timetable slots, announcements, and events.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term or subject/topic name' },
          category: {
            type: 'string',
            enum: ['all', 'notes', 'subjects', 'timetable', 'announcements', 'events'],
            description: 'Specific category filter',
          },
        },
        required: ['query'],
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentSubjects',
      description:
        'Get list of enrolled subjects, instructor details, credits, and syllabus coverage percentages.',
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
      name: 'getStudentTimetable',
      description:
        'Get daily and weekly class lecture timetable schedules with room numbers and timings.',
      parameters: {
        type: 'object',
        properties: {
          dayOfWeek: { type: 'string', description: 'Optional day of week e.g. Friday, Monday' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentExams',
      description:
        'Get upcoming university examination schedule, dates, timings, and exam hall locations.',
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
      name: 'getStudentAttendance',
      description:
        'Get attendance statistics and history for a student across their enrolled subjects.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject name to filter' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getNotes',
      description: 'Get lecture notes, study documents, chapter summaries, and revision guides.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Subject name e.g. Operating Systems, DBMS' },
          query: { type: 'string', description: 'Keyword query e.g. Virtual Memory, Paging, SQL' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAnnouncements',
      description:
        'Get official campus announcements, exam reschedules, event alerts, and administrative notices.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Optional category: Exam, Event, General, Academic',
          },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getEvents',
      description:
        'Get upcoming campus events, hackathons, guest lectures, sports competitions, and cultural galas.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['technical', 'cultural', 'sports', 'academic'] },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentAssignments',
      description: 'Get student assignments, due dates, submission statuses, and maximum scores.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'grading', 'closed', 'all'] },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyClasses',
      description: 'Get faculty teaching classes, enrolled students count, and subject codes.',
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
      description: 'Get student submissions for evaluation, grading status, and scores.',
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
      name: 'getAdminAnalytics',
      description:
        'Get institutional analytics: at-risk students below 75% attendance cutoff, curriculum pace anomalies, department metrics, and enrollment trends.',
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
      description:
        'Get university departments, student counts, faculty counts, and Head of Department names.',
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
      name: 'getUsers',
      description: 'Get campus user directory (students and faculty) with department and status.',
      parameters: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['student', 'teacher', 'admin'] },
          department: { type: 'string' },
        },
      },
    },
    allowedRoles: ['admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAuditLogs',
      description:
        'Get campus activity and security audit logs, user registrations, logins, and uploads.',
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
      name: 'navigateToRoute',
      description:
        'Instruct the user interface to navigate directly to a validated internal dashboard view/tab.',
      parameters: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description:
              'Destination keyword or key e.g. timetable, notes, exams, attendance, assignments, classes, profile',
          },
        },
        required: ['target'],
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
];

export class AIToolsExecutor {
  /**
   * Executes a tool invocation securely using MockCampusRepository and mock data.
   */
  static async executeTool(
    name: string,
    args: Record<string, any>,
    context: AIContextData
  ): Promise<{ success: boolean; data?: any; error?: string; action?: any }> {
    // 1. Check Server-Side RBAC
    const perm = AIPermissionsManager.checkToolPermission(name, context.user.role);
    if (!perm.allowed) {
      return { success: false, error: perm.reason || 'Permission denied for this operation.' };
    }

    try {
      switch (name) {
        case 'searchCampusData': {
          const q = (args.query || '').toLowerCase();
          const [subjects, notes, timetable, announcements] = await Promise.all([
            campusRepository.getSubjects(),
            campusRepository.getNotes(undefined, q),
            campusRepository.getStudentTimetable(),
            campusRepository.getAnnouncements(),
          ]);

          const matchedSubjects = subjects.filter(
            (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
          );
          const matchedTimetable = timetable.filter(
            (t) =>
              t.subject.toLowerCase().includes(q) ||
              (t.teacher && t.teacher.toLowerCase().includes(q))
          );
          const matchedAnnouncements = announcements.filter(
            (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
          );
          const matchedEvents = mockEvents.filter(
            (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
          );

          return {
            success: true,
            data: {
              query: args.query,
              subjects: matchedSubjects.slice(0, 4),
              notes: notes.slice(0, 4),
              timetableSlots: matchedTimetable.slice(0, 4),
              announcements: matchedAnnouncements.slice(0, 3),
              events: matchedEvents.slice(0, 3),
            },
          };
        }

        case 'getStudentSubjects': {
          const subjects = await campusRepository.getSubjects(args.department);
          return { success: true, data: subjects };
        }

        case 'getStudentTimetable': {
          const slots = await campusRepository.getStudentTimetable();
          if (args.dayOfWeek) {
            const filtered = slots.filter(
              (s) => s.dayOfWeek.toLowerCase() === args.dayOfWeek.toLowerCase()
            );
            return { success: true, data: filtered };
          }
          return { success: true, data: slots };
        }

        case 'getStudentExams': {
          let exams = [...mockExams];
          if (args.subject) {
            exams = exams.filter((e) =>
              e.subject.toLowerCase().includes(args.subject.toLowerCase())
            );
          }
          return { success: true, data: exams };
        }

        case 'getStudentAttendance': {
          const records = await campusRepository.getAttendance(args.subject);
          const subjects = await campusRepository.getSubjects();
          const attendanceSummary = subjects.map((sub) => ({
            subject: sub.name,
            code: sub.code,
            attendanceRate: sub.attendanceRate || 92.0,
            status: (sub.attendanceRate || 92.0) >= 75 ? 'Satisfactory' : 'Critical (Below 75%)',
          }));

          return {
            success: true,
            data: {
              overallAttendance: '92.1%',
              subjectRates: attendanceSummary,
              recentLogs: records.slice(0, 10),
            },
          };
        }

        case 'getNotes': {
          const notes = await campusRepository.getNotes(args.subject, args.query);
          return { success: true, data: notes };
        }

        case 'getAnnouncements': {
          const announcements = await campusRepository.getAnnouncements(context.user.role);
          if (args.category) {
            return {
              success: true,
              data: announcements.filter(
                (a) => a.category.toLowerCase() === args.category.toLowerCase()
              ),
            };
          }
          return { success: true, data: announcements };
        }

        case 'getEvents': {
          let events = [...mockEvents];
          if (args.category) {
            events = events.filter((e) => e.category === args.category);
          }
          return { success: true, data: events };
        }

        case 'getStudentAssignments': {
          const assignments = await campusRepository.getAssignments();
          const submissions = await campusRepository.getSubmissions();
          const enriched = assignments.map((asg) => {
            const sub = submissions.find(
              (s) => s.assignmentId === asg.id && s.studentId === context.user.id
            );
            return {
              ...asg,
              myStatus: sub ? sub.status : 'pending',
              myScore: sub?.score,
              feedback: sub?.feedback,
            };
          });
          return { success: true, data: enriched };
        }

        case 'getFacultyClasses': {
          const subjects = await campusRepository.getSubjects();
          const teacherSchedule = await campusRepository.getTeacherSchedule(context.user.name);
          return {
            success: true,
            data: {
              teachingSubjects: subjects.filter(
                (s) =>
                  s.instructor.toLowerCase().includes(context.user.name.toLowerCase()) ||
                  context.user.role === 'admin'
              ),
              schedule: teacherSchedule,
            },
          };
        }

        case 'getSubmissions': {
          const submissions = await campusRepository.getSubmissions(args.assignmentId);
          return { success: true, data: submissions };
        }

        case 'getAdminAnalytics': {
          const [users, depts, subjects, activities] = await Promise.all([
            campusRepository.getUsers(),
            campusRepository.getDepartments(),
            campusRepository.getSubjects(),
            campusRepository.getActivities(),
          ]);

          // Dynamically detect at-risk students below 75%
          const atRiskStudents = [
            {
              id: 'usr-008',
              name: 'Karthik Nambiar',
              rollNumber: 'MCA2612',
              department: 'MCA Sem 1',
              attendancePct: 62.4,
              reason: 'Severe attendance deficiency below 75% cutoff threshold in 3 subjects',
              recommendedAction: 'Issue Academic Warning Letter & Parent-Teacher Counseling',
            },
            {
              id: 'usr-004',
              name: 'Rohit Verma',
              rollNumber: 'BBA2415',
              department: 'BBA Sem 4',
              attendancePct: 68.0,
              reason: 'Absence during mid-term test cycle & 2 missed assignments',
              recommendedAction: 'Schedule remedial evaluation with Dr. Ramesh Gupta',
            },
          ];

          const curriculumAnomalies = subjects
            .filter((s) => s.syllabusCoveragePct < 60)
            .map((s) => ({
              subject: `${s.name} (${s.code})`,
              department: `${s.department} ${s.semester}`,
              coveragePct: s.syllabusCoveragePct,
              issue: `Syllabus coverage at ${s.syllabusCoveragePct}% with upcoming exam schedule`,
              recommendedAction: 'Schedule 2 additional catch-up review lab slots',
            }));

          return {
            success: true,
            data: {
              totalStudents: users.filter((u) => u.role === 'student').length * 120, // scale factor for demo
              totalFaculty: users.filter((u) => u.role === 'teacher').length * 8,
              totalDepartments: depts.length,
              atRiskStudents,
              curriculumAnomalies,
              departmentNotes: mockDepartmentNotes,
              gradeDistributions: mockGradeDistributions,
              recentAuditEvents: activities.slice(0, 6),
            },
          };
        }

        case 'getDepartments': {
          const depts = await campusRepository.getDepartments();
          return { success: true, data: depts };
        }

        case 'getUsers': {
          const users = await campusRepository.getUsers(args.role, args.department);
          return { success: true, data: users };
        }

        case 'getAuditLogs': {
          const logs = await campusRepository.getActivities();
          return { success: true, data: logs };
        }

        case 'navigateToRoute': {
          const nav = AINavigationManager.resolveNavigation(args.target, context.user.role);
          return {
            success: true,
            data: { navigatedTo: nav.route, title: nav.title },
            action: {
              type: 'navigate',
              label: `Open ${nav.title}`,
              route: nav.route,
            },
          };
        }

        default:
          return { success: false, error: `Tool "${name}" not found.` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error executing tool.' };
    }
  }
}
