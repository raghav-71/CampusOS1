export type Role = 'student' | 'teacher' | 'admin';

export type BcaSemester = 1 | 2 | 3 | 4 | 5 | 6;
export type BcaYear = 1 | 2 | 3;
export type BcaSection = 'A' | 'B' | 'Batch 1' | 'Batch 2';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  name?: string;
  initials: string;
  department: 'BCA';
  semester?: string;
  semesterNumber?: BcaSemester;
  year?: BcaYear;
  section?: BcaSection;
  rollNumber?: string;
  subjects?: string[];
  avatarUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  joinedAt?: string;
}

export interface Department {
  id: string;
  code: 'BCA';
  name: string;
  headOfDepartment: string;
  totalStudents: number;
  totalFaculty: number;
  description?: string;
  academicYears: {
    year: BcaYear;
    label: string;
    semesters: BcaSemester[];
    totalStudents: number;
  }[];
}

export interface Subject {
  id: string;
  subjectId?: string;
  code: string;
  name: string;
  department: 'BCA';
  semester: string;
  semesterNumber: BcaSemester;
  year: BcaYear;
  credits: number;
  instructor: string;
  instructorId?: string;
  type: 'THEORY' | 'LAB';
  syllabusCoveragePct: number;
  syllabusProgress?: number;
  attendanceRate?: number;
  colorBadge?: string;
  description?: string;
}

export type ClassStatus = 'scheduled' | 'LIVE' | 'completed';

export interface TimetableSlot {
  id: string;
  subject: string;
  subjectCode: string;
  time: string;
  endTime: string;
  room: string;
  teacher: string;
  teacherId?: string;
  department: 'BCA';
  semester: string;
  semesterNumber: BcaSemester;
  year?: BcaYear;
  section?: string;
  dayOfWeek: string;
  type?: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
  status: ClassStatus;
  startedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subject: string;
  subjectCode?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  semesterNumber?: BcaSemester;
  section?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  subjectId?: string;
  department: 'BCA';
  semester: string;
  semesterNumber: BcaSemester;
  teacher: string;
  teacherId?: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxScore: number;
  description?: string;
  status: 'active' | 'grading' | 'closed';
  fileUrl?: string;
  fileName?: string;
  fileData?: string;
  extractedText?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subject: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  score?: number;
  maxScore: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  feedback?: string;
}

export interface NoteDocument {
  id: string;
  title: string;
  subject: string;
  subjectId?: string;
  subjectCode?: string;
  semester: string;
  semesterNumber: BcaSemester;
  targetSemester?: BcaSemester;
  department: 'BCA';
  teacher: string;
  teacherId?: string;
  tags: string[];
  uploadedAt: string;
  downloads: number;
  pages: number;
  size: string;
  fileSize?: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  fileData?: string;
  extractedText?: string;
  category?: 'notes' | 'study-material' | 'syllabus' | 'question-paper';
  status?: 'published' | 'draft' | 'archived';
  isNew: boolean;
  rating?: number;
  views?: number;
  description?: string;
}

export type NotificationType =
  | 'CLASS_STARTED'
  | 'ASSIGNMENT'
  | 'EXAM'
  | 'ANNOUNCEMENT'
  | 'ATTENDANCE'
  | 'MARKS'
  | 'DOCUMENT'
  | 'AI'
  | 'SYSTEM';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Exam' | 'Event' | 'General' | 'Academic' | 'Emergency' | 'Class';
  type?: NotificationType;
  time: string;
  createdAt?: string;
  author: string;
  read: boolean;
  recipientUserId?: string;
  targetRole?: Role | 'all';
  targetSemester?: BcaSemester;
  semesterNumber?: BcaSemester;
  targetDepartment?: 'BCA' | 'all';
  targetSection?: string;
  subject?: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: string;
  relatedEntity?: 'class' | 'assignment' | 'exam' | 'note' | 'marks';
  relatedEntityId?: string;
}

export type ExamCategory =
  | 'INTERNAL_1'
  | 'INTERNAL_2'
  | 'LAB_INTERNAL_1'
  | 'LAB_INTERNAL_2'
  | 'END_SEMESTER';

