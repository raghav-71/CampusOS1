import { campusRepository } from '@/repositories/campusRepository';
import {
  mockUsers,
  mockDepartmentNotes,
  mockEnrollmentData,
  mockActivities,
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
        name: 'Computer Applications (Undergraduate)',
        studentsCount: 720,
        averageAttendance: 89.2,
        head: 'Dr. Priya Nair',
      },
      {
        code: 'MCA',
        name: 'Master of Computer Applications (Postgraduate)',
        studentsCount: 480,
        averageAttendance: 84.6,
        head: 'Prof. Ramesh Kulkarni',
      },
      {
        code: 'BTECH-CS',
        name: 'Computer Science & Engineering',
        studentsCount: 840,
        averageAttendance: 92.1,
        head: 'Dr. Arvind Sharma',
      },
      {
        code: 'BBA',
        name: 'Business Administration',
        studentsCount: 378,
        averageAttendance: 81.4, // lowest department attendance
        head: 'Dr. Sunita Rao',
      },
    ];
  }

  static async getAdminAnalytics() {
    const students = mockUsers.filter((u) => u.role === 'student');
    const atRisk = [
      {
        id: 'usr-006',
        name: 'Vikram Mehta',
        rollNumber: 'BCA24-042',
        attendancePct: 68.5,
        department: 'BCA',
        reason: 'Medical leave & absence during mid-term cycle',
        recommendedAction: 'Issue warning circular & schedule makeup lab',
      },
      {
        id: 'usr-008',
        name: 'Ananya Gupta',
        rollNumber: 'MCA25-019',
        attendancePct: 62.0,
        department: 'MCA',
        reason: 'Repeated unexcused absence below 75% cutoff',
        recommendedAction: 'Schedule parent-teacher conference & remedial sessions',
      },
    ];

    return {
      totalStudentsEnrolled: 2418,
      totalFacultyMembers: 86,
      averageInstitutionalAttendance: 91.4,
      lowestAttendanceDepartment: {
        code: 'BBA',
        name: 'Business Administration',
        averageAttendance: 81.4,
      },
      atRiskStudentsCount: atRisk.length,
      atRiskStudents: atRisk,
      curriculumAnomaliesCount: 1,
      curriculumAnomalies: [
        {
          subject: 'Database Management Systems (CS502)',
          department: 'BCA Sem 5',
          progressPct: 55,
          targetPct: 70,
          issue: 'Syllabus coverage pacing is 15% behind target schedule',
          recommendedAction: 'Authorize 4 remedial weekend lecture sessions',
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
