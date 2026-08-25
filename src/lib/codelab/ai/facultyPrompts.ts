/**
 * Campus OS — Faculty Code Lab AI Prompts
 * Professional academic prompts for assignment generation, question authoring,
 * rubric design, viva preparation, and student submission evaluation.
 */

import { CodeAIContext } from '@/types/codelab';
import { FacultyAIMode, DifficultyLevel } from '@/types/facultyCodelab';

export type FacultyAIAction =
  | 'EXPLAIN_CODE'
  | 'FIND_BUGS'
  | 'FIX_CODE'
  | 'OPTIMIZE_CODE'
  | 'GENERATE_TESTS'
  | 'GENERATE_ASSIGNMENT'
  | 'GENERATE_QUESTION'
  | 'GENERATE_SOLUTION'
  | 'GENERATE_HINTS'
  | 'CREATE_RUBRIC'
  | 'EVALUATE_SUBMISSION'
  | 'ANALYZE_STUDENT_CODE'
  | 'GENERATE_VIVA'
  | 'GENERATE_LAB_EXERCISE'
  | 'GENERATE_PRACTICAL_EXAM'
  | 'FREE_CHAT';

export class FacultyPromptBuilder {
  static buildSystemPrompt(context: CodeAIContext, mode: FacultyAIMode = 'developer'): string {
    return `You are Campus OS Faculty Code Mentor & Senior Computer Science Examiner.
You assist university professors, teaching assistants, and department chairs in curriculum development, coding exam preparation, and rigorous student code evaluation.

### FACULTY MODE: ${mode.toUpperCase()} MODE
- **Developer Mode**: High-efficiency coding, debugging, architecture, and performance benchmarking.
- **Teaching Mode**: Pedagogical explanations, step-by-step lecture demonstrations, and visual conceptualization.
- **Assessment Mode**: Objective student submission analysis, edge case checking, and constructive grading feedback.
- **Exam Mode**: Formal problem design, rubric creation, secret test case synthesis, and viva defense question authoring.

### ACTIVE WORKSPACE CONTEXT:
- **Language**: ${context.language}
- **Active File**: ${context.fileName}
${context.problemStatement ? `- **Problem Statement**: ${context.problemStatement.slice(0, 500)}` : ''}

### PEDAGOGICAL STANDARDS:
1. Deliver structured, production-grade output tailored to computer science education (BCA, B.Tech CSE, MCA).
2. Formulate explicit, testable input/output formats and boundary constraints.
3. For test case creation, always include standard, edge (0, negative, empty, max limits), and invalid stress inputs.
4. When evaluating student code, provide structured suggestions without being punitive. Faculty retains final grading authority.`;
  }

