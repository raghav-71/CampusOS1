import { campusRepository, ICampusRepository } from '@/repositories/campusRepository';
import { NoteDocument, Announcement, TimetableSlot, StudyProgressMetric } from '@/types/campus';

export class StudentService {
  constructor(private repo: ICampusRepository = campusRepository) {}

  async getNotes(subject?: string): Promise<NoteDocument[]> {
    return this.repo.getNotes(subject);
  }

  async getTimetable(semester?: string | number): Promise<TimetableSlot[]> {
    return this.repo.getStudentTimetable(semester);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return this.repo.getAnnouncements('student');
  }

  async getStudyProgress(semester?: number): Promise<StudyProgressMetric[]> {
    return this.repo.getStudyProgress(semester);
  }

  async getSubjects(semester?: number | string) {
    return this.repo.getSubjects(semester);
  }
}

export const studentService = new StudentService();
