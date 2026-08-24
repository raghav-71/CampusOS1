import {
  UserProfile,
  Department,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  NoteDocument,
  Announcement,
  ActivityItem,
  Assignment,
  Submission,
  StudyProgressMetric,
  EnrollmentMetric,
  DepartmentNotesMetric,
  FacultyAttendanceMetric,
  GradeDistributionMetric,
  MarksCardDocument,
  ExamSchedule,
  ExamCategory,
  ExamType,
  TeacherFilterState,
  Role,
} from '@/types/campus';

import {
  mockUsers,
  mockDepartments,
  mockSubjects,
  mockTimetable,
  mockTeacherSchedule,
  mockNotes,
  mockAnnouncements,
  mockAssignments,
  mockSubmissions,
  mockActivities,
  mockStudyProgressBySemester,
  mockEnrollmentData,
  mockDepartmentNotes,
  mockFacultyAttendanceTrends,
  mockGradeDistributions,
  mockExams,
  mockMarksCardSubmissions,
} from './mockData';

export interface ICampusRepository {
  // Users
  getUsers(role?: Role, department?: string): Promise<UserProfile[]>;
  getUserById(id: string): Promise<UserProfile | null>;
  getUserByEmail(email: string): Promise<UserProfile | null>;
  saveUser(user: UserProfile): Promise<UserProfile>;
  deleteUser(id: string): Promise<boolean>;

  // Departments & Subjects
  getDepartments(): Promise<Department[]>;
  getSubjects(department?: string): Promise<Subject[]>;
  getSubjectsBySemester(semester: number, department?: string): Promise<Subject[]>;

  // Timetable & Attendance
  getStudentTimetable(department?: string, semester?: string): Promise<TimetableSlot[]>;
  getTeacherSchedule(teacherName?: string): Promise<TimetableSlot[]>;
  getAttendance(subject?: string, date?: string): Promise<AttendanceRecord[]>;
  recordAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]>;

  // Notes
  getNotes(subject?: string, query?: string): Promise<NoteDocument[]>;
  saveNote(note: NoteDocument): Promise<NoteDocument>;
  uploadNote(
    note: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>
  ): Promise<NoteDocument>;

  // Announcements
  getAnnouncements(role?: Role): Promise<Announcement[]>;
  createAnnouncement(announcement: Announcement): Promise<Announcement>;

  // Assignments & Submissions
  getAssignments(teacherName?: string): Promise<Assignment[]>;
  createAssignment(assignment: Assignment): Promise<Assignment>;
  getSubmissions(assignmentId?: string): Promise<Submission[]>;
  gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<Submission | null>;

  // Exams
  getExams(filters?: {
    semester?: number;
    category?: ExamCategory;
    type?: ExamType;
    subject?: string;
  }): Promise<ExamSchedule[]>;

  // Marks Cards
  getMarksCardSubmissions(studentId?: string): Promise<MarksCardDocument[]>;
  submitMarksCard(
    semester: number,
    file: { name: string; size: string; type: 'pdf' | 'image'; previewUrl?: string }
  ): Promise<MarksCardDocument>;
  deleteMarksCard(semester: number): Promise<boolean>;

  // Metrics & Analytics
  getStudyProgress(semester?: number): Promise<StudyProgressMetric[]>;
  getEnrollmentTrends(): Promise<EnrollmentMetric[]>;
  getDepartmentNotes(): Promise<DepartmentNotesMetric[]>;
  getFacultyAttendanceTrends(): Promise<FacultyAttendanceMetric[]>;
  getGradeDistributions(): Promise<GradeDistributionMetric[]>;
  getActivities(): Promise<ActivityItem[]>;
}

