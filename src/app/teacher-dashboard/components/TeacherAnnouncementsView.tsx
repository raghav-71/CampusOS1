'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Announcement, AnnouncementCategory, BcaSemester, TeacherSubjectAssignment } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import { fileStorageService } from '@/services/fileStorageService';
import { AuthorizationService } from '@/services/authorizationService';
import { useProfile } from '@/hooks/useProfile';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Paperclip,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

const categoryConfig: Record<
  AnnouncementCategory,
  { label: string; badge: string; icon: string; border: string; bg: string }
> = {
  General: {
    label: 'General',
    badge: 'badge-blue',
    icon: '📢',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
  },
  Important: {
    label: 'Important',
    badge: 'badge-danger',
    icon: '🚨',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
  },
  Exam: {
    label: 'Exam / Test',
    badge: 'badge-purple',
    icon: '📝',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
  },
  Assignment: {
    label: 'Assignment',
    badge: 'badge-warning',
    icon: '📋',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  Notes: {
    label: 'Notes & Docs',
    badge: 'badge-cyan',
    icon: '📚',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
  },
  Event: {
    label: 'Campus Event',
    badge: 'badge-green',
    icon: '🎪',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
  Academic: {
    label: 'Academic',
    badge: 'badge-blue',
    icon: '🎓',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
  },
  Emergency: {
    label: 'Emergency Alert',
    badge: 'badge-danger',
    icon: '⚡',
    border: 'border-rose-600/50',
    bg: 'bg-rose-600/20',
  },
  Class: {
    label: 'Class Schedule',
    badge: 'badge-cyan',
    icon: '🕒',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
  },
};

const priorityStyles = {
  high: { badge: 'badge-danger', dot: 'bg-rose-500' },
  medium: { badge: 'badge-warning', dot: 'bg-amber-500' },
  low: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

export default function TeacherAnnouncementsView() {
  const { profile } = useProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [authorizedSemesters, setAuthorizedSemesters] = useState<BcaSemester[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [allTeacherSubjects, setAllTeacherSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal & Form states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('General');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetSemester, setTargetSemester] = useState<number>(5);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [targetSection, setTargetSection] = useState<string>('all');
  const [publishAt, setPublishAt] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isImportant, setIsImportant] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Detail Modal
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const teacherEmail = profile?.email || 'faculty@campusos.demo';
      const teacherId = profile?.id || 'usr-faculty-001';

      // 1. Fetch faculty authorized teaching assignments
      const sems = AuthorizationService.getFacultyAuthorizedSemesters(teacherEmail);
      const activeSems: BcaSemester[] = sems.length > 0 ? sems : [1, 5, 6];
      setAuthorizedSemesters(activeSems);

      const subjects = await campusRepository.getTeacherSubjects(teacherEmail);
      setAllTeacherSubjects(subjects);

      const initialSem = activeSems[0] || 5;
      setTargetSemester(initialSem);

      const filteredSubjects = subjects.filter((s) => s.semesterNumber === initialSem);
      setAvailableSubjects(filteredSubjects.length > 0 ? filteredSubjects : subjects);
      if (filteredSubjects.length > 0) {
        setSelectedSubjectId(filteredSubjects[0].subjectId);
      }

      // 2. Fetch all announcements
      const list = await campusRepository.getAnnouncements('teacher', teacherId, undefined, profile || undefined);
      setAnnouncements(list);
    } catch (err) {
      console.error('Error loading teacher announcements:', err);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When form semester changes, update available subjects strictly
  const handleFormSemesterChange = (sem: number) => {
    setTargetSemester(sem);
    const filtered = allTeacherSubjects.filter((s) => s.semesterNumber === sem);
    setAvailableSubjects(filtered);
    if (filtered.length > 0) {
      setSelectedSubjectId(filtered[0].subjectId);
    } else {
      setSelectedSubjectId('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = fileStorageService.validateFile(file, {
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'zip'],
      maxSizeBytes: 25 * 1024 * 1024,
    });

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file format');
      return;
    }

    setSelectedFile(file);
    toast.success(`Attached: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an announcement title');
      return;
    }
    if (!body.trim()) {
      toast.error('Please provide announcement content');
      return;
    }

    const assignedSub = availableSubjects.find((s) => s.subjectId === selectedSubjectId);

    setIsPublishing(true);
    try {
      let fileData: string | undefined = undefined;
      let fileName: string | undefined = undefined;
      let fileSize: string | undefined = undefined;
      let fileType: string | undefined = undefined;

      if (selectedFile) {
        const stored = await fileStorageService.uploadFile(
          selectedFile,
          'notes',
          { allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'zip'] },
          (pct) => setUploadProgress(pct)
        );
        fileData = stored.dataUrl || stored.previewUrl;
        fileName = stored.fileName;
        fileSize = stored.fileSize;
        fileType = stored.fileType;
      }

      const facultyEmail = profile?.email || 'faculty@campusos.demo';
      const facultyId = profile?.id || 'usr-faculty-001';
      const authorName = profile?.fullName || 'Faculty Instructor';

      const payload: Announcement = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        priority,
        category,
        type:
          category === 'Exam'
            ? 'EXAM'
            : category === 'Assignment'
              ? 'ASSIGNMENT'
              : category === 'Notes'
                ? 'DOCUMENT'
                : 'ANNOUNCEMENT',
        time: 'Just now',
        createdAt: new Date().toISOString(),
        publishAt: publishAt || undefined,
        expiresAt: expiresAt || undefined,
        author: authorName,
        authorId: facultyId,
        read: false,
        targetRole: 'student',
        targetSemester: targetSemester as BcaSemester,
        semesterNumber: targetSemester as BcaSemester,
        targetSection: targetSection === 'all' ? undefined : targetSection,
        targetDepartment: 'BCA',
        subject: assignedSub ? assignedSub.subjectName : undefined,
        subjectCode: assignedSub ? assignedSub.subjectCode : undefined,
        subjectId: assignedSub ? assignedSub.subjectId : undefined,
        fileUrl: fileData,
        fileData,
        fileName,
        fileSize,
        fileType,
        isImportant: isImportant || priority === 'high',
        relatedEntity:
          category === 'Notes'
            ? 'note'
            : category === 'Assignment'
              ? 'assignment'
              : category === 'Exam'
                ? 'exam'
                : 'announcement',
      };

      const created = await campusRepository.createAnnouncement(payload, profile || {
        id: facultyId,
        email: facultyEmail,
        role: 'teacher',
      });

      setAnnouncements((prev) => [created, ...prev]);
      toast.success(`Announcement published for Semester ${targetSemester} (${assignedSub?.subjectName || 'All Subjects'})!`);

      // Reset form
      setCreateModalOpen(false);
      setTitle('');
      setBody('');
      setSelectedFile(null);
      setPublishAt('');
      setExpiresAt('');
      setIsImportant(false);
    } catch (err: any) {
      toast.error('Failed to publish announcement: ' + (err.message || 'Authorization rejected'));
    } finally {
      setIsPublishing(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (!confirm(`Are you sure you want to remove announcement: "${announcement.title}"?`)) return;

    try {
      await campusRepository.deleteAnnouncement(announcement.id, profile || undefined);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
      toast.success('Announcement removed from campus feed');
    } catch (err: any) {
      toast.error('Failed to delete announcement: ' + err.message);
    }
  };

  // Filtered List
  const filteredAnnouncements = announcements.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBody = item.body.toLowerCase().includes(q);
      const matchSub = item.subject?.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      if (!matchTitle && !matchBody && !matchSub && !matchAuthor) return false;
    }

    if (filterSemester !== 'all') {
      const sem = parseInt(filterSemester, 10);
      if (item.targetSemester !== sem && item.semesterNumber !== sem) return false;
    }

    if (filterSubject !== 'all') {
      if (!item.subject || !item.subject.toLowerCase().includes(filterSubject.toLowerCase())) return false;
    }

    if (filterCategory !== 'all') {
      if (item.category !== filterCategory) return false;
    }

    return true;
  });

  // KPI calculations
  const totalCount = announcements.length;
  const highPriorityCount = announcements.filter((a) => a.priority === 'high' || a.isImportant).length;
  const totalSemestersReached = new Set(announcements.map((a) => a.targetSemester || a.semesterNumber).filter(Boolean)).size;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-green text-xs px-3 py-1 rounded-full font-700 uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" /> Faculty Circular & Notification Hub
              </span>
              <span className="badge-muted text-xs px-2.5 py-0.5 rounded-full font-600">
                Authorized Semesters: {authorizedSemesters.map((s) => `S${s}`).join(', ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-800 text-foreground tracking-tight">
              Class Announcements & Broadcasts
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Publish targeted academic notices, exam alerts, assignment briefs, and study material circulars to your assigned BCA semester classes.
            </p>
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 font-700 cursor-pointer whitespace-nowrap btn-press"
          >
            <Plus className="w-4 h-4" />
            Publish Announcement
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-border">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
            <span className="text-xs text-muted-foreground font-500">Total Published</span>
            <div className="text-2xl font-800 text-foreground mt-1 font-mono-data">{totalCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200">
            <span className="text-xs text-danger font-500">Urgent / High Priority</span>
            <div className="text-2xl font-800 text-danger mt-1 font-mono-data">{highPriorityCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-200">
            <span className="text-xs text-primary-dark font-500">Active Semesters</span>
            <div className="text-2xl font-800 text-primary-dark mt-1 font-mono-data">{totalSemestersReached}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
            <span className="text-xs text-muted-foreground font-500">Department</span>
            <div className="text-2xl font-800 text-primary mt-1 font-mono-data">BCA</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-border/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search announcements, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Semester Filter */}
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-600"
          >
            <option value="all">All Semesters</option>
            {authorizedSemesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-600"
          >
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="Important">Important</option>
            <option value="Exam">Exam / Test</option>
            <option value="Assignment">Assignment</option>
            <option value="Notes">Notes & Docs</option>
            <option value="Event">Event</option>
          </select>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-600 max-w-[180px] truncate"
          >
            <option value="all">All My Subjects</option>
            {allTeacherSubjects.map((sub) => (
              <option key={sub.subjectId} value={sub.subjectName}>
                {sub.subjectCode} - {sub.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-3xl glass-card animate-pulse" />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-border/80 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-2xl">
            📢
          </div>
          <h3 className="text-lg font-800 text-foreground">No Announcements Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {searchQuery || filterSemester !== 'all' || filterCategory !== 'all'
              ? 'No announcements match the active search or filters. Try adjusting your criteria.'
              : 'You have not published any class announcements yet. Click the button above to publish your first announcement.'}
          </p>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs px-4 py-2 rounded-xl font-700"
          >
            Publish New Announcement
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
          {filteredAnnouncements.map((item) => {
            const catInfo = categoryConfig[item.category] || categoryConfig.General;
            const prioInfo = priorityStyles[item.priority] || priorityStyles.medium;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-border hover:border-brand-300 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-700 ${catInfo.badge} flex items-center gap-1`}>
                        <span>{catInfo.icon}</span> {catInfo.label}
                      </span>
                      {item.targetSemester && (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-card/80 border border-border/80 font-mono-data text-foreground font-700">
                          Sem {item.targetSemester}
                        </span>
                      )}
                      {item.targetSection && item.targetSection !== 'all' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-card/80 border border-border/80 font-mono-data text-muted-foreground font-600">
                          Sec {item.targetSection}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-700 uppercase tracking-wider ${prioInfo.badge}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  {/* Subject Tag */}
                  {item.subject && (
                    <div className="flex items-center gap-1.5 text-xs text-primary font-700 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{item.subject}</span>
                    </div>
                  )}

                  {/* Title & Body */}
                  <h3 className="text-base font-800 text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-2 break-words mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed break-words">
                    {item.body}
                  </p>

                  {/* Attachment Indicator */}
                  {item.fileName && (
                    <div className="mt-3 p-2 rounded-xl bg-card/60 border border-border/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="text-[11px] font-600 text-foreground truncate break-all">
                          {item.fileName}
                        </span>
                      </div>
                      {item.fileSize && (
                        <span className="text-[10px] font-mono-data text-muted-foreground flex-shrink-0">
                          {item.fileSize}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono-data">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{item.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingAnnouncement(item)}
                      className="p-1.5 rounded-xl hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all cursor-pointer"
                      title="View Full Notice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(item)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Announcement Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Class Announcement"
      >
        <form onSubmit={handlePublishSubmit} className="space-y-4">
          {/* Target Semester & Subject Scope (Strict Access Enforcement) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-700 text-foreground mb-1">
                Target Semester <span className="text-rose-400">*</span>
              </label>
              <select
                value={targetSemester}
                onChange={(e) => handleFormSemesterChange(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-700"
                required
              >
                {authorizedSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    BCA Semester {sem}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Only semesters you are assigned to teach appear here.
              </p>
            </div>

            <div>
              <label className="block text-xs font-700 text-foreground mb-1">
                Assigned Subject <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-700"
              >
                <option value="">-- All Semester {targetSemester} Subjects --</option>
                {availableSubjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectCode} - {sub.subjectName} (Sec {sub.section})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Authorized subjects for Semester {targetSemester}.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-700 text-foreground mb-1">
              Announcement Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Unit 3 DBMS Question Bank & Assignment 2 Brief"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-600"
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-700 text-foreground mb-1">Category / Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-600"
              >
                <option value="General">📢 General Circular</option>
                <option value="Assignment">📋 Assignment Brief</option>
                <option value="Exam">📝 Exam / Test Notification</option>
                <option value="Notes">📚 Notes & Study Material</option>
                <option value="Important">🚨 Important Notice</option>
                <option value="Event">🎪 Campus Event</option>
                <option value="Academic">🎓 Academic Notice</option>
                <option value="Emergency">⚡ Urgent Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-700 text-foreground mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-600"
              >
                <option value="high">🔴 High / Urgent</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low / Informational</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-700 text-foreground mb-1">Target Section</label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary font-600"
              >
                <option value="all">All Sections (A & B)</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="Batch 1">Batch 1 (Lab)</option>
                <option value="Batch 2">Batch 2 (Lab)</option>
              </select>
            </div>
          </div>

          {/* Description Body */}
          <div>
            <label className="block text-xs font-700 text-foreground mb-1">
              Announcement Content / Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Enter comprehensive announcement details, instructions, links, or schedule notes for students..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-card/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary leading-relaxed"
              required
            />
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-xs font-700 text-foreground mb-1">
              Optional Attachment (PDF, DOCX, Images, ZIP up to 25MB)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip"
            />
            {selectedFile ? (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-700 text-foreground truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] font-mono-data text-muted-foreground flex-shrink-0">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-rose-400 text-xs p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border border-dashed border-border/80 hover:border-primary/60 rounded-xl text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-all cursor-pointer bg-card/40"
              >
                <Paperclip className="w-4 h-4" />
                Click to attach file or study material
              </button>
            )}
          </div>

          {/* Expiry / Publish Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-600 text-muted-foreground mb-1">
                Optional Expiry Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-card/60 border border-border text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-600 text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                Pin as High-Priority Notice
              </label>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isPublishing && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono-data">
                <span>Uploading attachment...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPublishing}
              className="btn-primary px-6 py-2.5 rounded-xl font-700 flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  Publish Notice
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {viewingAnnouncement && (
        <Modal
          isOpen={Boolean(viewingAnnouncement)}
          onClose={() => setViewingAnnouncement(null)}
          title={viewingAnnouncement.title}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-lg font-700 ${
                    categoryConfig[viewingAnnouncement.category]?.badge || 'badge-cyan'
                  }`}
                >
                  {viewingAnnouncement.category}
                </span>
                {viewingAnnouncement.targetSemester && (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-card/80 border border-border/80 font-mono-data font-700">
                    BCA Sem {viewingAnnouncement.targetSemester}
                  </span>
                )}
                {viewingAnnouncement.subject && (
                  <span className="text-xs text-primary font-700">
                    {viewingAnnouncement.subject}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono-data">
                {viewingAnnouncement.time}
              </span>
            </div>

            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
              {viewingAnnouncement.body}
            </div>

            {viewingAnnouncement.fileName && (
              <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 flex items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-700 text-foreground truncate break-all">
                      {viewingAnnouncement.fileName}
                    </p>
                    {viewingAnnouncement.fileSize && (
                      <p className="text-[10px] font-mono-data text-muted-foreground">
                        {viewingAnnouncement.fileSize}
                      </p>
                    )}
                  </div>
                </div>

                {(viewingAnnouncement.fileUrl || viewingAnnouncement.fileData) && (
                  <a
                    href={viewingAnnouncement.fileUrl || viewingAnnouncement.fileData}
                    download={viewingAnnouncement.fileName}
                    className="btn-primary text-xs px-3 py-1.5 rounded-xl font-700 flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Published by: <strong className="text-foreground">{viewingAnnouncement.author}</strong></span>
              <Button
                variant="secondary"
                onClick={() => setViewingAnnouncement(null)}
                className="text-xs py-1.5"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
