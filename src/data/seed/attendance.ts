import { AttendanceRecord } from '@/types/campus';

export interface SubjectAttendanceSummary {
  subjectCode: string;
  subjectName: string;
  semesterNumber: number;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
  status: 'Good' | 'Warning' | 'Critical';
}

export const seedStudentAttendanceSummary: Record<string, SubjectAttendanceSummary[]> = {
  // Arjun Sharma (Sem 5)
  'usr-001': [
    { subjectCode: 'CS501', subjectName: 'Operating Systems', semesterNumber: 5, attendedClasses: 28, totalClasses: 30, attendancePercentage: 93.3, status: 'Good' },
    { subjectCode: 'CS502', subjectName: 'Database Management Systems', semesterNumber: 5, attendedClasses: 28, totalClasses: 32, attendancePercentage: 87.5, status: 'Good' },
    { subjectCode: 'CS503', subjectName: 'Computer Networks', semesterNumber: 5, attendedClasses: 30, totalClasses: 38, attendancePercentage: 78.9, status: 'Warning' },
    { subjectCode: 'CS504', subjectName: 'Java Enterprise Programming', semesterNumber: 5, attendedClasses: 40, totalClasses: 42, attendancePercentage: 95.2, status: 'Good' },
    { subjectCode: 'CS505', subjectName: 'Design & Analysis of Algorithms', semesterNumber: 5, attendedClasses: 24, totalClasses: 30, attendancePercentage: 80.0, status: 'Good' },
  ],
  // Priya Menon (Sem 3)
  'usr-005': [
    { subjectCode: 'CS301', subjectName: 'Database Management Systems', semesterNumber: 3, attendedClasses: 29, totalClasses: 30, attendancePercentage: 96.7, status: 'Good' },
    { subjectCode: 'CS302', subjectName: 'Computer Organization', semesterNumber: 3, attendedClasses: 27, totalClasses: 30, attendancePercentage: 90.0, status: 'Good' },
  ],
  // Rohan Gupta (Sem 1)
  'usr-008': [
    { subjectCode: 'CS101', subjectName: 'Problem Solving & C Programming', semesterNumber: 1, attendedClasses: 26, totalClasses: 28, attendancePercentage: 92.8, status: 'Good' },
    { subjectCode: 'CS102', subjectName: 'Digital Logic Design', semesterNumber: 1, attendedClasses: 25, totalClasses: 28, attendancePercentage: 89.3, status: 'Good' },
  ],
};

export const seedAttendanceLogs: AttendanceRecord[] = [
  { id: 'att-log-01', studentId: 'usr-001', studentName: 'Arjun Sharma', rollNumber: 'BCA2401', subject: 'Operating Systems', subjectCode: 'CS501', date: '2026-08-29', status: 'present', semesterNumber: 5 },
  { id: 'att-log-02', studentId: 'usr-001', studentName: 'Arjun Sharma', rollNumber: 'BCA2401', subject: 'Computer Networks', subjectCode: 'CS503', date: '2026-08-29', status: 'present', semesterNumber: 5 },
  { id: 'att-log-03', studentId: 'usr-001', studentName: 'Arjun Sharma', rollNumber: 'BCA2401', subject: 'Database Management Systems', subjectCode: 'CS502', date: '2026-08-28', status: 'present', semesterNumber: 5 },
  { id: 'att-log-04', studentId: 'usr-001', studentName: 'Arjun Sharma', rollNumber: 'BCA2401', subject: 'Computer Networks', subjectCode: 'CS503', date: '2026-08-28', status: 'absent', semesterNumber: 5 },
  { id: 'att-log-05', studentId: 'usr-001', studentName: 'Arjun Sharma', rollNumber: 'BCA2401', subject: 'Java Enterprise Programming', subjectCode: 'CS504', date: '2026-08-27', status: 'present', semesterNumber: 5 },
  { id: 'att-log-06', studentId: 'usr-004', studentName: 'Divya Nair', rollNumber: 'BCA2404', subject: 'Operating Systems', subjectCode: 'CS501', date: '2026-08-29', status: 'absent', semesterNumber: 5 },
  { id: 'att-log-07', studentId: 'usr-012', studentName: 'Rohit Verma', rollNumber: 'BCA2521', subject: 'Web Technologies', subjectCode: 'CS401', date: '2026-08-29', status: 'absent', semesterNumber: 4 },
];
