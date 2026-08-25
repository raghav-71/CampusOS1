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
} from '@/types/campus';

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
  getQuestionPapers(teacherId?: string, subjectId?: string): Promise<QuestionPaperDocument[]>;
  uploadQuestionPaper(
    paper: Omit<QuestionPaperDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<QuestionPaperDocument>;
  deleteQuestionPaper(paperId: string): Promise<boolean>;

  // Notes
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
    file: { name: string; size: string; type: 'pdf' | 'image' | 'doc'; previewUrl?: string }
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
  private timetable: TimetableSlot[] = [...mockTimetable];
  private teacherSchedule: TimetableSlot[] = [...mockTeacherSchedule];
  private teacherAssignments: TeacherSubjectAssignment[] = [...mockTeacherSubjectAssignments];
  private notes: NoteDocument[] = [...mockNotes];
  private announcements: Announcement[] = [...mockAnnouncements];
  private assignments: Assignment[] = [...mockAssignments];
  private submissions: Submission[] = [...mockSubmissions];
  private activities: ActivityItem[] = [...mockActivities];
  private exams: ExamSchedule[] = [...mockExams];
  private marksCards: MarksCardDocument[] = [...mockMarksCardSubmissions];
  private examMarks: StudentExamMark[] = [...mockStudentExamMarks];
  private questionPapers: QuestionPaperDocument[] = [...mockQuestionPapers];
  private attendanceRecords: AttendanceRecord[] = [
    {
      id: 'att-1',
      studentId: 'usr-001',
      studentName: 'Arjun Sharma',
      rollNumber: 'BCA2401',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      date: '2026-08-23',
      status: 'present',
      semesterNumber: 5,
      section: 'A',
    },
    {
      id: 'att-2',
      studentId: 'usr-002',
      studentName: 'Priya Menon',
      rollNumber: 'BCA2402',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      date: '2026-08-23',
      status: 'present',
      semesterNumber: 5,
      section: 'A',
    },
    {
      id: 'att-3',
      studentId: 'usr-004',
      studentName: 'Rohit Verma',
      rollNumber: 'BCA2403',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      date: '2026-08-23',
      status: 'absent',
      semesterNumber: 5,
      section: 'A',
    },
  ];

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

    const assigned = this.teacherAssignments.filter(
      (a) =>
        a.teacherId === user.id ||
        a.teacherName.toLowerCase().includes(user.fullName.toLowerCase()) ||
        user.fullName.toLowerCase().includes(a.teacherName.toLowerCase())
    );

    if (assigned.length > 0) return assigned;

    // Fallback based on user.subjects
    if (user.subjects && user.subjects.length > 0) {
      return user.subjects.map((subName, i) => ({
        teacherId: user.id,
        teacherName: user.fullName,
        subjectId: `sub-${subName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        subjectName: subName,
        subjectCode: `CS${500 + i}`,
        semester: 'Semester 5',
        semesterNumber: 5,
        year: 3,
        section: 'A',
        credits: 4,
        type: 'THEORY',
        room: 'Room A-204',
        enrolledStudents: 64,
        avgAttendancePct: 92.0,
        syllabusCoveredPct: 75,
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

  async getQuestionPapers(teacherId?: string, subjectId?: string): Promise<QuestionPaperDocument[]> {
    let list = [...this.questionPapers];
    if (teacherId) {
      list = list.filter((q) => q.teacherId === teacherId);
    }
    if (subjectId) {
      list = list.filter((q) => q.subjectId === subjectId);
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
    return newDoc;
  }

  async deleteQuestionPaper(paperId: string): Promise<boolean> {
    const len = this.questionPapers.length;
    this.questionPapers = this.questionPapers.filter((q) => q.id !== paperId);
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

  async getNotes(subject?: string, query?: string): Promise<NoteDocument[]> {
    let list = [...this.notes];
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

  async getAnnouncements(role?: Role, userId?: string): Promise<Announcement[]> {
    let list = [...this.announcements];
    if (role) {
      list = list.filter((a) => !a.targetRole || a.targetRole === 'all' || a.targetRole === role);
    }
    if (userId) {
      list = list.filter((a) => !a.recipientUserId || a.recipientUserId === userId);
    }
    return list;
  }

  async createAnnouncement(announcement: Announcement): Promise<Announcement> {
    this.announcements.unshift(announcement);
    return announcement;
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const item = this.announcements.find((a) => a.id === notificationId);
    if (item) {
      item.read = true;
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
    return true;
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

  async getActivities(): Promise<ActivityItem[]> {
    return [...this.activities];
  }
}

export const campusRepository = new MockCampusRepository();
