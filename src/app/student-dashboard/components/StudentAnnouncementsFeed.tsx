'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import { useProfile } from '@/hooks/useProfile';
import { Announcement, AnnouncementCategory } from '@/types/campus';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Megaphone,
  Search,
  Filter,
  Check,
  CheckCheck,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  X,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

const categoryConfig: Record<
  string,
  { label: string; badge: string; icon: string; border: string }
> = {
  General: { label: 'General', badge: 'badge-blue', icon: '📢', border: 'border-blue-500/30' },
  Important: { label: 'Important', badge: 'badge-danger', icon: '🚨', border: 'border-rose-500/40' },
  Exam: { label: 'Exam / Test', badge: 'badge-purple', icon: '📝', border: 'border-purple-500/30' },
  Assignment: { label: 'Assignment', badge: 'badge-warning', icon: '📋', border: 'border-amber-500/30' },
  Notes: { label: 'Notes & Docs', badge: 'badge-cyan', icon: '📚', border: 'border-cyan-500/30' },
  Event: { label: 'Campus Event', badge: 'badge-green', icon: '🎪', border: 'border-emerald-500/30' },
  Academic: { label: 'Academic', badge: 'badge-blue', icon: '🎓', border: 'border-indigo-500/30' },
  Emergency: { label: 'Urgent Alert', badge: 'badge-danger', icon: '⚡', border: 'border-rose-600/50' },
  Class: { label: 'Live Lecture', badge: 'badge-cyan', icon: '🕒', border: 'border-cyan-500/30' },
};

const priorityStyles = {
  high: { badge: 'badge-danger', label: 'Urgent', dot: 'bg-rose-500' },
  medium: { badge: 'badge-warning', label: 'Important', dot: 'bg-amber-500' },
  low: { badge: 'badge-muted', label: 'Info', dot: 'bg-muted-foreground' },
};

