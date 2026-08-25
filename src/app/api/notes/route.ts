import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { NoteDocument } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const query = searchParams.get('q') || undefined;

    const notes = await campusRepository.getNotes(subject, query);
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

    const semNum = (parseInt(String(body.semester || '5').replace(/\D/g, '')) || 5) as 1 | 2 | 3 | 4 | 5 | 6;
    const newNote: NoteDocument = {
      id: `note-${Date.now()}`,
      title: body.title,
      subject: body.subject,
      semester: body.semester || 'Sem 5',
      semesterNumber: semNum,
      department: 'BCA',
      teacher: body.teacher || 'Dr. Priya Nair',
      tags: body.tags || [],
      uploadedAt: 'Just now',
      downloads: 0,
      pages: body.pages || 20,
      size: body.size || '3.0 MB',
      fileSize: body.size || '3.0 MB',
      isNew: true,
      rating: 5.0,
      views: 1,
    };

    const saved = await campusRepository.saveNote(newNote);
    return NextResponse.json({ note: saved, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
