import { UserProfile, Role, BcaSemester, Subject } from '@/types/campus';
import { seedSubjects } from '@/data/seed/subjects';

export interface TeachingAssignment {
  id: string;
  facultyId: string;
  facultyEmail: string;
  facultyName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semesterNumber: BcaSemester;
  year: 1 | 2 | 3;
  section: string;
}

export const seedTeachingAssignments: TeachingAssignment[] = [
  // Dr. Priya Nair (usr-faculty-001 / faculty@campusos.demo)
  // Teaches: S1 C Programming, S5 Operating Systems, S6 Cloud Computing
  {
    id: 'ta-001',
    facultyId: 'usr-faculty-001',
    facultyEmail: 'faculty@campusos.demo',
    facultyName: 'Dr. Priya Nair',
    subjectId: 'subj-101',
    subjectCode: 'CS101',
    subjectName: 'Problem Solving & C Programming',
    semesterNumber: 1,
    year: 1,
    section: 'A',
  },
  {
    id: 'ta-002',
    facultyId: 'usr-faculty-001',
    facultyEmail: 'faculty@campusos.demo',
    facultyName: 'Dr. Priya Nair',
    subjectId: 'subj-501',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    semesterNumber: 5,
    year: 3,
    section: 'A',
  },
  {
    id: 'ta-003',
    facultyId: 'usr-faculty-001',
    facultyEmail: 'faculty@campusos.demo',
    facultyName: 'Dr. Priya Nair',
    subjectId: 'subj-602',
    subjectCode: 'CS602',
    subjectName: 'Cloud Computing & DevOps Infrastructure',
    semesterNumber: 6,
    year: 3,
    section: 'A',
  },

  // Prof. Rajesh Kumar (usr-faculty-002 / faculty2@campusos.demo)
  // Teaches: S3 DBMS, S4 Web Tech, S5 Advanced DBMS
  {
    id: 'ta-004',
    facultyId: 'usr-faculty-002',
    facultyEmail: 'faculty2@campusos.demo',
    facultyName: 'Prof. Rajesh Kumar',
    subjectId: 'subj-301',
    subjectCode: 'CS301',
    subjectName: 'Database Management Systems',
    semesterNumber: 3,
    year: 2,
    section: 'A',
  },
  {
    id: 'ta-005',
    facultyId: 'usr-faculty-002',
    facultyEmail: 'faculty2@campusos.demo',
    facultyName: 'Prof. Rajesh Kumar',
    subjectId: 'subj-401',
    subjectCode: 'CS401',
    subjectName: 'Web Technologies & JavaScript Frameworks',
    semesterNumber: 4,
    year: 2,
    section: 'A',
  },
  {
    id: 'ta-006',
    facultyId: 'usr-faculty-002',
    facultyEmail: 'faculty2@campusos.demo',
    facultyName: 'Prof. Rajesh Kumar',
    subjectId: 'subj-502',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems (Advanced)',
    semesterNumber: 5,
    year: 3,
    section: 'B',
  },

  // Dr. Amit Sen (usr-faculty-003 / amit.sen@campusos.demo)
  // Teaches: S1 Digital Logic, S3 Computer Organization, S5 Computer Networks, S6 Cyber Security
  {
    id: 'ta-007',
    facultyId: 'usr-faculty-003',
    facultyEmail: 'amit.sen@campusos.demo',
    facultyName: 'Dr. Amit Sen',
    subjectId: 'subj-102',
    subjectCode: 'CS102',
    subjectName: 'Digital Logic & Computer Design',
    semesterNumber: 1,
    year: 1,
    section: 'A',
  },
  {
    id: 'ta-008',
    facultyId: 'usr-faculty-003',
    facultyEmail: 'amit.sen@campusos.demo',
    facultyName: 'Dr. Amit Sen',
    subjectId: 'subj-302',
    subjectCode: 'CS302',
    subjectName: 'Computer Organization & Architecture',
    semesterNumber: 3,
    year: 2,
    section: 'A',
  },
  {
    id: 'ta-009',
    facultyId: 'usr-faculty-003',
    facultyEmail: 'amit.sen@campusos.demo',
    facultyName: 'Dr. Amit Sen',
    subjectId: 'subj-503',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    semesterNumber: 5,
    year: 3,
    section: 'A',
  },
  {
    id: 'ta-010',
    facultyId: 'usr-faculty-003',
    facultyEmail: 'amit.sen@campusos.demo',
    facultyName: 'Dr. Amit Sen',
    subjectId: 'subj-603',
    subjectCode: 'CS603',
    subjectName: 'Cyber Security & Ethical Hacking',
    semesterNumber: 6,
    year: 3,
    section: 'A',
  },

  // Dr. Sunita Sharma (usr-faculty-004 / sunita.sharma@campusos.demo)
  // Teaches: S2 OOP C++, S4 Core Java, S5 Java Enterprise Programming
  {
    id: 'ta-011',
    facultyId: 'usr-faculty-004',
    facultyEmail: 'sunita.sharma@campusos.demo',
    facultyName: 'Dr. Sunita Sharma',
    subjectId: 'subj-202',
    subjectCode: 'CS202',
    subjectName: 'Object-Oriented Programming with C++',
    semesterNumber: 2,
    year: 1,
    section: 'A',
  },
  {
    id: 'ta-012',
    facultyId: 'usr-faculty-004',
    facultyEmail: 'sunita.sharma@campusos.demo',
    facultyName: 'Dr. Sunita Sharma',
    subjectId: 'subj-402',
    subjectCode: 'CS402',
    subjectName: 'Core Java & Application Development',
    semesterNumber: 4,
    year: 2,
    section: 'A',
  },
  {
    id: 'ta-013',
    facultyId: 'usr-faculty-004',
    facultyEmail: 'sunita.sharma@campusos.demo',
    facultyName: 'Dr. Sunita Sharma',
    subjectId: 'subj-504',
    subjectCode: 'CS504',
    subjectName: 'Java Enterprise Programming',
    semesterNumber: 5,
    year: 3,
    section: 'A',
  },

  // Prof. Anand Verma (usr-faculty-005 / anand.verma@campusos.demo)
  // Teaches: S1 Discrete Math, S2 Data Structures, S5 Design & Analysis of Algorithms
  {
    id: 'ta-014',
    facultyId: 'usr-faculty-005',
    facultyEmail: 'anand.verma@campusos.demo',
    facultyName: 'Prof. Anand Verma',
    subjectId: 'subj-103',
    subjectCode: 'CS103',
    subjectName: 'Discrete Mathematics',
    semesterNumber: 1,
    year: 1,
    section: 'A',
  },
  {
    id: 'ta-015',
    facultyId: 'usr-faculty-005',
    facultyEmail: 'anand.verma@campusos.demo',
    facultyName: 'Prof. Anand Verma',
    subjectId: 'subj-201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures & Algorithms in C++',
    semesterNumber: 2,
    year: 1,
    section: 'A',
  },
  {
    id: 'ta-016',
    facultyId: 'usr-faculty-005',
    facultyEmail: 'anand.verma@campusos.demo',
    facultyName: 'Prof. Anand Verma',
    subjectId: 'subj-505',
    subjectCode: 'CS505',
    subjectName: 'Design & Analysis of Algorithms',
    semesterNumber: 5,
    year: 3,
    section: 'A',
  },

  // Prof. Meera Swaminathan (usr-faculty-006 / meera.swaminathan@campusos.demo)
  // Teaches: S1 C Programming, S6 AI & Machine Learning
  {
    id: 'ta-017',
    facultyId: 'usr-faculty-006',
    facultyEmail: 'meera.swaminathan@campusos.demo',
    facultyName: 'Prof. Meera Swaminathan',
    subjectId: 'subj-101',
    subjectCode: 'CS101',
    subjectName: 'Problem Solving & C Programming',
    semesterNumber: 1,
    year: 1,
    section: 'B',
  },
  {
    id: 'ta-018',
    facultyId: 'usr-faculty-006',
    facultyEmail: 'meera.swaminathan@campusos.demo',
    facultyName: 'Prof. Meera Swaminathan',
    subjectId: 'subj-601',
    subjectCode: 'CS601',
    subjectName: 'Artificial Intelligence & Machine Learning',
    semesterNumber: 6,
    year: 3,
    section: 'A',
  },
];