export default function StudentAnnouncementsFeed() {
  const router = useRouter();
  const { profile } = useProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setAnnouncements(list);
    }, profile || undefined);

    return () => unsubscribe();
  }, [profile]);

  const unreadCount = announcements.filter((a) => !a.read).length;

  const markAllRead = async () => {
    await notificationService.markAllAsRead(profile?.id || undefined);
    toast.success('All announcements marked as read');
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
    if (!notice.read) {
      notificationService.markAsRead(notice.id, profile?.id || undefined);
    }

    if (notice.relatedEntity === 'note' || notice.type === 'DOCUMENT' || notice.category === 'Notes') {
      router.push(`/student-dashboard?tab=notes&resourceId=${notice.relatedEntityId || notice.id}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('campusos:open-document', {
            detail: { id: notice.relatedEntityId || notice.id, title: notice.title },
          })
        );
      }
    } else if (notice.relatedEntity === 'assignment' || notice.type === 'ASSIGNMENT' || notice.category === 'Assignment') {
      router.push(`/student-dashboard?tab=assignments&assignmentId=${notice.relatedEntityId || notice.id}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('campusos:open-assignment', {
            detail: { id: notice.relatedEntityId || notice.id, title: notice.title },
          })
        );
      }
    } else if (notice.relatedEntity === 'exam' || notice.type === 'EXAM' || notice.category === 'Exam') {
      router.push(`/student-dashboard?tab=exams`);
    } else if (notice.relatedEntity === 'class' || notice.type === 'CLASS_STARTED') {
      router.push(`/student-dashboard?tab=timetable`);
    } else {
      setSelectedNotice(notice);
    }
  };

  // Distinct subjects from loaded announcements
  const uniqueSubjects = Array.from(
    new Set(announcements.map((a) => a.subject).filter(Boolean))
  ) as string[];

  // Filter logic
  const filteredList = announcements.filter((item) => {
    if (unreadOnly && item.read) return false;

    if (categoryFilter !== 'all') {
      if (item.category !== categoryFilter && item.type !== categoryFilter) return false;
    }

    if (subjectFilter !== 'all') {
      if (!item.subject || !item.subject.toLowerCase().includes(subjectFilter.toLowerCase())) {
        return false;
      }
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
    <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-black/[0.06] shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary-dark" />
              Official Announcements & Circulars
            </h3>
            {unreadCount > 0 && (
              <span className="badge-danger text-xs px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-[#6E6E73]">
            Targeted notifications and academic updates for BCA Semester {profile?.semesterNumber || 5}.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary-dark hover:underline font-semibold flex items-center gap-1.5 cursor-pointer self-end sm:self-center active:scale-[0.98]"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 p-3 bg-[#F5F5F7] rounded-[14px] border border-black/[0.04]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E73]" />
          <input
            type="text"
            placeholder="Search circulars, subject notes, exam notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-[10px] bg-white border border-black/[0.08] text-[#1D1D1F] placeholder:text-[#6E6E73] focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-[10px] bg-white border border-black/[0.08] text-[#1D1D1F] focus:outline-none focus:border-primary font-medium cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="General">📢 General</option>
            <option value="Notes">📚 Notes & Docs</option>
            <option value="Assignment">📋 Assignments</option>
            <option value="Exam">📝 Exams</option>
            <option value="Important">🚨 Important</option>
            <option value="Event">🎪 Events</option>
          </select>

          {/* Subject Filter */}
          {uniqueSubjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-[10px] bg-white border border-black/[0.08] text-[#1D1D1F] focus:outline-none focus:border-primary font-medium max-w-[150px] truncate cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {/* Unread Only Toggle */}
          <button
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`text-xs px-3 py-2 rounded-[10px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${
              unreadOnly
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-[#6E6E73] border border-black/[0.08] hover:text-[#1D1D1F]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center space-y-3 rounded-[16px] bg-[#FAFAFC] border border-black/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary-dark flex items-center justify-center mx-auto text-xl border border-primary/20">
              📢
            </div>
            <h4 className="text-sm font-semibold text-[#1D1D1F]">No Announcements Found</h4>
            <p className="text-xs text-[#6E6E73] max-w-sm mx-auto leading-relaxed">
              {searchQuery || categoryFilter !== 'all' || subjectFilter !== 'all' || unreadOnly
                ? 'No circulars match your current filter settings.'
                : 'No announcements have been published for your semester yet.'}
            </p>
          </div>
        ) : (
          filteredList.map((ann) => {
            const cat = categoryConfig[ann.category] || categoryConfig.General;
            const prio = priorityStyles[ann.priority] || priorityStyles.medium;
            const isClassLive = ann.type === 'CLASS_STARTED';

            return (
              <div
                key={ann.id}
                onClick={() => {
                  if (!ann.read) notificationService.markAsRead(ann.id, profile?.id || undefined);
                  if (ann.relatedEntity && ann.relatedEntity !== 'announcement') {
                    handleResourceNavigation(ann);
                  } else {
                    setSelectedNotice(ann);
                  }
                }}
                className={`p-4 rounded-[16px] border transition-all duration-200 cursor-pointer relative group ${
                  !ann.read
                    ? isClassLive
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-very-soft shadow-card'
                      : 'border-primary/25 bg-[#F0FDF4] shadow-xs'
                    : 'border-black/[0.06] bg-white hover:bg-[#FAFAFC]'
                }`}
              >
                {/* Header Tag Bar */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    {!ann.read && (
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          isClassLive ? 'bg-accent animate-ping' : prio.dot
                        }`}
                      />
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-700 ${cat.badge} flex items-center gap-1`}>
                      <span>{cat.icon}</span> {cat.label}
                    </span>

                    {ann.subject && (
                      <span className="text-xs text-primary font-700 flex items-center gap-1 truncate max-w-[180px]">
                        <BookOpen className="w-3 h-3 flex-shrink-0" />
                        {ann.subject}
                      </span>
                    )}

                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-700 ${prio.badge}`}>
                      {prio.label}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground font-mono-data font-600 flex-shrink-0">
                    {ann.time}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-800 text-foreground mb-1 leading-snug group-hover:text-primary transition-colors break-words">
                  {isClassLive && <span className="text-accent font-900 mr-1">🔴 LIVE:</span>}
                  {ann.title}
                </h4>

                {/* Body */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 break-words">
                  {ann.body}
                </p>

                {/* Attached File Preview if available */}
                {ann.fileName && (
                  <div className="mt-3 p-2.5 rounded-xl bg-card/80 border border-border/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs font-700 text-foreground truncate break-all">
                        {ann.fileName}
                      </span>
                      {ann.fileSize && (
                        <span className="text-[10px] font-mono-data text-muted-foreground flex-shrink-0">
                          ({ann.fileSize})
                        </span>
                      )}
                    </div>

                    {(ann.fileUrl || ann.fileData) && (
                      <a
                        href={ann.fileUrl || ann.fileData}
                        download={ann.fileName}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-primary text-[11px] px-2.5 py-1 rounded-lg font-700 flex items-center gap-1 flex-shrink-0"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
                  <span className="truncate">
                    Author: <strong className="text-foreground">{ann.author}</strong>
                  </span>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ann.relatedEntity && ann.relatedEntity !== 'announcement' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResourceNavigation(ann);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white text-xs font-700 transition-all flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {ann.relatedEntity === 'note'
                          ? 'Open Notes'
                          : ann.relatedEntity === 'assignment'
                            ? 'Open Assignment'
                            : ann.relatedEntity === 'exam'
                              ? 'Exam Schedule'
                              : 'Open Class'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(e, ann)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        ann.read
                          ? 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                          : 'text-primary hover:bg-primary/20'
                      }`}
                      title={ann.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotice && (
        <Modal
          isOpen={Boolean(selectedNotice)}
          onClose={() => setSelectedNotice(null)}
          title={selectedNotice.title}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-lg font-700 ${
                    categoryConfig[selectedNotice.category]?.badge || 'badge-cyan'
                  }`}
                >
                  {selectedNotice.category}
                </span>
                {selectedNotice.subject && (
                  <span className="text-xs font-700 text-primary">{selectedNotice.subject}</span>
                )}
                {selectedNotice.targetSemester && (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-card/80 border border-border/80 font-mono-data font-700">
                    BCA Sem {selectedNotice.targetSemester}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono-data">
                {selectedNotice.time}
              </span>
            </div>

            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words max-h-72 overflow-y-auto no-scrollbar">
              {selectedNotice.body}
            </div>

            {selectedNotice.fileName && (
              <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-between gap-3 mt-4">
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

            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Published by: <strong className="text-foreground">{selectedNotice.author}</strong></span>
              <div className="flex items-center gap-2">
                {selectedNotice.relatedEntity && selectedNotice.relatedEntity !== 'announcement' && (
                  <Button
                    onClick={() => {
                      const notice = selectedNotice;
                      setSelectedNotice(null);
                      handleResourceNavigation(notice);
                    }}
                    className="btn-primary text-xs py-1.5 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Resource
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setSelectedNotice(null)}
                  className="text-xs py-1.5"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
