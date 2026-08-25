/**
 * Campus OS Deterministic AI Engine (Offline Fallback)
 * Provides deterministic tool execution and transparent offline notices when no LLM provider is reachable.
 */

import { toolRegistry, AIExecutionContext } from '../tools/ToolRegistry';

export interface AgentStepExecution {
  step: string;
  toolName?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  durationMs?: number;
}

export interface AgentExecutionResponse {
  answer: string;
  category: 'ACADEMIC' | 'TIMETABLE' | 'CLASS' | 'FILE' | 'NOTIFICATION' | 'ACTION' | 'SEARCH' | 'TEACHER' | 'ADMIN' | 'GENERAL';
  toolsUsed: string[];
  executionSteps: AgentStepExecution[];
  actionRequired?: {
    type: 'NAVIGATE' | 'CONFIRM_WRITE' | 'OPEN_MODAL' | 'DOWNLOAD_FILE';
    label: string;
    payload: any;
  };
  suggestedPrompts: string[];
  modelUsed: string;
  provider: string;
  durationMs: number;
  isOfflineFallback?: boolean;
}

export class DeterministicEngine {
  static async process(
    query: string,
    context: AIExecutionContext
  ): Promise<AgentExecutionResponse> {
    const startTime = Date.now();
    const q = query.toLowerCase().trim();
    const steps: AgentStepExecution[] = [];
    const toolsUsed: string[] = [];

    const recordStep = (step: string, toolName?: string) => {
      steps.push({
        step,
        toolName,
        status: 'COMPLETED',
        durationMs: 25,
      });
      if (toolName && !toolsUsed.includes(toolName)) {
        toolsUsed.push(toolName);
      }
    };

    recordStep('Analyzing query & checking local tools');

    // ─── 1. TEACHER: START CLASS ─────────────────────────────────────────────
    if (
      (q.includes('start') || q.includes('go live') || q.includes('begin lecture')) &&
      (q.includes('class') || q.includes('lecture') || q.includes('session')) &&
      (context.userRole === 'teacher' || context.userRole === 'admin')
    ) {
      recordStep('Triggering live lecture broadcast', 'start_class');
      const res = await toolRegistry.executeTool('start_class', { subjectName: 'Operating Systems' }, context);
      const data = res.data;

      return {
        answer: `🚀 **Lecture Session is LIVE!**\n\n- **Subject**: **${data.subject}** (Sec ${data.section})\n- **Venue**: \`${data.room}\`\n- **Notification**: Broadcast sent to all students in ${data.broadcastedTo}.\n- **Status**: Live attendance session ready.`,
        category: 'CLASS',
        toolsUsed,
        executionSteps: steps,
        actionRequired: {
          type: 'NAVIGATE',
          label: 'Open Live Attendance Sheet',
          payload: { tab: 'attendance' },
        },
        suggestedPrompts: ['Show students below 75% attendance', 'Show my assigned classes', 'Open Question Papers'],
        modelUsed: 'deterministic-offline-engine',
        provider: 'Campus OS Local Engine (Offline)',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 2. ATTENDANCE QUERY (STUDENT/TEACHER) ────────────────────────────────
    if (
      (q.includes('my attendance') || q.includes('check attendance') || q.includes('what is my attendance') || q.includes('attendance percentage')) &&
      !q.includes('what does attendance mean') &&
      !q.includes('explain attendance')
    ) {
      recordStep('Querying student attendance records', 'get_student_attendance');
      const res = await toolRegistry.executeTool('get_student_attendance', {}, context);
      const data = res.data;

      let answer = `### 📊 Your Campus OS Attendance Summary\n\n`;
      answer += `**Cumulative Attendance:** \`${data.overallAttendance}\`\n\n`;
      answer += `**Subject Breakdown:**\n`;
      if (Array.isArray(data.subjectBreakdown)) {
        data.subjectBreakdown.forEach((s: any) => {
          const badge = s.status === 'GOOD_STANDING' ? '✓ Good Standing' : '⚠️ *Below 75% Cutoff*';
          answer += `- **${s.subject} (${s.code}):** \`${s.attendance}\` — ${badge}\n`;
        });
      }

      return {
        answer,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        actionRequired: {
          type: 'NAVIGATE',
          label: 'View Full Attendance Sheet',
          payload: { tab: 'attendance' },
        },
        suggestedPrompts: ['Which subject am I weakest in?', 'When is my next exam?', 'What is my next class?'],
        modelUsed: 'deterministic-offline-engine',
        provider: 'Campus OS Local Engine (Offline)',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 3. EXAMS QUERY ──────────────────────────────────────────────────────
    if (q.includes('my exam') || q.includes('exam schedule') || q.includes('upcoming exam') || q.includes('next exam')) {
      recordStep('Fetching scheduled examination timetable', 'get_exam_schedule');
      const res = await toolRegistry.executeTool('get_exam_schedule', { semester: context.semester || 5 }, context);
      const data = res.data;

      let answer = `### 📝 Scheduled BCA Semester ${data.semester} Examinations\n\n`;
      if (Array.isArray(data.schedule)) {
        data.schedule.forEach((e: any) => {
          answer += `- **${e.subject} (${e.code})** · \`${e.category}\`\n  📅 **Date:** ${e.date} at **${e.time}** | 📍 **Room:** \`${e.venue}\`\n`;
        });
      }

      return {
        answer,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        actionRequired: {
          type: 'NAVIGATE',
          label: 'Open Exam Timetable',
          payload: { tab: 'exams' },
        },
        suggestedPrompts: ['What is my attendance?', 'Which subject am I weakest in?', 'Open timetable'],
        modelUsed: 'deterministic-offline-engine',
        provider: 'Campus OS Local Engine (Offline)',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 4. TIMETABLE & NEXT CLASS ───────────────────────────────────────────
    if (q.includes('next class') || q.includes('next lecture')) {
      recordStep('Retrieving immediate next lecture slot', 'get_next_class');
      const res = await toolRegistry.executeTool('get_next_class', {}, context);
      const data = res.data;

      return {
        answer: `📍 **Next Upcoming Class**\n\n- **Subject:** **${data.nextClass}** (\`${data.code}\`)\n- **Time:** **${data.time}**\n- **Venue:** \`${data.venue}\`\n- **Instructor:** ${data.instructor}`,
        category: 'TIMETABLE',
        toolsUsed,
        executionSteps: steps,
        actionRequired: {
          type: 'NAVIGATE',
          label: 'Open Full Timetable',
          payload: { tab: 'timetable' },
        },
        suggestedPrompts: ['What is my attendance?', 'Show my marks', 'When is my next exam?'],
        modelUsed: 'deterministic-offline-engine',
        provider: 'Campus OS Local Engine (Offline)',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 5. NAVIGATION COMMANDS ──────────────────────────────────────────────
    if (q.startsWith('open ') || q.startsWith('go to ') || q.startsWith('navigate to ')) {
      let targetTab = 'overview';
      if (q.includes('timetable') || q.includes('schedule')) targetTab = 'timetable';
      else if (q.includes('attendance')) targetTab = 'attendance';
      else if (q.includes('exam')) targetTab = 'exams';
      else if (q.includes('subject') || q.includes('course')) targetTab = 'subjects';
      else if (q.includes('note') || q.includes('document')) targetTab = 'notes';
      else if (q.includes('paper')) targetTab = 'papers';
      else if (q.includes('announcement') || q.includes('notice')) targetTab = 'announcements';
      else if (q.includes('analytics')) targetTab = 'analytics';

      recordStep(`Navigating interface to ${targetTab}`, 'navigate_to_page');
      return {
        answer: `🚀 **Opening ${targetTab.toUpperCase()}**\n\nNavigating to the **${targetTab}** view in Campus OS.`,
        category: 'ACTION',
        toolsUsed,
        executionSteps: steps,
        actionRequired: {
          type: 'NAVIGATE',
          label: `Open ${targetTab}`,
          payload: { tab: targetTab },
        },
        suggestedPrompts: ['What is my next class?', 'Check my attendance', 'Show upcoming exams'],
        modelUsed: 'deterministic-offline-engine',
        provider: 'Campus OS Local Engine (Offline)',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 6. GENERAL OFFLINE NOTICE (NO NAVIGATION FORCING) ───────────────────
    recordStep('Offline mode notice');
    return {
      answer: `### ⚡ Campus AI (Offline Mode)\n\nI am currently running in **Local Offline Mode** without an active LLM connection. Local Campus OS tools (attendance, timetable, exams, subjects, navigation) are active and functional.\n\n> **To enable ChatGPT-level general intelligence, coding, and reasoning:**\n> 1. Launch **Ollama** locally (\`ollama run qwen2.5:7b\`), or\n> 2. Ensure your free \`GROQ_API_KEY\` or \`OPENROUTER_API_KEY\` is configured in \`.env.local\`.\n\n**Try asking campus questions:**\n- *"What is my attendance?"*\n- *"When is my next exam?"*\n- *"What is my next class?"*\n- *"Open my timetable"*`,
      category: 'GENERAL',
      toolsUsed,
      executionSteps: steps,
      suggestedPrompts: [
        'What is my attendance?',
        'When is my next exam?',
        'What is my next class?',
        'Open my timetable',
      ],
      modelUsed: 'deterministic-offline-engine',
      provider: 'Campus OS Engine (Offline Mode)',
      durationMs: Date.now() - startTime,
      isOfflineFallback: true,
    };
  }
}
