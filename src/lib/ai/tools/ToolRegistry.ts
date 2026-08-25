/**
 * Campus OS AI Tool Registry
 * Central registry of all deterministic tools, permissions, parameter validation, and execution handlers.
 */

import { LLMToolDefinition } from '../providers/types';
import { campusRepository } from '@/repositories/campusRepository';
import { notificationService } from '@/services/notificationService';
import { documentPipeline } from '../rag/documentPipeline';
import { mockSubjects, mockExams, mockTimetable, mockUsers } from '@/repositories/mockData';

export interface AIExecutionContext {
  userId: string;
  userRole: 'student' | 'teacher' | 'admin';
  userName: string;
  department: string;
  semester: number;
  currentPath: string;
  currentTab: string;
  selectedEntity?: string;
}

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
  actionRequired?: {
    type: 'NAVIGATE' | 'CONFIRM_WRITE' | 'OPEN_MODAL' | 'DOWNLOAD_FILE';
    payload: any;
  };
}

export interface ToolDefinition {
  name: string;
  category: 'ACADEMIC' | 'TIMETABLE' | 'CLASS' | 'NOTIFICATION' | 'FILE' | 'QUESTION_PAPER' | 'ASSIGNMENT' | 'TEACHER' | 'ADMIN' | 'NAVIGATION' | 'SEARCH' | 'CALCULATION';
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  allowedRoles: ('student' | 'teacher' | 'admin')[];
  isWriteAction?: boolean;
  handler: (args: any, context: AIExecutionContext) => Promise<ToolExecutionResult>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerAllTools();
  }

  registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getToolsForRole(role: 'student' | 'teacher' | 'admin'): ToolDefinition[] {
    return this.getAllTools().filter((t) => t.allowedRoles.includes(role));
  }

  getLLMDefinitionsForRole(role: 'student' | 'teacher' | 'admin'): LLMToolDefinition[] {
    return this.getToolsForRole(role).map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  async executeTool(
    name: string,
    args: any,
    context: AIExecutionContext
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        toolName: name,
        success: false,
        error: `Tool "${name}" is not registered in Campus OS.`,
      };
    }

    // Permission verification
    if (!tool.allowedRoles.includes(context.userRole)) {
      return {
        toolName: name,
        success: false,
        error: `Security error: Role "${context.userRole}" is not authorized to execute "${name}".`,
      };
    }

    try {
      return await tool.handler(args || {}, context);
    } catch (err: any) {
      return {
        toolName: name,
        success: false,
        error: `Execution error in "${name}": ${err.message}`,
      };
    }
  }

  private registerAllTools() {
    // ─── 1. ACADEMIC & STUDENT TOOLS ─────────────────────────────────────────
    this.registerTool({
      name: 'get_student_profile',
      category: 'ACADEMIC',
      description: 'Get academic profile of the currently logged in student (Roll No, CGPA, Attendance, registered subjects).',
      parameters: { type: 'object', properties: {} },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (_, ctx) => {
        const studentUser = mockUsers.find((u) => u.id === ctx.userId) || mockUsers[0];
        return {
          toolName: 'get_student_profile',
          success: true,
          data: {
            id: studentUser.id,
            name: studentUser.fullName || studentUser.name,
            rollNumber: studentUser.rollNumber || 'BCA2401',
            department: 'BCA',
            semester: studentUser.semester || 'Semester 5',
            cgpa: '8.82 / 10.0',
            overallAttendance: '93.3%',
            subjects: studentUser.subjects || ['Operating Systems', 'DBMS', 'Computer Networks', 'Java Programming', 'DAA'],
          },
        };
      },
    });

    this.registerTool({
      name: 'get_subjects',
      category: 'ACADEMIC',
      description: 'Get all BCA curriculum subjects, credits, syllabus progress, and instructors for the term.',
      parameters: {
        type: 'object',
        properties: {
          semester: { type: 'number', description: 'Semester number (1-6). Defaults to current term.' },
        },
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args, ctx) => {
        const sem = args.semester || ctx.semester || 5;
        const subjects = mockSubjects.filter((s) => s.semesterNumber === sem);
        return {
          toolName: 'get_subjects',
          success: true,
          data: {
            semester: sem,
            count: subjects.length,
            subjects: subjects.map((s) => ({
              code: s.code,
              name: s.name,
              credits: s.credits,
              type: s.type,
              instructor: s.instructor,
              syllabusProgress: `${s.syllabusProgress || 70}%`,
              attendanceRate: `${s.attendanceRate || 88}%`,
            })),
          },
        };
      },
    });

    this.registerTool({
      name: 'get_student_attendance',
      category: 'ACADEMIC',
      description: 'Get real-time attendance percentage breakdown by subject and cumulative overall attendance percentage for the logged in student.',
      parameters: {
        type: 'object',
        properties: {
          subjectName: { type: 'string', description: 'Optional specific subject name (e.g. DBMS, Operating Systems)' },
        },
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args) => {
        const subjects = mockSubjects.filter((s) => s.semesterNumber === 5);
        if (args.subjectName) {
          const match = subjects.find((s) => s.name.toLowerCase().includes(args.subjectName.toLowerCase()));
          if (match) {
            return {
              toolName: 'get_student_attendance',
              success: true,
              data: {
                subject: match.name,
                code: match.code,
                attendanceRate: `${match.attendanceRate || 92}%`,
                status: (match.attendanceRate || 92) >= 75 ? 'ELIGIBLE (Above 75% cutoff)' : 'SHORTAGE_RISK (Below 75%)',
                requirementPct: '75%',
              },
            };
          }
        }

        const overallAvg = Math.round(subjects.reduce((sum, s) => sum + (s.attendanceRate || 85), 0) / subjects.length);
        return {
          toolName: 'get_student_attendance',
          success: true,
          data: {
            overallAttendance: `${overallAvg}%`,
            eligibleForExams: overallAvg >= 75,
            subjectBreakdown: subjects.map((s) => ({
              subject: s.name,
              code: s.code,
              attendance: `${s.attendanceRate || 88}%`,
              status: (s.attendanceRate || 88) >= 75 ? 'GOOD_STANDING' : 'ATTENDANCE_WARNING',
            })),
          },
        };
      },
    });

    this.registerTool({
      name: 'get_exam_schedule',
      category: 'ACADEMIC',
      description: 'Get scheduled examination timetable for 1st Internal, 2nd Internal, End Semester, and Lab Practical assessments.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['ALL', 'INTERNAL_1', 'INTERNAL_2', 'END_SEMESTER'], description: 'Exam category cycle' },
          semester: { type: 'number', description: 'BCA Semester (1-6)' },
        },
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args, ctx) => {
        const sem = args.semester || ctx.semester || 5;
        let exams = mockExams.filter((e) => e.semesterNumber === sem);
        if (args.category && args.category !== 'ALL') {
          exams = exams.filter((e) => e.examCategory === args.category);
        }
        return {
          toolName: 'get_exam_schedule',
          success: true,
          data: {
            semester: sem,
            totalExams: exams.length,
            schedule: exams.map((e) => ({
              code: e.subjectCode,
              subject: e.subject,
              type: e.examType,
              category: e.examCategory,
              date: e.date,
              time: e.time,
              venue: e.room,
              maxMarks: e.maxMarks || 50,
            })),
          },
        };
      },
    });

    this.registerTool({
      name: 'get_marks_and_performance',
      category: 'ACADEMIC',
      description: 'Get student internal test marks, GPA, and score comparison between Internal 1 and Internal 2 with weakest/strongest subject identification.',
      parameters: {
        type: 'object',
        properties: {
          subjectName: { type: 'string', description: 'Optional subject name filter' },
        },
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async () => {
        const marksData = [
          { subject: 'Operating Systems', code: 'CS501', internal1: 42, internal2: 46, max: 50, trend: '+4 (Improved)', grade: 'A+' },
          { subject: 'Database Management Systems', code: 'CS502', internal1: 45, internal2: 44, max: 50, trend: '-1 (Stable)', grade: 'A+' },
          { subject: 'Computer Networks', code: 'CS503', internal1: 36, internal2: 41, max: 50, trend: '+5 (Improved)', grade: 'A' },
          { subject: 'Java Programming', code: 'CS504', internal1: 48, internal2: 49, max: 50, trend: '+1 (Top)', grade: 'O' },
          { subject: 'Design & Analysis of Algorithms', code: 'CS505', internal1: 34, internal2: 38, max: 50, trend: '+4 (Improved)', grade: 'B+' },
        ];
        return {
          toolName: 'get_marks_and_performance',
          success: true,
          data: {
            cgpa: '8.82 / 10.0',
            sgpaEstimated: '8.90',
            totalSubjects: 5,
            results: marksData,
            highestSubject: 'Java Programming (49/50 - Top Grade O)',
            weakestSubject: 'Design & Analysis of Algorithms (38/50 - Grade B+)',
            summary: 'Strong performance overall. Algorithms has lowest score (38/50) and represents primary improvement area.',
          },
        };
      },
    });

    // ─── 2. TIMETABLE & CLASS TOOLS ──────────────────────────────────────────
    this.registerTool({
      name: 'get_today_timetable',
      category: 'TIMETABLE',
      description: 'Get the lecture and lab schedule for today along with timings, rooms, and faculty.',
      parameters: { type: 'object', properties: {} },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async () => {
        const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const daySlots = mockTimetable.filter((t) => t.dayOfWeek?.toLowerCase() === todayDay.toLowerCase());
        const slotsToReturn = daySlots.length > 0 ? daySlots : mockTimetable.slice(0, 4);

        return {
          toolName: 'get_today_timetable',
          success: true,
          data: {
            day: daySlots.length > 0 ? todayDay : 'Friday',
            totalSlots: slotsToReturn.length,
            classes: slotsToReturn.map((s) => ({
              time: `${s.time} - ${s.endTime}`,
              subject: s.subject,
              code: s.subjectCode,
              room: s.room,
              instructor: s.teacher,
              isLive: s.status === 'LIVE',
            })),
          },
        };
      },
    });

    this.registerTool({
      name: 'get_next_class',
      category: 'TIMETABLE',
      description: 'Identify the immediate next upcoming lecture or practical on today schedule.',
      parameters: { type: 'object', properties: {} },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async () => {
        const next = mockTimetable[0] || {
          subject: 'Operating Systems',
          subjectCode: 'CS501',
          time: '10:30 AM',
          room: 'A-204',
          teacher: 'Dr. Priya Nair',
        };

        return {
          toolName: 'get_next_class',
          success: true,
          data: {
            nextClass: next.subject,
            code: next.subjectCode,
            time: next.time,
            venue: next.room,
            instructor: next.teacher,
          },
        };
      },
    });

    this.registerTool({
      name: 'start_class',
      category: 'CLASS',
      description: 'Trigger a lecture session start and broadcast real-time notifications to enrolled students (Teacher/Admin only).',
      parameters: {
        type: 'object',
        properties: {
          subjectName: { type: 'string', description: 'Name of the subject (e.g. Operating Systems)' },
          section: { type: 'string', description: 'Class section (e.g. A, B)' },
          room: { type: 'string', description: 'Lecture room/hall' },
        },
        required: ['subjectName'],
      },
      allowedRoles: ['teacher', 'admin'],
      isWriteAction: true,
      handler: async (args, ctx) => {
        const subject = args.subjectName || 'Operating Systems';
        const section = args.section || 'A';
        const room = args.room || 'A-204';

        await notificationService.triggerClassStart(
          ctx.userId || 'usr-003',
          ctx.userName || 'Dr. Priya Nair',
          subject,
          ctx.semester || 5,
          section,
          room
        );

        return {
          toolName: 'start_class',
          success: true,
          data: {
            status: 'LIVE',
            subject,
            section,
            room,
            instructor: ctx.userName,
            broadcastedTo: `BCA Sem ${ctx.semester || 5} Section ${section}`,
            timestamp: new Date().toLocaleTimeString(),
          },
          actionRequired: {
            type: 'NAVIGATE',
            payload: { tab: 'attendance', subject },
          },
        };
      },
    });

    // ─── 3. FILE & DOCUMENT RAG TOOLS ────────────────────────────────────────
    this.registerTool({
      name: 'search_academic_documents',
      category: 'FILE',
      description: 'Search across question papers, lecture notes, and syllabus materials using semantic & keyword RAG.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term or question (e.g. "normalization in DBMS", "page replacement LRU")' },
          subject: { type: 'string', description: 'Optional subject filter' },
        },
        required: ['query'],
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args) => {
        const results = documentPipeline.search(args.query, args.subject, 3);
        if (results.length === 0) {
          return {
            toolName: 'search_academic_documents',
            success: true,
            data: {
              found: false,
              message: `No exact document excerpts found matching "${args.query}".`,
            },
          };
        }

        return {
          toolName: 'search_academic_documents',
          success: true,
          data: {
            found: true,
            totalMatches: results.length,
            excerpts: results.map((r) => ({
              documentTitle: r.chunk.docTitle,
              subject: r.chunk.subject,
              relevanceScore: Math.round(r.score * 10) / 10,
              content: r.chunk.text,
            })),
          },
        };
      },
    });

    this.registerTool({
      name: 'get_question_papers',
      category: 'QUESTION_PAPER',
      description: 'List official university question papers uploaded for BCA subjects.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Subject name filter' },
        },
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args) => {
        const papers = await campusRepository.getQuestionPapers();
        const filtered = args.subject
          ? papers.filter((p) => p.subject.toLowerCase().includes(args.subject.toLowerCase()))
          : papers;

        return {
          toolName: 'get_question_papers',
          success: true,
          data: {
            total: filtered.length,
            papers: filtered.map((p) => ({
              id: p.id,
              title: p.title,
              subject: p.subject,
              semester: p.semester,
              examType: p.examType,
              fileName: p.fileName,
              duration: p.duration,
              totalMarks: p.totalMarks,
            })),
          },
        };
      },
    });

    // ─── 4. TEACHER TOOLS ────────────────────────────────────────────────────
    this.registerTool({
      name: 'get_teacher_assigned_classes',
      category: 'TEACHER',
      description: 'Get all courses and BCA student sections assigned to the faculty member.',
      parameters: { type: 'object', properties: {} },
      allowedRoles: ['teacher', 'admin'],
      handler: async (_, ctx) => {
        const email = ctx.userId.includes('@') ? ctx.userId : 'dr.priya.nair@campusos.edu';
        const classes = await campusRepository.getTeacherSubjects(email);
        return {
          toolName: 'get_teacher_assigned_classes',
          success: true,
          data: {
            faculty: ctx.userName || 'Dr. Priya Nair',
            totalCourses: classes.length,
            totalStudents: classes.reduce((sum, c) => sum + c.enrolledStudents, 0),
            classes: classes.map((c) => ({
              subject: c.subjectName,
              code: c.subjectCode,
              semester: c.semesterNumber,
              section: c.section,
              enrolled: c.enrolledStudents,
              avgAttendance: `${c.avgAttendancePct}%`,
              syllabusProgress: `${c.syllabusCoveredPct}%`,
            })),
          },
        };
      },
    });

    this.registerTool({
      name: 'get_students_at_attendance_risk',
      category: 'TEACHER',
      description: 'Find students in the teacher course sections whose attendance is below 75%.',
      parameters: {
        type: 'object',
        properties: {
          subjectName: { type: 'string', description: 'Subject name (e.g. Operating Systems, DBMS)' },
        },
      },
      allowedRoles: ['teacher', 'admin'],
      handler: async () => {
        const atRisk = [
          { roll: 'BCA2403', name: 'Rohit Verma', subject: 'Operating Systems', attendance: '68.5%', status: 'DEFICIT_WARNING' },
          { roll: 'BCA2442', name: 'Vikram Mehta', subject: 'Operating Systems', attendance: '68.5%', status: 'DEFICIT_WARNING' },
          { roll: 'BCA2419', name: 'Divya Rao', subject: 'DBMS', attendance: '71.0%', status: 'BORDERLINE' },
        ];
        return {
          toolName: 'get_students_at_attendance_risk',
          success: true,
          data: {
            threshold: '75%',
            count: atRisk.length,
            students: atRisk,
          },
        };
      },
    });

    // ─── 5. ADMIN TOOLS ──────────────────────────────────────────────────────
    this.registerTool({
      name: 'get_institutional_metrics',
      category: 'ADMIN',
      description: 'Get global university statistics: BCA total enrollment, active faculty, overall attendance rate, and exam passing rate.',
      parameters: { type: 'object', properties: {} },
      allowedRoles: ['admin'],
      handler: async () => {
        return {
          toolName: 'get_institutional_metrics',
          success: true,
          data: {
            department: 'Bachelor of Computer Applications (BCA)',
            totalStudents: 240,
            activeFaculty: 18,
            averageAttendance: '91.8%',
            semesterPassingRate: '94.2%',
            semestersActive: 'Semesters 1 through 6',
          },
        };
      },
    });

    this.registerTool({
      name: 'create_announcement',
      category: 'NOTIFICATION',
      description: 'Broadcast an official institutional notice to all students and faculty in real-time.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Announcement title' },
          body: { type: 'string', description: 'Announcement message body' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Priority level' },
          category: { type: 'string', description: 'Category (Exam, Event, Academic, Emergency)' },
        },
        required: ['title', 'body'],
      },
      allowedRoles: ['admin', 'teacher'],
      isWriteAction: true,
      handler: async (args, ctx) => {
        const notice = {
          id: `ann-${Date.now()}`,
          title: args.title,
          body: args.body,
          priority: (args.priority || 'medium') as 'high' | 'medium' | 'low',
          category: (args.category || 'General') as 'General' | 'Exam' | 'Event' | 'Academic' | 'Emergency',
          type: 'ANNOUNCEMENT' as const,
          time: 'Just now',
          createdAt: new Date().toISOString(),
          author: ctx.userName || 'Office of Controller of Examinations (BCA)',
          read: false,
          targetDepartment: 'BCA' as const,
          targetRole: 'all' as const,
        };

        await notificationService.sendNotification(notice);

        return {
          toolName: 'create_announcement',
          success: true,
          data: {
            status: 'BROADCASTED',
            title: notice.title,
            priority: notice.priority,
            author: notice.author,
          },
          actionRequired: {
            type: 'NAVIGATE',
            payload: { tab: 'announcements' },
          },
        };
      },
    });

    // ─── 6. NAVIGATION TOOLS ─────────────────────────────────────────────────
    this.registerTool({
      name: 'navigate_to_page',
      category: 'NAVIGATION',
      description: 'Directly navigate the Campus OS user interface to a specific dashboard tab or screen when the user explicitly requests navigation (e.g. "open my timetable", "take me to attendance").',
      parameters: {
        type: 'object',
        properties: {
          tab: {
            type: 'string',
            enum: ['overview', 'timetable', 'attendance', 'exams', 'subjects', 'notes', 'papers', 'announcements', 'analytics', 'events'],
            description: 'Destination dashboard tab',
          },
          subjectName: { type: 'string', description: 'Optional subject to highlight upon arrival' },
        },
        required: ['tab'],
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args) => {
        return {
          toolName: 'navigate_to_page',
          success: true,
          data: {
            navigatedTo: args.tab,
            subject: args.subjectName,
            status: 'SUCCESS',
          },
          actionRequired: {
            type: 'NAVIGATE',
            payload: { tab: args.tab, subject: args.subjectName },
          },
        };
      },
    });

    // ─── 7. DETERMINISTIC CALCULATION & STUDY PLAN TOOLS ─────────────────────
    this.registerTool({
      name: 'calculate_academic_study_plan',
      category: 'CALCULATION',
      description: 'Synthesizes a prioritized, day-by-day study schedule and revision plan based on upcoming exams and weak areas.',
      parameters: {
        type: 'object',
        properties: {
          focusSubject: { type: 'string', description: 'Optional target subject' },
        },
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async () => {
        const plan = [
          { priority: 1, subject: 'Design & Analysis of Algorithms', reason: 'Lowest score (38/50). Focus on Dynamic Programming & Greedy Algorithms.', hours: '2.5 hrs/day' },
          { priority: 2, subject: 'Computer Networks', reason: 'Exam coming up soon. Revise TCP flow control & Subnetting CIDR formulas.', hours: '2.0 hrs/day' },
          { priority: 3, subject: 'Operating Systems', reason: 'Memory management & Page Replacement exercises.', hours: '1.5 hrs/day' },
          { priority: 4, subject: 'Java Programming', reason: 'High mastery (49/50). Quick review of Multithreading & JDBC.', hours: '1.0 hr/day' },
        ];

        return {
          toolName: 'calculate_academic_study_plan',
          success: true,
          data: {
            recommendedDailyStudyHours: '7.0 Hours',
            schedule: plan,
            goal: 'Boost SGPA to > 9.0 in Semester 5 End-Term Exams',
          },
          actionRequired: {
            type: 'NAVIGATE',
            payload: { tab: 'notes' },
          },
        };
      },
    });

    this.registerTool({
      name: 'calculate_expression',
      category: 'CALCULATION',
      description: 'Evaluate mathematical calculations, CGPA/GPA computations, attendance percentage projections, and statistics deterministically.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Mathematical expression to calculate (e.g. "(38+44+46+49+41)/5" or "(42/50)*100")' },
          description: { type: 'string', description: 'What this calculation represents' },
        },
        required: ['expression'],
      },
      allowedRoles: ['student', 'teacher', 'admin'],
      handler: async (args) => {
        try {
          // Safe sanitized math evaluator
          const cleanExpr = String(args.expression).replace(/[^0-9+\-*/().%^ ]/g, '');
          const result = Function(`'use strict'; return (${cleanExpr})`)();
          return {
            toolName: 'calculate_expression',
            success: true,
            data: {
              expression: args.expression,
              result: Number(result),
              rounded: Math.round(Number(result) * 100) / 100,
              description: args.description || 'Mathematical evaluation',
            },
          };
        } catch (err: any) {
          return {
            toolName: 'calculate_expression',
            success: false,
            error: `Failed to calculate: ${err.message}`,
          };
        }
      },
    });
  }
}

export const toolRegistry = new ToolRegistry();
