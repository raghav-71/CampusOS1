'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import { useProfile } from '@/hooks/useProfile';
import { Announcement, AnnouncementCategory } from '@/types/campus';
import {
  Check,
  CheckCheck,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Filter,
  X,
  Megaphone,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

const categoryPills: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'Notes', label: 'Notes & Docs' },
  { key: 'Assignment', label: 'Assignments' },
  { key: 'Exam', label: 'Exams' },
  { key: 'General', label: 'General' },
];

const priorityStyles = {
  high: { badge: 'badge-danger', dot: 'bg-rose-500' },
  medium: { badge: 'badge-warning', dot: 'bg-amber-500' },
  low: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

const categoryBadgeMap: Record<string, { badge: string; icon: string }> = {
  General: { badge: 'badge-blue', icon: '📢' },
  Important: { badge: 'badge-danger', icon: '🚨' },
  Exam: { badge: 'badge-purple', icon: '📝' },
  Assignment: { badge: 'badge-warning', icon: '📋' },
  Notes: { badge: 'badge-cyan', icon: '📚' },
  Event: { badge: 'badge-green', icon: '🎪' },
  Academic: { badge: 'badge-blue', icon: '🎓' },
  Emergency: { badge: 'badge-danger', icon: '⚡' },
  Class: { badge: 'badge-cyan', icon: '🕒' },
};

export default function NotificationDropdown({
  isOpen,
  onClose,
  onViewAll,
}: NotificationDropdownProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
    }, profile || undefined);

    return () => unsubscribe();
  }, [profile]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    const userId = profile?.id || undefined;
    await notificationService.markAllAsRead(userId);
    toast.success('All notifications marked as read');
  };

  const handleToggleRead = async (e: React.MouseEvent, notice: Announcement) => {
    e.stopPropagation();
    const userId = profile?.id || undefined;
    if (notice.read) {
      await notificationService.markAsUnread(notice.id, userId);
      toast.info('Marked as unread');
    } else {
      await notificationService.markAsRead(notice.id, userId);
      toast.success('Marked as read');
    }
  };

  const handleResourceNavigation = (notice: Announcement) => {
    const userRole = profile?.role || 'student';
    const basePath = userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

    // Mark as read immediately on click
    if (!notice.read) {
      notificationService.markAsRead(notice.id, profile?.id || undefined);
    }

    onClose();

    if (notice.relatedEntity === 'note' || notice.type === 'DOCUMENT' || notice.category === 'Notes') {
      router.push(`${basePath}?tab=notes&resourceId=${notice.relatedEntityId || notice.id}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('campusos:open-document', {
            detail: { id: notice.relatedEntityId || notice.id, title: notice.title },
          })
        );
      }
    } else if (notice.relatedEntity === 'assignment' || notice.type === 'ASSIGNMENT' || notice.category === 'Assignment') {
      router.push(`${basePath}?tab=assignments&assignmentId=${notice.relatedEntityId || notice.id}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('campusos:open-assignment', {
            detail: { id: notice.relatedEntityId || notice.id, title: notice.title },
          })
        );
      }
    } else if (notice.relatedEntity === 'exam' || notice.type === 'EXAM' || notice.category === 'Exam') {
      router.push(`${basePath}?tab=exams`);
    } else if (notice.relatedEntity === 'class' || notice.type === 'CLASS_STARTED') {
      router.push(`${basePath}?tab=timetable`);
    } else {
      // General announcement -> Open modal
      setSelectedNotice(notice);
    }
  };

  const handleItemClick = (notice: Announcement) => {
    if (!notice.read) {
      notificationService.markAsRead(notice.id, profile?.id || undefined);
    }

    if (notice.relatedEntity && notice.relatedEntity !== 'announcement') {
      handleResourceNavigation(notice);
    } else {
      setSelectedNotice(notice);
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread' && item.read) return false;
    if (activeFilter !== 'all' && activeFilter !== 'unread') {
      if (item.category !== activeFilter && item.type !== activeFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBody = item.body.toLowerCase().includes(q);
      const matchSub = item.subject?.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchSub && !matchAuthor) return false;
    }
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Card */}
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-[420px] max-w-[95vw] bg-white rounded-[20px] border border-black/[0.08] shadow-modal p-4 animate-fade-in-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#1D1D1F] tracking-tight flex items-center gap-1.5">
              <span>Notifications</span>
            </h4>
            {unreadCount > 0 && (
              <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-dark font-medium cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-[#8E8E93] hover:text-[#1D1D1F] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="pt-2.5 pb-2 space-y-2 border-b border-black/[0.06]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/[0.03] border border-transparent text-[#1D1D1F] placeholder:text-[#8E8E93] focus:outline-none focus:bg-white focus:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1D1D1F]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {categoryPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setActiveFilter(pill.key)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === pill.key
                    ? 'bg-[#1D1D1F] text-white shadow-subtle'
                    : 'bg-black/[0.04] text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 no-scrollbar min-h-[140px] max-h-[380px]">
          {filteredNotifications.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-black/[0.04] text-[#8E8E93] flex items-center justify-center mx-auto text-sm">
                🔔
              </div>
              <p className="text-xs text-[#8E8E93] font-medium">
                {searchQuery || activeFilter !== 'all'
                  ? 'No notifications match your filter'
                  : 'You are all caught up.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const catConfig = categoryBadgeMap[item.category] || { badge: 'badge-cyan', icon: '📢' };
              const isClassLive = item.type === 'CLASS_STARTED';

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-[14px] border transition-all cursor-pointer relative group ${
                    !item.read
                      ? 'border-[#DCFCE7] bg-[#F0FDF4] hover:border-primary/40'
                      : 'border-black/[0.04] bg-white hover:bg-black/[0.015]'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-white/80 border border-black/[0.06] text-[#6E6E73]">
                        {item.category}
                      </span>
                      {item.subject && (
                        <span className="text-[10.5px] text-[#15803D] font-medium truncate max-w-[140px]">
                          {item.subject}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-[#8E8E93] font-mono-data flex-shrink-0">
                      {item.time}
                    </span>
                  </div>

                  {/* Title & Body */}
                  <h5 className="text-xs font-semibold text-[#1D1D1F] mb-0.5 leading-snug line-clamp-2 break-words">
                    {isClassLive && <span className="text-primary font-bold mr-1">● LIVE:</span>}
                    {item.title}
                  </h5>

                  <p className="text-[11px] text-[#6E6E73] line-clamp-2 leading-relaxed break-words">
                    {item.body}
                  </p>

                  {/* Attachment Badge if present */}
                  {item.fileName && (
                    <div className="mt-2 p-1.5 rounded-lg bg-card/60 border border-border/60 flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3 h-3 text-accent flex-shrink-0" />
                        <span className="font-600 text-foreground truncate">{item.fileName}</span>
                      </div>
                      {item.fileSize && (
                        <span className="text-muted-foreground font-mono-data flex-shrink-0">
                          {item.fileSize}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer metadata & quick action buttons */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground truncate">
                      — {item.author}
                    </span>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Deep Link Button if entity exists */}
                      {item.relatedEntity && item.relatedEntity !== 'announcement' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResourceNavigation(item);
                          }}
                          className="px-2 py-0.5 rounded-md bg-primary/20 hover:bg-primary text-primary hover:text-white text-[10px] font-700 transition-all flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {item.relatedEntity === 'note'
                            ? 'Open Note'
                            : item.relatedEntity === 'assignment'
                              ? 'Open Assignment'
                              : item.relatedEntity === 'exam'
                                ? 'View Exam'
                                : 'Open Class'}
                        </button>
                      )}

                      {/* Read / Unread toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleRead(e, item)}
                        className={`p-1 rounded-md transition-colors ${
                          item.read
                            ? 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                            : 'text-primary hover:bg-primary/20'
                        }`}
                        title={item.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-border/60 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onViewAll) {
                onViewAll();
              } else {
                const userRole = profile?.role || 'student';
                const basePath = userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
                router.push(`${basePath}?tab=announcements`);
              }
            }}
            className="text-xs text-primary hover:underline font-800 w-full text-center py-1 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>View All Announcements & Circulars Feed</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedNotice(null)}
          />
          <div className="relative glass-card rounded-3xl p-6 border border-primary/40 max-w-lg w-full animate-modal-pop shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-lg font-700 ${
                    categoryBadgeMap[selectedNotice.category]?.badge || 'badge-cyan'
                  }`}
                >
                  {categoryBadgeMap[selectedNotice.category]?.icon} {selectedNotice.category}
                </span>
                {selectedNotice.subject && (
                  <span className="text-xs font-700 text-primary">{selectedNotice.subject}</span>
                )}
                {selectedNotice.targetSemester && (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-card/80 border border-border/80 font-mono-data font-700">
                    Sem {selectedNotice.targetSemester}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono-data">
                {selectedNotice.time}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-800 text-foreground mb-2 leading-snug break-words">
                {selectedNotice.title}
              </h3>
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-y-auto no-scrollbar">
                {selectedNotice.body}
              </div>
            </div>

            {/* Attached File Download */}
            {selectedNotice.fileName && (
              <div className="p-3 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-700 text-foreground truncate break-all">
                      {selectedNotice.fileName}
                    </p>
                    {selectedNotice.fileSize && (
                      <p className="text-[10px] font-mono-data text-muted-foreground">
                        {selectedNotice.fileSize}
                      </p>
                    )}
                  </div>
                </div>

                {(selectedNotice.fileUrl || selectedNotice.fileData) && (
                  <a
                    href={selectedNotice.fileUrl || selectedNotice.fileData}
                    download={selectedNotice.fileName}
                    className="btn-primary text-xs px-3 py-1.5 rounded-xl font-700 flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Posted by: <strong className="text-foreground">{selectedNotice.author}</strong></span>
              <div className="flex items-center gap-2">
                {selectedNotice.relatedEntity && selectedNotice.relatedEntity !== 'announcement' && (
                  <button
                    onClick={() => {
                      const notice = selectedNotice;
                      setSelectedNotice(null);
                      handleResourceNavigation(notice);
                    }}
                    className="btn-primary px-3 py-1.5 rounded-xl text-xs font-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Go to Resource
                  </button>
                )}
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-card/80 text-xs font-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
