import { campusRepository } from '@/repositories/campusRepository';
import {
  mockExams,
  mockEvents,
  mockStudyProgressData,
  mockEnrollmentData,
  mockDepartmentNotes,
  mockGradeDistributions,
  mockUsers,
} from '@/repositories/mockData';
import { AIToolDefinition } from './aiTypes';
import { AIPermissionsManager } from './aiPermissions';
import { AINavigationManager } from './aiNavigation';

export const CAMPUS_AI_TOOL_DEFINITIONS: AIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'searchCampus',
      description:
        'Universal search across campus subjects, lecture notes, timetable slots, announcements, assignments, and events.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term or topic/subject name' },
          category: {
            type: 'string',
            enum: [
              'all',
              'notes',
              'subjects',
              'timetable',
              'announcements',
              'events',
              'assignments',
            ],
            description: 'Optional category filter',
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
      name: 'getCurrentUser',
      description: 'Get profile details and role of the currently authenticated user in session.',
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
      description:
        'Get student academic profile, enrolled degree program, semester, and roll number.',
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
        'Get attendance statistics, percentages, and history for a student across enrolled subjects.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject name to filter' },
          studentId: { type: 'string', description: 'Optional student ID' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentAssignments',
      description: 'Get assignments list, due dates, submission status, and max marks.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject filter' },
          studentId: { type: 'string', description: 'Optional student ID' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentGrades',
      description: 'Get internal assessment grades and academic marks distribution.',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'Optional student ID' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentNotes',
      description: 'Search lecture notes, study documents, chapters, and PDF resources.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keyword or topic to search' },
          subject: { type: 'string', description: 'Subject name filter' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getStudentFlashcards',
      description: 'Retrieve quick revision flashcards for exam study and memorization.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Subject name e.g. Operating Systems' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAnnouncements',
      description: 'Get official campus announcements, notices, circulars, and urgent alerts.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of announcements to retrieve (default 5)' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getEvents',
      description: 'Get upcoming campus events, hackathons, sports meets, and guest lectures.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of events to retrieve (default 5)' },
        },
      },
    },
    allowedRoles: ['student', 'teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyClasses',
      description:
        'Get teaching classes, batches, enrolled student counts, and lecture halls for faculty.',
      parameters: {
        type: 'object',
        properties: {
          facultyId: { type: 'string', description: 'Optional faculty ID' },
        },
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyStudents',
      description: 'Get roster of enrolled students in a specific class or subject batch.',
      parameters: {
        type: 'object',
        properties: {
          classId: { type: 'string', description: 'Class or subject identifier' },
        },
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getFacultyAssignments',
      description: 'Get assignments created by faculty, submission counts, and pending grading.',
      parameters: {
        type: 'object',
        properties: {
          facultyId: { type: 'string', description: 'Optional faculty user ID' },
        },
      },
    },
    allowedRoles: ['teacher', 'admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getSubmissions',
      description: 'Get student assignment submissions awaiting evaluation and score entry.',
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
      description: 'Get directory of students, faculty members, and campus administrators.',
      parameters: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['student', 'teacher', 'admin', 'all'] },
          department: { type: 'string', description: 'Filter by department' },
        },
      },
    },
    allowedRoles: ['admin'],
  },
  {
    type: 'function',
    function: {
      name: 'getAdminAnalytics',
      description:
        'Get institutional compliance metrics, at-risk attendance anomalies, and curriculum velocity.',
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
        'Get list of university academic departments, student counts, and faculty head info.',
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
      description:
        'Get security audit logs, system logins, role changes, and administrative actions.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of logs to retrieve' },
        },
      },
    },
    allowedRoles: ['admin'],
  },
  {
    type: 'function',
    function: {
      name: 'navigateToRoute',
      description:
        'Navigate the user interface to an authorized internal Campus OS dashboard page or tab.',
      parameters: {
        type: 'object',
        properties: {
          route: {
            type: 'string',
            description: 'Target internal route e.g. /student-dashboard?tab=timetable',
          },
          label: {
            type: 'string',
            description: 'Human-readable action description e.g. Open Timetable',
          },
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
        error: `Permission Denied: Your role '${userRole}' is not authorized to execute tool '${toolName}'.`,
      };
    }

    try {
      switch (toolName) {
        case 'searchCampus':
        case 'searchCampusData': {
          const q = (args.query || '').toLowerCase();
          const subjects = await campusRepository.getSubjects();
          const notes = await campusRepository.getNotes();
          const timetable = await campusRepository.getStudentTimetable();
          const announcements = await campusRepository.getAnnouncements();
          const assignments = await campusRepository.getAssignments();

          return {
            success: true,
            data: {
              subjects: subjects.filter(
                (s) =>
                  s.name.toLowerCase().includes(q) ||
                  s.code.toLowerCase().includes(q) ||
                  s.department.toLowerCase().includes(q)
              ),
              notes: notes.filter(
                (n) =>
                  n.title.toLowerCase().includes(q) ||
                  n.subject.toLowerCase().includes(q) ||
                  n.tags.some((t) => t.toLowerCase().includes(q))
              ),
              timetable: timetable.filter(
                (t) =>
                  t.subject.toLowerCase().includes(q) ||
                  t.teacher.toLowerCase().includes(q) ||
                  t.room.toLowerCase().includes(q)
              ),
              announcements: announcements.filter(
                (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
              ),
              assignments: assignments.filter(
                (asg) =>
                  asg.title.toLowerCase().includes(q) || asg.subject.toLowerCase().includes(q)
              ),
            },
          };
        }

        case 'getCurrentUser':
        case 'getStudentProfile': {
          const user = mockUsers[0];
          return {
            success: true,
            data: {
              id: user.id,
              name: user.fullName,
              email: user.email,
              role: user.role,
              department: user.department,
              semester: user.semester,
              rollNumber: user.rollNumber,
              stats: mockStudyProgressData,
            },
          };
        }

        case 'getStudentSubjects': {
          const subjects = await campusRepository.getSubjects();
          return { success: true, data: subjects };
        }

        case 'getStudentTimetable': {
          const timetable = await campusRepository.getStudentTimetable();
          if (args.dayOfWeek) {
            return {
              success: true,
              data: timetable.filter(
                (t) => t.dayOfWeek.toLowerCase() === args.dayOfWeek.toLowerCase()
              ),
            };
          }
          return { success: true, data: timetable };
        }

        case 'getStudentExams': {
          if (args.subject) {
            return {
              success: true,
              data: mockExams.filter((e) =>
                e.subject.toLowerCase().includes(args.subject.toLowerCase())
              ),
            };
          }
          return { success: true, data: mockExams };
        }

        case 'getStudentAttendance': {
          const subjectsList = [
            {
              subjectCode: 'CS501',
              subjectName: 'Operating Systems',
              attended: 42,
              totalClasses: 45,
              percentage: 93.3,
            },
            {
              subjectCode: 'CS502',
              subjectName: 'Database Management Systems',
              attended: 35,
              totalClasses: 40,
              percentage: 87.5,
            },
            {
              subjectCode: 'CS503',
              subjectName: 'Computer Networks',
              attended: 30,
              totalClasses: 38,
              percentage: 78.9,
            },
            {
              subjectCode: 'CS504',
              subjectName: 'Java Programming',
              attended: 40,
              totalClasses: 42,
              percentage: 95.2,
            },
            {
              subjectCode: 'CS505',
              subjectName: 'Design & Analysis of Algorithms',
              attended: 32,
              totalClasses: 40,
              percentage: 80.0,
            },
          ];

          if (args.subject) {
            const match = subjectsList.find(
              (s) =>
                s.subjectName.toLowerCase().includes(args.subject.toLowerCase()) ||
                s.subjectCode.toLowerCase().includes(args.subject.toLowerCase())
            );
            return {
              success: true,
              data: match || { message: 'Subject not found in attendance records' },
            };
          }

          return {
            success: true,
            data: {
              overall: { attended: 179, totalLectures: 205, percentage: 87.3 },
              subjects: subjectsList,
            },
          };
        }

        case 'getStudentAssignments': {
          const assignments = await campusRepository.getAssignments();
          if (args.subject) {
            return {
              success: true,
              data: assignments.filter((a) =>
                a.subject.toLowerCase().includes(args.subject.toLowerCase())
              ),
            };
          }
          return { success: true, data: assignments };
        }

        case 'getStudentGrades': {
          return {
            success: true,
            data: {
              gpa: 3.84,
              scale: 4.0,
              distributions: mockGradeDistributions,
              semesterRank: 4,
              totalCohort: 60,
            },
          };
        }

        case 'getStudentNotes':
        case 'getNotes': {
          const notes = await campusRepository.getNotes();
          if (args.query) {
            const q = args.query.toLowerCase();
            return {
              success: true,
              data: notes.filter(
                (n) =>
                  n.title.toLowerCase().includes(q) ||
                  n.subject.toLowerCase().includes(q) ||
                  n.tags.some((t) => t.toLowerCase().includes(q))
              ),
            };
          }
          return { success: true, data: notes };
        }

        case 'getStudentFlashcards': {
          return {
            success: true,
            data: [
              {
                id: 'fc-1',
                subject: args.subject || 'Operating Systems',
                front: 'What is Belady’s Anomaly?',
                back: 'A phenomenon where increasing the number of page frames results in an increase in the number of page faults (occurs in FIFO page replacement).',
              },
              {
                id: 'fc-2',
                subject: args.subject || 'Operating Systems',
                front: 'What are the 4 Coffman conditions for Deadlock?',
                back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
              },
              {
                id: 'fc-3',
                subject: args.subject || 'Operating Systems',
                front: 'What is EMAT in Paging with TLB?',
                back: 'Effective Memory Access Time = Hit_Ratio × (TLB_Time + Mem_Time) + (1 - Hit_Ratio) × (TLB_Time + 2 × Mem_Time)',
              },
            ],
          };
        }

        case 'getAnnouncements': {
          const announcements = await campusRepository.getAnnouncements();
          const limit = args.limit || 5;
          return { success: true, data: announcements.slice(0, limit) };
        }

        case 'getEvents': {
          const limit = args.limit || 5;
          return { success: true, data: mockEvents.slice(0, limit) };
        }

        case 'getFacultyClasses': {
          return {
            success: true,
            data: [
              {
                id: 'cls-1',
                subject: 'Operating Systems (CS501)',
                batch: 'BCA Sem 5 - Div A',
                studentsCount: 60,
                room: 'Room A-204',
                timing: 'Mon, Wed, Fri 10:30 AM',
              },
              {
                id: 'cls-2',
                subject: 'System Architecture (MCA302)',
                batch: 'MCA Sem 3 - Div B',
                studentsCount: 45,
                room: 'Room B-102',
                timing: 'Tue, Thu 2:00 PM',
              },
              {
                id: 'cls-3',
                subject: 'OS Lab (CS501L)',
                batch: 'BCA Sem 5 - Batch 1',
                studentsCount: 30,
                room: 'Lab 3 (Block A)',
                timing: 'Friday 2:00 PM – 4:00 PM',
              },
            ],
          };
        }

        case 'getFacultyStudents': {
          const students = mockUsers.filter((u) => u.role === 'student');
          return {
            success: true,
            data: students.map((s) => ({
              id: s.id,
              name: s.fullName,
              rollNumber: s.rollNumber,
              department: s.department,
              attendancePct: s.id === 'usr-006' ? 68.5 : s.id === 'usr-008' ? 62.0 : 94.2,
            })),
          };
        }

        case 'getFacultyAssignments': {
          const assignments = await campusRepository.getAssignments();
          return {
            success: true,
            data: assignments.map((a) => ({
              id: a.id,
              title: a.title,
              subject: a.subject,
              dueDate: a.dueDate,
              totalSubmissions: 54,
              pendingGrading: 12,
            })),
          };
        }

        case 'getSubmissions': {
          const submissions = await campusRepository.getSubmissions();
          return { success: true, data: submissions };
        }

        case 'getAdminUsers': {
          const users = await campusRepository.getUsers();
          if (args.role && args.role !== 'all') {
            return { success: true, data: users.filter((u) => u.role === args.role) };
          }
          return { success: true, data: users };
        }

        case 'getAdminAnalytics': {
          const students = mockUsers.filter((u) => u.role === 'student');
          const atRisk = students.filter((s) => s.id === 'usr-006' || s.id === 'usr-008');

          return {
            success: true,
            data: {
              totalStudentsEnrolled: 2418,
              totalFacultyMembers: 86,
              averageInstitutionalAttendance: 91.4,
              atRiskStudentsCount: atRisk.length,
              atRiskStudents: [
                {
                  id: 'usr-006',
                  name: 'Vikram Mehta',
                  rollNumber: 'BCA24-042',
                  attendancePct: 68.5,
                  department: 'BCA',
                  reason: 'Medical absence',
                  recommendedAction: 'Issue warning circular & schedule makeup lab',
                },
                {
                  id: 'usr-008',
                  name: 'Ananya Gupta',
                  rollNumber: 'MCA25-019',
                  attendancePct: 62.0,
                  department: 'MCA',
                  reason: 'Repeated unauthorized leave',
                  recommendedAction: 'Schedule parent-teacher conference & remedial sessions',
                },
              ],
              curriculumAnomaliesCount: 1,
              curriculumAnomalies: [
                {
                  subject: 'Database Management Systems (CS502)',
                  department: 'BCA Sem 5',
                  progressPct: 55,
                  targetPct: 70,
                  issue: 'Syllabus coverage pacing is 15% behind target schedule',
                  recommendedAction: 'Authorize 4 remedial weekend lecture sessions',
                },
              ],
              departmentBreakdowns: mockDepartmentNotes,
              enrollmentTrends: mockEnrollmentData,
            },
          };
        }

        case 'getDepartments': {
          return {
            success: true,
            data: [
              {
                code: 'BCA',
                name: 'Computer Applications (Undergraduate)',
                studentsCount: 720,
                head: 'Dr. Priya Nair',
              },
              {
                code: 'MCA',
                name: 'Master of Computer Applications (Postgraduate)',
                studentsCount: 480,
                head: 'Prof. Ramesh Kulkarni',
              },
              {
                code: 'BTECH-CS',
                name: 'Computer Science & Engineering',
                studentsCount: 840,
                head: 'Dr. Arvind Sharma',
              },
              {
                code: 'BBA',
                name: 'Business Administration',
                studentsCount: 378,
                head: 'Dr. Sunita Rao',
              },
            ],
          };
        }

        case 'getAuditLogs': {
          const logs = await campusRepository.getActivities();
          const limit = args.limit || 10;
          return { success: true, data: logs.slice(0, limit) };
        }

        case 'navigateToRoute': {
          const route = args.route;
          const label = args.label || AINavigationManager.getRouteLabel(route);
          const sanitized = AINavigationManager.resolveSafeRoute(route, userRole);

          if (!sanitized) {
            return {
              success: false,
              error: `Navigation Target '${route}' is not a valid or authorized internal Campus OS route for role '${userRole}'.`,
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
        error: `Tool execution failed: ${err.message}`,
      };
    }
  }
}
