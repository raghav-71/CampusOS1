import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
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

    const download = await campusRepository.downloadDocument(id, userProfile);

    if (download.fileData && download.fileData.startsWith('data:')) {
      const parts = download.fileData.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : (download.contentType || 'application/pdf');
      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${download.fileName}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    return new NextResponse(download.content, {
      status: 200,
      headers: {
        'Content-Type': download.contentType || 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${download.fileName}"`,
      },
    });
  } catch (err: any) {
    const status = err.status || 403;
    return NextResponse.json({ error: err.message || 'Access Denied to download this document' }, { status });
  }
}
