'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
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
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleItemClick = async (notice: Announcement) => {
    if (!notice.read) {
      await notificationService.markAsRead(notice.id);
    }
    setSelectedNotice(notice);
  };

  return (
    <>
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 glass-card rounded-3xl border border-primary/40 shadow-2xl p-4 animate-fade-in-up">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-800 text-foreground tracking-tight">Notifications</h4>
            {unreadCount > 0 && (
              <span className="badge-danger text-[10px] px-2 py-0.5 rounded-full font-700 animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-600 cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((item) => {
              const config = priorityStyles[item.priority] || priorityStyles.medium;
              const isClassLive = item.type === 'CLASS_STARTED';

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    !item.read
                      ? isClassLive
                        ? 'border-accent/60 bg-accent/10 shadow-glow'
                        : 'border-primary/40 bg-primary/10 hover:border-primary'
                      : 'border-border/40 bg-card/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      {!item.read && (
                        <span
                          className={`w-2 h-2 rounded-full ${isClassLive ? 'bg-accent animate-ping' : config.dot}`}
                        />
                      )}
                      <span className="text-xs font-700 text-foreground flex items-center gap-1">
                        {isClassLive && <span className="text-accent">🔴 LIVE:</span>}
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono-data flex-shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-500">
                    — {item.author}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onViewAll) onViewAll();
            }}
            className="text-xs text-primary hover:underline font-700 w-full text-center py-1 cursor-pointer"
          >
            View All Announcements & Circulars →
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedNotice(null)}
          />
          <div className="relative glass-card rounded-3xl p-6 border border-primary/40 max-w-md w-full animate-fade-in-up shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-lg font-700 ${priorityStyles[selectedNotice.priority]?.badge || 'badge-cyan'}`}
              >
                {selectedNotice.category} · {selectedNotice.priority.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground font-mono-data">
                {selectedNotice.time}
              </span>
            </div>
            <h3 className="text-base font-800 text-foreground mb-2">{selectedNotice.title}</h3>
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">{selectedNotice.body}</p>
            <p className="text-xs text-muted-foreground mb-6">Posted by: {selectedNotice.author}</p>
            <button
              onClick={() => setSelectedNotice(null)}
              className="btn-primary w-full py-2.5 rounded-xl font-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
