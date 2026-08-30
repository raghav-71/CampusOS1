import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { NoteDocument } from '@/types/campus';
import { AuthorizationService } from '@/services/authorizationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const query = searchParams.get('q') || undefined;
    const semParam = searchParams.get('semester');
    const userRole = searchParams.get('role') || 'student';
    const userSem = searchParams.get('userSemester') ? parseInt(searchParams.get('userSemester')!) : undefined;

    const effectiveSemester = userRole === 'student' && userSem ? userSem : semParam ? parseInt(semParam) : undefined;

    const notes = await campusRepository.getNotes(subject, query, effectiveSemester);
    return NextResponse.json({ notes, total: notes.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.subject) {
      return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 });
    }

    const semNum = (parseInt(String(body.semester || body.semesterNumber || '5').replace(/\D/g, '')) || 5) as 1 | 2 | 3 | 4 | 5 | 6;
    const facultyEmail = body.facultyEmail || body.teacherEmail || 'faculty@campusos.demo';
    const facultyId = body.facultyId || body.teacherId || 'usr-faculty-001';

    // Strict Authorization check
    const validation = AuthorizationService.validateFacultyUpload(
      { id: facultyId, email: facultyEmail, role: 'teacher' },
      {
        subjectCode: body.subjectCode || body.subjectId || body.subject,
        subject: body.subject,
        semesterNumber: semNum,
      }
    );

    if (!validation.allowed) {
      return NextResponse.json({ error: validation.error, status: 403 }, { status: 403 });
    }

    const saved = await campusRepository.uploadNote(
      {
        title: body.title,
        description: body.description || `Lecture notes on ${body.title}`,
        subject: body.subject,
        subjectId: body.subjectId || 'sub-cs501',
        subjectCode: body.subjectCode || 'CS501',
        semester: `Semester ${semNum}`,
        semesterNumber: semNum,
        targetSemester: semNum,
        department: 'BCA',
        teacher: body.teacher || 'Dr. Priya Nair',
        teacherId: facultyId,
        tags: body.tags || [],
        pages: body.pages || 20,
        size: body.size || body.fileSize || '3.0 MB',
        fileSize: body.size || body.fileSize || '3.0 MB',
        fileName: body.fileName || `${body.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        fileType: body.fileType || 'pdf',
        fileUrl: body.fileUrl,
        fileData: body.fileData || body.fileUrl,
        extractedText: body.extractedText || `Lecture notes on ${body.title} for ${body.subject}.`,
        category: body.category || 'notes',
        status: body.status || 'published',
        rating: 5.0,
        views: 1,
      },
      { id: facultyId, email: facultyEmail, role: 'teacher' }
    );
    return NextResponse.json({ note: saved, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
