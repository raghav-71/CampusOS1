import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId') || undefined;

    const submissions = await campusRepository.getSubmissions(assignmentId);
    return NextResponse.json({ submissions, total: submissions.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, score, feedback } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: 'submissionId and score are required' }, { status: 400 });
    }

    const updated = await campusRepository.gradeSubmission(submissionId, score, feedback);
    if (!updated) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: updated, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