export type ExamType = 'THEORY' | 'LAB';

export interface ExamSchedule {
  id: string;
  subjectId?: string;
  subject: string;
  subjectCode: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  room: string;
  semester: string;
  semesterNumber: BcaSemester;
  year: BcaYear;
  department: 'BCA';
  examCategory: ExamCategory;
  examType: ExamType;
  faculty: string;
  facultyId?: string;
  maxMarks: number;
  syllabusCovered?: string;
}

export interface StudentExamMark {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semesterNumber: BcaSemester;
  section: string;
  examCategory: ExamCategory;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  passed: boolean;
}

export interface StudentPerformanceRecord {
  studentId: string;
  studentName: string;
  rollNumber: string;
  semesterNumber: BcaSemester;
  section: string;
  internal1Marks: number;
  internal1Max: number;
  internal2Marks: number;
  internal2Max: number;
  labInternalMarks: number;
  labInternalMax: number;
  endSemMarks: number;
  endSemMax: number;
  overallPercentage: number;
  overallGrade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  trend: 'improving' | 'steady' | 'needs_attention';
  attendancePct: number;
}

export interface TeacherExamPerformance {
  examCategory: ExamCategory;
  examLabel: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  passPercentage: number;
  failPercentage: number;
  gradeDistribution: {
    gradeRange: string;
    studentCount: number;
    grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  }[];
  scoreBuckets: {
    bucket: string;
    count: number;
  }[];
}

export interface QuestionPaperDocument {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subject: string;
  subjectCode: string;
  semester: string;
  semesterNumber: BcaSemester;
  year: BcaYear;
  examType: 'Mid-Term' | 'End-Term' | 'Quiz' | 'Practical';
  examCategory?: ExamCategory;
  title: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  fileData?: string;
  extractedText?: string;
  description?: string;
  uploadedAt: string;
  status: 'Published' | 'Draft' | 'Approved by Dean';
  totalMarks: number;
  maxMarks?: number;
  duration: string;
}

export type QuestionPaper = QuestionPaperDocument;

export interface TeacherSubjectAssignment {
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semester: string;
  semesterNumber: BcaSemester;
  year: BcaYear;
  section: string;
  credits: number;
  type: 'THEORY' | 'LAB';
  room: string;
  enrolledStudents: number;
  avgAttendancePct: number;
  syllabusCoveredPct: number;
}

export type MarksCardStatus =
  | 'NOT_SUBMITTED'
  | 'UPLOADING'
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'APPROVED'
  | 'REJECTED';

export interface MarksCardDocument {
  id: string;
  semester: number;
  year: number;
  semesterLabel: string;
  status: MarksCardStatus;
  sgpa?: string;
  totalCredits?: number;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  fileType?: 'pdf' | 'image' | 'doc';
  previewUrl?: string;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'cultural' | 'sports' | 'academic';
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity?: number;
  registeredCount: number;
  isRegistered?: boolean;
}

export interface ActivityItem {
  id: string;
  type:
    | 'upload'
    | 'registration'
    | 'announcement'
    | 'flag'
    | 'event'
    | 'login'
    | 'suspension'
    | 'grade'
    | 'class_start';
  title: string;
  detail: string;
  time: string;
  actor: string;
  actorColor: string;
  iconColor: string;
}

export interface KPICardData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change: string;
  trend: 'positive' | 'warning' | 'danger' | 'neutral';
  detail: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hero?: boolean;
}

export interface StudyProgressMetric {
  week: string;
  [subjectKey: string]: string | number;
}

export interface EnrollmentMetric {
  month: string;
  BCA_Year1: number;
  BCA_Year2: number;
  BCA_Year3: number;
  total: number;
  [deptKey: string]: string | number;
}

export interface DepartmentNotesMetric {
  id: string;
  dept: string;
  notes: number;
  teachers: number;
}

export interface FacultyAttendanceMetric {
  day: string;
  os: number;
  dbms: number;
  cn: number;
}

export interface GradeDistributionMetric {
  gradeRange: string;
  studentCount: number;
}

export interface TeacherFilterState {
  gradeYear: string;
  semester: string;
  subject: string;
  section: string;
}
