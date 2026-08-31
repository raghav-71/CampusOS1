import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { Assignment, UserProfile } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const semester = searchParams.get('semester') ? parseInt(searchParams.get('semester')!, 10) : undefined;
    const status = searchParams.get('status') || undefined;
    const teacherName = searchParams.get('teacherName') || undefined;
    const studentSemester = searchParams.get('studentSemester') ? parseInt(searchParams.get('studentSemester')!, 10) : undefined;
    const studentId = searchParams.get('studentId') || undefined;
    const userRole = searchParams.get('role') || undefined;

    const userProfile: Partial<UserProfile> | undefined = userRole === 'student' || studentSemester
      ? {
          role: 'student',
          id: studentId || 'usr-001',
          semesterNumber: (studentSemester || 5) as any,
        }
      : undefined;

    const assignments = await campusRepository.getAssignments(
      {
        subject,
        semester: semester || studentSemester,
        status,
        teacherName,
      },
      userProfile
    );

    return NextResponse.json({ assignments, total: assignments.length, success: true });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.subject) {
      return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 });
    }

    const semNum = (parseInt(String(body.semesterNumber || body.semester || '5').replace(/\D/g, '')) || 5) as 1 | 2 | 3 | 4 | 5 | 6;
    
    const facultyProfile: Partial<UserProfile> | undefined = body.facultyProfile || {
      role: 'teacher',
      id: body.teacherId || 'usr-faculty-001',
      fullName: body.teacher || 'Dr. Priya Nair',
      email: body.teacherEmail || 'faculty@campusos.demo',
    };

    const newAssignment = await campusRepository.createAssignment(
      {
        title: body.title,
        subject: body.subject,
        subjectId: body.subjectId,
        subjectCode: body.subjectCode,
        department: 'BCA',
        semester: body.semester || `Semester ${semNum}`,
        semesterNumber: semNum,
        teacher: body.teacher || facultyProfile?.fullName || 'Dr. Priya Nair',
        teacherId: body.teacherId || facultyProfile?.id || 'usr-faculty-001',
        dueDate: body.dueDate || 'Sep 15, 2026',
        dueTime: body.dueTime || '11:59 PM',
        maxScore: Number(body.maxScore) || 50,
        description: body.description || '',
        status: body.status || 'active',
        allowLateSubmissions: body.allowLateSubmissions !== false,
        fileName: body.fileName,
        fileSize: body.fileSize,
        fileUrl: body.fileUrl,
        fileData: body.fileData,
        extractedText: body.extractedText,
        attachments: body.attachments || [],
      },
      facultyProfile
    );

    return NextResponse.json({ assignment: newAssignment, success: true }, { status: 201 });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates, facultyProfile } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates are required' }, { status: 400 });
    }

    const updated = await campusRepository.updateAssignment(id, updates, facultyProfile);
    if (!updated) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ assignment: updated, success: true });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const success = await campusRepository.deleteAssignment(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    const statusCode = err.status || 500;
    return NextResponse.json({ error: err.message }, { status: statusCode });
  }
}
