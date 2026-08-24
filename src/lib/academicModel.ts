/**
 * Centralized Academic Data Model & Semester Normalization
 *
 * Normalizes semester representation, subject identities (subjectId),
 * examination types (Theory/Lab, Internal 1/2, End-Semester),
 * marks card submissions, and teacher class filters.
 */

export interface SemesterInfo {
  semester: number; // 1, 2, 3, 4, 5, 6
  year: number; // 1, 2, 3
  label: string; // "Semester 5"
  shortLabel: string; // "Sem 5"
  term: string; // "Fall 2026"
  isCurrent?: boolean;
}

export const PROGRAM_SEMESTERS: SemesterInfo[] = [
  { semester: 1, year: 1, label: 'Semester 1', shortLabel: 'Sem 1', term: 'Fall 2024' },
  { semester: 2, year: 1, label: 'Semester 2', shortLabel: 'Sem 2', term: 'Spring 2025' },
  { semester: 3, year: 2, label: 'Semester 3', shortLabel: 'Sem 3', term: 'Fall 2025' },
  { semester: 4, year: 2, label: 'Semester 4', shortLabel: 'Sem 4', term: 'Spring 2026' },
  { semester: 5, year: 3, label: 'Semester 5', shortLabel: 'Sem 5', term: 'Fall 2026', isCurrent: true },
  { semester: 6, year: 3, label: 'Semester 6', shortLabel: 'Sem 6', term: 'Spring 2027' },
];

export function normalizeSemesterNumber(semInput: string | number | undefined): number {
  if (typeof semInput === 'number') return semInput;
  if (!semInput) return 5;
  const match = semInput.match(/\d+/);
  return match ? parseInt(match[0], 10) : 5;
}

export function getSemesterInfo(semesterNum: number): SemesterInfo {
  return (
    PROGRAM_SEMESTERS.find((s) => s.semester === semesterNum) || {
      semester: semesterNum,
      year: Math.ceil(semesterNum / 2),
      label: `Semester ${semesterNum}`,
      shortLabel: `Sem ${semesterNum}`,
      term: 'Academic Year',
    }
  );
}

// Canonical Subject Entity
export interface SubjectEntity {
  subjectId: string; // e.g. "sub-os" or "CS501"
  code: string; // "CS501"
  name: string; // "Operating Systems"
  department: string; // "BCA"
  semester: number; // 5
  year: number; // 3
  credits: number; // 4
  type: 'THEORY' | 'LAB';
  instructor: string;
  syllabusProgress: number; // 0-100
  attendanceRate: number; // 0-100
  description?: string;
}

// Examination Categories & Types
export type ExamCategory = 'INTERNAL_1' | 'INTERNAL_2' | 'END_SEMESTER';
export type ExamType = 'THEORY' | 'LAB';

export interface ExamEntity {
  id: string;
  subjectId: string;
  subject: string;
  subjectCode: string;
  semester: number;
  year: number;
  department: string;
  examCategory: ExamCategory;
  examType: ExamType;
  date: string;
  startTime: string;
  endTime: string;
  time: string;
  duration: string;
  room: string;
  faculty: string;
  maxMarks: number;
  syllabusCovered?: string;
  isCompleted?: boolean;
}

// Marks Card Submissions
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
  fileType?: 'pdf' | 'image';
  previewUrl?: string;
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Teacher Dashboard Filtering Structure
export interface TeacherFilterState {
  gradeYear: string; // 'all' | '1' | '2' | '3'
  semester: string; // 'all' | '1' | '2' | '3' | '4' | '5' | '6'
  subject: string; // 'all' | 'Operating Systems' | 'DBMS' | ...
  section: string; // 'all' | 'A' | 'B' | 'Lab Batch 1'
}
