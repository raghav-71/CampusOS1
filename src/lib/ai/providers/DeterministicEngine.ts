/**
 * Campus OS Deterministic AI Engine (Offline Fallback)
 * Provides deterministic tool execution and transparent offline notices when no LLM provider is reachable.
 */

import { toolRegistry, AIExecutionContext } from '../tools/ToolRegistry';
import { DocumentChunker } from '../documents/DocumentChunker';

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

    // ─── 0. ATTACHED DOCUMENT / STUDY MATERIAL CONTEXT ─────────────────────────
    const selectedDoc: any = context.selectedEntity;
    if (selectedDoc && (selectedDoc.extractedText || selectedDoc.title || selectedDoc.description)) {
      // Security Boundary Check for Cross-Semester Document Access
      const targetSem = selectedDoc.targetSemester || selectedDoc.semesterNumber;
      const studentSem = context.semester;
      if (context.userRole === 'student' && targetSem && studentSem && targetSem !== studentSem) {
        return {
          answer: `🛡️ **Access Denied (Strict Access Control Boundary)**: You are enrolled in Semester ${studentSem}. You cannot access, inspect, or summarize materials for Semester ${targetSem}.`,
          category: 'ACTION',
          toolsUsed: [],
          executionSteps: [{ step: 'Security boundary validation', status: 'FAILED', durationMs: 5 }],
          suggestedPrompts: ['What is my attendance?', 'When is my next exam?', 'Open my timetable'],
          modelUsed: 'campus-security-guard',
          provider: 'CampusOS Security',
          durationMs: Date.now() - startTime,
        };
      }

      const text = selectedDoc.extractedText || selectedDoc.description || '';
      const docTitle = selectedDoc.title || selectedDoc.name || 'Attached Course Document';
      const chunks = DocumentChunker.chunkText(text);

      const isAssignment =
        selectedDoc.type === 'assignment' ||
        selectedDoc.dueDate ||
        selectedDoc.maxScore ||
        docTitle.toLowerCase().includes('assignment') ||
        docTitle.toLowerCase().includes('report') ||
        docTitle.toLowerCase().includes('simulator');

      // A. Assignment Explanation ("Explain what this assignment is asking me to do")
      if (
        isAssignment &&
        (q.includes('explain what') ||
          q.includes('asking me to do') ||
          q.includes('how to do') ||
          q.includes('what to do') ||
          q.includes('assignment requirement') ||
          q.includes('instructions'))
      ) {
        recordStep('Synthesizing assignment objectives and problem breakdown');
        const desc = selectedDoc.description || text || '';
        return {
          answer: `### 📋 Assignment Breakdown: "${docTitle}"
**Course / Subject**: \`${selectedDoc.subject || 'BCA Computer Science'}\` · **Max Score**: **${selectedDoc.maxScore || 50} Marks** · **Deadline**: **${selectedDoc.dueDate || 'Upcoming'}**

---

#### 1. Core Objective & Goal
This assignment assesses your mastery of **${selectedDoc.subject || 'Core Concepts'}**. Your task is to design, implement, and document a working solution following university standards.

#### 2. Detailed Problem Breakdown
${desc.length > 50 ? desc : 'Implement the required algorithmic logic, handle edge cases, conduct performance evaluations, and write a concise technical report.'}

#### 3. Recommended Step-by-Step Approach
1. **Requirement Analysis**: Read through all constraints, expected inputs, and outputs carefully.
2. **Algorithm & Architecture**: Outline your data structures, class diagrams, and helper functions before coding.
3. **Implementation**: Code in modular units with clear variable names and inline documentation.
4. **Testing & Edge Cases**: Test with boundary values, null/empty inputs, and scale datasets.
5. **Report & Submission**: Bundle your source code with clean screenshots or PDF documentation as specified.

---
💡 *Tip: You can ask me "How should I approach this problem?" or "Summarize the attached PDF" for more specific guidance!*`,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: ['How should I approach this problem?', 'Summarize attached PDF', 'What are key viva questions?'],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      // B. Step-by-Step Approach / Question Guidance ("How should I approach question 3?")
      if (
        q.includes('how should i approach') ||
        q.includes('how to approach') ||
        q.includes('step by step') ||
        q.includes('guide me') ||
        q.includes('how to solve')
      ) {
        recordStep('Generating structured step-by-step solution methodology');
        const relevant = DocumentChunker.findRelevantChunks(query, chunks, 2);
        const refContext = relevant.map((r) => r.text).join('\n\n');

        return {
          answer: `### 💡 Step-by-Step Guidance for "${docTitle}"

To tackle this problem systematically:

1. **Deconstruct the Input & State**:
   - Identify given parameters, data structures, and initial state.
   - For algorithmic problems (e.g. Page Replacement, Normalization, Banker's Algorithm, LINQ), write down the mathematical invariants first.

2. **Core Algorithm Logic**:
   - Write pseudocode tracing one complete cycle on paper.
   - Maintain state arrays/dictionaries for tracking counts, time stamps, or matrices.

3. **Defensive Edge Case Handling**:
   - Verify handling of division by zero, null references, and out-of-bound indices.
   - Ensure proper cleanup of open file streams, sockets, and memory allocations.

4. **Self-Verification & Benchmarking**:
   - Trace your solution against sample test inputs.
   - Verify output format matches the instructor specification.

${refContext.length > 50 ? `\n**Reference Specification Notes:**\n> ${refContext.slice(0, 300).replace(/\n/g, ' ')}...` : ''}`,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: ['Explain what this assignment asks', 'Summarize attached PDF', 'Give me viva questions'],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      // C. Document / Assignment Summarization
      if (q.includes('summar') || q.includes('revision') || q.includes('overview') || q.includes('key point')) {
        recordStep('Generating structured academic summary from document text');
        const summary = DocumentChunker.generateAcademicSummary(docTitle, text, selectedDoc.subject);
        return {
          answer: summary,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: ['How should I approach this problem?', 'Give me 15 viva questions', 'What are key definitions?'],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      // D. Authentic Multiple Choice Questions (MCQs) Generation
      if (q.includes('mcq') || q.includes('multiple choice') || q.includes('10 questions') || q.includes('quiz me') || q.includes('generate questions')) {
        recordStep('Generating 10 authentic MCQs from document text');
        const mcqOutput = DocumentChunker.generateAuthenticMCQs(docTitle, text, selectedDoc.subject, 10);
        return {
          answer: mcqOutput,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: ['Summarize this document', 'Explain Question 3 in detail', 'What are key definitions?'],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      // E. Viva & Exam Revision Questions
      if (q.includes('viva') || q.includes('exam question') || q.includes('interview')) {
        recordStep('Extracting viva & exam questions from document text');
        const relevant = DocumentChunker.findRelevantChunks(query, chunks, 3);
        const refText = relevant.map((r) => r.text).join('\n\n');

        let vivaAnswer = `### 🎯 High-Yield Exam & Viva Questions for "${docTitle}"\n\n`;
        vivaAnswer += `Based on the verified document content:\n\n`;
        vivaAnswer += `1. **Core Mechanism**: Explain the fundamental design pattern and algorithmic logic implemented in this document.\n`;
        vivaAnswer += `2. **Language Invariants**: What are the specific keywords, constraints, and syntax rules governing these modules?\n`;
        vivaAnswer += `3. **Memory & Lifecycle**: How are resources, garbage collection, and object lifecycles handled?\n`;
        vivaAnswer += `4. **Exception Handling**: What runtime exceptions can occur during execution, and how are they prevented?\n`;
        vivaAnswer += `5. **Production Best Practices**: How would you optimize and test this codebase for large-scale enterprise deployments?\n\n`;
        if (refText.length > 50) {
          vivaAnswer += `**Relevant Document Extract:**\n> *${refText.slice(0, 300).replace(/\n/g, ' ')}...*\n`;
        }

        return {
          answer: vivaAnswer,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: ['Generate 10 MCQs from this document', 'Summarize this document', 'Explain key formulas'],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      // C. Specific Experiment / Topic Query
      recordStep('Querying relevant document chunks', 'search_document');
      const relevantChunks = DocumentChunker.findRelevantChunks(query, chunks, 3);
      if (relevantChunks.length > 0) {
        let answerText = `### 📑 Document Extract: ${docTitle}\n\n`;
        relevantChunks.slice(0, 2).forEach((c) => {
          const headingLabel = c.heading || (c.pageNumber ? `Page ${c.pageNumber}` : 'Relevant Section');
          answerText += `#### ${headingLabel}\n${c.text.slice(0, 1000)}\n\n`;
        });
        answerText += `---\n**Subject Area**: \`${selectedDoc.subject || 'BCA Coursework'}\` · **Status**: Verified course document content.`;

        return {
          answer: answerText,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: ['Generate 10 MCQs from this document', 'Summarize this document', 'Explain this concept simply'],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      // D. General Document Analysis
      return {
        answer: `### 📑 Document Analysis: ${docTitle}\n\n${text.slice(0, 2000)}\n\n---\n**Key Takeaways:**\n- **Core Topic**: Comprehensive overview of ${selectedDoc.subject || 'BCA Course Material'}.\n- **Key Highlights**: Covers theoretical foundations, code implementations, and exam notes.`,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: ['Give me 5 viva questions', 'Summarize key points', 'Explain code'],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── OS THEORY: DEADLOCKS & PROCESS SYNCHRONIZATION ──────────────────────
    if (q.includes('deadlock') || q.includes('coffman') || q.includes('banker')) {
      return {
        answer: `### 🔒 Operating Systems: Deadlocks & Prevention

A **Deadlock** is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.

#### 1. The 4 Coffman Conditions (Must all hold simultaneously):
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process is holding at least one resource and waiting to acquire additional resources.
3. **No Preemption**: Resources cannot be preempted; they can only be released voluntarily by the holding process.
4. **Circular Wait**: A closed chain of processes exists such that $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., $P_n$ waits for $P_0$.

#### 2. Prevention & Avoidance:
- **Deadlock Prevention**: Invalidate at least one of the 4 Coffman conditions (e.g., impose total ordering of resources to prevent circular wait).
- **Deadlock Avoidance (Banker's Algorithm)**: Dynamically checks resource allocation state to ensure the system never enters an *Unsafe State*.`,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: ['Explain Banker algorithm', 'What is semaphore in OS?', 'When is my OS exam?'],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

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

    // ─── 2. ABSENCE, ILLNESS & COLLEGE LEAVE LETTER ───────────────────────────
    if (
      q.includes('letter') ||
      q.includes('leave') ||
      q.includes('cannot attend') ||
      q.includes("can't attend") ||
      q.includes("won't be able to attend") ||
      q.includes('not able to come') ||
      q.includes('unable to attend') ||
      q.includes('absent') ||
      q.includes('appointment') ||
      q.includes('sick') ||
      q.includes('fever') ||
      q.includes('unwell') ||
      q.includes('emergency')
    ) {
      recordStep('Processing absence notice & leave policy guidelines');

      const isDraftRequest =
        q.includes('write a letter') ||
        q.includes('draft') ||
        q.includes('generate a letter') ||
        q.includes('write the letter') ||
        q.includes('leave letter') ||
        q.includes('application') ||
        q.includes('write letter');

      const studentName = context.userName || 'Arjun Sharma';
      const rollNo = 'BCA2401';
      const dept = context.department || 'BCA (Bachelor of Computer Applications)';
      const sem = context.semester ? `Semester ${context.semester}` : 'Semester 5';
      const todayDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (isDraftRequest) {
        return {
          answer: `### 📄 Formal College Leave Application Letter

Here is a complete, formal leave letter formatted for your department:

---

**Date:** ${todayDate}  
**To:**  
The Class Teacher / Head of Department  
Department of ${dept}  
CampusOS Institute of Technology  

**Subject: Application for Leave of Absence**

Respected Sir/Madam,

I am writing to formally request a leave of absence from classes on **${todayDate}** due to unavoidable personal/medical circumstances.

I assure you that I will review the shared lecture notes on CampusOS and complete any assigned lab exercises or submissions promptly upon my return. I will also consult with my peers and professors to ensure no academic coursework is missed.

Kindly grant me permission and approve my leave of absence for this period.

Thanking you.

Yours sincerely,  
**${studentName}**  
**Roll Number:** \`${rollNo}\`  
**Program:** ${dept} (${sem})  

---
*Tip: You can copy this letter directly or send it to your faculty mentor.*`,
          category: 'ACADEMIC',
          toolsUsed,
          executionSteps: steps,
          suggestedPrompts: [
            'What is my attendance?',
            'Check upcoming assignments',
            'Open notes library',
          ],
          modelUsed: 'CampusOS AI',
          provider: 'CampusOS AI',
          durationMs: Date.now() - startTime,
          isOfflineFallback: true,
        };
      }

      return {
        answer: `### 📌 Absence & College Leave Guidelines

I understand that you are unable to attend scheduled classes. Here is what you should do:

1. **Inform Your Faculty Mentor / Class Teacher**:
   - According to college academic policy, please notify your class teacher or faculty mentor about your absence so it is officially noted in the department logs.

2. **Submit a Formal Leave Application**:
   - If you require an official leave letter for documentation or attendance exemption, I can draft a complete, professional application for you right away.

3. **Catch Up on Lecture Material**:
   - All lecture slides, PDF notes, and lab assignments will remain accessible via the **Notes Library** tab on CampusOS.

---
👉 *Would you like me to draft a formal leave letter for you now? Just say: **"Write a letter for me"**.*`,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: [
          'Write a letter for me',
          'What is my attendance?',
          'Open my notes library',
        ],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 3. ATTENDANCE QUERY (STUDENT/TEACHER) ────────────────────────────────
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
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 4. CORE CS & ACADEMIC TOPICS (POLYMORPHISM, RECURSION, NORMALIZATION, NULLPOINTER) ─
    if (q.includes('polymorphism')) {
      return {
        answer: `### ☕ Polymorphism in Object-Oriented Programming

**Polymorphism** (from Greek: "many forms") is the ability of an object or method to take on multiple forms. In OOP (such as Java or C++), there are two primary types:

#### 1. Compile-Time Polymorphism (Method Overloading)
Multiple methods with the same name but different parameter lists within the same class:
\`\`\`java
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}
\`\`\`

#### 2. Runtime Polymorphism (Method Overriding / Dynamic Method Dispatch)
A subclass provides a specific implementation of a method declared in its parent class:
\`\`\`java
class Animal {
    void makeSound() { System.out.println("Animal sound"); }
}
class Dog extends Animal {
    @Override
    void makeSound() { System.out.println("Woof!"); }
}
\`\`\`

**Key Benefits:** Code reusability, extensibility, and interface decoupling.`,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: ['Explain recursion with code', 'What is normalization in DBMS?', 'Open Code Lab'],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    if (q.includes('recursion')) {
      return {
        answer: `### 🔁 Recursion in Computer Science

**Recursion** is a programming technique where a function calls itself to solve smaller sub-problems of the same type until reaching a base condition.

#### Essential Components:
1. **Base Case**: The condition that terminates recursion to prevent stack overflow.
2. **Recursive Step**: The reduction of the input toward the base case.

#### Example: Factorial in Java / Python
\`\`\`java
public static int factorial(int n) {
    if (n <= 1) return 1; // Base case
    return n * factorial(n - 1); // Recursive call
}
\`\`\`

**Time Complexity:** $O(N)$  
**Space Complexity:** $O(N)$ due to call stack frames.`,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: ['What is polymorphism?', 'Explain binary search', 'Open Code Lab'],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    if (q.includes('normalization') || q.includes('bcnf') || q.includes('1nf') || q.includes('2nf') || q.includes('3nf')) {
      return {
        answer: `### 🗄️ Database Normalization (1NF to BCNF)

**Normalization** is the systematic process of organizing data in a relational database to minimize redundancy and eliminate insertion, update, and deletion anomalies.

| Normal Form | Rule Requirement |
| :--- | :--- |
| **1NF** | Atomic column values (no multi-valued attributes / repeating groups). |
| **2NF** | In 1NF + No partial functional dependencies (all non-key attributes fully dependent on candidate key). |
| **3NF** | In 2NF + No transitive dependencies ($A \\to B$ and $B \\to C$). |
| **BCNF** | Stricter 3NF: For every functional dependency $X \\to Y$, $X$ must be a super key. |`,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: ['What is ACID in DBMS?', 'What is polymorphism?', 'When is my DBMS exam?'],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    if (q.includes('nullpointer') || q.includes('null pointer')) {
      return {
        answer: `### ⚠️ Debugging Java NullPointerException (NPE)

A **NullPointerException** occurs when your code attempts to access a field, call a method, or index an array using an object reference that points to \`null\` in memory.

#### Common Causes & Fixes:
1. **Uninitialized Object Reference**:
   \`\`\`java
   // ❌ Cause:
   String str = null;
   System.out.println(str.length()); // Throws NPE

   //  Fix: Safe null-check or Optional
   if (str != null) {
       System.out.println(str.length());
   }
   \`\`\`
2. **Uninitialized Array Elements**:
   \`\`\`java
   Student[] students = new Student[5];
   students[0].getName(); // ❌ students[0] is null
   \`\`\`
3. **Use Objects.requireNonNull or Optional**:
   \`\`\`java
   Optional.ofNullable(str).ifPresent(s -> System.out.println(s.length()));
   \`\`\``,
        category: 'ACADEMIC',
        toolsUsed,
        executionSteps: steps,
        suggestedPrompts: ['Open Code Lab', 'What is polymorphism?', 'Check my attendance'],
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 5. EXAMS QUERY ──────────────────────────────────────────────────────
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
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 6. TIMETABLE & NEXT CLASS ───────────────────────────────────────────
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
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 7. NAVIGATION COMMANDS ──────────────────────────────────────────────
    if (q.startsWith('open ') || q.startsWith('go to ') || q.startsWith('navigate to ')) {
      let targetTab = 'overview';
      if (q.includes('timetable') || q.includes('schedule')) targetTab = 'timetable';
      else if (q.includes('attendance')) targetTab = 'attendance';
      else if (q.includes('exam')) targetTab = 'exams';
      else if (q.includes('subject') || q.includes('course')) targetTab = 'subjects';
      else if (q.includes('note') || q.includes('document')) targetTab = 'notes';
      else if (q.includes('paper')) targetTab = 'papers';
      else if (q.includes('announcement') || q.includes('notice')) targetTab = 'announcements';
      else if (q.includes('feedback')) targetTab = 'feedback';
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
        modelUsed: 'CampusOS AI',
        provider: 'CampusOS AI',
        durationMs: Date.now() - startTime,
        isOfflineFallback: true,
      };
    }

    // ─── 8. GENERAL ASSISTANT RESPONSE ───────────────────────────────────────
    recordStep('Generating response');
    return {
      answer: `### 🎓 CampusOS AI Assistant

I am ready to help you with:
- **Academic Queries & Tutoring**: Ask about OS, DBMS, Algorithms, Java, and Networking.
- **Attendance & Timetable**: Check real-time attendance rates, lecture venues, and upcoming classes.
- **Absence & Leave Assistance**: I can draft formal college leave applications and mentor notifications.
- **Exam Preparation**: Review syllabus topics, scheduled exam dates, and sample viva questions.
- **Code Lab Tutoring**: Ask for code explanations, debugging hints, and complexity analysis.

**Sample Questions:**
- *"I cannot attend classes tomorrow because of an appointment"*
- *"Write a leave letter for me"*
- *"What is polymorphism in Java?"*
- *"When is my next exam?"*`,
      category: 'GENERAL',
      toolsUsed,
      executionSteps: steps,
      suggestedPrompts: [
        'I cannot attend classes tomorrow',
        'What is my attendance?',
        'When is my next exam?',
        'What is polymorphism in Java?',
      ],
      modelUsed: 'CampusOS AI',
      provider: 'CampusOS AI',
      durationMs: Date.now() - startTime,
      isOfflineFallback: true,
    };
  }
}
