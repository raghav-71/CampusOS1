/**
 * Campus OS — Faculty Code Repositories
 * Repository pattern providing persistence for Question Banks, Assignments,
 * Student Submissions, and Rubrics.
 */

import {
  CodingQuestionDraft,
  ProgrammingAssignmentDraft,
  StudentCodeSubmission,
  AssignmentRubric,
} from '@/types/facultyCodelab';

const QUESTIONS_KEY = 'campusos_faculty_questions_v1';
const ASSIGNMENTS_KEY = 'campusos_faculty_assignments_v1';
const SUBMISSIONS_KEY = 'campusos_faculty_submissions_v1';
const RUBRICS_KEY = 'campusos_faculty_rubrics_v1';

export interface IQuestionRepository {
  getQuestions(): Promise<CodingQuestionDraft[]>;
  getQuestionById(id: string): Promise<CodingQuestionDraft | null>;
  saveQuestion(question: CodingQuestionDraft): Promise<CodingQuestionDraft>;
  deleteQuestion(id: string): Promise<boolean>;
}

export interface IAssignmentRepository {
  getAssignments(): Promise<ProgrammingAssignmentDraft[]>;
  getAssignmentById(id: string): Promise<ProgrammingAssignmentDraft | null>;
  saveAssignment(assignment: ProgrammingAssignmentDraft): Promise<ProgrammingAssignmentDraft>;
  deleteAssignment(id: string): Promise<boolean>;
}

export interface ISubmissionRepository {
  getSubmissions(): Promise<StudentCodeSubmission[]>;
  getSubmissionById(id: string): Promise<StudentCodeSubmission | null>;
  saveSubmission(submission: StudentCodeSubmission): Promise<StudentCodeSubmission>;
}

export interface IRubricRepository {
  getRubrics(): Promise<AssignmentRubric[]>;
  saveRubric(rubric: AssignmentRubric): Promise<AssignmentRubric>;
}

export class LocalStorageFacultyRepository
  implements IQuestionRepository, IAssignmentRepository, ISubmissionRepository, IRubricRepository
{
  // Sample initial mock student submissions for testing evaluation
  private initialSubmissions: StudentCodeSubmission[] = [
    {
      id: 'sub-101',
      studentId: 'STU-2024-089',
      studentName: 'Aarav Sharma',
      questionId: 'q-two-sum',
      questionTitle: 'Two Sum Problem',
      language: 'Python',
      submittedCode: `def two_sum(nums, target):
    # Brute force approach
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return f"{i} {j}"
    return ""

import sys
lines = sys.stdin.read().split()
if lines:
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    print(two_sum(nums, target))`,
      submittedAt: Date.now() - 3600000 * 4,
      status: 'PENDING',
      testResults: {
        passed: 3,
        total: 3,
        details: [
          { input: '4\n2 7 11 15\n9', expected: '0 1', actual: '0 1', passed: true },
          { input: '3\n3 2 4\n6', expected: '1 2', actual: '1 2', passed: true },
          { input: '2\n3 3\n6', expected: '0 1', actual: '0 1', passed: true },
        ],
      },
    },
    {
      id: 'sub-102',
      studentId: 'STU-2024-114',
      studentName: 'Priya Patel',
      questionId: 'q-palindrome',
      questionTitle: 'Valid Palindrome',
      language: 'Python',
      submittedCode: `import sys

def is_palindrome(s):
    # Bug: Forgot to strip non-alphanumeric characters
    return s.lower() == s.lower()[::-1]

s = sys.stdin.read().strip()
print("true" if is_palindrome(s) else "false")`,
      submittedAt: Date.now() - 3600000 * 2,
      status: 'PENDING',
      testResults: {
        passed: 1,
        total: 3,
        details: [
          { input: 'A man, a plan, a canal: Panama', expected: 'true', actual: 'false', passed: false },
          { input: 'race a car', expected: 'false', actual: 'false', passed: true },
        ],
      },
    },
  ];

  // Questions
  async getQuestions(): Promise<CodingQuestionDraft[]> {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(QUESTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getQuestionById(id: string): Promise<CodingQuestionDraft | null> {
    const list = await this.getQuestions();
    return list.find((q) => q.id === id) || null;
  }

  async saveQuestion(question: CodingQuestionDraft): Promise<CodingQuestionDraft> {
    const list = await this.getQuestions();
    const idx = list.findIndex((q) => q.id === question.id);
    const updated = [...list];
    if (idx >= 0) {
      updated[idx] = { ...question, updatedAt: Date.now() };
    } else {
      updated.unshift({ ...question, updatedAt: Date.now() });
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
    }
    return question;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const list = await this.getQuestions();
    const filtered = list.filter((q) => q.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered));
    }
    return true;
  }

  // Assignments
  async getAssignments(): Promise<ProgrammingAssignmentDraft[]> {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ASSIGNMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getAssignmentById(id: string): Promise<ProgrammingAssignmentDraft | null> {
    const list = await this.getAssignments();
    return list.find((a) => a.id === id) || null;
  }

  async saveAssignment(assignment: ProgrammingAssignmentDraft): Promise<ProgrammingAssignmentDraft> {
    const list = await this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    const updated = [...list];
    if (idx >= 0) {
      updated[idx] = { ...assignment, updatedAt: Date.now() };
    } else {
      updated.unshift({ ...assignment, updatedAt: Date.now() });
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated));
    }
    return assignment;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const list = await this.getAssignments();
    const filtered = list.filter((a) => a.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(filtered));
    }
    return true;
  }

  // Submissions
  async getSubmissions(): Promise<StudentCodeSubmission[]> {
    if (typeof window === 'undefined') return this.initialSubmissions;
    try {
      const stored = localStorage.getItem(SUBMISSIONS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(this.initialSubmissions));
      return this.initialSubmissions;
    } catch {
      return this.initialSubmissions;
    }
  }

  async getSubmissionById(id: string): Promise<StudentCodeSubmission | null> {
    const list = await this.getSubmissions();
    return list.find((s) => s.id === id) || null;
  }

  async saveSubmission(submission: StudentCodeSubmission): Promise<StudentCodeSubmission> {
    const list = await this.getSubmissions();
    const idx = list.findIndex((s) => s.id === submission.id);
    const updated = [...list];
    if (idx >= 0) {
      updated[idx] = submission;
    } else {
      updated.unshift(submission);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    }
    return submission;
  }

  // Rubrics
  async getRubrics(): Promise<AssignmentRubric[]> {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RUBRICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async saveRubric(rubric: AssignmentRubric): Promise<AssignmentRubric> {
    const list = await this.getRubrics();
    const idx = list.findIndex((r) => r.id === rubric.id);
    const updated = [...list];
    if (idx >= 0) {
      updated[idx] = rubric;
    } else {
      updated.unshift(rubric);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(RUBRICS_KEY, JSON.stringify(updated));
    }
    return rubric;
  }
}

export const facultyCodeRepo = new LocalStorageFacultyRepository();
