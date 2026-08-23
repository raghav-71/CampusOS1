import { campusRepository, ICampusRepository } from '@/repositories/campusRepository';
import {
  UserProfile,
  Department,
  Subject,
  ActivityItem,
  EnrollmentMetric,
  DepartmentNotesMetric,
  Role,
} from '@/types/campus';

export class AdminService {
  constructor(private repo: ICampusRepository = campusRepository) {}

  async getUsers(role?: Role): Promise<UserProfile[]> {
    return this.repo.getUsers(role);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repo.deleteUser(id);
  }

  async getDepartments(): Promise<Department[]> {
    return this.repo.getDepartments();
  }

  async getSubjects(department?: string): Promise<Subject[]> {
    return this.repo.getSubjects(department);
  }

  async getActivities(): Promise<ActivityItem[]> {
    return this.repo.getActivities();
  }

  async getEnrollmentTrends(): Promise<EnrollmentMetric[]> {
    return this.repo.getEnrollmentTrends();
  }

  async getDepartmentNotes(): Promise<DepartmentNotesMetric[]> {
    return this.repo.getDepartmentNotes();
  }
}

export const adminService = new AdminService();
