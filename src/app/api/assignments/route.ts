import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { Assignment } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;

    const assignments = await campusRepository.getAssignments(subject);
    return NextResponse.json({ assignments, total: assignments.length });
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
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: body.title,
      subject: body.subject,
      department: 'BCA',
      semester: body.semester || 'Sem 5',
      semesterNumber: semNum,
      teacher: body.teacher || 'Dr. Priya Nair',
      dueDate: body.dueDate || 'Aug 30, 2026',
      totalSubmissions: 0,
      gradedSubmissions: 0,
      maxScore: body.maxScore || 20,
      description: body.description || '',
      status: 'active',
    };

    const saved = await campusRepository.createAssignment(newAssignment);
    return NextResponse.json({ assignment: saved, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
