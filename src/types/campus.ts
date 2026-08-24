export type Role = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  name?: string;
  initials: string;
  department?: string;
  semester?: string;
  rollNumber?: string;
  subjects?: string[];
  avatarUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  joinedAt?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  totalStudents: number;
  totalFaculty: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
  instructor: string;
  syllabusCoveragePct: number;
  syllabusProgress?: number;
  attendanceRate?: number;
  colorBadge?: string;
}

export interface TimetableSlot {
  id: string;
  subject: string;
  subjectCode?: string;
  time: string;
  endTime: string;
  room: string;
  teacher: string;
  department: string;
  semester: string;
  dayOfWeek: string;
  type?: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  department: string;
  semester: string;
  teacher: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxScore: number;
  description?: string;
  status: 'active' | 'grading' | 'closed';
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
  feedback?: string;
}

export interface NoteDocument {
  id: string;
  title: string;
  subject: string;
  semester: string;
  department?: string;
  teacher: string;
  tags: string[];
  uploadedAt: string;
  downloads: number;
  pages: number;
  size: string;
  fileSize?: string;
  isNew: boolean;
  rating?: number;
  views?: number;
  fileUrl?: string;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Exam' | 'Event' | 'General' | 'Academic' | 'Emergency';
  time: string;
  author: string;
  read: boolean;
  targetRole?: Role | 'all';
  targetDepartment?: string;
}

export interface ExamSchedule {
  id: string;
  subject: string;
  subjectCode: string;
  date: string;
  time: string;
  room: string;
  semester: string;
  department: string;
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
  registeredCount?: number;
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
    | 'grade';
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
  value: string;
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
