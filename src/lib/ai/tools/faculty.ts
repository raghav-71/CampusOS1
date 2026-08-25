import { campusRepository } from '@/repositories/campusRepository';
import { mockTeacherSubjectAssignments } from '@/repositories/mockData';
import { TeacherSubjectAssignment } from '@/types/campus';

export class FacultyTools {
  static async getFacultyClasses(facultyId?: string, semester?: number, subject?: string) {
    let list: TeacherSubjectAssignment[] = mockTeacherSubjectAssignments;
    if (semester) {
      list = list.filter((c: TeacherSubjectAssignment) => c.semesterNumber === semester);
    }
    if (subject) {
      list = list.filter((c: TeacherSubjectAssignment) =>
        c.subjectName.toLowerCase().includes(subject.toLowerCase())
      );
    }

    return list.map((c: TeacherSubjectAssignment) => ({
      id: c.subjectId,
      subject: `${c.subjectName} (${c.subjectCode})`,
      name: c.subjectName,
      code: c.subjectCode,
      semester: c.semester,
      semesterNumber: c.semesterNumber,
      section: c.section,
      batch: `BCA ${c.semester} - Sec ${c.section}`,
      studentsCount: c.enrolledStudents,
      avgAttendancePct: c.avgAttendancePct,
      room: c.room,
      timing: '10:00 AM – 11:00 AM',
    }));
  }

  static async getFacultyStudents(filters?: {
    classId?: string;
    subject?: string;
    semester?: number;
    lowAttendanceOnly?: boolean;
  }) {
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
        attendancePct: 96.0,
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
        reason: 'Low attendance in OS lecture cycle (<75%)',
      },
      {
        id: 'usr-011',
        name: 'Vikram Mehta',
        rollNumber: 'BCA2442',
        department: 'BCA',
        semester: 5,
        subject: 'Operating Systems',
        attendancePct: 68.5,
        isBelowCutoff: true,
        grade: 'C',
        reason: 'Medical leave & missed lectures (<75%)',
      },
      {
        id: 'usr-012',
        name: 'Pooja Hegde',
        rollNumber: 'BCA2502',
        department: 'BCA',
        semester: 3,
        subject: 'Data Structures',
        attendancePct: 71.0,
        isBelowCutoff: true,
        grade: 'B',
        reason: 'Missed recursion and tree traversal laboratory sessions',
      },
      {
        id: 'usr-013',
        name: 'Rahul Deshmukh',
        rollNumber: 'BCA2501',
        department: 'BCA',
        semester: 3,
        subject: 'Data Structures',
        attendancePct: 92.0,
        isBelowCutoff: false,
        grade: 'A+',
      },
    ];

    if (filters?.semester) {
      roster = roster.filter((r) => r.semester === filters.semester);
    }
    if (filters?.subject) {
      roster = roster.filter((r) =>
        r.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      );
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
      totalSubmissions: 64,
      pendingGrading: 8,
      maxScore: a.maxScore,
    }));
  }

  static async getSubmissions(assignmentId?: string) {
    const submissions = await campusRepository.getSubmissions(assignmentId);
    return submissions;
  }
}
