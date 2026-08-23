import { campusRepository, ICampusRepository } from '@/repositories/campusRepository';
import { NoteDocument, Announcement, TimetableSlot, StudyProgressMetric } from '@/types/campus';

export class StudentService {
  constructor(private repo: ICampusRepository = campusRepository) {}

  async getNotes(subject?: string): Promise<NoteDocument[]> {
    return this.repo.getNotes(subject);
  }

  async getTimetable(department?: string, semester?: string): Promise<TimetableSlot[]> {
    return this.repo.getStudentTimetable(department, semester);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return this.repo.getAnnouncements('student');
  }

  async getStudyProgress(): Promise<StudyProgressMetric[]> {
    return this.repo.getStudyProgress();
  }

  async getSubjects(department?: string) {
    return this.repo.getSubjects(department);
  }
}

export const studentService = new StudentService();