export interface FacultyValidationResult {
  allowed: boolean;
  error?: string;
  status?: number;
}

export class AuthorizationService {
  private static assignments: TeachingAssignment[] = [...seedTeachingAssignments];

  /**
   * Normalize faculty identifier (email, ID, name, or alias)
   */
  private static matchesFaculty(a: TeachingAssignment, identifier: string): boolean {
    if (!identifier) return false;
    const key = identifier.toLowerCase().trim();
    if (a.facultyId.toLowerCase() === key || a.facultyEmail.toLowerCase() === key) return true;
    if (a.facultyName.toLowerCase() === key || key.includes(a.facultyName.toLowerCase())) return true;

    // Common campus email / ID aliases
    if (
      (key.includes('priya') || key === 'fac001' || key === 'usr-003' || key === 'prof-001' || key === 'usr-faculty-001') &&
      (a.facultyEmail.includes('faculty@campusos') || a.facultyName.toLowerCase().includes('priya'))
    ) {
      return true;
    }
    if (
      (key.includes('rajesh') || key === 'fac002') &&
      a.facultyEmail.includes('rajesh')
    ) {
      return true;
    }
    if (
      (key.includes('amit') || key === 'fac003') &&
      a.facultyEmail.includes('amit')
    ) {
      return true;
    }
    if (
      (key.includes('sunita') || key === 'fac004') &&
      a.facultyEmail.includes('sunita')
    ) {
      return true;
    }
    if (
      (key.includes('anand') || key === 'fac005') &&
      a.facultyEmail.includes('anand')
    ) {
      return true;
    }
    if (
      (key.includes('meera') || key === 'fac006') &&
      a.facultyEmail.includes('meera')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Retrieves all teaching assignments for a faculty member.
   */
  static getFacultyTeachingAssignments(facultyIdOrEmail: string): TeachingAssignment[] {
    return this.assignments.filter((a) => this.matchesFaculty(a, facultyIdOrEmail));
  }

  /**
   * Returns the list of distinct semesters in which the faculty has an active teaching assignment.
   */
  static getFacultyAuthorizedSemesters(facultyIdOrEmail: string): BcaSemester[] {
    const assignments = this.getFacultyTeachingAssignments(facultyIdOrEmail);
    const set = new Set<BcaSemester>();
    assignments.forEach((a) => set.add(a.semesterNumber));
    return Array.from(set).sort((a, b) => a - b);
  }

  /**
   * Returns the subjects a faculty is assigned to teach, optionally filtered by semester.
   */
  static getFacultyAuthorizedSubjects(
    facultyIdOrEmail: string,
    semesterNumber?: number
  ): TeachingAssignment[] {
    let list = this.getFacultyTeachingAssignments(facultyIdOrEmail);
    if (semesterNumber) {
      list = list.filter((a) => a.semesterNumber === semesterNumber);
    }
    return list;
  }

  /**
   * Core Access Rule: Can faculty manage a specific subject for a specific semester?
   */
  static canFacultyManageSubject(
    facultyIdOrEmail: string,
    subjectCodeOrIdOrName: string,
    semesterNumber: number
  ): boolean {
    if (!facultyIdOrEmail || !subjectCodeOrIdOrName || !semesterNumber) return false;
    const sub = subjectCodeOrIdOrName.toLowerCase();
    const sem = Number(semesterNumber);

    return this.assignments.some(
      (a) =>
        this.matchesFaculty(a, facultyIdOrEmail) &&
        a.semesterNumber === sem &&
        (a.subjectCode.toLowerCase() === sub ||
          a.subjectId.toLowerCase() === sub ||
          a.subjectName.toLowerCase().includes(sub) ||
          sub.includes(a.subjectName.toLowerCase()))
    );
  }

  /**
   * Student Access Rule: Can student access content for targetSemester?
   */
  static canStudentAccessSemester(
    studentSemesterNumber: number | undefined,
    targetSemesterNumber: number | undefined
  ): boolean {
    if (!studentSemesterNumber || !targetSemesterNumber) return false;
    return Number(studentSemesterNumber) === Number(targetSemesterNumber);
  }

  /**
   * Student Access Rule: Can student access a specific subject?
   */
  static canStudentAccessSubject(
    studentProfile: Partial<UserProfile> | null | undefined,
    subjectCodeOrIdOrName: string
  ): boolean {
    if (!studentProfile || studentProfile.role !== 'student') return false;
    const studentSem = studentProfile.semesterNumber || 5;
    const sub = (subjectCodeOrIdOrName || '').toLowerCase();

    // Check if the subject exists in the student's current semester curriculum
    return seedSubjects.some(
      (s) =>
        s.semesterNumber === studentSem &&
        (s.code.toLowerCase() === sub ||
          s.id.toLowerCase() === sub ||
          s.name.toLowerCase().includes(sub) ||
          sub.includes(s.name.toLowerCase()))
    );
  }

  /**
   * Unified Document Authorization Check:
   * Returns true if user is authorized to read/view/download this document.
   */
  static canUserAccessDocument(
    userProfile: Partial<UserProfile> | null | undefined,
    document: {
      targetSemester?: number;
      semesterNumber?: number;
      subjectCode?: string;
      subjectId?: string;
      subject?: string;
      uploadedById?: string;
      visibility?: string;
    }
  ): { allowed: boolean; reason?: string } {
    if (!userProfile) {
      return { allowed: false, reason: 'Authentication required.' };
    }

    // Admins have full access
    if (userProfile.role === 'admin') {
      return { allowed: true };
    }

    const docSemester = document.targetSemester || document.semesterNumber;

    // Faculty Access Check
    if (userProfile.role === 'teacher') {
      const facultyId = userProfile.id || userProfile.email || '';
      const docSub = document.subjectCode || document.subjectId || document.subject || '';

      if (document.uploadedById === userProfile.id) {
        return { allowed: true };
      }

      if (docSemester && docSub) {
        const canManage = this.canFacultyManageSubject(facultyId, docSub, docSemester);
        if (canManage) {
          return { allowed: true };
        }
      }

      return {
        allowed: false,
        reason: `Access Denied: You are not assigned to teach ${document.subject || 'this subject'} in Semester ${docSemester}.`,
      };
    }

    // Student Access Check (Strict Semester Isolation)
    if (userProfile.role === 'student') {
      const studentSem = userProfile.semesterNumber || 5;

      if (docSemester && Number(docSemester) !== Number(studentSem)) {
        return {
          allowed: false,
          reason: `Access Denied: You are enrolled in Semester ${studentSem}. You cannot access materials for Semester ${docSemester}.`,
        };
      }

      return { allowed: true };
    }

    return { allowed: false, reason: 'Unauthorized access.' };
  }

  /**
   * Validates document upload authorization for faculty before persisting.
   */
  static validateFacultyUpload(
    facultyProfile: Partial<UserProfile> | null | undefined,
    uploadPayload: {
      subjectCode?: string;
      subjectId?: string;
      subject?: string;
      semesterNumber: number;
    }
  ): FacultyValidationResult {
    if (!facultyProfile) {
      return { allowed: false, error: 'Authentication required.', status: 401 };
    }

    if (facultyProfile.role === 'admin') {
      return { allowed: true };
    }

    if (facultyProfile.role !== 'teacher') {
      return { allowed: false, error: 'Only faculty members can publish academic materials.', status: 403 };
    }

    const facultyKey = facultyProfile.email || facultyProfile.id || facultyProfile.fullName || '';
    const subjectKey = uploadPayload.subjectCode || uploadPayload.subject || uploadPayload.subjectId || '';
    const sem = uploadPayload.semesterNumber;

    const isAuthorized = this.canFacultyManageSubject(facultyKey, subjectKey, sem);

    if (!isAuthorized) {
      return {
        allowed: false,
        error: `Access Denied: You are not assigned to teach "${uploadPayload.subject || subjectKey}" for Semester ${sem}. Upload rejected.`,
        status: 403,
      };
    }

    return { allowed: true };
  }
}
