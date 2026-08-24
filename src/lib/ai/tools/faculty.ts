import { campusRepository } from '@/repositories/campusRepository';
import { mockUsers } from '@/repositories/mockData';
import { ALL_TEACHER_CLASSES } from '@/app/teacher-dashboard/components/TeacherClassesView';

export class FacultyTools {
  static async getFacultyClasses(facultyId?: string, semester?: number, subject?: string) {
    let list = ALL_TEACHER_CLASSES;
    if (semester) {
      list = list.filter((c) => c.semesterNumber === semester);
    }
    if (subject) {
      list = list.filter((c) => c.name.toLowerCase().includes(subject.toLowerCase()));
    }

    return list.map((c) => ({
      id: c.id,
      subject: `${c.name} (${c.code})`,
      name: c.name,
      code: c.code,
      semester: c.semester,
      semesterNumber: c.semesterNumber,
      section: c.section,
      batch: `${c.department} ${c.semester} - Sec ${c.section}`,
      studentsCount: c.enrolledStudents,
      avgAttendancePct: c.avgAttendancePct,
      room: c.room,
      timing: c.nextLecture,
    }));
  }

  static async getFacultyStudents(filters?: {
    classId?: string;
    subject?: string;
    semester?: number;
    lowAttendanceOnly?: boolean;
  }) {
    // If specific class requested
    let roster = [
      {
        id: 'usr-001',
        name: 'Arjun Sharma',
        rollNumber: 'BCA2401',
        department: 'BCA',
        semester: 5,
        subject: 'Operating Systems',
        attendancePct: 93.3,
        isBelowCutoff: false,
        grade: 'A+',
      },
      {
        id: 'usr-002',
        name: 'Priya Menon',
        rollNumber: 'BCA2402',
        department: 'BCA',
        semester: 5,
        subject: 'Operating Systems',
        attendancePct: 91.0,
        isBelowCutoff: false,
        grade: 'O',
      },
      {
        id: 'usr-004',
        name: 'Rohit Verma',
        rollNumber: 'BCA2403',
        department: 'BCA',
        semester: 5,
        subject: 'Operating Systems',
        attendancePct: 68.5,
        isBelowCutoff: true,
        grade: 'C',
        reason: 'Low attendance in OS lecture cycle',
      },
      {
        id: 'usr-042',
        name: 'Vikram Mehta',
        rollNumber: 'BCA24-042',
        department: 'BCA',
        semester: 5,
        subject: 'Operating Systems',
        attendancePct: 68.5,
        isBelowCutoff: true,
        grade: 'C',
        reason: 'Medical leave & missed lectures',
      },
      {
        id: 'usr-019',
        name: 'Ananya Gupta',
        rollNumber: 'MCA25-019',
        department: 'MCA',
        semester: 3,
        subject: 'System Architecture',
        attendancePct: 62.0,
        isBelowCutoff: true,
        grade: 'D',
        reason: 'Unexcused absences in System Architecture',
      },
      {
        id: 'usr-020',
        name: 'Rahul Deshmukh',
        rollNumber: 'MCA25-001',
        department: 'MCA',
        semester: 3,
        subject: 'System Architecture',
        attendancePct: 88.0,
        isBelowCutoff: false,
        grade: 'A',
      },
    ];

    if (filters?.semester) {
      roster = roster.filter((r) => r.semester === filters.semester);
    }
    if (filters?.subject) {
      roster = roster.filter((r) => r.subject.toLowerCase().includes(filters.subject!.toLowerCase()));
    }
    if (filters?.lowAttendanceOnly) {
      roster = roster.filter((r) => r.isBelowCutoff);
    }

    return roster;
  }

  static async getFacultyAssignments(facultyId?: string) {
    const assignments = await campusRepository.getAssignments();
    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      dueDate: a.dueDate,
      totalSubmissions: 54,
      pendingGrading: 12,
      maxScore: a.maxScore,
    }));
  }

  static async getSubmissions(assignmentId?: string) {
    const submissions = await campusRepository.getSubmissions(assignmentId);
    return submissions;
  }
}
