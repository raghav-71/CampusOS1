import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { UserProfile } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;
    const userRole = searchParams.get('role') || undefined;
    const currentUserId = searchParams.get('currentUserId') || undefined;

    const userProfile: Partial<UserProfile> | undefined = userRole === 'student'
      ? {
          role: 'student',
          id: currentUserId || studentId || 'usr-001',
        }
      : undefined;

    const submissions = await campusRepository.getSubmissions(
      { assignmentId, studentId },
      userProfile
    );

    return NextResponse.json({ submissions, total: submissions.length, success: true });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}

// Student submission endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, studentId, studentName, studentEmail, rollNumber, textAnswer, file, fileName, fileSize, fileUrl, fileData, extractedText, studentProfile } = body;

    if (!assignmentId || !studentId) {
      return NextResponse.json({ error: 'assignmentId and studentId are required' }, { status: 400 });
    }

    const effectiveProfile: Partial<UserProfile> = studentProfile || {
      role: 'student',
      id: studentId,
      fullName: studentName,
      email: studentEmail,
      semesterNumber: body.semesterNumber || 5,
    };

    const submission = await campusRepository.submitAssignment(
      {
        assignmentId,
        assignmentTitle: body.assignmentTitle || 'Assignment',
        studentId,
        studentName: studentName || 'Student',
        studentEmail: studentEmail || 'student@campusos.demo',
        rollNumber: rollNumber || 'BCA2401',
        subject: body.subject || 'Course Subject',
        subjectCode: body.subjectCode,
        semesterNumber: body.semesterNumber || 5,
        maxScore: body.maxScore || 50,
        textAnswer,
        fileName: fileName || file?.name,
        fileSize: fileSize || file?.size,
        fileUrl: fileUrl || file?.url,
        fileData: fileData || file?.dataUrl,
        extractedText: extractedText || file?.extractedText,
      },
      effectiveProfile
    );

    return NextResponse.json({ submission, success: true }, { status: 201 });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}

// Faculty grading endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, score, feedback, facultyProfile } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: 'submissionId and score are required' }, { status: 400 });
    }

    const updated = await campusRepository.gradeSubmission(
      submissionId,
      Number(score),
      feedback,
      facultyProfile
    );
    if (!updated) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: updated, success: true });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}
