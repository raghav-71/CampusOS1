import { campusRepository } from '@/repositories/campusRepository';
import {
  mockUsers,
  mockDepartmentNotes,
  mockEnrollmentData,
} from '@/repositories/mockData';

export class AdminTools {
  static async getAdminUsers(role?: string, department?: string) {
    const users = await campusRepository.getUsers();
    let filtered = [...users];
    if (role && role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }
    if (department && department !== 'All') {
      filtered = filtered.filter((u) => u.department === department);
    }
    return filtered;
  }

  static async getDepartments() {
    return [
      {
        code: 'BCA',
        name: 'Bachelor of Computer Applications (3-Year Degree)',
        studentsCount: 384,
        averageAttendance: 91.8,
        head: 'Dr. Priya Nair',
      },
    ];
  }

  static async getAdminAnalytics() {
    const atRisk = [
      {
        id: 'usr-004',
        name: 'Rohit Verma',
        rollNumber: 'BCA2403',
        attendancePct: 68.5,
        department: 'BCA',
        semester: 5,
        reason: 'Repeated unexcused absences during OS and DBMS lectures',
        recommendedAction: 'Issue warning circular & schedule remediation counseling',
      },
      {
        id: 'usr-011',
        name: 'Vikram Mehta',
        rollNumber: 'BCA2442',
        attendancePct: 68.5,
        department: 'BCA',
        semester: 5,
        reason: 'Medical leave & absence during mid-term cycle',
        recommendedAction: 'Verify medical certificate & schedule makeup lab sessions',
      },
    ];

    return {
      totalStudentsEnrolled: 384,
      totalFacultyMembers: 30,
      averageInstitutionalAttendance: 91.8,
      lowestAttendanceDepartment: {
        code: 'BCA',
        name: 'Bachelor of Computer Applications',
        averageAttendance: 91.8,
      },
      atRiskStudentsCount: atRisk.length,
      atRiskStudents: atRisk,
      curriculumAnomaliesCount: 1,
      curriculumAnomalies: [
        {
          subject: 'Database Management Systems (CS502)',
          department: 'BCA Sem 5',
          progressPct: 60,
          targetPct: 75,
          issue: 'Syllabus coverage pacing is 15% behind target schedule',
          recommendedAction: 'Authorize 2 remedial weekend lecture sessions',
        },
      ],
      departmentBreakdowns: mockDepartmentNotes,
      enrollmentTrends: mockEnrollmentData,
    };
  }

  static async getAuditLogs(limit = 10) {
    const logs = await campusRepository.getActivities();
    return logs.slice(0, limit);
  }
}
