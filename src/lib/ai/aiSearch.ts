import { campusRepository } from '@/repositories/campusRepository';
import { mockExams, mockEvents, mockUsers } from '@/repositories/mockData';
import { Role } from '@/types/campus';

export interface UnifiedSearchResult {
  category:
    | 'Subject'
    | 'Note'
    | 'Timetable'
    | 'Exam'
    | 'Announcement'
    | 'Event'
    | 'Assignment'
    | 'User';
  title: string;
  subtitle: string;
  route: string;
  badgeColor?: string;
  metadata?: Record<string, any>;
}

export class AISearchEngine {
  /**
   * Searches across all campus data structures respecting role authorization.
   */
  static async searchAll(query: string, role: Role): Promise<UnifiedSearchResult[]> {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();

    const [subjects, notes, timetable, announcements, assignments] = await Promise.all([
      campusRepository.getSubjects(),
      campusRepository.getNotes(),
      campusRepository.getStudentTimetable(),
      campusRepository.getAnnouncements(role),
      campusRepository.getAssignments(),
    ]);

    const results: UnifiedSearchResult[] = [];

    // 1. Subjects
    for (const sub of subjects) {
      if (
        sub.name.toLowerCase().includes(q) ||
        sub.code.toLowerCase().includes(q) ||
        sub.department.toLowerCase().includes(q) ||
        sub.instructor.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Subject',
          title: `${sub.name} (${sub.code})`,
          subtitle: `${sub.department} ${sub.semester} · Instructor: ${sub.instructor} · Syllabus: ${sub.syllabusCoveragePct}%`,
          route:
            role === 'teacher'
              ? '/teacher-dashboard?tab=classes'
              : '/student-dashboard?tab=subjects',
          badgeColor: sub.colorBadge || 'badge-cyan',
          metadata: sub,
        });
      }
    }

    // 2. Notes
    for (const note of notes) {
      if (
        note.title.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        note.teacher.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Note',
          title: note.title,
          subtitle: `${note.subject} · By ${note.teacher} · ${note.pages} pages · ${note.fileSize || note.size}`,
          route: '/student-dashboard?tab=notes',
          badgeColor: 'badge-violet',
          metadata: note,
        });
      }
    }

    // 3. Timetable Slots
    for (const slot of timetable) {
      if (
        slot.subject.toLowerCase().includes(q) ||
        slot.teacher.toLowerCase().includes(q) ||
        slot.room.toLowerCase().includes(q) ||
        slot.dayOfWeek.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Timetable',
          title: `${slot.subject} (${slot.type || 'Lecture'})`,
          subtitle: `${slot.dayOfWeek} at ${slot.time} – ${slot.endTime} · Room ${slot.room} · Prof. ${slot.teacher}`,
          route:
            role === 'teacher'
              ? '/teacher-dashboard?tab=timetable'
              : '/student-dashboard?tab=timetable',
          badgeColor: 'badge-cyan',
          metadata: slot,
        });
      }
    }

    // 4. Exams
    for (const ex of mockExams) {
      if (
        ex.subject.toLowerCase().includes(q) ||
        ex.subjectCode.toLowerCase().includes(q) ||
        ex.room.toLowerCase().includes(q) ||
        ex.date.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Exam',
          title: `${ex.subject} End-Term Exam`,
          subtitle: `Date: ${ex.date} (${ex.time}) · Venue: ${ex.room}`,
          route: '/student-dashboard?tab=exams',
          badgeColor: 'badge-warning',
          metadata: ex,
        });
      }
    }

    // 5. Announcements
    for (const ann of announcements) {
      if (
        ann.title.toLowerCase().includes(q) ||
        ann.body.toLowerCase().includes(q) ||
        ann.category.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Announcement',
          title: ann.title,
          subtitle: `Category: ${ann.category} · Priority: ${ann.priority.toUpperCase()} · ${ann.time}`,
          route:
            role === 'admin'
              ? '/admin-dashboard?tab=announcements'
              : '/student-dashboard?tab=announcements',
          badgeColor: ann.priority === 'high' ? 'badge-danger' : 'badge-cyan',
          metadata: ann,
        });
      }
    }

    // 6. Events
    for (const evt of mockEvents) {
      if (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.category.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Event',
          title: evt.title,
          subtitle: `${evt.date} · ${evt.location} · Organized by ${evt.organizer}`,
          route: '/student-dashboard?tab=events',
          badgeColor: 'badge-success',
          metadata: evt,
        });
      }
    }

    // 7. Assignments
    for (const asg of assignments) {
      if (
        asg.title.toLowerCase().includes(q) ||
        asg.subject.toLowerCase().includes(q) ||
        asg.teacher.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Assignment',
          title: asg.title,
          subtitle: `${asg.subject} · Due: ${asg.dueDate} · Max Score: ${asg.maxScore} pts`,
          route:
            role === 'teacher'
              ? '/teacher-dashboard?tab=assignments'
              : '/student-dashboard?tab=overview',
          badgeColor: asg.status === 'active' ? 'badge-warning' : 'badge-muted',
          metadata: asg,
        });
      }
    }

    // 8. Users (Admin/Faculty only)
    if (role === 'admin' || role === 'teacher') {
      for (const u of mockUsers) {
        if (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q))
        ) {
          results.push({
            category: 'User',
            title: `${u.fullName} (${u.role.toUpperCase()})`,
            subtitle: `${u.department || 'Campus'} ${u.semester || ''} · ${u.email}`,
            route:
              role === 'admin' ? '/admin-dashboard?tab=students' : '/teacher-dashboard?tab=classes',
            badgeColor: u.role === 'teacher' ? 'badge-violet' : 'badge-cyan',
            metadata: u,
          });
        }
      }
    }

    return results;
  }
}
