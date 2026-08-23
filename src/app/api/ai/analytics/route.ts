import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const insights = {
      timestamp: new Date().toISOString(),
      summary: 'Institutional AI Copilot Analysis for Fall 2026',
      atRiskStudents: [
        {
          id: 'usr-008',
          name: 'Karthik Nambiar',
          rollNumber: 'MCA2612',
          department: 'MCA Sem 1',
          attendancePct: 62.4,
          reason: 'Severe attendance deficiency below 75% cutoff threshold in 3 subjects',
          recommendedAction: 'Issue Academic Warning Letter & Parent-Teacher Counseling',
        },
        {
          id: 'usr-004',
          name: 'Rohit Verma',
          rollNumber: 'BBA2415',
          department: 'BBA Sem 4',
          attendancePct: 68.0,
          reason: 'Absence during mid-term test cycle & 2 missed assignments',
          recommendedAction: 'Schedule remedial evaluation with Dr. Ramesh Gupta',
        },
      ],
      curriculumAnomalies: [
        {
          subject: 'DBMS (CS502)',
          department: 'BCA Sem 5',
          issue: 'Syllabus coverage at 55% with 2 weeks remaining before mid-term',
          recommendedAction: 'Schedule 2 additional weekend lab catch-up slots',
        },
      ],
      workloadDistribution: {
        balancedFacultyPct: 92,
        overloadedFaculty: ['Dr. Priya Nair (18 Hrs/Wk — HOD + Research Guide)'],
      },
    };

    return NextResponse.json({ insights, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
