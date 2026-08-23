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
  mockStudyProgressData,
  mockEnrollmentData,
  mockDepartmentNotes,
  mockFacultyAttendanceTrends,
  mockGradeDistributions,
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

  // Timetable & Attendance
  getStudentTimetable(department?: string, semester?: string): Promise<TimetableSlot[]>;
  getTeacherSchedule(teacherName?: string): Promise<TimetableSlot[]>;
  getAttendance(subject?: string, date?: string): Promise<AttendanceRecord[]>;
  recordAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]>;

  // Notes
  getNotes(subject?: string, query?: string): Promise<NoteDocument[]>;
  saveNote(note: NoteDocument): Promise<NoteDocument>;
  uploadNote(note: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>): Promise<NoteDocument>;

  // Announcements
  getAnnouncements(role?: Role): Promise<Announcement[]>;
  createAnnouncement(announcement: Announcement): Promise<Announcement>;

  // Assignments & Submissions
  getAssignments(teacherName?: string): Promise<Assignment[]>;
  createAssignment(assignment: Assignment): Promise<Assignment>;
  getSubmissions(assignmentId?: string): Promise<Submission[]>;
  gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<Submission | null>;

  // Metrics & Analytics
  getStudyProgress(): Promise<StudyProgressMetric[]>;
  getEnrollmentTrends(): Promise<EnrollmentMetric[]>;
  getDepartmentNotes(): Promise<DepartmentNotesMetric[]>;
  getFacultyAttendanceTrends(): Promise<FacultyAttendanceMetric[]>;
  getGradeDistributions(): Promise<GradeDistributionMetric[]>;
  getActivities(): Promise<ActivityItem[]>;
}

export class MockCampusRepository implements ICampusRepository {
  private users: UserProfile[] = [...mockUsers];
  private notes: NoteDocument[] = [...mockNotes];
  private announcements: Announcement[] = [...mockAnnouncements];
  private assignments: Assignment[] = [...mockAssignments];
  private submissions: Submission[] = [...mockSubmissions];
  private activities: ActivityItem[] = [...mockActivities];
  private attendanceRecords: AttendanceRecord[] = [
    { id: 'att-1', studentId: 'usr-001', studentName: 'Arjun Sharma', rollNumber: 'BCA2401', subject: 'Operating Systems', date: '2026-08-23', status: 'present' },
    { id: 'att-2', studentId: 'usr-002', studentName: 'Priya Menon', rollNumber: 'BCA2402', subject: 'Operating Systems', date: '2026-08-23', status: 'present' },
    { id: 'att-3', studentId: 'usr-004', studentName: 'Rohit Verma', rollNumber: 'BCA2403', subject: 'Operating Systems', date: '2026-08-23', status: 'absent' },
  ];

  async getUsers(role?: Role, department?: string): Promise<UserProfile[]> {
    let result = [...this.users];
    if (role) result = result.filter((u) => u.role === role);
    if (department && department !== 'All') result = result.filter((u) => u.department === department);
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
    this.users.unshift(user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const prevLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < prevLen;
  }

  async getDepartments(): Promise<Department[]> {
    return [...mockDepartments];
  }

  async getSubjects(department?: string): Promise<Subject[]> {
    if (!department) return [...mockSubjects];
    return mockSubjects.filter((s) => s.department === department);
  }

  async getStudentTimetable(_department?: string, _semester?: string): Promise<TimetableSlot[]> {
    return [...mockTimetable];
  }

  async getTeacherSchedule(_teacherName?: string): Promise<TimetableSlot[]> {
    return [...mockTeacherSchedule];
  }

  async getAttendance(subject?: string, date?: string): Promise<AttendanceRecord[]> {
    let result = [...this.attendanceRecords];
    if (subject) result = result.filter((r) => r.subject.toLowerCase() === subject.toLowerCase());
    if (date) result = result.filter((r) => r.date === date);
    return result;
  }

  async recordAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]> {
    for (const rec of records) {
      const idx = this.attendanceRecords.findIndex(
        (r) => r.studentId === rec.studentId && r.subject === rec.subject && r.date === rec.date
      );
      if (idx >= 0) {
        this.attendanceRecords[idx] = rec;
      } else {
        this.attendanceRecords.push({ ...rec, id: rec.id || `att-${Date.now()}-${Math.random()}` });
      }
    }
    return records;
  }

  async getNotes(subject?: string, query?: string): Promise<NoteDocument[]> {
    let result = [...this.notes];
    if (subject && subject !== 'All' && subject !== 'All Subjects') {
      result = result.filter((n) => n.subject.toLowerCase() === subject.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async saveNote(note: NoteDocument): Promise<NoteDocument> {
    this.notes.unshift(note);
    return note;
  }

  async uploadNote(noteInput: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>): Promise<NoteDocument> {
    const newNote: NoteDocument = {
      ...noteInput,
      id: `note-${Date.now()}`,
      uploadedAt: 'Just now',
      downloads: 0,
      isNew: true,
    };
    this.notes.unshift(newNote);
    return newNote;
  }

  async getAnnouncements(_role?: Role): Promise<Announcement[]> {
    return [...this.announcements];
  }

  async createAnnouncement(announcement: Announcement): Promise<Announcement> {
    this.announcements.unshift(announcement);
    return announcement;
  }

  async getAssignments(_teacherName?: string): Promise<Assignment[]> {
    return [...this.assignments];
  }

  async createAssignment(assignment: Assignment): Promise<Assignment> {
    this.assignments.unshift(assignment);
    return assignment;
  }

  async getSubmissions(assignmentId?: string): Promise<Submission[]> {
    if (!assignmentId) return [...this.submissions];
    return this.submissions.filter((s) => s.assignmentId === assignmentId);
  }

  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<Submission | null> {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;
    sub.score = score;
    sub.feedback = feedback;
    sub.status = 'graded';
    return { ...sub };
  }

  async getStudyProgress(): Promise<StudyProgressMetric[]> {
    return [...mockStudyProgressData];
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
