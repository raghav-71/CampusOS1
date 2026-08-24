import { campusRepository } from '@/repositories/campusRepository';
import { mockExams } from '@/repositories/mockData';

export interface PageIntelligenceData {
  route: string;
  tab: string;
  title: string;
  focusedEntityName?: string;
  visibleDataSummary?: Record<string, any>;
}

export class PageContextManager {
  static async extractPageContext(
    currentPath: string = '/student-dashboard',
    currentTab: string = 'overview',
    selectedEntity?: Record<string, any>,
    userRole: string = 'student'
  ): Promise<PageIntelligenceData> {
    const cleanPath = currentPath.toLowerCase();
    const cleanTab = (currentTab || 'overview').toLowerCase();

    let title = 'Student Dashboard';
    if (cleanPath.includes('admin')) title = 'Institutional Admin Dashboard';
    else if (cleanPath.includes('teacher')) title = 'Faculty Academic Dashboard';

    let visibleDataSummary: Record<string, any> | undefined = undefined;
    let focusedEntityName: string | undefined = undefined;

    try {
      if (cleanTab === 'attendance' || cleanPath.includes('attendance')) {
        title = userRole === 'teacher' ? 'Faculty Attendance Register' : 'Student Attendance Portal';
        focusedEntityName = 'Attendance Records';
        const attendance = [
          { subjectCode: 'CS501', subjectName: 'Operating Systems', percentage: 93.3, status: 'Good' },
          { subjectCode: 'CS502', subjectName: 'Database Management Systems', percentage: 87.5, status: 'Good' },
          { subjectCode: 'CS503', subjectName: 'Computer Networks', percentage: 78.9, status: 'Risk Warning (Near 75%)' },
          { subjectCode: 'CS504', subjectName: 'Java Programming', percentage: 95.2, status: 'Good' },
          { subjectCode: 'CS505', subjectName: 'Design & Analysis of Algorithms', percentage: 80.0, status: 'Good' },
        ];

        visibleDataSummary = {
          view: 'Attendance Sheet',
          overallPercentage: 87.3,
          lowestSubject: { name: 'Computer Networks (CS503)', percentage: 78.9 },
          subjects: attendance,
          note: 'University minimum cutoff requirement is 75.0%.',
        };
      } else if (cleanTab === 'timetable' || cleanPath.includes('timetable')) {
        title = userRole === 'teacher' ? 'Faculty Teaching Timetable' : 'Student Weekly Timetable';
        focusedEntityName = 'Class Schedule';
        const tt = await campusRepository.getStudentTimetable();
        visibleDataSummary = {
          view: 'Weekly Class Timetable',
          totalSlots: tt.length,
          schedule: tt.slice(0, 5).map((s) => ({
            subject: s.subject,
            time: `${s.dayOfWeek} ${s.time}`,
            room: s.room,
            instructor: s.teacher,
          })),
        };
      } else if (cleanTab === 'exams' || cleanPath.includes('exams')) {
        title = 'Examination Schedule & Timetable';
        focusedEntityName = 'Upcoming Exams';
        visibleDataSummary = {
          view: 'Upcoming University Examinations',
          nextExam: {
            subject: 'Operating Systems (CS501)',
            date: 'Aug 27, 2026',
            time: '10:00 AM',
            venue: 'Block A, Exam Hall 1',
          },
          examsList: mockExams,
        };
      } else if (cleanTab === 'assignments' || cleanPath.includes('assignments')) {
        title = userRole === 'teacher' ? 'Faculty Assignment Management' : 'Student Assignments';
        focusedEntityName = selectedEntity?.title || 'Assignments';
        const asg = await campusRepository.getAssignments();
        visibleDataSummary = {
          view: 'Assignments Portal',
          pendingAssignments: asg.map((a) => ({
            id: a.id,
            title: a.title,
            subject: a.subject,
            due: a.dueDate,
            status: a.status,
          })),
        };
      } else if (cleanTab === 'notes' || cleanPath.includes('notes')) {
        title = 'Lecture Notes & Study Resources';
        focusedEntityName = selectedEntity?.title || 'Lecture Notes';
        const notes = await campusRepository.getNotes();
        visibleDataSummary = {
          view: 'Notes Library',
          totalNotesCount: notes.length,
          availableSubjects: ['Operating Systems', 'DBMS', 'Computer Networks', 'DAA', 'Java'],
        };
      }
    } catch {
      // Fallback gracefully
    }

    if (selectedEntity) {
      focusedEntityName = selectedEntity.title || selectedEntity.name || selectedEntity.subject;
    }

    return {
      route: currentPath,
      tab: currentTab,
      title,
      focusedEntityName,
      visibleDataSummary,
    };
  }
}
