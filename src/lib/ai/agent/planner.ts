import { AIIntent, AIContextData } from '../aiTypes';

export interface ExecutionPlan {
  intent: AIIntent;
  requiresLLM: boolean;
  preFetchTools: string[];
  deterministicHandler?: string;
  reasoningGoal?: string;
}

export class AgentPlanner {
  /**
   * Plans the execution pipeline for a given user request.
   */
  static createPlan(message: string, intent: AIIntent, context: AIContextData): ExecutionPlan {
    const q = message.toLowerCase().trim();
    const role = context.user.role;

    // 1. Direct Navigation
    if (intent === 'NAVIGATE') {
      return {
        intent: 'NAVIGATE',
        requiresLLM: false,
        preFetchTools: ['navigateToRoute'],
        deterministicHandler: 'handleNavigation',
      };
    }

    // 2. Search Queries
    if (intent === 'SEARCH') {
      return {
        intent: 'SEARCH',
        requiresLLM: false,
        preFetchTools: ['searchCampusData', 'getStudentNotes'],
        deterministicHandler: 'handleSearch',
      };
    }

    // 3. Marks Card & Academic Documents Lookup
    if (
      q.includes('marks card') ||
      q.includes('markscard') ||
      q.includes('academic documents') ||
      q.includes('pending academic') ||
      q.includes('grade sheet')
    ) {
      return {
        intent: 'DATA_LOOKUP',
        requiresLLM: false,
        preFetchTools: ['getMarksCardStatus'],
        deterministicHandler: 'handleMarksCardLookup',
      };
    }

    // 4. Analytics / Role specific inspection
    if (intent === 'ANALYZE' || q.includes('low attendance') || q.includes('lowest attendance') || q.includes('weakest')) {
      if (q.includes('students') || role === 'teacher' || q.includes('class')) {
        if (q.includes('low attendance') || q.includes('at-risk') || q.includes('cutoff') || q.includes('weakest')) {
          return {
            intent: 'ANALYZE',
            requiresLLM: false,
            preFetchTools: ['getFacultyStudents'],
            deterministicHandler: 'handleFacultyLowAttendanceStudents',
          };
        }
      }

      if (q.includes('lowest attendance') && (q.includes('subject') || q.includes('which subject'))) {
        return {
          intent: 'ANALYZE',
          requiresLLM: false,
          preFetchTools: ['getStudentAttendance'],
          deterministicHandler: 'handleLowestAttendanceSubject',
        };
      }

      if (q.includes('weakest') || q.includes('worry about')) {
        return {
          intent: 'ANALYZE',
          requiresLLM: false,
          preFetchTools: ['getStudentAttendance', 'getStudentGrades'],
          deterministicHandler: 'handleWeakestAreaAnalysis',
        };
      }

      if (q.includes('lowest attendance') && (q.includes('dept') || q.includes('department'))) {
        return {
          intent: 'ANALYZE',
          requiresLLM: false,
          preFetchTools: ['getAdminAnalytics', 'getDepartments'],
          deterministicHandler: 'handleLowestAttendanceDept',
        };
      }

      if (q.includes('campus overview') || q.includes('overview of campus') || q.includes('attendance trends')) {
        return {
          intent: 'ANALYZE',
          requiresLLM: false,
          preFetchTools: ['getAdminAnalytics'],
          deterministicHandler: 'handleAdminOverview',
        };
      }
    }

    // 5. Fast Deterministic Data Lookups
    if (intent === 'DATA_LOOKUP') {
      if (q.includes('attendance') && !q.includes('why') && !q.includes('strategy') && !q.includes('plan')) {
        if (role === 'teacher' || q.includes('student')) {
          return {
            intent: 'ANALYZE',
            requiresLLM: false,
            preFetchTools: ['getFacultyStudents'],
            deterministicHandler: 'handleFacultyLowAttendanceStudents',
          };
        }
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: ['getStudentAttendance'],
          deterministicHandler: 'handleAttendanceLookup',
        };
      }

      if (
        q.includes('exam') ||
        q.includes('internal') ||
        q.includes('finals') ||
        q.includes('next exam')
      ) {
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: ['getStudentExams'],
          deterministicHandler: 'handleExamLookup',
        };
      }

      if (q.includes('assignment') || q.includes('pending work') || q.includes('homework')) {
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: ['getStudentAssignments'],
          deterministicHandler: 'handleAssignmentLookup',
        };
      }

      if (q.includes('timetable') || q.includes('schedule') || q.includes('today') || q.includes('next class')) {
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: role === 'teacher' ? ['getFacultyClasses'] : ['getStudentTimetable'],
          deterministicHandler: role === 'teacher' ? 'handleFacultyClassesLookup' : 'handleTimetableLookup',
        };
      }

      if (q.includes('classes') || q.includes('my classes')) {
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: ['getFacultyClasses'],
          deterministicHandler: 'handleFacultyClassesLookup',
        };
      }

      if (q.includes('submission')) {
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: ['getSubmissions', 'getFacultyAssignments'],
          deterministicHandler: 'handleSubmissionsLookup',
        };
      }

      if (q.includes('announcement') || q.includes('notice') || q.includes('circular')) {
        return {
          intent: 'DATA_LOOKUP',
          requiresLLM: false,
          preFetchTools: ['getAnnouncements'],
          deterministicHandler: 'handleAnnouncementsLookup',
        };
      }
    }

    // 6. Generative and Explanatory queries requiring LLM
    if (intent === 'GENERATE') {
      return {
        intent: 'GENERATE',
        requiresLLM: true,
        preFetchTools: ['getStudentNotes', 'getStudentExams', 'getStudentSubjects'],
        reasoningGoal: 'Generate syllabus-aligned academic content strictly via LLM reasoning.',
      };
    }

    if (intent === 'EXPLAIN') {
      return {
        intent: 'EXPLAIN',
        requiresLLM: true,
        preFetchTools: ['getStudentNotes'],
        reasoningGoal: 'Provide conceptual academic explanation with pedagogical clarity.',
      };
    }

    if (intent === 'RECOMMEND') {
      return {
        intent: 'RECOMMEND',
        requiresLLM: true,
        preFetchTools: ['getStudentExams', 'getStudentAttendance', 'getStudentNotes'],
        reasoningGoal: 'Synthesize student performance data and exam schedule into prioritized study blueprint.',
      };
    }

    // Default general reasoning
    return {
      intent: intent || 'GENERAL',
      requiresLLM: true,
      preFetchTools: ['searchCampusData'],
      reasoningGoal: 'Answer user inquiry accurately using retrieved Campus OS context.',
    };
  }
}