  static buildActionPrompt(
    action: FacultyAIAction | string,
    context: CodeAIContext,
    params?: {
      subject?: string;
      semester?: string;
      topic?: string;
      difficulty?: DifficultyLevel;
      numQuestions?: number;
      durationMinutes?: number;
      marks?: number;
      studentCode?: string;
      referenceSolution?: string;
    }
  ): string {
    const act = (action || 'EXPLAIN_CODE').toUpperCase() as FacultyAIAction;

    switch (act) {
      case 'GENERATE_ASSIGNMENT':
        return `Design a complete university programming assignment:
- **Subject**: ${params?.subject || 'Data Structures & Algorithms'}
- **Semester**: ${params?.semester || 'Semester 3'}
- **Topic**: ${params?.topic || 'Arrays, Hash Maps, and Recursion'}
- **Difficulty**: ${params?.difficulty || 'Medium'}
- **Target Language**: ${context.language}
- **Number of Questions**: ${params?.numQuestions || 3}
- **Total Marks**: ${params?.marks || 30}

For each question provide:
1. Title & Problem Statement
2. Input and Output Format with constraints
3. 2 Sample Test Cases with explanations
4. 2 Hidden Edge Test Cases
5. Learning objective & Reference algorithm`;

      case 'GENERATE_QUESTION':
        return `Create a structured coding examination question based on this ${context.language} topic/code:
Topic: ${params?.topic || 'Core Programming & Data Structures'}
Difficulty: ${params?.difficulty || 'Medium'}
Marks: ${params?.marks || 10}

Output formatted as:
- **Title**: ...
- **Problem Statement**: ...
- **Input Format & Constraints**: ...
- **Output Format**: ...
- **Sample Test Cases (Input + Output)**: ...
- **Hidden Test Cases (Edge Cases)**: ...
- **Expected Time & Space Complexity Big-O**: ...
- **Reference Solution Outline**: ...`;

      case 'GENERATE_SOLUTION':
        return `Write an optimal, highly readable Reference Solution in ${context.language} with complete docstrings, time complexity $O(N)$, space complexity analysis, and modular helper functions.`;

      case 'GENERATE_TESTS':
        return `Generate a comprehensive test suite for this ${context.language} code:
1. **Visible Sample Cases (2)**
2. **Hidden Standard Cases (3)**
3. **Edge / Boundary Cases (3)** (e.g. empty input, single element, negative numbers, overflow limits)
4. **Stress Performance Cases (1)**
Format each with Input, Expected Output, and Rationale.`;

      case 'CREATE_RUBRIC':
        return `Create a detailed ${params?.marks || 20}-mark grading rubric for this programming problem:
Break down marks across:
1. Algorithm Correctness & Logic (${Math.round((params?.marks || 20) * 0.4)} marks)
2. Handling Edge Cases & Constraints (${Math.round((params?.marks || 20) * 0.25)} marks)
3. Time & Space Complexity Efficiency (${Math.round((params?.marks || 20) * 0.2)} marks)
4. Code Cleanliness, Naming & Style (${Math.round((params?.marks || 20) * 0.15)} marks)
Provide specific deduction criteria for common student mistakes.`;

      case 'EVALUATE_SUBMISSION':
        return `Evaluate the following student code submission against the reference solution and problem:

### REFERENCE CODE:
\`\`\`${context.language}
${context.sourceCode}
\`\`\`

### STUDENT SUBMISSION:
\`\`\`${context.language}
${params?.studentCode || 'No student code provided'}
\`\`\`

Provide an objective assessment:
1. **Suggested Score** (out of ${params?.marks || 10})
2. **Correctness Analysis**: Did the student solve the problem? What edge cases fail?
3. **Logical or Runtime Flaws**: Pinpoint exact lines and issues.
4. **Complexity Comparison**: Student Big-O vs Reference Big-O.
5. **Constructive Student Feedback**: What they did well and specific recommendations for improvement.`;

      case 'GENERATE_VIVA':
        return `Generate 6-8 oral viva examination questions for students defending this ${context.language} program:
Categories:
1. **Basic Understanding**: (e.g. Why did you choose this data structure?)
2. **Code & Algorithm Flow**: (e.g. Walk through line X with input Y)
3. **Complexity & Scaling**: (e.g. What is the time complexity and how does it behave at scale?)
4. **Debugging & Corner Cases**: (e.g. What happens if input is empty or null?)
5. **Alternative Paradigms**: (e.g. How would you solve this iteratively vs recursively?)
Provide expected answer keys for faculty reference.`;

      case 'GENERATE_LAB_EXERCISE':
        return `Design a structured 2-hour practical programming lab session for ${params?.subject || 'Programming in ' + context.language}:
- **Lab Objectives**
- **Core Concepts Covered**
- **Exercise 1: Basic Warmup Problem**
- **Exercise 2: Main Core Problem**
- **Exercise 3: Advanced Challenge / Bonus**
- **Lab Evaluation Sheet & Viva Checklist**`;

      case 'GENERATE_PRACTICAL_EXAM':
        return `Author a university practical lab examination question paper:
- **Course**: ${params?.subject || 'Computer Science'}
- **Duration**: ${params?.durationMinutes || 90} Minutes
- **Total Marks**: ${params?.marks || 50}
- **Section A (20 Marks)**: Core Algorithm & Implementation
- **Section B (20 Marks)**: Data Structure Problem with Constraints
- **Section C (10 Marks)**: Viva Voce & Code Optimization`;

      case 'GENERATE_HINTS':
        return `Create 3 progressive tiered hints for students attempting this problem:
- **Hint 1 (Conceptual)**: Points out the general data structure or approach without any code.
- **Hint 2 (Algorithmic)**: Explains the transformation or loop invariant.
- **Hint 3 (Implementation)**: Pseudocode structure for the tricky condition.`;

      case 'EXPLAIN_CODE':
        return `Provide a comprehensive lecture-ready explanation of this ${context.language} code, including architectural diagram flow in text, function invariants, memory layout, and Big-O derivations.`;

      case 'FIND_BUGS':
        return `Conduct an exhaustive faculty code audit on this ${context.language} code for logic flaws, security vulnerabilities, unhandled exceptions, and suboptimal patterns.`;

      case 'OPTIMIZE_CODE':
        return `Demonstrate how to optimize this ${context.language} code to optimal time and space complexity with formal algorithmic proofs.`;

      default:
        return `Assist the faculty member in developing, testing, or assessing this ${context.language} program.`;
    }
  }
}
