import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';
import { Announcement } from '@/types/campus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') as any) || undefined;
    const userId = searchParams.get('userId') || undefined;
    const announcements = await campusRepository.getAnnouncements(role, userId);
    return NextResponse.json({ announcements, total: announcements.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: body.title,
      body: body.body,
      priority: body.priority || 'medium',
      category: body.category || 'General',
      time: 'Just now',
      author: body.author || 'Admin Office',
      read: false,
    };

    const saved = await campusRepository.createAnnouncement(newAnnouncement);
    return NextResponse.json({ announcement: saved, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
