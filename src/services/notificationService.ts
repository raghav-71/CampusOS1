import { Announcement, NotificationType, UserProfile } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';

export type NotificationListener = (notifications: Announcement[]) => void;

interface SubscribedListener {
  id: string;
  callback: NotificationListener;
  profile?: Partial<UserProfile> | null;
}

class NotificationService {
  private listeners: SubscribedListener[] = [];

  /**
   * Subscribe to real-time notification changes.
   * If profile is provided, notifications will be strictly scoped to user's semester/role.
   */
  subscribe(listener: NotificationListener, profile?: Partial<UserProfile> | null): () => void {
    const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: SubscribedListener = {
      id: subId,
      callback: listener,
      profile: profile || null,
    };
    this.listeners.push(entry);

    // Initial dispatch with scoping
    this.getScopedList(profile).then((notifs) => {
      try {
        listener(notifs);
      } catch (err) {
        console.error('Error on initial notification dispatch:', err);
      }
    });

    return () => {
      this.listeners = this.listeners.filter((l) => l.id !== subId);
    };
  }

  private async getScopedList(profile?: Partial<UserProfile> | null): Promise<Announcement[]> {
    if (profile) {
      return campusRepository.getAnnouncements(
        profile.role,
        profile.id,
        profile.semesterNumber,
        profile
      );
    }
    return campusRepository.getAnnouncements();
  }

  private async dispatchAll() {
    for (const sub of this.listeners) {
      try {
        const list = await this.getScopedList(sub.profile);
        sub.callback(list);
      } catch (err) {
        console.error('Error dispatching notifications to subscriber:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const allNotifs = await campusRepository.getAnnouncements();
      window.dispatchEvent(
        new CustomEvent('campusos:notifications-updated', { detail: allNotifs })
      );
    }
  }

  async sendNotification(announcement: Announcement, facultyProfile?: Partial<UserProfile>) {
    const created = await campusRepository.createAnnouncement(announcement, facultyProfile);
    await this.dispatchAll();
    return created;
  }

  async deleteNotification(notificationId: string, userProfile?: Partial<UserProfile>) {
    const success = await campusRepository.deleteAnnouncement(notificationId, userProfile);
    await this.dispatchAll();
    return success;
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

  async markAsRead(notificationId: string, userId?: string) {
    await campusRepository.markNotificationRead(notificationId, userId);
    await this.dispatchAll();
  }

  async markAsUnread(notificationId: string, userId?: string) {
    await campusRepository.markNotificationUnread(notificationId, userId);
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
    category: Announcement['category'] = 'General',
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
