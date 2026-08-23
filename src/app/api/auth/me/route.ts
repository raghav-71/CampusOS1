import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';

export async function GET(request: NextRequest) {
  try {
    const sessionEmail = request.cookies.get('campusos_email')?.value || 'arjun.sharma@campusos.edu';
    const profile = await campusRepository.getUserByEmail(sessionEmail);

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: profile, authenticated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
