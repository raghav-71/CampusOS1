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
  MarksCardDocument,
  ExamSchedule,
  ExamCategory,
  ExamType,
  Role,
  StudentExamMark,
  StudentPerformanceRecord,
  TeacherExamPerformance,
  QuestionPaperDocument,
  TeacherSubjectAssignment,
  GradeDistributionMetric,
  AnonymousFeedback,
  FeedbackCategory,
} from '@/types/campus';

import {
  seedStudents,
  seedFaculty,
  seedSubjects,
  seedTimetable,
  seedExams,
  seedNotes,
  seedAssignments,
  seedSubmissions,
  seedAnnouncements,
  seedQuestionPapers,
  seedAttendanceLogs,
  seedSharedDocuments,
  SharedDocumentRecord,
} from '@/data/seed';
import { AuthorizationService } from '@/services/authorizationService';

import {
  mockUsers,
  mockDepartments,
  mockSubjects,
  mockTimetable,
  mockTeacherSchedule,
  mockTeacherSubjectAssignments,
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
  mockStudentExamMarks,
  mockStudentPerformanceMatrix,
  mockQuestionPapers,
} from './mockData';

export interface ICampusRepository {
  // Users
  getUsers(role?: Role, department?: string): Promise<UserProfile[]>;
  getUserById(id: string): Promise<UserProfile | null>;
  getUserByEmail(email: string): Promise<UserProfile | null>;
  saveUser(user: UserProfile): Promise<UserProfile>;
  deleteUser(id: string): Promise<boolean>;

  // Departments & Curriculum (BCA)
  getDepartments(): Promise<Department[]>;
  getSubjects(semester?: number | string): Promise<Subject[]>;
  getSubjectsBySemester(semester: number): Promise<Subject[]>;

  // Timetable & Live Classes
  getStudentTimetable(param1?: string | number, param2?: string): Promise<TimetableSlot[]>;
  getTeacherSchedule(teacherName?: string): Promise<TimetableSlot[]>;
  startClassSession(
    teacherId: string,
    subject: string,
    semesterNumber: number,
    section: string,
    room: string
  ): Promise<{ classSlot: TimetableSlot; notification: Announcement }>;

  // Attendance
  getAttendance(subject?: string, date?: string): Promise<AttendanceRecord[]>;
  recordAttendance(records: AttendanceRecord[]): Promise<AttendanceRecord[]>;

  // Teacher Scoped Subjects & Analytics
  getTeacherSubjects(teacherIdOrEmail: string): Promise<TeacherSubjectAssignment[]>;
  getTeacherExamPerformance(
    examCategory: ExamCategory,
    subjectId?: string
  ): Promise<TeacherExamPerformance>;
  getTeacherStudentPerformanceMatrix(
    teacherId?: string,
    semesterNumber?: number
  ): Promise<StudentPerformanceRecord[]>;

  // Question Papers (Upload PDF)
  getQuestionPapers(
    teacherId?: string,
    subjectId?: string,
    semesterNumber?: number,
    userProfile?: any
  ): Promise<QuestionPaperDocument[]>;
  uploadQuestionPaper(
    paper: Omit<QuestionPaperDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<QuestionPaperDocument>;
  deleteQuestionPaper(paperId: string): Promise<boolean>;

  // Notes & Shared Documents
  getSharedDocuments(
    semesterNumber?: number,
    userProfile?: Partial<UserProfile>
  ): Promise<SharedDocumentRecord[]>;
  getNotes(subject?: string, query?: string): Promise<NoteDocument[]>;
  saveNote(note: NoteDocument): Promise<NoteDocument>;
  uploadNote(
    note: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>
  ): Promise<NoteDocument>;

  // Announcements & Notifications
  getAnnouncements(role?: Role, userId?: string): Promise<Announcement[]>;
  createAnnouncement(announcement: Announcement): Promise<Announcement>;
  markNotificationRead(notificationId: string): Promise<boolean>;
  markAllNotificationsRead(userId?: string): Promise<boolean>;

  // Assignments & Submissions
  getAssignments(
    filters?: string | { subject?: string; semester?: number; status?: string; teacherName?: string },
    userProfile?: Partial<UserProfile>
  ): Promise<Assignment[]>;
  getAssignmentById(id: string, userProfile?: Partial<UserProfile>): Promise<Assignment | null>;
  createAssignment(
    assignment: Omit<Assignment, 'id' | 'createdAt' | 'totalSubmissions' | 'gradedSubmissions'> & { id?: string },
    facultyProfile?: Partial<UserProfile>
  ): Promise<Assignment>;
  updateAssignment(
    id: string,
    updates: Partial<Assignment>,
    facultyProfile?: Partial<UserProfile>
  ): Promise<Assignment | null>;
  deleteAssignment(id: string, facultyProfile?: Partial<UserProfile>): Promise<boolean>;
  submitAssignment(
    payload: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'assignmentTitle'> & { id?: string; assignmentTitle?: string; textAnswer?: string },
    studentProfile?: Partial<UserProfile>
  ): Promise<Submission>;
  getSubmissions(
    filters?: string | { assignmentId?: string; studentId?: string },
    userProfile?: Partial<UserProfile>
  ): Promise<Submission[]>;
  gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string,
    facultyProfile?: Partial<UserProfile>
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
    file: { name: string; size: string; type: 'pdf' | 'image' | 'doc'; previewUrl?: string }
  ): Promise<MarksCardDocument>;
  deleteMarksCard(semester: number): Promise<boolean>;

