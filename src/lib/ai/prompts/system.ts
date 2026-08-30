/**
 * Campus OS System Prompt Builder
 * Establishes General-Purpose AI First + Campus OS Superpowers Second.
 */

export interface SystemPromptContext {
  userName?: string;
  userRole?: 'student' | 'teacher' | 'admin' | string;
  department?: string;
  semester?: number | string;
  currentPath?: string;
  currentTab?: string;
  selectedEntity?: string;
  user?: {
    name?: string;
    role?: string;
    department?: string;
    semester?: string;
  };
  currentPage?: {
    route?: string;
    tab?: string;
    title?: string;
  };
}

export class SystemPromptBuilder {
  static getBaseSystemPrompt(context: SystemPromptContext): string {
    const userName = context.userName || context.user?.name || 'Campus Member';
    const roleStr = (context.userRole || context.user?.role || 'student').toUpperCase();
    const semStr = context.semester ? `Semester ${context.semester}` : context.user?.semester || 'Semester 5';
    const deptStr = context.department || context.user?.department || 'BCA (Bachelor of Computer Applications)';
    const route = context.currentPath || context.currentPage?.route || '/student-dashboard';
    const tab = (context.currentTab || context.currentPage?.tab || 'overview').toUpperCase();

    return `You are Campus AI, a concise and helpful academic assistant inside Campus OS.

  Answer general questions, tutoring, coding, summaries, exam preparation, and study planning directly. Use Markdown when useful. Keep normal answers focused, usually under 250 words, and do not mention internal tools or reasoning.

Use Campus OS tools only when the user explicitly needs personal academic records, campus data, or navigation. Never use a tool for a general concept question. Treat tool results as the only source of campus facts; never invent grades, attendance, dates, or schedules.

Security: students may access only their own private records; faculty may access authorized class data; admins may access authorized institutional data. Never disclose another user's confidential information.

User: ${userName} | Role: ${roleStr} | Program: ${deptStr} | ${semStr} | View: ${route} (${tab})${context.selectedEntity ? ` | Focus: ${context.selectedEntity}` : ''}`;
  }
}
