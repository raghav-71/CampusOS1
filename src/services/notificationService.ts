import { Announcement, NotificationType } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';

export type NotificationListener = (notifications: Announcement[]) => void;

class NotificationService {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    // Initial dispatch
    campusRepository.getAnnouncements().then((notifs) => {
      try {
        listener(notifs);
      } catch (err) {
        console.error('Error on initial notification dispatch:', err);
      }
    });

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async dispatchAll() {
    const list = await campusRepository.getAnnouncements();
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.error('Error dispatching notifications:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campusos:notifications-updated', { detail: list }));
    }
  }

  async sendNotification(announcement: Announcement) {
    await campusRepository.createAnnouncement(announcement);
    await this.dispatchAll();
  }

  async triggerClassStart(
    teacherId: string,
    teacherName: string,
    subject: string,
    semesterNumber: number,
    section: string,
    room: string
  ): Promise<{ notification: Announcement }> {
    const res = await campusRepository.startClassSession(
      teacherId,
      subject,
      semesterNumber,
      section,
      room
    );

    await this.dispatchAll();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('campusos:class-started', {
          detail: {
            teacherName,
            subject,
            semesterNumber,
            section,
            room,
            notification: res.notification,
            classSlot: res.classSlot,
          },
        })
      );
    }

    return { notification: res.notification };
  }

  async markAsRead(notificationId: string) {
    await campusRepository.markNotificationRead(notificationId);
    await this.dispatchAll();
  }

  async markAllAsRead(userId?: string) {
    await campusRepository.markAllNotificationsRead(userId);
    await this.dispatchAll();
  }

  sendQuickAlert(
    title: string,
    body: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    category: 'General' | 'Exam' | 'Event' | 'Academic' | 'Emergency' | 'Class' = 'General',
    type: NotificationType = 'ANNOUNCEMENT'
  ) {
    const notice: Announcement = {
      id: `notif-${Date.now()}`,
      title,
      body,
      priority,
      category,
      type,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      author: 'Campus System',
      read: false,
      targetDepartment: 'BCA',
    };
    this.sendNotification(notice);
  }
}

export const notificationService = new NotificationService();
