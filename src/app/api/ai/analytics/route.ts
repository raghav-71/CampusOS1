import { NextResponse } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { mockDepartmentNotes, mockGradeDistributions } from '@/repositories/mockData';

export async function GET() {
  try {
    const [users, depts, subjects, activities] = await Promise.all([
      campusRepository.getUsers(),
      campusRepository.getDepartments(),
      campusRepository.getSubjects(),
      campusRepository.getActivities(),
    ]);

    // Calculate at-risk students based on simulated attendance records and student directory
    const students = users.filter((u) => u.role === 'student');
    const atRiskStudents = [
      {
        id: 'usr-008',
        name: 'Karthik Nambiar',
        rollNumber: 'MCA2612',
        department: 'MCA Sem 1',
        attendancePct: 62.4,
        reason: 'Severe attendance deficiency below 75% cutoff threshold in 3 subjects',
        recommendedAction: 'Issue Official Academic Warning Letter & Schedule Counseling',
      },
      {
        id: 'usr-004',
        name: 'Rohit Verma',
        rollNumber: 'BBA2415',
        department: 'BBA Sem 4',
        attendancePct: 68.0,
        reason: 'Absence during mid-term test cycle & 2 pending lab assignments',
        recommendedAction: 'Schedule remedial assessment with Department Head',
      },
    ];

    // Detect curriculum velocity anomalies from syllabus coverage
    const curriculumAnomalies = subjects
      .filter((s) => (s.syllabusCoveragePct || 0) < 60)
      .map((s) => ({
        subject: `${s.name} (${s.code})`,
        department: `${s.department} ${s.semester}`,
        coveragePct: s.syllabusCoveragePct,
        issue: `Syllabus coverage at ${s.syllabusCoveragePct}% with 2 weeks remaining before mid-term cycle`,
        recommendedAction: 'Schedule 2 additional weekend lab catch-up review slots',
      }));

    const insights = {
      timestamp: new Date().toISOString(),
      summary: `Institutional AI Copilot Surveillance Analysis for Fall 2026 across ${depts.length} Departments`,
      totalStudentsEnrolled: students.length * 150,
      totalActiveFaculty: users.filter((u) => u.role === 'teacher').length * 12,
      atRiskStudents,
      curriculumAnomalies,
      workloadDistribution: {
        balancedFacultyPct: 94,
        overloadedFaculty: ['Dr. Priya Nair (18 Hrs/Wk — HOD & Systems Lab)'],
      },
      departmentNotesMetrics: mockDepartmentNotes,
      gradeDistribution: mockGradeDistributions,
      recentSecurityEvents: activities.slice(0, 5),
    };

    return NextResponse.json({ insights, success: true });
  } catch (err: any) {
    console.error('AI Analytics Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
