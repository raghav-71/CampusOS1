/**
 * Campus OS — Faculty Code Lab Types
 * Extends Code Lab for professors, teaching assistants, and examiners.
 */

import { CodeExecutionResult, TestCase } from '@/types/codelab';

export type FacultyAIMode = 'developer' | 'teaching' | 'assessment' | 'exam';

export type DifficultyLevel =
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'Expert'
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced';

export interface CodingQuestionDraft {
  id: string;
  title: string;
  subject: string;
  semester: string;
  topic: string;
  difficulty: DifficultyLevel;
  marks: number;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  expectedComplexity?: string;
  allowedLanguages: string[];
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  referenceSolution: Record<string, string>; // languageId -> code
  learningObjective?: string;
  vivaQuestions?: string[];
  createdAt: number;
  updatedAt: number;
  status: 'DRAFT' | 'SAVED' | 'PUBLISHED';
}

export interface ProgrammingAssignmentDraft {
  id: string;
  title: string;
  subject: string;
  semester: string;
  topic: string;
  difficulty: DifficultyLevel;
  numQuestions: number;
  timeLimitMinutes: number;
  allowedLanguages: string[];
  questions: CodingQuestionDraft[];
  totalMarks: number;
  rubricId?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: number;
  updatedAt: number;
}

export interface RubricCriterion {
  id: string;
  category: string; // e.g. "Algorithm & Correctness", "Code Quality & Style", "Time Complexity", "Edge Cases Handling"
  maxMarks: number;
  description: string;
}

export interface AssignmentRubric {
  id: string;
  assignmentId?: string;
  title: string;
  totalMarks: number;
  criteria: RubricCriterion[];
  createdAt: number;
}

export interface StudentCodeSubmission {
  id: string;
  studentId: string;
  studentName: string;
  questionId: string;
  questionTitle: string;
  language: string;
  submittedCode: string;
  submittedAt: number;
  status: 'PENDING' | 'EVALUATED';
  testResults?: {
    passed: number;
    total: number;
    details: Array<{ input: string; expected: string; actual: string; passed: boolean }>;
  };
  evaluation?: {
    suggestedScore: number;
    maxScore: number;
    correctness: string;
    strengths: string[];
    problems: string[];
    suggestions: string[];
    feedback: string;
    complexityAnalysis: string;
    evaluatedAt: number;
  };
}

export interface LabExerciseDraft {
  id: string;
  title: string;
  course: string;
  semester: string;
  durationMinutes: number;
  difficulty: DifficultyLevel;
  learningObjectives: string[];
  prerequisites: string[];
  problems: CodingQuestionDraft[];
  vivaQuestions: Array<{ question: string; answerKey: string; category: string }>;
  evaluationCriteria: string[];
  createdAt: number;
}