export class MockCampusRepository implements ICampusRepository {
  private users: UserProfile[] = [...mockUsers];
  private subjects: Subject[] = [...mockSubjects];
  private notes: NoteDocument[] = [...mockNotes];
  private announcements: Announcement[] = [...mockAnnouncements];
  private assignments: Assignment[] = [...mockAssignments];
  private submissions: Submission[] = [...mockSubmissions];
  private activities: ActivityItem[] = [...mockActivities];
  private exams: ExamSchedule[] = [...mockExams];
  private marksCards: MarksCardDocument[] = [...mockMarksCardSubmissions];
  private attendanceRecords: AttendanceRecord[] = [
    {
      id: 'att-1',
      studentId: 'usr-001',
      studentName: 'Arjun Sharma',
      rollNumber: 'BCA2401',
      subject: 'Operating Systems',
      date: '2026-08-23',
      status: 'present',
    },
    {
      id: 'att-2',
      studentId: 'usr-002',
      studentName: 'Priya Menon',
      rollNumber: 'BCA2402',
      subject: 'Operating Systems',
      date: '2026-08-23',
      status: 'present',
    },
    {
      id: 'att-3',
      studentId: 'usr-004',
      studentName: 'Rohit Verma',
      rollNumber: 'BCA2403',
      subject: 'Operating Systems',
      date: '2026-08-23',
      status: 'absent',
    },
  ];

