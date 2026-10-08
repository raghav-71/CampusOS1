import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { campusRepository } from '@/repositories/campusRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAll, markUnread } = body;

    if (markAll) {
      await campusRepository.markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }

    if (markUnread) {
      await campusRepository.markNotificationUnread(notificationId, userId);
      return NextResponse.json({ success: true, message: 'Notification marked as unread' });
    }

    await campusRepository.markNotificationRead(notificationId, userId);
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
