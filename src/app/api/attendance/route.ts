import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { AttendanceRecord } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const date = searchParams.get('date') || undefined;

    const records = await campusRepository.getAttendance(subject, date);
    return NextResponse.json({ records, total: records.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const records: AttendanceRecord[] = body.records || [body];

    const saved = await campusRepository.recordAttendance(records);
    return NextResponse.json({ savedCount: saved.length, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