  async getUsers(role?: Role, department?: string): Promise<UserProfile[]> {
    let result = [...this.users];
    if (role) result = result.filter((u) => u.role === role);
    if (department && department !== 'All')
      result = result.filter((u) => u.department === department);
    return result;
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async saveUser(user: UserProfile): Promise<UserProfile> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user };
      return this.users[existingIndex];
    }
    this.users.push(user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < initialLen;
  }

  async getDepartments(): Promise<Department[]> {
    return [...mockDepartments];
  }

  async getSubjects(department?: string): Promise<Subject[]> {
    let list = [...this.subjects];
    if (department && department !== 'All') {
      list = list.filter((s) => s.department.toLowerCase() === department.toLowerCase());
    }
    return list;
  }

  async getSubjectsBySemester(semester: number, department?: string): Promise<Subject[]> {
    let list = this.subjects.filter((s) => s.semesterNumber === semester);
    if (department && department !== 'All') {
      list = list.filter((s) => s.department.toLowerCase() === department.toLowerCase());
    }
    return list;
  }

  async getStudentTimetable(department?: string, semester?: string): Promise<TimetableSlot[]> {
    let list = [...mockTimetable];
    if (department) list = list.filter((t) => t.department === department);
    if (semester) list = list.filter((t) => t.semester === semester);
    return list;
  }

  async getTeacherSchedule(teacherName?: string): Promise<TimetableSlot[]> {
    let list = [...mockTeacherSchedule];
    if (teacherName) list = list.filter((t) => t.teacher.includes(teacherName));
    return list;
  }

  async getAttendance(subject?: string, date?: string): Promise<AttendanceRecord[]> {
    let list = [...this.attendanceRecords];
    if (subject) list = list.filter((a) => a.subject === subject);
    if (date) list = list.filter((a) => a.date === date);
    return list;
  }

  async recordAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]> {
    this.attendanceRecords.push(...records);
    return records;
  }

  async getNotes(subject?: string, query?: string): Promise<NoteDocument[]> {
    let list = [...this.notes];
    if (subject) {
      list = list.filter(
        (n) =>
          n.subject.toLowerCase().includes(subject.toLowerCase()) ||
          n.subjectId?.toLowerCase() === subject.toLowerCase()
      );
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async saveNote(note: NoteDocument): Promise<NoteDocument> {
    const idx = this.notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      this.notes[idx] = note;
    } else {
      this.notes.unshift(note);
    }
    return note;
  }

  async uploadNote(
    note: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>
  ): Promise<NoteDocument> {
    const newNote: NoteDocument = {
      ...note,
      id: `note-${Date.now()}`,
      uploadedAt: 'Just now',
      downloads: 0,
      isNew: true,
      rating: 5.0,
      views: 1,
    };
    this.notes.unshift(newNote);
    return newNote;
  }

  async getAnnouncements(role?: Role): Promise<Announcement[]> {
    let list = [...this.announcements];
    if (role) {
      list = list.filter((a) => !a.targetRole || a.targetRole === 'all' || a.targetRole === role);
    }
    return list;
  }

  async createAnnouncement(announcement: Announcement): Promise<Announcement> {
    this.announcements.unshift(announcement);
    return announcement;
  }

  async getAssignments(teacherName?: string): Promise<Assignment[]> {
    let list = [...this.assignments];
    if (teacherName) list = list.filter((a) => a.teacher.includes(teacherName));
    return list;
  }

  async createAssignment(assignment: Assignment): Promise<Assignment> {
    this.assignments.unshift(assignment);
    return assignment;
  }

  async getSubmissions(assignmentId?: string): Promise<Submission[]> {
    let list = [...this.submissions];
    if (assignmentId) list = list.filter((s) => s.assignmentId === assignmentId);
    return list;
  }

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<Submission | null> {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;
    sub.score = score;
    sub.status = 'graded';
    if (feedback) sub.feedback = feedback;
    return sub;
  }

  async getExams(filters?: {
    semester?: number;
    category?: ExamCategory;
    type?: ExamType;
    subject?: string;
  }): Promise<ExamSchedule[]> {
    let list = [...this.exams];
    if (filters?.semester) {
      list = list.filter((e) => e.semesterNumber === filters.semester);
    }
    if (filters?.category) {
      list = list.filter((e) => e.examCategory === filters.category);
    }
    if (filters?.type) {
      list = list.filter((e) => e.examType === filters.type);
    }
    if (filters?.subject) {
      const q = filters.subject.toLowerCase();
      list = list.filter(
        (e) => e.subject.toLowerCase().includes(q) || e.subjectCode.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getMarksCardSubmissions(studentId?: string): Promise<MarksCardDocument[]> {
    return [...this.marksCards];
  }

  async submitMarksCard(
    semester: number,
    file: { name: string; size: string; type: 'pdf' | 'image'; previewUrl?: string }
  ): Promise<MarksCardDocument> {
    const existingIdx = this.marksCards.findIndex((m) => m.semester === semester);
    const newDoc: MarksCardDocument = {
      id: `mc-sem${semester}`,
      semester,
      year: Math.ceil(semester / 2),
      semesterLabel: `Semester ${semester}`,
      status: 'SUBMITTED',
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      fileType: file.type,
      previewUrl: file.previewUrl,
      adminRemarks: 'Submitted by student. Awaiting academic verification.',
    };

    if (existingIdx >= 0) {
      this.marksCards[existingIdx] = newDoc;
    } else {
      this.marksCards.push(newDoc);
    }
    return newDoc;
  }

  async deleteMarksCard(semester: number): Promise<boolean> {
    const existingIdx = this.marksCards.findIndex((m) => m.semester === semester);
    if (existingIdx >= 0) {
      this.marksCards[existingIdx] = {
        id: `mc-sem${semester}`,
        semester,
        year: Math.ceil(semester / 2),
        semesterLabel: `Semester ${semester}`,
        status: 'NOT_SUBMITTED',
        adminRemarks: 'Previous marks card removed. Pending upload.',
      };
      return true;
    }
    return false;
  }

  async getStudyProgress(semester: number = 5): Promise<StudyProgressMetric[]> {
    return mockStudyProgressBySemester[semester] || mockStudyProgressBySemester[5];
  }

  async getEnrollmentTrends(): Promise<EnrollmentMetric[]> {
    return [...mockEnrollmentData];
  }

  async getDepartmentNotes(): Promise<DepartmentNotesMetric[]> {
    return [...mockDepartmentNotes];
  }

  async getFacultyAttendanceTrends(): Promise<FacultyAttendanceMetric[]> {
    return [...mockFacultyAttendanceTrends];
  }

  async getGradeDistributions(): Promise<GradeDistributionMetric[]> {
    return [...mockGradeDistributions];
  }

  async getActivities(): Promise<ActivityItem[]> {
    return [...this.activities];
  }
}

export const campusRepository = new MockCampusRepository();
