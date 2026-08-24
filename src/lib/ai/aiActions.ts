import { AIActionPayload, AIQuizData, AIStudyPlan } from './aiTypes';

export class AIActionsManager {
  static createNavigationAction(route: string, label: string): AIActionPayload {
    return {
      type: 'navigate',
      label,
      route,
    };
  }

  static createQuizAction(quiz: AIQuizData): AIActionPayload {
    return {
      type: 'generate_quiz',
      label: `Start ${quiz.subject || 'Practice'} Quiz`,
      payload: quiz,
    };
  }

  static createStudyPlanAction(plan: AIStudyPlan): AIActionPayload {
    return {
      type: 'generate_study_plan',
      label: `View ${plan.subject} ${plan.totalDays}-Day Study Plan`,
      payload: plan,
    };
  }

  static createAlertAction(message: string): AIActionPayload {
    return {
      type: 'show_alert',
      label: 'Campus Notification',
      payload: { message },
    };
  }
}
