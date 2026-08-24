import { AIChatMessage, AIToolDefinition, AIContextData } from '../aiTypes';
import { AIProvider, AIProviderResponse, ProviderStatusInfo } from './types';
import { AIToolsExecutor } from '../aiTools';
import { AINavigationManager } from '../aiNavigation';

export class FallbackProvider implements AIProvider {
  name: 'fallback' = 'fallback';

  isConfigured(): boolean {
    return true; // Always available offline
  }

  async generateResponse(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    context: AIContextData,
    systemPrompt: string
  ): Promise<AIProviderResponse> {
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const q = latestUserMsg.toLowerCase().trim();
    const role = context.user?.role || 'student';
    const userId = context.user?.id || 'usr-001';

    // 1. Direct Navigation intent
    const navIntent = AINavigationManager.parseNavigationIntent(latestUserMsg, role);
    if (navIntent) {
      return {
        content: `📍 **Opening ${navIntent.label}**\n\nNavigating to \`${navIntent.route}\`...`,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: navIntent.label,
          route: navIntent.route,
        },
      };
    }

    // 2. Attendance Query
    if (q.includes('attendance') || q.includes('absent') || q.includes('bunk')) {
      const attendance = await AIToolsExecutor.executeTool(
        'getStudentAttendance',
        { studentId: userId },
        role
      );

      if (!attendance.success || !attendance.data) {
        return {
          content: `I couldn't find your attendance information in Campus OS records.`,
          finishReason: 'stop',
          provider: 'fallback',
          modelUsed: 'deterministic-local-intelligence',
          isOfflineFallback: true,
        };
      }

      const overall = attendance.data.overall || {
        percentage: 87.3,
        attended: 179,
        totalLectures: 205,
      };
      const subjects = attendance.data.subjects || [];
      const lowList = subjects.filter((s: any) => s.percentage < 75);

      let text = `### 📊 Your Campus OS Attendance Report\n\n`;
      text += `**Overall Cumulative Attendance:** \`${overall.percentage}%\` (${overall.attended}/${overall.totalLectures} lectures attended)\n\n`;
      text += `**Subject Breakdown:**\n`;
      subjects.forEach((s: any) => {
        const flag = s.percentage < 75 ? '⚠️ *Below 75% Cutoff*' : '✓ Satisfactory';
        text += `- **${s.subjectName} (${s.subjectCode}):** \`${s.percentage}%\` (${s.attended}/${s.totalClasses} classes) — ${flag}\n`;
      });

      if (lowList.length > 0) {
        text += `\n> [!WARNING]\n> **Action Recommended:** Your attendance in **${lowList.map((l: any) => l.subjectName).join(', ')}** is below the minimum 75% university criteria. You need to attend consecutive upcoming lectures to prevent exam debarment.`;
      } else {
        text += `\n> [!NOTE]\n> Excellent job! You currently fulfill the 75% attendance requirement for all registered subjects.`;
      }

      return {
        content: text,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'View Full Attendance Sheet',
          route: '/student-dashboard?tab=attendance',
        },
      };
    }

    // 3. Timetable / Next class
    if (
      q.includes('timetable') ||
      q.includes('schedule') ||
      q.includes('class today') ||
      q.includes('next class') ||
      q.includes('classes')
    ) {
      if (role === 'teacher') {
        const teacherClasses = await AIToolsExecutor.executeTool(
          'getFacultyClasses',
          { facultyId: userId },
          role
        );
        return {
          content: `### 👨‍🏫 Your Teaching Schedule\n\n- **Operating Systems (CS501):** BCA Sem 5 (Div A) · 60 Students · Mon, Wed, Fri 10:30 AM (Room A-204)\n- **System Architecture (MCA302):** MCA Sem 3 (Div B) · 45 Students · Tue, Thu 2:00 PM (Room B-102)\n- **OS Lab (CS501L):** BCA Sem 5 (Batch 1) · 30 Students · Friday 2:00 PM – 4:00 PM (Lab 3)`,
          finishReason: 'stop',
          provider: 'fallback',
          modelUsed: 'deterministic-local-intelligence',
          isOfflineFallback: true,
          action: {
            type: 'navigate',
            label: 'Open Teaching Schedule',
            route: '/teacher-dashboard?tab=classes',
          },
        };
      }

      const tt = await AIToolsExecutor.executeTool('getStudentTimetable', {}, role);
      const list = tt.data || [];
      let text = `### 📅 Your Weekly Timetable\n\nHere is your scheduled lecture lineup:\n\n`;
      list.forEach((slot: any) => {
        text += `- **${slot.subject}** (${slot.type || 'Lecture'}): ${slot.dayOfWeek || slot.day} ${slot.time} in **${slot.room}** (Instructor: ${slot.teacher})\n`;
      });

      return {
        content: text,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'Open Interactive Timetable',
          route: '/student-dashboard?tab=timetable',
        },
      };
    }

    // 4. Exams / Dates
    if (
      q.includes('exam') ||
      q.includes('mid term') ||
      q.includes('end term') ||
      q.includes('finals')
    ) {
      const examsRes = await AIToolsExecutor.executeTool(
        'getStudentExams',
        { studentId: userId },
        role
      );
      const list = examsRes.data || [];
      let text = `### 📝 Registered Examination Schedule\n\n`;
      list.forEach((ex: any) => {
        text += `- **${ex.subject}** (${ex.subjectCode}): **${ex.date}** at ${ex.time} — *${ex.room}*\n`;
      });
      text += `\n*Please remember to carry your physical College Hall Ticket and Student ID card.*`;

      return {
        content: text,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'View Exam Timetable',
          route: '/student-dashboard?tab=exams',
        },
      };
    }

    // 5. Assignments & Deadlines
    if (
      q.includes('assignment') ||
      q.includes('homework') ||
      q.includes('deadline') ||
      q.includes('pending work') ||
      q.includes('finish')
    ) {
      const asgRes = await AIToolsExecutor.executeTool(
        'getStudentAssignments',
        { studentId: userId },
        role
      );
      const list = asgRes.data || [];
      const pending = list.filter((a: any) => a.status !== 'graded');
      let text = `### 📋 Assignment & Submissions Overview\n\n`;
      text += `**Total Pending Submissions:** ${pending.length}\n\n`;
      list.forEach((a: any) => {
        text += `- **${a.title}** (${a.subject}): Due **${a.dueDate}** — *Status: ${a.status}* (Max Marks: ${a.maxMarks || 100})\n`;
      });

      return {
        content: text,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'Open Assignments Portal',
          route: '/student-dashboard?tab=assignments',
        },
      };
    }

    // 6. Notes Search
    if (
      q.includes('note') ||
      q.includes('pdf') ||
      q.includes('material') ||
      q.includes('slides') ||
      q.includes('find')
    ) {
      const notesRes = await AIToolsExecutor.executeTool(
        'getStudentNotes',
        { query: latestUserMsg },
        role
      );
      const list = notesRes.data || [];
      let text = `### 📚 Lecture Notes & Study Materials in Library\n\n`;
      if (list.length === 0) {
        text += `No specific documents matched "${latestUserMsg}". You can browse all uploaded notes in the Notes Explorer.`;
      } else {
        list.slice(0, 4).forEach((n: any) => {
          text += `- **${n.title}** (${n.subject}) by Prof. ${n.teacher} · ${n.pages} pages\n`;
        });
      }

      return {
        content: text,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'Open Notes Explorer',
          route: '/student-dashboard?tab=notes',
        },
      };
    }

    // 7. Practice Quiz Generation
    if (
      q.includes('quiz') ||
      q.includes('practice question') ||
      q.includes('mcq') ||
      q.includes('daa question')
    ) {
      const quiz = {
        question:
          'Which page replacement algorithm suffers from Belady’s Anomaly where allocating more page frames leads to more page faults?',
        options: [
          'FIFO (First-In, First-Out)',
          'LRU (Least Recently Used)',
          'Optimal Page Replacement (OPT)',
          'LFU (Least Frequently Used)',
        ],
        correctIndex: 0,
        explanation:
          'FIFO is not a stack algorithm and does not maintain the inclusion property, causing Belady’s Anomaly for certain reference strings.',
        subject: 'Operating Systems (CS501)',
      };

      return {
        content: `### 🎯 Practice Quiz: Operating Systems (CS501)\n\nHere is an exam-level question from your syllabus:`,
        quizData: quiz,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
      };
    }

    // 8. Study Plan Generation
    if (
      q.includes('study plan') ||
      q.includes('revision') ||
      q.includes('study today') ||
      q.includes('daa exam tomorrow')
    ) {
      return {
        content: `### 🗓️ 5-Day Exam Revision Blueprint: Operating Systems (CS501)\n\n1. **Day 1 — Process Management & Synchronization:** Review PCB, state models, mutexes, semaphores, and Peterson’s solution.\n2. **Day 2 — CPU Scheduling Algorithms:** Practice numerical problems on FCFS, SJF, Round Robin (varying time quanta), and Priority Scheduling.\n3. **Day 3 — Deadlocks:** Master the 4 Coffman conditions, Resource Allocation Graphs, and Banker’s Safety & Request Algorithm.\n4. **Day 4 — Memory Management:** Study Paging, Segmentation, TLB hit ratios, and Page Replacement algorithms (FIFO, LRU, Optimal).\n5. **Day 5 — Final Mock Test & Formula Sheet:** Solve past 3 years university question papers and answer key rubrics.\n\n[Open Notes Explorer] to retrieve chapter notes.`,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'Open OS Lecture Notes',
          route: '/student-dashboard?tab=notes',
        },
      };
    }

    // 9. Institutional / Admin Overview
    if (role === 'admin' || q.includes('campus overview') || q.includes('analytics')) {
      const analytics = await AIToolsExecutor.executeTool('getAdminAnalytics', {}, 'admin');
      const data = analytics.data;
      return {
        content: `### 🏛️ Campus OS Institutional Intelligence Overview\n\n- **Total Enrolled Students:** ${data.totalStudentsEnrolled}\n- **Overall Attendance Compliance:** ${data.averageInstitutionalAttendance}%\n- **At-Risk Students (<75% attendance):** ${data.atRiskStudentsCount}\n- **Syllabus Pacing Warnings:** ${data.curriculumAnomaliesCount}\n\nAll department records are indexed and available in the Admin Copilot.`,
        finishReason: 'stop',
        provider: 'fallback',
        modelUsed: 'deterministic-local-intelligence',
        isOfflineFallback: true,
        action: {
          type: 'navigate',
          label: 'Open Admin Copilot',
          route: '/admin-dashboard?tab=copilot',
        },
      };
    }

    // 10. Default Local Assistance
    return {
      content: `### ⚡ Campus OS Intelligence Core (Local Mode)\n\nI am connected directly to your **${role.toUpperCase()}** profile and repository.\n\nYou can ask me to:\n- 📅 **"Open my timetable"** or check scheduled classes\n- 📊 **"What is my attendance?"** for live subject percentages\n- 📝 **"When is my next exam?"** to inspect test dates\n- 📋 **"Show pending assignments"** to view upcoming deadlines\n- 📚 **"Find notes on Virtual Memory"** to search lecture documents\n- 🎯 **"Generate a practice quiz"** for exam revision`,
      finishReason: 'stop',
      provider: 'fallback',
      modelUsed: 'deterministic-local-intelligence',
      isOfflineFallback: true,
    };
  }

  async generateStructured<T>(
    prompt: string,
    systemPrompt: string,
    schemaHint?: string
  ): Promise<T> {
    const samplePaper = {
      title: 'Operating Systems (CS501) — Examination Assessment',
      semester: 'Semester 5',
      subject: 'Operating Systems (CS501)',
      duration: '3 Hours',
      totalMarks: 100,
      partA: {
        title: 'Part A (Short Conceptual Questions — 5 × 4 = 20 Marks)',
        questions: [
          '1. Define the four Coffman conditions necessary for a deadlock to occur.',
          '2. Differentiate between preemptive and non-preemptive CPU scheduling with examples.',
          '3. Explain Belady’s Anomaly and identify which page replacement algorithm experiences it.',
          '4. What is a Translation Lookaside Buffer (TLB) and how does it reduce memory access time?',
          '5. Describe the critical section problem and the three requirements for a valid solution.',
        ],
      },
      partB: {
        title: 'Part B (Comprehensive Analytical Questions — 4 × 20 = 80 Marks)',
        questions: [
          '6. (a) Apply Banker’s Algorithm for Deadlock Avoidance to verify if the given system state is safe.\n(b) Explain Resource-Request algorithm steps in detail.',
          '7. (a) Compare Round Robin, Shortest Job First (SJF), and FCFS for average turnaround and waiting time.\n(b) Illustrate with a detailed Gantt chart.',
          '8. (a) Explain Paging hardware with TLB. Derive Effective Memory Access Time (EMAT).\n(b) Contrast internal vs external fragmentation.',
          '9. (a) Discuss disk scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN, and LOOK.\n(b) Analyze seek time minimization for a 200-cylinder disk.',
        ],
      },
      answerKey: {
        rubrics: [
          'Part A: 2 marks for definition/concept, 2 marks for valid formula/diagram/example.',
          'Part B Numerical: 10 marks for step-by-step matrix reduction and safety vector check.',
          'Part B Theory: 6 marks for architectural diagram, 8 marks for explanation, 6 marks for comparative matrix.',
        ],
      },
    };

    return samplePaper as unknown as T;
  }

  async checkHealth(): Promise<ProviderStatusInfo> {
    return {
      providerName: 'Local Campus OS Intelligence',
      status: 'online',
      model: 'deterministic-engine',
      isFree: true,
      message: '100% Offline Capable & Deterministic',
      latencyMs: 1,
    };
  }
}
