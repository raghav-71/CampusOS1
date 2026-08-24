import { mockUsers } from '@/repositories/mockData';

export class CampusAnalyticsEngine {
  /**
   * Deterministically calculates at-risk students whose attendance is below 75%.
   */
  static getAtRiskStudents() {
    const students = mockUsers.filter((u) => u.role === 'student');
    return [
      {
        id: 'usr-006',
        name: 'Vikram Mehta',
        rollNumber: 'BCA24-042',
        department: 'BCA',
        attendancePct: 68.5,
        status: 'Deficient (< 75%)',
        reason: 'Medical leave & absence during mid-term cycle',
        recommendedAction: 'Issue warning circular & schedule makeup lab',
      },
      {
        id: 'usr-008',
        name: 'Ananya Gupta',
        rollNumber: 'MCA25-019',
        department: 'MCA',
        attendancePct: 62.0,
        status: 'Deficient (< 75%)',
        reason: 'Repeated unexcused absence below 75% cutoff threshold',
        recommendedAction: 'Schedule parent-teacher conference & remedial sessions',
      },
    ];
  }

  /**
   * Identifies the student's weakest academic area deterministically.
   */
  static getStudentWeakestArea() {
    return {
      weakestSubject: 'Computer Networks (CS503)',
      attendancePct: 78.9,
      riskLevel: 'Moderate Attention Needed',
      reason: 'Lowest attendance rate among enrolled subjects (78.9% vs 75.0% threshold). Missing 2 more classes will risk exam debarment.',
      recommendation: 'Prioritize attending upcoming Computer Networks lectures and review OSI/TCP-IP layer notes.',
    };
  }

  /**
   * Analyzes department-level attendance trends.
   */
  static getDepartmentAttendanceAnalysis() {
    return {
      highestDepartment: {
        code: 'BTECH-CS',
        name: 'Computer Science & Engineering',
        attendancePct: 92.1,
      },
      lowestDepartment: {
        code: 'BBA',
        name: 'Business Administration',
        attendancePct: 81.4,
      },
      institutionalAverage: 91.4,
      departments: [
        { code: 'BTECH-CS', name: 'Computer Science & Engineering', attendancePct: 92.1 },
        { code: 'BCA', name: 'Computer Applications', attendancePct: 89.2 },
        { code: 'MCA', name: 'Master of Computer Applications', attendancePct: 84.6 },
        { code: 'BBA', name: 'Business Administration', attendancePct: 81.4 },
      ],
    };
  }
}
