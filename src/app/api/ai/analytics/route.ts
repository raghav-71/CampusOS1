import { NextResponse } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { AdminTools } from '@/lib/ai/tools/admin';
import { CampusAnalyticsEngine } from '@/lib/ai/tools/analytics';

export async function GET() {
  try {
    const [analytics, depts, users, activities] = await Promise.all([
      AdminTools.getAdminAnalytics(),
      AdminTools.getDepartments(),
      campusRepository.getUsers(),
      campusRepository.getActivities(),
    ]);

    const deptAttendance = CampusAnalyticsEngine.getDepartmentAttendanceAnalysis();

    const insights = {
      timestamp: new Date().toISOString(),
      summary: `Institutional AI Copilot Analysis across ${depts.length} University Departments`,
      totalStudentsEnrolled: analytics.totalStudentsEnrolled,
      totalActiveFaculty: analytics.totalFacultyMembers,
      averageInstitutionalAttendance: analytics.averageInstitutionalAttendance,
      lowestAttendanceDepartment: analytics.lowestAttendanceDepartment,
      atRiskStudents: analytics.atRiskStudents,
      curriculumAnomalies: analytics.curriculumAnomalies,
      departmentAttendanceBreakdown: deptAttendance.departments,
      workloadDistribution: {
        balancedFacultyPct: 94,
        overloadedFaculty: ['Dr. Priya Nair (18 Hrs/Wk — HOD & Systems Lab)'],
      },
      departmentNotesMetrics: analytics.departmentBreakdowns,
      recentSecurityEvents: activities.slice(0, 5),
    };

    return NextResponse.json({ insights, success: true });
  } catch (err: any) {
    console.error('AI Analytics Route Error:', err);
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}