  // Anonymous Feedback (Strict Anonymity)
  getFeedback(category?: FeedbackCategory): Promise<AnonymousFeedback[]>;
  submitFeedback(
    payload: Omit<AnonymousFeedback, 'id' | 'submittedAt' | 'status'>
  ): Promise<AnonymousFeedback>;
  updateFeedbackStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'addressed'
  ): Promise<boolean>;

  // Metrics & Analytics
  getStudyProgress(semester?: number): Promise<StudyProgressMetric[]>;
  getEnrollmentTrends(): Promise<EnrollmentMetric[]>;
  getDepartmentNotes(): Promise<DepartmentNotesMetric[]>;
  getFacultyAttendanceTrends(): Promise<FacultyAttendanceMetric[]>;
  getGradeDistributions(): Promise<GradeDistributionMetric[]>;
  getActivities(): Promise<ActivityItem[]>;
}

export class MockCampusRepository implements ICampusRepository {
  private users: UserProfile[] = [...mockUsers, ...seedStudents, ...seedFaculty];
  private subjects: Subject[] = [...seedSubjects];
  private timetable: TimetableSlot[] = [...seedTimetable];
  private teacherSchedule: TimetableSlot[] = [...mockTeacherSchedule];
  private teacherAssignments: TeacherSubjectAssignment[] = [...mockTeacherSubjectAssignments];
  private notes: NoteDocument[] = [...seedNotes];
  private sharedDocuments: SharedDocumentRecord[] = [...seedSharedDocuments];
  private announcements: Announcement[] = [...seedAnnouncements];
  private assignments: Assignment[] = [...seedAssignments];
  private submissions: Submission[] = [...seedSubmissions];
  private activities: ActivityItem[] = [...mockActivities];
  private exams: ExamSchedule[] = [...seedExams];
  private marksCards: MarksCardDocument[] = [...mockMarksCardSubmissions];
  private examMarks: StudentExamMark[] = [...mockStudentExamMarks];
  private questionPapers: QuestionPaperDocument[] = [...seedQuestionPapers];
  private attendanceRecords: AttendanceRecord[] = [...seedAttendanceLogs];
  private feedbacks: AnonymousFeedback[] = [
    {
      id: 'fb-001',
      category: 'Teaching',
      rating: 5,
      message: 'The interactive Operating Systems simulations and Banker Algorithm walkthroughs in Lab 2 were immensely helpful for understanding deadlock avoidance.',
      submittedRole: 'student',
      submittedAt: '2026-08-28T14:30:00Z',
      status: 'reviewed',
    },
    {
      id: 'fb-002',
      category: 'Course',
      rating: 4,
      message: 'Can we include more real-world cloud deployment case studies in the Cloud Computing & DevOps syllabus for Semester 6?',
      submittedRole: 'student',
      submittedAt: '2026-08-29T10:15:00Z',
      status: 'pending',
    },
    {
      id: 'fb-003',
      category: 'CampusOS',
      rating: 5,
      message: 'The real-time attendance tracking and instant PDF lecture notes download have made keeping up with coursework seamless.',
      submittedRole: 'student',
      submittedAt: '2026-08-29T16:45:00Z',
      status: 'addressed',
    },
    {
      id: 'fb-004',
      category: 'Technical Issue',
      rating: 4,
      message: 'Projector in Room A-204 experienced minor HDMI flicker during morning lecture sessions. Requesting AV maintenance review.',
      submittedRole: 'teacher',
      submittedAt: '2026-08-30T09:20:00Z',
      status: 'reviewed',
    },
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedNotes = localStorage.getItem('campusos_published_notes');
        if (savedNotes) {
          const parsed = JSON.parse(savedNotes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(this.notes.map((n) => n.id));
            const toAdd = parsed.filter((n: NoteDocument) => !existingIds.has(n.id));
            this.notes = [...toAdd, ...this.notes];
          }
        }

        const savedShared = localStorage.getItem('campusos_shared_documents');
        if (savedShared) {
          const parsed = JSON.parse(savedShared);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(this.sharedDocuments.map((d) => d.id));
            const toAdd = parsed.filter((d: SharedDocumentRecord) => !existingIds.has(d.id));
            this.sharedDocuments = [...toAdd, ...this.sharedDocuments];
          }
        }

