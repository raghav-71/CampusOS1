import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { Announcement, BcaSemester, Role } from '@/types/campus';
import { AuthorizationService } from '@/services/authorizationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') as Role) || undefined;
    const userId = searchParams.get('userId') || undefined;
    const userSem = searchParams.get('userSemester') || searchParams.get('semesterNumber') || searchParams.get('semester');
    const semNum = userSem ? (parseInt(String(userSem).replace(/\D/g, '')) as BcaSemester) : undefined;
    const subject = searchParams.get('subject') || undefined;

    let userProfile: any = undefined;
    if (role) {
      userProfile = {
        id: userId,
        role,
        semesterNumber: semNum,
      };
    }

    let announcements = await campusRepository.getAnnouncements(role, userId, semNum, userProfile);

    if (subject && subject !== 'all') {
      const sub = subject.toLowerCase();
      announcements = announcements.filter(
        (a) =>
          !a.subject ||
          a.subject.toLowerCase().includes(sub) ||
          a.subjectCode?.toLowerCase() === sub ||
          a.subjectId?.toLowerCase() === sub
      );
    }

    return NextResponse.json({ announcements, total: announcements.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.body) {
      return NextResponse.json({ error: 'Title and announcement description are required.' }, { status: 400 });
    }

    const semRaw = body.targetSemester || body.semesterNumber || body.semester;
    const semNum = semRaw
      ? ((parseInt(String(semRaw).replace(/\D/g, '')) || 5) as BcaSemester)
      : undefined;

    const facultyEmail = body.facultyEmail || body.authorEmail || body.email || 'faculty@campusos.demo';
    const facultyId = body.facultyId || body.authorId || 'usr-faculty-001';
    const facultyRole: Role = body.role || 'teacher';

    // Strict Authorization check for faculty
    if (facultyRole === 'teacher') {
      const validation = AuthorizationService.validateFacultyAnnouncement(
        { id: facultyId, email: facultyEmail, role: 'teacher', fullName: body.author },
        {
          subjectCode: body.subjectCode || body.subjectId || body.subject,
          subjectId: body.subjectId,
          subject: body.subject,
          targetSemester: semNum,
          semesterNumber: semNum,
        }
      );

      if (!validation.allowed) {
        return NextResponse.json({ error: validation.error, status: 403 }, { status: 403 });
      }
    }

    const newAnnouncement: Announcement = {
      id: body.id || `ann-${Date.now()}`,
      title: body.title,
      body: body.body,
      priority: body.priority || 'medium',
      category: body.category || 'General',
      type: body.type || 'ANNOUNCEMENT',
      time: 'Just now',
      createdAt: new Date().toISOString(),
      publishAt: body.publishAt,
      expiresAt: body.expiresAt,
      author: body.author || 'Dr. Priya Nair',
      authorId: facultyId,
      read: false,
      targetRole: body.targetRole || 'all',
      targetSemester: semNum,
      semesterNumber: semNum,
      targetSection: body.targetSection || 'all',
      targetDepartment: body.targetDepartment || 'BCA',
      subject: body.subject,
      subjectCode: body.subjectCode,
      subjectId: body.subjectId,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileData: body.fileData,
      fileSize: body.fileSize,
      fileType: body.fileType,
      isImportant: Boolean(body.isImportant || body.priority === 'high'),
      relatedEntity: body.relatedEntity || 'announcement',
      relatedEntityId: body.relatedEntityId,
    };

    const saved = await campusRepository.createAnnouncement(newAnnouncement, {
      id: facultyId,
      email: facultyEmail,
      role: facultyRole,
    });

    return NextResponse.json({ announcement: saved, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;
    const role = (searchParams.get('role') as Role) || 'teacher';

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const success = await campusRepository.deleteAnnouncement(id, { id: userId, role });
    if (!success) {
      return NextResponse.json({ error: 'Announcement not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Announcement removed.' });
  } catch (err: any) {
    const status = (err as any).status || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
