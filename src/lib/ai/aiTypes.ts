import { Role, UserProfile } from '@/types/campus';

export type AIMode =
  | 'tutor'
  | 'study_plan'
  | 'quiz'
  | 'assignment'
  | 'exam_assist'
  | 'question_paper'
  | 'attendance_intel'
  | 'admin_copilot'
  | 'search'
  | 'general';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  timestamp?: string;
  toolCalls?: AIToolCall[];
  action?: AIActionPayload;
  quiz?: AIQuizData;
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
  allowedRoles: Role[];
}

export interface AIContextData {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    department?: string;
    semester?: string;
    rollNumber?: string;
    subjects?: string[];
  };
  currentPage: {
    route: string;
    tab?: string;
    title?: string;
  };
  selectedContext?: Record<string, any>;
  recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIActionPayload {
  type:
    | 'navigate'
    | 'generate_quiz'
    | 'generate_study_plan'
    | 'generate_paper'
    | 'show_alert'
    | 'highlight_data';
  label?: string;
  route?: string;
  payload?: any;
}

export interface AIQuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject?: string;
  selectedOption?: number;
}

export interface AIStudyPlanDay {
  day: number;
  title: string;
  topics: string[];
  duration: string;
  practiceGoal: string;
}

export interface AIStudyPlan {
  subject: string;
  targetExamDate?: string;
  totalDays: number;
  schedule: AIStudyPlanDay[];
  revisionTips: string[];
}

export interface AIResponsePayload {
  answer: string;
  category: AIMode;
  action?: AIActionPayload;
  quizData?: AIQuizData;
  studyPlan?: AIStudyPlan;
  toolsUsed?: string[];
  suggestedPrompts?: string[];
}
