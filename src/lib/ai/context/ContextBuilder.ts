/**
 * Campus OS AI Context Builder
 * Constructs compact, authentic, and page-aware context from mock repositories
 * for students, faculty, administrators, and Code Lab sessions.
 */

import { UserProfile, Role } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import {
  seedStudents,
  seedFaculty,
  seedSubjects,
  seedTimetable,
  seedExams,
  seedNotes,
  seedAssignments,
  seedAnnouncements,
  seedStudentAttendanceSummary,
} from '@/data/seed';
import { AuthorizationService } from '@/services/authorizationService';
import { CodeAIContext } from '@/types/codelab';

export interface CampusAIContextOptions {
  userProfile?: Partial<UserProfile> | any;
  currentPath?: string;
  currentTab?: string;
  selectedEntity?: any;
  selectedDocument?: any;
  codeLabContext?: CodeAIContext;
  history?: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>;
}

export interface CompactCampusContext {
  role: Role;
  userSummary: string;
  pageSummary: string;
  academicSummary?: string;
  facultySummary?: string;
  documentSummary?: string;
  codeLabSummary?: string;
  rawContext: Record<string, any>;
}

export class ContextBuilder {
  /**
   * Builds compact, structured Campus OS context tailored for the active query and page.
   */
  static async buildCampusAIContext(options: CampusAIContextOptions): Promise<CompactCampusContext> {
    const profile = options.userProfile || {
      id: 'usr-001',
      name: 'Arjun Sharma',
      fullName: 'Arjun Sharma',
      email: 'student5@campusos.demo',
      role: 'student' as Role,
      department: 'BCA',
      semester: 'Semester 5',
      semesterNumber: 5,
      rollNumber: 'BCA2401',
      initials: 'AS',
      subjects: ['Operating Systems', 'DBMS', 'Computer Networks', 'Java Programming', 'DAA'],
    };

    const role: Role = profile.role || 'student';
    const studentSem: number = profile.semesterNumber || 5;
    const path = options.currentPath || '/student-dashboard';
    const tab = (options.currentTab || 'overview').toLowerCase();

    // 1. User Summary
    const userName = profile.fullName || profile.name || 'Campus Member';
    const userSummary = `User: ${userName} | Role: ${role.toUpperCase()} | Department: ${profile.department || 'BCA'} | ${profile.semester || `Semester ${studentSem}`} (Roll: ${profile.rollNumber || 'BCA2401'})`;

    // 2. Page & Tab Summary
    let pageSummary = `Current Page: ${path} (Active Tab: ${tab.toUpperCase()})`;
    if (options.selectedEntity) {
      const entityTitle = options.selectedEntity.title || options.selectedEntity.name || options.selectedEntity.subject;
      if (entityTitle) {
        pageSummary += ` | Focused Item: ${entityTitle}`;
      }
    }

    // 3. Document Summary (when a document is opened or asked about)
    let documentSummary: string | undefined = undefined;
    const docEntity = options.selectedDocument || options.selectedEntity;
    if (docEntity && (docEntity.extractedText || docEntity.title)) {
      const auth = AuthorizationService.canUserAccessDocument(profile, {
        targetSemester: docEntity.targetSemester || docEntity.semesterNumber,
        semesterNumber: docEntity.semesterNumber || docEntity.targetSemester,
        subjectCode: docEntity.subjectCode || docEntity.subject,
        subjectId: docEntity.subjectId,
        subject: docEntity.subject,
        uploadedById: docEntity.uploadedById || docEntity.teacherId,
        visibility: docEntity.visibility,
      });

      if (auth.allowed) {
        const fullExtracted = docEntity.extractedText || docEntity.description || '';
        documentSummary = [
          `### 📄 Active Document Content: "${docEntity.title}" (${docEntity.subject || 'Academic Document'})`,
          `- Author / Instructor: ${docEntity.teacher || docEntity.uploadedBy || 'Faculty Member'}`,
          `- Target Cohort: ${docEntity.semester || `Semester ${docEntity.semesterNumber || studentSem}`}`,
          `- Authentic Extracted Document Text:`,
          `"""`,
          fullExtracted.slice(0, 12000),
          `"""`,
        ].join('\n');
      } else {
        documentSummary = `[RESTRICTED DOCUMENT ACCESS]: The active user is unauthorized to access document "${docEntity.title}" belonging to another semester.`;
      }
    }

    // 4. Academic Summary (for students)
    let academicSummary: string | undefined = undefined;
    if (role === 'student') {
      const userAttendance = seedStudentAttendanceSummary[profile.id] || [
        { subjectCode: 'CS501', subjectName: 'Operating Systems', attendancePercentage: 93.3, status: 'Good' },
        { subjectCode: 'CS502', subjectName: 'Database Management Systems', attendancePercentage: 87.5, status: 'Good' },
        { subjectCode: 'CS503', subjectName: 'Computer Networks', attendancePercentage: 78.9, status: 'Warning' },
        { subjectCode: 'CS504', subjectName: 'Java Enterprise Programming', attendancePercentage: 95.2, status: 'Good' },
        { subjectCode: 'CS505', subjectName: 'Design & Analysis of Algorithms', attendancePercentage: 80.0, status: 'Good' },
      ];

      const semSubjects = seedSubjects.filter((s) => s.semesterNumber === studentSem);
      const semExams = seedExams.filter((e) => e.semesterNumber === studentSem);
      const semTimetable = seedTimetable.filter((t) => t.semesterNumber === studentSem);
      const semAssignments = await campusRepository.getAssignments(undefined, profile);
      const semNotes = await campusRepository.getNotes(undefined, undefined, studentSem, profile);

      const totalAtt = Math.round(
        userAttendance.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / (userAttendance.length || 1) * 10
      ) / 10;

      academicSummary = [
        `### 📊 Student Academic Records (Authentic Semester ${studentSem} Data):`,
        `- Enrolled Subjects: ${semSubjects.map((s) => `${s.name} (${s.code})`).join(', ') || 'Operating Systems, DBMS, Networks'}`,
        `- Real-time Attendance (Overall: ${totalAtt}%):`,
        ...userAttendance.map((a) => `  * ${a.subjectName} (${a.subjectCode}): ${a.attendancePercentage}% [${a.status}]`),
        `- Upcoming Examinations:`,
        ...semExams.slice(0, 3).map((e) => `  * ${e.subject} (${e.subjectCode}): ${e.date} at ${e.time} (${e.room})`),
        `- Next Scheduled Classes:`,
        ...semTimetable.slice(0, 3).map((t) => `  * ${t.dayOfWeek} ${t.time}: ${t.subject} with ${t.teacher} (${t.room})`),
        `- Pending Assignments:`,
        ...semAssignments.slice(0, 3).map((a) => `  * ${a.title} (Due: ${a.dueDate}, Max Score: ${a.maxScore})`),
        `- Available Notes in Library:`,
        ...semNotes.slice(0, 5).map((n) => `  * ${n.title} (${n.size || n.fileSize}) by ${n.teacher}`),
      ].join('\n');
    }

    // 5. Faculty Summary (for teachers)
    let facultySummary: string | undefined = undefined;
    if (role === 'teacher') {
      const teaching = AuthorizationService.getFacultyTeachingAssignments(profile.id || profile.email);
      const authorizedSemesters = AuthorizationService.getFacultyAuthorizedSemesters(profile.id || profile.email);
      facultySummary = [
        '### 🎓 Faculty Teaching Scope (Strictly Authorized Teaching Assignments):',
        `- Active Teaching Assignments: ${
          teaching.length > 0
            ? teaching.map((t) => `${t.subjectName} (${t.subjectCode} - Semester ${t.semesterNumber} Sec ${t.section})`).join(', ')
            : 'Operating Systems (CS501 - Semester 5 Sec A)'
        }`,
        `- Authorized Semesters: ${
          authorizedSemesters.length > 0
            ? authorizedSemesters.map((s) => `Semester ${s}`).join(', ')
            : 'Semester 5'
        }`,
        '- Class Attendance Averages: OS Sec A (89.2%), DBMS Sec B (85.7%)',
        '- Students Flagged at Attendance Risk (<75%):',
        '  * Rohit Verma (BCA2403) - 68.5% in Operating Systems [Notice Dispatched]',
        '  * Vikram Mehta (BCA2442) - 68.5% in Operating Systems [Notice Dispatched]',
        '  * Divya Rao (BCA2419) - 71.0% in DBMS [Borderline Warning]',
        '- Security Notice: You are strictly authorized to view, manage, and publish content ONLY for your assigned subjects and semesters above.',
      ].join('\n');
    }

    // 6. Admin Summary (for admins)
    if (role === 'admin') {
      academicSummary = [
        '### 🏛️ Institutional Overview (Authentic CampusOS Data):',
        '- Department: Bachelor of Computer Applications (BCA)',
        '- Total Students Enrolled: 240 across 6 semesters',
        '- Active Faculty Members: 18 professors',
        '- Average Institutional Attendance: 91.8%',
        '- Semester Pass Rate: 94.2%',
      ].join('\n');
    }

    // 7. Code Lab Summary (when Code Lab context is provided or active)
    let codeLabSummary: string | undefined = undefined;
    if (options.codeLabContext || path.includes('code-lab')) {
      const ctx = options.codeLabContext;
      if (ctx) {
        codeLabSummary = [
          '### 💻 Code Lab Editor Context:',
          `- Active File: ${ctx.fileName || 'main.py'} (${ctx.language || 'Python'})`,
          `- Cursor Position: Line ${ctx.cursorLine || 1}`,
          ctx.problemStatement ? `- Problem Statement: ${ctx.problemStatement}` : '',
          ctx.sourceCode ? `- Current Source Code:\n\`\`\`${ctx.language || 'text'}\n${ctx.sourceCode.slice(0, 2500)}\n\`\`\`` : '',
          ctx.selectedCode ? `- Selected Snippet:\n\`\`\`\n${ctx.selectedCode}\n\`\`\`` : '',
          ctx.stderr || ctx.compilationOutput
            ? `- Error / Compiler Output:\n\`\`\`\n${(ctx.stderr || ctx.compilationOutput || '').slice(0, 1500)}\n\`\`\``
            : '',
          ctx.stdout ? `- Execution Output (stdout):\n\`\`\`\n${ctx.stdout.slice(0, 1000)}\n\`\`\`` : '',
        ].filter(Boolean).join('\n');
      }
    }

    return {
      role,
      userSummary,
      pageSummary,
      academicSummary,
      facultySummary,
      documentSummary,
      codeLabSummary,
      rawContext: {
        userId: profile.id,
        userName,
        role,
        department: profile.department,
        semester: profile.semester,
        path,
        tab,
      },
    };
  }

  /**
   * Formats the compact context into a prompt segment for LLM injection.
   */
  static formatContextForPrompt(ctx: CompactCampusContext): string {
    const parts = [
      ctx.userSummary,
      ctx.pageSummary,
      ctx.academicSummary,
      ctx.facultySummary,
      ctx.documentSummary,
      ctx.codeLabSummary,
    ].filter(Boolean);

    const securityPolicy =
      ctx.role === 'student'
        ? `[STRICT ACCESS CONTROL POLICY]: The active user is a student in Semester ${ctx.userSummary.match(/Semester (\d+)/)?.[1] || 5}. Under NO circumstances should you provide, search, or summarize exams, notes, or internal files from other semesters. If asked about materials from other semesters, clearly state that your access is restricted to their enrolled semester.`
        : ctx.role === 'teacher'
        ? `[STRICT ACCESS CONTROL POLICY]: The active user is a faculty member. Access is restricted to their explicitly assigned subjects and semesters.`
        : '';

    if (securityPolicy) {
      parts.push(securityPolicy);
    }

    return parts.join('\n\n');
  }
}