        const savedAsg = localStorage.getItem('campusos_assignments');
        if (savedAsg) {
          const parsed = JSON.parse(savedAsg);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(this.assignments.map((a) => a.id));
            const toAdd = parsed.filter((a: Assignment) => !existingIds.has(a.id));
            this.assignments = [...toAdd, ...this.assignments];
          }
        }

        const savedAnn = localStorage.getItem('campusos_announcements');
        if (savedAnn) {
          const parsed = JSON.parse(savedAnn);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(this.announcements.map((a) => a.id));
            const toAdd = parsed.filter((a: Announcement) => !existingIds.has(a.id));
            this.announcements = [...toAdd, ...this.announcements];
          }
        }

        const savedQp = localStorage.getItem('campusos_question_papers');
        if (savedQp) {
          const parsed = JSON.parse(savedQp);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(this.questionPapers.map((q) => q.id));
            const toAdd = parsed.filter((q: QuestionPaperDocument) => !existingIds.has(q.id));
            this.questionPapers = [...toAdd, ...this.questionPapers];
          }
        }

        const savedSubm = localStorage.getItem('campusos_submissions');
        if (savedSubm) {
          const parsed = JSON.parse(savedSubm);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(this.submissions.map((s) => s.id));
            const toAdd = parsed.filter((s: Submission) => !existingIds.has(s.id));
            this.submissions = [...toAdd, ...this.submissions];
          }
        }
      } catch {}
    }
  }

  private persistNotesToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campusos_published_notes', JSON.stringify(this.notes));
        localStorage.setItem('campusos_shared_documents', JSON.stringify(this.sharedDocuments));
      } catch {}
    }
  }

  private persistAssignmentsToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campusos_assignments', JSON.stringify(this.assignments));
      } catch {}
    }
  }

  private persistSubmissionsToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campusos_submissions', JSON.stringify(this.submissions));
      } catch {}
    }
  }

  private persistAnnouncementsToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campusos_announcements', JSON.stringify(this.announcements));
      } catch {}
    }
  }

  private persistQuestionPapersToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campusos_question_papers', JSON.stringify(this.questionPapers));
      } catch {}
    }
  }

  async getUsers(role?: Role, department?: string): Promise<UserProfile[]> {
    let result = [...this.users];
    if (role) result = result.filter((u) => u.role === role);
    if (department && department !== 'all') {
      result = result.filter((u) => u.department === department);
    }
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
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < initialLen;
  }

  async getDepartments(): Promise<Department[]> {
    return [...mockDepartments];
  }

  async getSubjects(semester?: number | string): Promise<Subject[]> {
    let list = [...this.subjects];
    if (semester !== undefined) {
      const semNum =
        typeof semester === 'number'
          ? semester
          : parseInt(String(semester).replace(/\D/g, '')) || 0;
      if (semNum > 0) {
        list = list.filter((s) => s.semesterNumber === semNum);
      }
    }
    return list;
  }

  async getSubjectsBySemester(semester: number): Promise<Subject[]> {
    return this.subjects.filter((s) => s.semesterNumber === semester);
  }

  async getStudentTimetable(param1?: string | number, param2?: string): Promise<TimetableSlot[]> {
    let list = [...this.timetable];
    const semInput = param2 || param1;
    if (semInput !== undefined) {
      const semNum =
        typeof semInput === 'number'
          ? semInput
          : parseInt(String(semInput).replace(/\D/g, '')) || 0;
      if (semNum > 0) {
        list = list.filter(
          (t) =>
            t.semesterNumber === semNum ||
            t.semester === `Semester ${semNum}` ||
            t.semester === `Sem ${semNum}`
        );
      }
    }
    return list;
  }

  async getTeacherSchedule(teacherName?: string): Promise<TimetableSlot[]> {
    let list = [...this.teacherSchedule];
    if (teacherName) {
      const q = teacherName.toLowerCase();
      list = list.filter((t) => t.teacher.toLowerCase().includes(q));
    }
    return list;
  }

  /**
   * Teacher clicks START CLASS:
   * 1. Updates matching student & teacher timetable slots to LIVE
   * 2. Emits student notification
   * 3. Adds activity item
   */
  async startClassSession(
    teacherId: string,
    subject: string,
    semesterNumber: number,
    section: string,
    room: string
  ): Promise<{ classSlot: TimetableSlot; notification: Announcement }> {
    const teacher = this.users.find((u) => u.id === teacherId || u.fullName.includes(teacherId)) || {
      id: teacherId,
      fullName: 'Dr. Priya Nair',
    };

    // Update timetable slot
    const slotIdx = this.timetable.findIndex(
      (t) =>
        t.subject.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(t.subject.toLowerCase())
    );

    let updatedSlot: TimetableSlot;
    if (slotIdx >= 0) {
      this.timetable[slotIdx] = {
        ...this.timetable[slotIdx],
        status: 'LIVE',
        startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      updatedSlot = this.timetable[slotIdx];
    } else {
      updatedSlot = {
        id: `cls-live-${Date.now()}`,
        subject,
        subjectCode: 'CS501',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: 'In 60 min',
        room,
        teacher: teacher.fullName,
        teacherId: teacher.id,
        department: 'BCA',
        semester: `Semester ${semesterNumber}`,
        semesterNumber: semesterNumber as any,
        section,
        dayOfWeek: 'Today',
        type: 'Lecture',
        status: 'LIVE',
      };
      this.timetable.unshift(updatedSlot);
    }

    // Update teacher schedule slot too
    const tSlotIdx = this.teacherSchedule.findIndex((t) =>
      t.subject.toLowerCase().includes(subject.toLowerCase())
    );
    if (tSlotIdx >= 0) {
      this.teacherSchedule[tSlotIdx] = { ...this.teacherSchedule[tSlotIdx], status: 'LIVE' };
    }

    // Create student notification
    const notification: Announcement = {
      id: `notif-class-${Date.now()}`,
      title: `🔔 Lecture Live: ${subject}`,
      body: `${teacher.fullName} has started your ${subject} class in ${room} (BCA Sem ${semesterNumber} Sec ${section}).`,
      priority: 'high',
      category: 'Class',
      type: 'CLASS_STARTED',
      time: 'Just now',
      createdAt: new Date().toISOString(),
      author: teacher.fullName,
      read: false,
      targetDepartment: 'BCA',
      targetSemester: semesterNumber as any,
      targetSection: section,
      relatedEntity: 'class',
      relatedEntityId: updatedSlot.id,
    };

    this.announcements.unshift(notification);

    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'class_start',
      title: `${subject} Class Started`,
      detail: `${teacher.fullName} launched live lecture session in ${room}`,
      time: 'Just now',
      actor: teacher.fullName,
      actorColor: 'bg-accent/20 text-accent',
      iconColor: 'text-accent',
    });

    return { classSlot: updatedSlot, notification };
  }

  async getTeacherSubjects(teacherIdOrEmail: string): Promise<TeacherSubjectAssignment[]> {
    const q = teacherIdOrEmail.toLowerCase();
    const user = this.users.find(
      (u) => u.id === teacherIdOrEmail || u.email.toLowerCase() === q || u.fullName.toLowerCase().includes(q)
    );

    if (!user) {
      // Default to Dr. Priya Nair's assignments
      return this.teacherAssignments.filter((a) => a.teacherId === 'usr-003');
    }

    const teaching = AuthorizationService.getFacultyTeachingAssignments(teacherIdOrEmail);
    if (teaching.length > 0) {
      return teaching.map((t) => ({
        teacherId: t.facultyId,
        teacherName: t.facultyName,
        subjectId: t.subjectId,
        subjectName: t.subjectName,
        subjectCode: t.subjectCode,
        semester: `Semester ${t.semesterNumber}`,
        semesterNumber: t.semesterNumber,
        year: t.year,
        section: t.section,
        credits: 4,
        type: 'THEORY',
        room: `Room ${t.semesterNumber}0${t.year}`,
        enrolledStudents: 60,
        avgAttendancePct: 90.0,
        syllabusCoveredPct: 80,
      }));
    }

    return this.teacherAssignments.filter((a) => a.teacherId === 'usr-003');
  }

  async getTeacherExamPerformance(
    examCategory: ExamCategory,
    subjectId?: string
  ): Promise<TeacherExamPerformance> {
    let filteredMarks = this.examMarks.filter((m) => m.examCategory === examCategory);
    if (subjectId) {
      filteredMarks = filteredMarks.filter((m) => m.subjectId === subjectId);
    }

    if (filteredMarks.length === 0) {
      filteredMarks = this.examMarks.filter((m) => m.examCategory === 'INTERNAL_1');
    }

    const totalStudents = filteredMarks.length;
    const scores = filteredMarks.map((m) => m.percentage).sort((a, b) => a - b);
    const avg = Math.round((scores.reduce((sum, s) => sum + s, 0) / (totalStudents || 1)) * 10) / 10;
    const highest = scores.length ? Math.max(...scores) : 0;
    const lowest = scores.length ? Math.min(...scores) : 0;
    const median = scores.length ? scores[Math.floor(scores.length / 2)] : 0;

    const passedCount = filteredMarks.filter((m) => m.percentage >= 40).length;
    const passPercentage = Math.round((passedCount / (totalStudents || 1)) * 100);
    const failPercentage = 100 - passPercentage;

    const gradeMap: Record<string, number> = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
    filteredMarks.forEach((m) => {
      gradeMap[m.grade] = (gradeMap[m.grade] || 0) + 1;
    });

    const gradeDistribution = [
      { gradeRange: '90-100% (O)', studentCount: gradeMap['O'] || 0, grade: 'O' as const },
      { gradeRange: '80-89% (A+)', studentCount: gradeMap['A+'] || 0, grade: 'A+' as const },
      { gradeRange: '70-79% (A)', studentCount: gradeMap['A'] || 0, grade: 'A' as const },
      { gradeRange: '60-69% (B+)', studentCount: gradeMap['B+'] || 0, grade: 'B+' as const },
      { gradeRange: '50-59% (B)', studentCount: gradeMap['B'] || 0, grade: 'B' as const },
      { gradeRange: '40-49% (C)', studentCount: gradeMap['C'] || 0, grade: 'C' as const },
      { gradeRange: '< 40% (F)', studentCount: gradeMap['F'] || 0, grade: 'F' as const },
    ];

    const scoreBuckets = [
      { bucket: '90-100', count: filteredMarks.filter((m) => m.percentage >= 90).length },
      { bucket: '80-89', count: filteredMarks.filter((m) => m.percentage >= 80 && m.percentage < 90).length },
      { bucket: '70-79', count: filteredMarks.filter((m) => m.percentage >= 70 && m.percentage < 80).length },
      { bucket: '60-69', count: filteredMarks.filter((m) => m.percentage >= 60 && m.percentage < 70).length },
      { bucket: '< 60', count: filteredMarks.filter((m) => m.percentage < 60).length },
    ];

    const categoryLabels: Record<ExamCategory, string> = {
      INTERNAL_1: '1st Internal Assessment',
      INTERNAL_2: '2nd Internal Assessment',
      LAB_INTERNAL_1: 'Lab Internal 1 Practical',
      LAB_INTERNAL_2: 'Lab Internal 2 Practical',
      END_SEMESTER: 'End Semester University Examination',
    };

    return {
      examCategory,
      examLabel: categoryLabels[examCategory] || examCategory,
      totalStudents,
      averageScore: avg,
      highestScore: highest,
      lowestScore: lowest,
      medianScore: median,
      passPercentage,
      failPercentage,
      gradeDistribution,
      scoreBuckets,
    };
  }

  async getTeacherStudentPerformanceMatrix(
    teacherId?: string,
    semesterNumber?: number
  ): Promise<StudentPerformanceRecord[]> {
    return [...mockStudentPerformanceMatrix];
  }

  async getQuestionPapers(
    teacherId?: string,
    subjectId?: string,
    semesterNumber?: number,
    userProfile?: any
  ): Promise<QuestionPaperDocument[]> {
    let list = [...this.questionPapers];
    if (teacherId) {
      list = list.filter((q) => q.teacherId === teacherId);
    }
    if (subjectId) {
      list = list.filter((q) => q.subjectId === subjectId);
    }
    if (semesterNumber) {
      list = list.filter((q) => q.semesterNumber === semesterNumber);
    }
    if (userProfile && userProfile.role === 'student' && userProfile.semesterNumber) {
      list = list.filter((q) => q.semesterNumber === userProfile.semesterNumber);
    }
    return list;
  }

  async uploadQuestionPaper(
    paper: Omit<QuestionPaperDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<QuestionPaperDocument> {
    const newDoc: QuestionPaperDocument = {
      ...paper,
      id: `qp-${Date.now()}`,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Published',
    };
    this.questionPapers.unshift(newDoc);
    this.persistQuestionPapersToStorage();
    return newDoc;
  }

  async deleteQuestionPaper(paperId: string): Promise<boolean> {
    const len = this.questionPapers.length;
    this.questionPapers = this.questionPapers.filter((q) => q.id !== paperId);
    this.persistQuestionPapersToStorage();
    return this.questionPapers.length < len;
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

  async getSharedDocuments(
    semesterNumber?: number,
    userProfile?: Partial<UserProfile>
  ): Promise<SharedDocumentRecord[]> {
    let list = [...this.sharedDocuments];
    if (semesterNumber) {
      list = list.filter((d) => d.targetSemester === semesterNumber);
    }
    if (userProfile && userProfile.role === 'student' && userProfile.semesterNumber) {
      list = list.filter((d) => d.targetSemester === userProfile.semesterNumber);
    }
    return list;
  }

  async getDocumentById(
    id: string,
    userProfile?: Partial<UserProfile>
  ): Promise<SharedDocumentRecord | NoteDocument | null> {
    const sharedDoc = this.sharedDocuments.find((d) => d.id === id);
    const noteDoc = this.notes.find((n) => n.id === id);
    const qpDoc = this.questionPapers.find((q) => q.id === id);
    const doc = sharedDoc || noteDoc || (qpDoc as any);

    if (!doc) {
      return null;
    }

    if (userProfile) {
      const docAny = doc as any;
      const auth = AuthorizationService.canUserAccessDocument(userProfile, {
        targetSemester: docAny.targetSemester || docAny.semesterNumber,
        semesterNumber: docAny.semesterNumber || docAny.targetSemester,
        subjectCode: docAny.subjectCode || docAny.subject,
        subjectId: docAny.subjectId,
        subject: docAny.subject,
        uploadedById: docAny.uploadedById || docAny.teacherId,
        visibility: docAny.visibility,
      });

      if (!auth.allowed) {
        const error = new Error(auth.reason || '403 Forbidden: Access Denied to this document.');
        (error as any).status = 403;
        throw error;
      }
    }

    return doc;
  }

  async downloadDocument(
    id: string,
    userProfile: Partial<UserProfile>
  ): Promise<{ fileName: string; contentType: string; content: string; fileData?: string; previewUrl?: string }> {
    const doc = await this.getDocumentById(id, userProfile);
    if (!doc) {
      const error = new Error('Document not found.');
      (error as any).status = 404;
      throw error;
    }

    const docAny = doc as any;
    const content = docAny.extractedText || `CampusOS Study Material: ${doc.title}\nSubject: ${doc.subject}\nSemester: ${doc.semester}`;
    const fileName = docAny.fileName || `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${docAny.fileType || 'pdf'}`;
    const fileData = docAny.fileData || docAny.fileUrl;

    return {
      fileName,
      contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
      content,
      fileData,
      previewUrl: docAny.fileUrl || fileData,
    };
  }

  async getNotes(
    subject?: string,
    query?: string,
    semesterNumber?: number,
    userProfile?: Partial<UserProfile>
  ): Promise<NoteDocument[]> {
    let effectiveSem = semesterNumber;
    if (userProfile && userProfile.role === 'student' && userProfile.semesterNumber) {
      effectiveSem = userProfile.semesterNumber;
    }

    let list = [...this.notes];

    // Filter by student semester
    if (effectiveSem) {
      list = list.filter((n) => !n.semesterNumber || n.semesterNumber === effectiveSem);
    }

    // Filter drafts: students only see published notes
    if (userProfile?.role === 'student') {
      list = list.filter((n) => n.status !== 'draft');
    }

    if (subject && subject !== 'all') {
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
    this.persistNotesToStorage();
    return note;
  }

  async uploadNote(
    note: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>,
    facultyProfile?: Partial<UserProfile>
  ): Promise<NoteDocument> {
    if (facultyProfile && facultyProfile.role === 'teacher') {
      const validation = AuthorizationService.validateFacultyUpload(facultyProfile, {
        subjectCode: note.subjectCode || note.subjectId,
        subjectId: note.subjectId,
        subject: note.subject,
        semesterNumber: note.semesterNumber,
      });
      if (!validation.allowed) {
        const error = new Error(validation.error || '403 Forbidden: Unauthorized teaching assignment.');
        (error as any).status = 403;
        throw error;
      }
    }

    const noteId = `note-${Date.now()}`;
    const newNote: NoteDocument = {
      ...note,
      id: noteId,
      targetSemester: note.semesterNumber,
      status: note.status || 'published',
      category: note.category || 'notes',
      uploadedAt: 'Just now',
      downloads: 0,
      isNew: true,
      rating: 5.0,
      views: 1,
    };
    this.notes.unshift(newNote);

    // Also sync to sharedDocuments
    const sharedRecord: SharedDocumentRecord = {
      id: noteId,
      title: newNote.title,
      fileName: newNote.fileName || `${newNote.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      fileType: (newNote.fileType as any) || 'pdf',
      fileSize: newNote.fileSize || newNote.size || '3.5 MB',
      sizeBytes: 3670016,
      category: (newNote.category as any) || 'notes',
      subject: newNote.subject,
      subjectCode: newNote.subjectCode || newNote.subjectId || 'CS501',
      semester: newNote.semester,
      targetSemester: newNote.semesterNumber,
      uploadedBy: newNote.teacher,
      uploadedById: newNote.teacherId || 'usr-003',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: (newNote.status as any) || 'published',
      visibility: 'students',
      fileData: newNote.fileData,
      extractedText: newNote.extractedText || newNote.description || `Lecture notes on ${newNote.title} for ${newNote.subject}.`,
      downloads: 0,
      views: 1,
    };
    this.sharedDocuments.unshift(sharedRecord);

    this.persistNotesToStorage();
    return newNote;
  }

  async deleteNote(noteId: string): Promise<boolean> {
    const prev = this.notes.length;
    this.notes = this.notes.filter((n) => n.id !== noteId);
    this.sharedDocuments = this.sharedDocuments.filter((d) => d.id !== noteId);
    this.persistNotesToStorage();
    return this.notes.length < prev;
  }

  async getAnnouncements(role?: Role, userId?: string, semesterNumber?: number): Promise<Announcement[]> {
    let list = [...this.announcements];
    if (role) {
      list = list.filter((a) => !a.targetRole || a.targetRole === 'all' || a.targetRole === role);
    }
    if (userId) {
      list = list.filter((a) => !a.recipientUserId || a.recipientUserId === userId);
    }
    if (semesterNumber) {
      list = list.filter((a) => !a.targetSemester || a.targetSemester === semesterNumber || a.semesterNumber === semesterNumber);
    }
    return list;
  }

  async createAnnouncement(announcement: Announcement): Promise<Announcement> {
    this.announcements.unshift(announcement);
    this.persistAnnouncementsToStorage();
    return announcement;
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const item = this.announcements.find((a) => a.id === notificationId);
    if (item) {
      item.read = true;
      this.persistAnnouncementsToStorage();
      return true;
    }
    return false;
  }

  async markAllNotificationsRead(userId?: string): Promise<boolean> {
    this.announcements.forEach((a) => {
      if (!userId || !a.recipientUserId || a.recipientUserId === userId) {
        a.read = true;
      }
    });
    this.persistAnnouncementsToStorage();
    return true;
  }

  async getAssignments(
    filters?: string | { subject?: string; semester?: number; status?: string; teacherName?: string },
    userProfile?: Partial<UserProfile>
  ): Promise<Assignment[]> {
    let list = [...this.assignments];

    // 1. Strict student semester isolation
    if (userProfile && userProfile.role === 'student') {
      const sem = userProfile.semesterNumber || 5;
      list = list.filter((a) => a.semesterNumber === sem);
      // Students never see drafts
      list = list.filter((a) => a.status !== 'draft');
    }

    // 2. Filter object or string
    if (typeof filters === 'string') {
      if (filters.trim()) {
        list = list.filter((a) => a.teacher.includes(filters) || a.subject.includes(filters));
      }
    } else if (filters) {
      if (filters.teacherName) {
        list = list.filter((a) => a.teacher.toLowerCase().includes(filters.teacherName!.toLowerCase()));
      }
      if (filters.semester) {
        list = list.filter((a) => a.semesterNumber === filters.semester);
      }
      if (filters.subject && filters.subject !== 'all') {
        const sub = filters.subject.toLowerCase();
        list = list.filter(
          (a) =>
            a.subject.toLowerCase().includes(sub) ||
            a.subjectId?.toLowerCase() === sub ||
            a.subjectCode?.toLowerCase() === sub
        );
      }
      if (filters.status && filters.status !== 'all') {
        list = list.filter((a) => a.status === filters.status);
      }
    }

    return list;
  }

  async getAssignmentById(id: string, userProfile?: Partial<UserProfile>): Promise<Assignment | null> {
    const asg = this.assignments.find((a) => a.id === id);
    if (!asg) return null;

    // Strict semester isolation check
    if (userProfile && userProfile.role === 'student') {
      const studentSem = userProfile.semesterNumber || 5;
      if (asg.semesterNumber !== studentSem) {
        const error = new Error(
          `403 Forbidden: You are enrolled in Semester ${studentSem}. You cannot access assignments for Semester ${asg.semesterNumber}.`
        );
        (error as any).status = 403;
        throw error;
      }
    }

    return asg;
  }

  async createAssignment(
    assignment: Omit<Assignment, 'id' | 'createdAt' | 'totalSubmissions' | 'gradedSubmissions'> & { id?: string },
    facultyProfile?: Partial<UserProfile>
  ): Promise<Assignment> {
    // Server-side faculty teaching authorization check
    if (facultyProfile && facultyProfile.role === 'teacher') {
      const validation = AuthorizationService.validateFacultyUpload(facultyProfile, {
        subjectCode: assignment.subjectCode || assignment.subjectId,
        subjectId: assignment.subjectId,
        subject: assignment.subject,
        semesterNumber: assignment.semesterNumber,
      });
      if (!validation.allowed) {
        const error = new Error(validation.error || '403 Forbidden: Unauthorized teaching assignment.');
        (error as any).status = 403;
        throw error;
      }
    }

    const newId = assignment.id || `asg-${Date.now()}`;
    const newAssignment: Assignment = {
      ...assignment,
      id: newId,
      department: 'BCA',
      targetSemester: assignment.semesterNumber,
      status: assignment.status || 'active',
      totalSubmissions: 0,
      gradedSubmissions: 0,
      createdAt: new Date().toISOString(),
    };

    this.assignments.unshift(newAssignment);
    this.persistAssignmentsToStorage();
    return newAssignment;
  }

  async updateAssignment(
    id: string,
    updates: Partial<Assignment>,
    facultyProfile?: Partial<UserProfile>
  ): Promise<Assignment | null> {
    const idx = this.assignments.findIndex((a) => a.id === id);
    if (idx === 0 || idx > 0) {
      const existing = this.assignments[idx];

      if (facultyProfile && facultyProfile.role === 'teacher') {
        const validation = AuthorizationService.validateFacultyUpload(facultyProfile, {
          subjectCode: updates.subjectCode || existing.subjectCode || existing.subjectId,
          subjectId: updates.subjectId || existing.subjectId,
          subject: updates.subject || existing.subject,
          semesterNumber: updates.semesterNumber || existing.semesterNumber,
        });
        if (!validation.allowed) {
          const error = new Error(validation.error || '403 Forbidden: Unauthorized teaching assignment.');
          (error as any).status = 403;
          throw error;
        }
      }

      this.assignments[idx] = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.persistAssignmentsToStorage();
      return this.assignments[idx];
    }
    return null;
  }

  async deleteAssignment(id: string, facultyProfile?: Partial<UserProfile>): Promise<boolean> {
    const idx = this.assignments.findIndex((a) => a.id === id);
    if (idx < 0) return false;

    const existing = this.assignments[idx];
    if (facultyProfile && facultyProfile.role === 'teacher') {
      const validation = AuthorizationService.validateFacultyUpload(facultyProfile, {
        subjectCode: existing.subjectCode || existing.subjectId,
        subjectId: existing.subjectId,
        subject: existing.subject,
        semesterNumber: existing.semesterNumber,
      });
      if (!validation.allowed) {
        const error = new Error(validation.error || '403 Forbidden: Unauthorized teaching assignment.');
        (error as any).status = 403;
        throw error;
      }
    }

    this.assignments.splice(idx, 1);
    this.submissions = this.submissions.filter((s) => s.assignmentId !== id);
    this.persistAssignmentsToStorage();
    this.persistSubmissionsToStorage();
    return true;
  }

  async submitAssignment(
    payload: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'assignmentTitle'> & { id?: string; assignmentTitle?: string; textAnswer?: string },
    studentProfile?: Partial<UserProfile>
  ): Promise<Submission> {
    const assignment = this.assignments.find((a) => a.id === payload.assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID "${payload.assignmentId}" not found.`);
    }

    // Student semester check
    if (studentProfile && studentProfile.role === 'student') {
      const studentSem = studentProfile.semesterNumber || 5;
      if (assignment.semesterNumber !== studentSem) {
        const error = new Error(
          `403 Forbidden: You are enrolled in Semester ${studentSem}. You cannot submit assignments for Semester ${assignment.semesterNumber}.`
        );
        (error as any).status = 403;
        throw error;
      }
    }

    const existingIdx = this.submissions.findIndex(
      (s) => s.assignmentId === payload.assignmentId && s.studentId === payload.studentId
    );

    const submissionId = payload.id || (existingIdx >= 0 ? this.submissions[existingIdx].id : `subm-${Date.now()}`);
    const newSubmission: Submission = {
      ...payload,
      id: submissionId,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      subjectCode: assignment.subjectCode,
      semesterNumber: assignment.semesterNumber,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'submitted',
      maxScore: assignment.maxScore,
    };

    if (existingIdx >= 0) {
      this.submissions[existingIdx] = newSubmission;
    } else {
      this.submissions.unshift(newSubmission);
      assignment.totalSubmissions = (assignment.totalSubmissions || 0) + 1;
      this.persistAssignmentsToStorage();
    }

    this.persistSubmissionsToStorage();
    return newSubmission;
  }

  async getSubmissions(
    filters?: string | { assignmentId?: string; studentId?: string },
    userProfile?: Partial<UserProfile>
  ): Promise<Submission[]> {
    let list = [...this.submissions];

    // 1. Strict student isolation: student can ONLY retrieve their own submission
    if (userProfile && userProfile.role === 'student') {
      const studentId = userProfile.id || 'usr-001';
      list = list.filter((s) => s.studentId === studentId);
    }

    // 2. Filter by assignmentId or studentId
    if (typeof filters === 'string') {
      if (filters.trim()) {
        list = list.filter((s) => s.assignmentId === filters);
      }
    } else if (filters) {
      if (filters.assignmentId) {
        list = list.filter((s) => s.assignmentId === filters.assignmentId);
      }
      if (filters.studentId) {
        list = list.filter((s) => s.studentId === filters.studentId);
      }
    }

    return list;
  }

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string,
    facultyProfile?: Partial<UserProfile>
  ): Promise<Submission | null> {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;

    const asg = this.assignments.find((a) => a.id === sub.assignmentId);

    // Faculty authorization check
    if (facultyProfile && facultyProfile.role === 'teacher') {
      if (asg) {
        const validation = AuthorizationService.validateFacultyUpload(facultyProfile, {
          subjectCode: asg.subjectCode || asg.subjectId,
          subjectId: asg.subjectId,
          subject: asg.subject,
          semesterNumber: asg.semesterNumber,
        });
        if (!validation.allowed) {
          const error = new Error(validation.error || '403 Forbidden: Unauthorized to grade this subject.');
          (error as any).status = 403;
          throw error;
        }
      }
    }

    const wasGraded = sub.status === 'graded';
    sub.score = score;
    sub.status = 'graded';
    if (feedback !== undefined) sub.feedback = feedback;
    sub.gradedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    sub.gradedBy = facultyProfile?.fullName || 'Faculty Instructor';

    if (!wasGraded && asg) {
      asg.gradedSubmissions = (asg.gradedSubmissions || 0) + 1;
      this.persistAssignmentsToStorage();
    }

    this.persistSubmissionsToStorage();
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
    file: { name: string; size: string; type: 'pdf' | 'image' | 'doc'; previewUrl?: string }
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
      adminRemarks: 'Submitted by student. Awaiting academic verification by COE.',
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

  async getFeedback(category?: FeedbackCategory): Promise<AnonymousFeedback[]> {
    let list = [...this.feedbacks];
    if (category) {
      list = list.filter((f) => f.category === category);
    }
    return list;
  }

  async submitFeedback(
    payload: Omit<AnonymousFeedback, 'id' | 'submittedAt' | 'status'>
  ): Promise<AnonymousFeedback> {
    const created: AnonymousFeedback = {
      id: `fb-${Date.now()}`,
      category: payload.category,
      rating: payload.rating || 5,
      message: payload.message,
      submittedRole: payload.submittedRole,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    this.feedbacks.unshift(created);
    return created;
  }

  async updateFeedbackStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'addressed'
  ): Promise<boolean> {
    const item = this.feedbacks.find((f) => f.id === id);
    if (item) {
      item.status = status;
      return true;
    }
    return false;
  }

  async getActivities(): Promise<ActivityItem[]> {
    return [...this.activities];
  }
}

export const campusRepository = new MockCampusRepository();
