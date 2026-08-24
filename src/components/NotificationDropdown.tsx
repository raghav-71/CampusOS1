'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockAnnouncements } from '@/repositories/mockData';
import { Announcement } from '@/types/campus';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

const priorityStyles = {
  high: { badge: 'badge-danger', dot: 'bg-danger' },
  medium: { badge: 'badge-warning', dot: 'bg-warning' },
  low: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

export default function NotificationDropdown({
  isOpen,
  onClose,
  onViewAll,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Announcement[]>(mockAnnouncements);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleItemClick = (notice: Announcement) => {
    setNotifications((prev) => prev.map((n) => (n.id === notice.id ? { ...n, read: true } : n)));
    setSelectedNotice(notice);
  };

  return (
    <>
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 glass-card rounded-2xl border border-border/80 shadow-2xl p-4 animate-fade-in-up">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-700 text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <span className="badge-danger text-[10px] px-1.5 py-0.2 rounded-full font-700">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-500 cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {notifications.map((item) => {
            const config = priorityStyles[item.priority];
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  !item.read
                    ? 'border-border bg-muted/40 hover:border-primary/40'
                    : 'border-transparent bg-muted/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {!item.read && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
                    <span className="text-xs font-600 text-foreground">{item.title}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.body}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">— {item.author}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onViewAll) onViewAll();
            }}
            className="text-xs text-primary hover:underline font-600 w-full text-center py-1 cursor-pointer"
          >
            View All Announcements →
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedNotice(null)}
          />
          <div className="relative glass-card rounded-2xl p-6 border border-border max-w-md w-full animate-fade-in-up">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-600 ${priorityStyles[selectedNotice.priority].badge}`}
              >
                {selectedNotice.category} · {selectedNotice.priority.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">{selectedNotice.time}</span>
            </div>
            <h3 className="text-base font-700 text-foreground mb-2">{selectedNotice.title}</h3>
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">{selectedNotice.body}</p>
            <p className="text-xs text-muted-foreground mb-6">Posted by: {selectedNotice.author}</p>
            <button onClick={() => setSelectedNotice(null)} className="btn-primary w-full py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
