import { AIIntent } from '../aiTypes';

export class IntentClassifier {
  /**
   * Classifies user query into one of the core Campus OS intents.
   */
  static classify(message: string): AIIntent {
    const q = message.toLowerCase().trim();

    // 1. NAVIGATE
    if (
      q.startsWith('open ') ||
      q.startsWith('go to ') ||
      q.startsWith('take me to ') ||
      q.startsWith('navigate to ') ||
      q.startsWith('switch to ') ||
      q.includes('open my timetable') ||
      q.includes('open timetable') ||
      q.includes('open attendance') ||
      q.includes('take me to attendance') ||
      q.includes('take me to my attendance') ||
      q.includes('take me to timetable') ||
      q.includes('open notes') ||
      q.includes('open assignments') ||
      q.includes('open marks card') ||
      q.includes('open profile')
    ) {
      return 'NAVIGATE';
    }

    // 2. SEARCH
    if (
      q.startsWith('find ') ||
      q.startsWith('search ') ||
      q.startsWith('lookup ') ||
      q.includes('find my notes') ||
      q.includes('find dbms notes') ||
      q.includes('find notes') ||
      q.includes('search my campus') ||
      q.includes('search campus') ||
      q.includes('find announcements')
    ) {
      return 'SEARCH';
    }

    // 3. GENERATE
    if (
      q.includes('generate ') ||
      q.includes('create paper') ||
      q.includes('generate paper') ||
      q.includes('question paper') ||
      q.includes('create a quiz') ||
      q.includes('create quiz') ||
      q.includes('give me a quiz') ||
      q.includes('10-question') ||
      q.includes('5-question') ||
      q.includes('quiz me') ||
      q.includes('create an assignment') ||
      q.includes('create assignment') ||
      q.includes('draft assignment') ||
      q.includes('make questions')
    ) {
      return 'GENERATE';
    }

    // 4. RECOMMEND
    if (
      q.includes('what should i study') ||
      q.includes('what to study') ||
      q.includes('recommend') ||
      q.includes('which subjects should i worry about') ||
      q.includes('what should i prepare') ||
      q.includes('study recommendation') ||
      q.includes('revision plan') ||
      q.includes('study plan')
    ) {
      return 'RECOMMEND';
    }

    // 5. ANALYZE
    if (
      q.includes('why is this') ||
      q.includes('why is my') ||
      q.includes('why is attendance low') ||
      q.includes('low attendance') ||
      q.includes('lowest attendance') ||
      q.includes('which subject am i weakest') ||
      q.includes('weakest subject') ||
      q.includes('weakest students') ||
      q.includes('lowest attendance dept') ||
      q.includes('department has the lowest') ||
      q.includes('analyze') ||
      q.includes('attendance trends') ||
      q.includes('campus overview') ||
      q.includes('overview of campus') ||
      q.includes('at-risk') ||
      q.includes('pacing anomaly')
    ) {
      return 'ANALYZE';
    }

    // 6. EXPLAIN
    if (
      q.includes('explain ') ||
      q.includes('teach me ') ||
      q.includes('how does ') ||
      q.includes('what is dijkstra') ||
      q.includes('explain dijkstra') ||
      q.includes('what is bcnf') ||
      q.includes('what is normalization') ||
      q.includes('what is paging') ||
      q.includes('what is deadlock') ||
      q.includes('explain this') ||
      q.includes('tell me about this') ||
      q.includes('tcp/ip') ||
      q.includes('difference between')
    ) {
      return 'EXPLAIN';
    }

    // 7. DATA_LOOKUP
    if (
      q.includes('attendance') ||
      q.includes('next exam') ||
      q.includes('first internal') ||
      q.includes('1st internal') ||
      q.includes('second internal') ||
      q.includes('2nd internal') ||
      q.includes('lab internal') ||
      q.includes('exams this month') ||
      q.includes('exams are left') ||
      q.includes('what exams') ||
      q.includes('marks card') ||
      q.includes('markscard') ||
      q.includes('academic documents') ||
      q.includes('pending academic') ||
      q.includes('next class') ||
      q.includes('pending assignments') ||
      q.includes('what assignments') ||
      q.includes('my grades') ||
      q.includes('my classes') ||
      q.includes('show my classes') ||
      q.includes('show classes') ||
      q.includes('show announcements') ||
      q.includes('recent announcements') ||
      q.includes('summarize my submissions') ||
      q.includes('show submissions') ||
      q.includes('what do i have today') ||
      q.includes('classes today')
    ) {
      return 'DATA_LOOKUP';
    }

    return 'GENERAL';
  }
}
