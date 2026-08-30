import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { AuthorizationService } from '@/services/authorizationService';
import { UserProfile } from '@/types/campus';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const userRole = (searchParams.get('role') || 'student') as UserProfile['role'];
    const userSemester = searchParams.get('semester') ? parseInt(searchParams.get('semester')!) : 5;
    const userEmail = searchParams.get('email') || 'student5@campusos.demo';
    const userId = searchParams.get('userId') || 'usr-001';

    const userProfile: Partial<UserProfile> = {
      id: userId,
      email: userEmail,
      role: userRole,
      semesterNumber: userSemester as any,
    };

    const doc = await campusRepository.getDocumentById(id, userProfile);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document: doc, success: true });
  } catch (err: any) {
    const status = err.status || 403;
    return NextResponse.json({ error: err.message || 'Access Denied' }, { status });
  }
}
