import { UserProfile } from '@/types/campus';
import { AIContextData } from './aiTypes';
import { campusRepository } from '@/repositories/campusRepository';

export class AIContextBuilder {
  /**
   * Constructs dynamic runtime context for the AI prompt, tool execution, and hybrid intelligence.
   */
  static async buildContext(
    userProfile: UserProfile,
    currentPath: string = '/student-dashboard',
    currentTab: string = 'overview',
    selectedEntity?: Record<string, any>,
    recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIContextData> {
    const role = userProfile.role || 'student';
    let visibleDataSummary: Record<string, any> | undefined = undefined;

    try {
      if (currentTab === 'attendance' || currentPath.includes('attendance')) {
        const attRecords = await campusRepository.getAttendance();
        const total = attRecords.length || 1;
        const present = attRecords.filter((r) => r.status === 'present').length;
        const pct = Math.round((present / total) * 100);

        visibleDataSummary = {
          view: 'Attendance Sheet',
          overallPercentage: pct,
          attendedLectures: present,
          totalLectures: total,
          subjects: [
            { name: 'Operating Systems', percentage: 94.2, status: 'Satisfactory' },
            { name: 'DBMS', percentage: 87.5, status: 'Satisfactory' },
            { name: 'Computer Networks', percentage: 78.9, status: 'Satisfactory' },
            { name: 'Java Programming', percentage: 95.2, status: 'Satisfactory' },
            { name: 'Design & Analysis of Algorithms', percentage: 80.0, status: 'Satisfactory' },
          ],
        };
      } else if (currentTab === 'timetable' || currentPath.includes('timetable')) {
        const tt = await campusRepository.getStudentTimetable();
        visibleDataSummary = {
          view: 'Weekly Class Timetable',
          totalWeeklySlots: tt.length,
          upcomingLectures: tt
            .slice(0, 3)
            .map((t) => `${t.subject} (${t.dayOfWeek} ${t.time} in ${t.room})`),
        };
      } else if (currentTab === 'exams' || currentPath.includes('exams')) {
        visibleDataSummary = {
          view: 'Upcoming Examination Schedule',
          nextExam: 'Operating Systems (CS501) on Aug 27, 2026 at 10:00 AM (Exam Hall 1)',
          totalExamsScheduled: 4,
        };
      } else if (currentTab === 'assignments' || currentPath.includes('assignments')) {
        const asg = await campusRepository.getAssignments();
        visibleDataSummary = {
          view: 'Assignments Portal',
          pendingCount: asg.filter((a) => a.status === 'active').length,
          assignments: asg.map((a) => ({
            title: a.title,
            subject: a.subject,
            due: a.dueDate,
            status: a.status,
          })),
        };
      }
    } catch {
      // Ignore background context fetch errors
    }

    return {
      userId: userProfile.id || 'usr-default',
      userName: userProfile.fullName || (userProfile as any).name || 'Campus Member',
      userRole: role,
      department: userProfile.department || 'Computer Applications (BCA)',
      semester: userProfile.semester || 'Sem 5',
      user: {
        id: userProfile.id || 'usr-default',
        email: userProfile.email || 'student@campusos.edu',
        name: userProfile.fullName || (userProfile as any).name || 'Campus Member',
        role,
        department: userProfile.department || 'Computer Applications (BCA)',
        semester: userProfile.semester || 'Sem 5',
        rollNumber: userProfile.rollNumber || 'BCA2401',
        subjects: userProfile.subjects || [
          'Operating Systems',
          'DBMS',
          'Computer Networks',
          'Java Programming',
          'DAA',
        ],
      },
      currentPage: {
        route: currentPath,
        tab: currentTab,
        title: this.getPageTitle(currentPath, currentTab),
      },
      selectedEntityContext: selectedEntity,
      visibleDataContext: visibleDataSummary,
      selectedContext: selectedEntity,
      recentHistory,
    };
  }

  private static getPageTitle(path: string, tab: string): string {
    if (path.includes('admin')) return `Admin Dashboard (${tab})`;
    if (path.includes('teacher')) return `Faculty Dashboard (${tab})`;
    return `Student Dashboard (${tab})`;
  }
}
