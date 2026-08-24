import { Announcement } from '@/types/campus';

export type NotificationListener = (notification: Announcement) => void;

class NotificationService {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(announcement: Announcement) {
    this.listeners.forEach((listener) => {
      try {
        listener(announcement);
      } catch (err) {
        console.error('Error dispatching notification:', err);
      }
    });
  }

  sendQuickAlert(
    title: string,
    body: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    category: 'General' | 'Exam' | 'Event' | 'Academic' | 'Emergency' = 'General'
  ) {
    const notice: Announcement = {
      id: `notif-${Date.now()}`,
      title,
      body,
      priority,
      category,
      time: 'Just now',
      author: 'Campus System',
      read: false,
    };
    this.notify(notice);
  }
}

export const notificationService = new NotificationService();
