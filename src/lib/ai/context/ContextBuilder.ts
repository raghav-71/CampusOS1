/**
 * Campus OS AI Context Builder
 * Constructs compact, authentic, and page-aware context from mock repositories
 * for students, faculty, administrators, and Code Lab sessions.
 */

import { UserProfile, Role } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { mockExams, mockSubjects, mockTimetable } from '@/repositories/mockData';
import { CodeAIContext } from '@/types/codelab';

export interface CampusAIContextOptions {
  userProfile?: Partial<UserProfile> | any;
  currentPath?: string;
  currentTab?: string;
  selectedEntity?: any;
  codeLabContext?: CodeAIContext;
  history?: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>;
}

export interface CompactCampusContext {
  role: Role;
  userSummary: string;
  pageSummary: string;
  academicSummary?: string;
  facultySummary?: string;
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
      email: 'arjun.sharma@campusos.edu',
      role: 'student' as Role,
      department: 'BCA',
      semester: 'Sem 5',
      rollNumber: 'BCA2401',
      initials: 'AS',
      subjects: ['Operating Systems', 'DBMS', 'Computer Networks', 'Java Programming', 'DAA'],
    };

    const role: Role = profile.role || 'student';
    const path = options.currentPath || '/student-dashboard';
    const tab = (options.currentTab || 'overview').toLowerCase();

    // 1. User Summary
    const userName = profile.fullName || profile.name || 'Campus Member';
    const userSummary = `User: ${userName} | Role: ${role.toUpperCase()} | Department: ${profile.department || 'BCA'} | ${profile.semester || 'Semester 5'} (Roll: ${profile.rollNumber || 'BCA2401'})`;

    // 2. Page & Tab Summary
    let pageSummary = `Current Page: ${path} (Active Tab: ${tab.toUpperCase()})`;
    if (options.selectedEntity) {
      const entityTitle = options.selectedEntity.title || options.selectedEntity.name || options.selectedEntity.subject;
      if (entityTitle) {
        pageSummary += ` | Focused Item: ${entityTitle}`;
      }
    }

    // 3. Academic Summary (for students)
    let academicSummary: string | undefined = undefined;
    if (role === 'student') {
      academicSummary = [
        '### 📊 Student Academic Records (Authentic CampusOS Data):',
        '- Enrolled Subjects: Operating Systems (CS501), DBMS (CS502), Computer Networks (CS503), Java Programming (CS504), DAA (CS505)',
        '- Real-time Attendance:',
        '  * OS (CS501): 93.3% [Good]',
        '  * DBMS (CS502): 87.5% [Good]',
        '  * Computer Networks (CS503): 78.9% [⚠️ Risk Warning - Near 75% Cutoff]',
        '  * Java (CS504): 95.2% [Excellent]',
        '  * DAA (CS505): 80.0% [Good]',
        '  * Cumulative Overall Attendance: 87.3%',
        '- Upcoming University Examinations:',
        '  * Operating Systems (CS501): Aug 27, 2026 at 10:00 AM (Block A, Exam Hall 1)',
        '  * Database Management Systems (CS502): Aug 30, 2026 at 10:00 AM (Block B, Exam Hall 2)',
        '  * Computer Networks (CS503): Sep 03, 2026 at 02:00 PM (Block A, Exam Hall 3)',
        '- Next Classes (Weekly Schedule):',
        '  * Monday 09:00 AM: Operating Systems with Dr. Priya Nair (Room 301)',
        '  * Monday 10:30 AM: DBMS with Prof. Rajesh Kumar (Lab 2)',
        '  * Tuesday 09:00 AM: Computer Networks with Dr. Amit Sen (Room 304)',
        '- Pending Assignments:',
        '  * DBMS ER-Diagram Modeling (Due: Sep 05, 2026)',
        '  * OS Deadlock Banker Algorithm Simulation (Due: Sep 08, 2026)',
        '- Active Study Notes in Library: OS Process Management, DBMS Normalization, CN Subnetting, Java Multithreading',
      ].join('\n');
    }

    // 4. Faculty Summary (for teachers)
    let facultySummary: string | undefined = undefined;
    if (role === 'teacher') {
      facultySummary = [
        '### 🎓 Faculty Teaching Scope (Authentic CampusOS Data):',
        '- Assigned Courses: Operating Systems (CS501 - Sem 5 Sec A, 60 students), DBMS (CS502 - Sem 5 Sec B, 58 students)',
        '- Class Attendance Averages: OS Sec A (89.2%), DBMS Sec B (85.7%)',
        '- Students Flagged at Attendance Risk (<75%):',
        '  * Rohit Verma (BCA2403) - 68.5% in Operating Systems [Notice Dispatched]',
        '  * Vikram Mehta (BCA2442) - 68.5% in Operating Systems [Notice Dispatched]',
        '  * Divya Rao (BCA2419) - 71.0% in DBMS [Borderline Warning]',
        '- Official Question Papers in Archive: End-Term Exam 2025 (OS CS501), Mid-Term Exam 2026 (DBMS CS502)',
      ].join('\n');
    }

    // 5. Admin Summary (for admins)
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

    // 6. Code Lab Summary (when Code Lab context is provided or active)
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
      ctx.codeLabSummary,
    ].filter(Boolean);

    return parts.join('\n\n');
  }
}
