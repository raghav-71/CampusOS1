import { Role, UserProfile } from '@/types/campus';

export type AIIntent =
  | 'NAVIGATE'
  | 'SEARCH'
  | 'DATA_LOOKUP'
  | 'ANALYZE'
  | 'EXPLAIN'
  | 'GENERATE'
  | 'RECOMMEND'
  | 'ACTION'
  | 'GENERAL';

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
  | 'general'
  | 'navigation'
  | 'data_lookup'
  | 'analysis'
  | 'academic_help'
  | 'generation'
  | 'recommendation'
  | 'action'
  | 'general_question';

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
  studyPlan?: AIStudyPlan;
  questionPaper?: AIQuestionPaper;
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
  userId?: string;
  userName?: string;
  userRole?: Role;
  department?: string;
  semester?: string;
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
  selectedEntityContext?: Record<string, any>;
  visibleDataContext?: Record<string, any>;
  selectedContext?: Record<string, any>;
  recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIActionPayload {
  type:
    | 'navigate'
    | 'open_entity'
    | 'generate_quiz'
    | 'generate_study_plan'
    | 'generate_paper'
    | 'show_alert'
    | 'highlight_data';
  label?: string;
  route?: string;
  entityType?: 'assignment' | 'note' | 'exam' | 'subject' | 'announcement';
  entityId?: string;
  payload?: any;
}

export interface AIQuizData {
  title?: string;
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

export interface AIQuestionPaperSection {
  name: string;
  instructions?: string;
  marksPerQuestion?: number;
  totalSectionMarks?: number;
  questions: string[];
}

export interface AIQuestionPaper {
  title: string;
  subject: string;
  semester?: string;
  difficulty?: string;
  totalMarks: number;
  duration?: string;
  instructions?: string[];
  sections: AIQuestionPaperSection[];
  answerKey?: {
    rubrics: string[];
  };
}

export interface AIResponsePayload {
  answer: string;
  category: AIIntent | AIMode | string;
  action?: AIActionPayload;
  quizData?: AIQuizData;
  studyPlan?: AIStudyPlan;
  questionPaper?: AIQuestionPaper;
  toolsUsed?: string[];
  executionSteps?: Array<{ step: string; toolName?: string; status: string; durationMs?: number }>;
  suggestedPrompts?: string[];
  modelUsed?: string;
  provider?: string;
  isOfflineFallback?: boolean;
}

export interface AIRouterRequest {
  message: string;
  userProfile: UserProfile;
  currentPath?: string;
  currentTab?: string;
  sessionId?: string;
  selectedEntity?: Record<string, any>;
  mode?: string;
}
