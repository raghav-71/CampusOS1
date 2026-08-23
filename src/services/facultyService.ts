import { campusRepository, ICampusRepository } from '@/repositories/campusRepository';
import {
  TimetableSlot,
  Assignment,
  Submission,
  FacultyAttendanceMetric,
  GradeDistributionMetric,
  NoteDocument,
} from '@/types/campus';

export class FacultyService {
  constructor(private repo: ICampusRepository = campusRepository) {}

  async getSchedule(teacherName?: string): Promise<TimetableSlot[]> {
    return this.repo.getTeacherSchedule(teacherName);
  }

  async getAssignments(teacherName?: string): Promise<Assignment[]> {
    return this.repo.getAssignments(teacherName);
  }

  async getSubmissions(assignmentId?: string): Promise<Submission[]> {
    return this.repo.getSubmissions(assignmentId);
  }

  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<Submission | null> {
    return this.repo.gradeSubmission(submissionId, score, feedback);
  }

  async getAttendanceTrends(): Promise<FacultyAttendanceMetric[]> {
    return this.repo.getFacultyAttendanceTrends();
  }

  async getGradeDistributions(): Promise<GradeDistributionMetric[]> {
    return this.repo.getGradeDistributions();
  }

  async getUploadedNotes(teacherName?: string): Promise<NoteDocument[]> {
    const allNotes = await this.repo.getNotes();
    if (!teacherName) return allNotes;
    return allNotes.filter((n) => n.teacher.toLowerCase().includes(teacherName.toLowerCase()));
  }

  async uploadNote(note: Omit<NoteDocument, 'id' | 'uploadedAt' | 'downloads' | 'isNew'>): Promise<NoteDocument> {
    return this.repo.uploadNote(note);
  }
}

export const facultyService = new FacultyService();
