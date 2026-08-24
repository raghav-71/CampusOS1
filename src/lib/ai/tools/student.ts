import { campusRepository } from '@/repositories/campusRepository';
import {
  mockExams,
  mockStudyProgressData,
  mockGradeDistributions,
  mockUsers,
  mockMarksCardSubmissions,
} from '@/repositories/mockData';
import { ExamCategory, ExamType, MarksCardDocument } from '@/types/campus';

export interface SubjectAttendanceItem {
  subjectCode: string;
  subjectName: string;
  attended: number;
  totalClasses: number;
  percentage: number;
  status: string;
}

export interface StudentAttendanceReport {
  overall: {
    attended: number;
    totalLectures: number;
    percentage: number;
    cutoffRequirement: number;
    status: string;
  };
  lowestSubject: {
    subjectCode: string;
    subjectName: string;
    percentage: number;
    attended: number;
    totalClasses: number;
  };
  subjects: SubjectAttendanceItem[];
}

export class StudentTools {
  static async getStudentProfile(studentId?: string) {
    const user = mockUsers.find((u) => u.id === studentId) || mockUsers[0];
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      semester: user.semester,
      rollNumber: user.rollNumber,
      stats: mockStudyProgressData,
    };
  }

  static async getStudentSubjects(department?: string, semester?: number) {
    if (semester) {
      return await campusRepository.getSubjectsBySemester(semester, department);
    }
    return await campusRepository.getSubjects(department);
  }

  static async getStudentTimetable(dayOfWeek?: string) {
    const timetable = await campusRepository.getStudentTimetable();
    if (dayOfWeek) {
      return timetable.filter(
        (t) => t.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
      );
    }
    return timetable;
  }

  static async getStudentExams(filters?: {
    subject?: string;
    category?: ExamCategory;
    type?: ExamType;
    semester?: number;
  }) {
    return await campusRepository.getExams(filters);
  }

  static async getMarksCardStatus(semester?: number): Promise<{
    documents: MarksCardDocument[];
    missingSemesters: number[];
    approvedCount: number;
    pendingCount: number;
  }> {
    const docs = await campusRepository.getMarksCardSubmissions();
    const missing = [1, 2, 3, 4].filter((s) => {
      const doc = docs.find((d) => d.semester === s);
      return !doc || doc.status === 'NOT_SUBMITTED' || doc.status === 'REJECTED';
    });
    const approved = docs.filter((d) => d.status === 'APPROVED').length;
    const pending = docs.filter((d) => d.status === 'SUBMITTED' || d.status === 'REVIEWING').length;

    return {
      documents: semester ? docs.filter((d) => d.semester === semester) : docs,
      missingSemesters: missing,
      approvedCount: approved,
      pendingCount: pending,
    };
  }

  static async getStudentAttendance(
    subject?: string,
    studentId?: string
  ): Promise<StudentAttendanceReport | SubjectAttendanceItem | { message: string }> {
    const subjectsList: SubjectAttendanceItem[] = [
      {
        subjectCode: 'CS501',
        subjectName: 'Operating Systems',
        attended: 42,
        totalClasses: 45,
        percentage: 93.3,
        status: 'Satisfactory (Above 75%)',
      },
      {
        subjectCode: 'CS502',
        subjectName: 'Database Management Systems',
        attended: 35,
        totalClasses: 40,
        percentage: 87.5,
        status: 'Satisfactory (Above 75%)',
      },
      {
        subjectCode: 'CS503',
        subjectName: 'Computer Networks',
        attended: 30,
        totalClasses: 38,
        percentage: 78.9,
        status: 'Warning: Close to 75% cutoff threshold',
      },
      {
        subjectCode: 'CS504',
        subjectName: 'Java Programming',
        attended: 40,
        totalClasses: 42,
        percentage: 95.2,
        status: 'Satisfactory (Above 75%)',
      },
      {
        subjectCode: 'CS505',
        subjectName: 'Design & Analysis of Algorithms',
        attended: 32,
        totalClasses: 40,
        percentage: 80.0,
        status: 'Satisfactory (Above 75%)',
      },
    ];

    if (subject) {
      const match = subjectsList.find(
        (s) =>
          s.subjectName.toLowerCase().includes(subject.toLowerCase()) ||
          s.subjectCode.toLowerCase().includes(subject.toLowerCase())
      );
      return match || { message: `Subject '${subject}' not found in attendance register.` };
    }

    return {
      overall: {
        attended: 179,
        totalLectures: 205,
        percentage: 87.3,
        cutoffRequirement: 75.0,
        status: 'All registered subjects satisfy university attendance eligibility.',
      },
      lowestSubject: {
        subjectCode: 'CS503',
        subjectName: 'Computer Networks',
        percentage: 78.9,
        attended: 30,
        totalClasses: 38,
      },
      subjects: subjectsList,
    };
  }

  static async getStudentAssignments(subject?: string) {
    const assignments = await campusRepository.getAssignments();
    if (subject) {
      return assignments.filter((a) =>
        a.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }
    return assignments;
  }

  static async getStudentGrades(studentId?: string) {
    return {
      gpa: 3.84,
      scale: 4.0,
      distributions: mockGradeDistributions,
      semesterRank: 4,
      totalCohort: 60,
      academicStanding: 'Dean’s Honor List',
    };
  }

  static async getStudentNotes(query?: string, subject?: string) {
    const notes = await campusRepository.getNotes(subject, query);
    return notes;
  }

  static async getStudentFlashcards(subject?: string) {
    const sub = subject || 'Operating Systems';
    return [
      {
        id: 'fc-1',
        subject: sub,
        front: 'What is Belady’s Anomaly?',
        back: 'A phenomenon in FIFO page replacement where allocating more page frames results in an increase in page faults.',
      },
      {
        id: 'fc-2',
        subject: sub,
        front: 'What are the 4 Coffman conditions for Deadlock?',
        back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\nAll four must hold simultaneously for deadlock to occur.',
      },
      {
        id: 'fc-3',
        subject: sub,
        front: 'What is Effective Memory Access Time (EMAT) with TLB?',
        back: 'EMAT = Hit_Ratio × (TLB_Time + Mem_Time) + (1 - Hit_Ratio) × (TLB_Time + 2 × Mem_Time)',
      },
    ];
  }
}
