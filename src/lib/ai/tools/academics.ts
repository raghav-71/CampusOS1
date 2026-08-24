import { campusRepository } from '@/repositories/campusRepository';

export class AcademicsTools {
  static async getSubjectTopics(subjectCodeOrName: string) {
    const subjects = await campusRepository.getSubjects();
    const clean = subjectCodeOrName.toLowerCase();
    const found = subjects.find(
      (s) =>
        s.code.toLowerCase().includes(clean) ||
        s.name.toLowerCase().includes(clean)
    );

    if (!found) {
      return {
        subject: subjectCodeOrName,
        topics: [
          'Unit 1: Fundamentals & Architecture',
          'Unit 2: Core Algorithms & Mechanics',
          'Unit 3: Memory & State Management',
          'Unit 4: Advanced Protocols & Optimizations',
          'Unit 5: Case Studies & Applied Implementations',
        ],
      };
    }

    return {
      subject: `${found.name} (${found.code})`,
      department: found.department,
      semester: found.semester,
      instructor: found.instructor,
      coveragePct: found.syllabusCoveragePct,
      topics: [
        'Process Management & Synchronization (Peterson’s Solution, Semaphores)',
        'CPU Scheduling (FCFS, SJF, Round Robin, SRTF)',
        'Deadlock Prevention & Banker’s Safety Algorithm',
        'Memory Management (Paging, Segmentation, TLB, Page Replacement)',
        'Disk Scheduling (SSTF, SCAN, C-LOOK) & File Systems',
      ],
    };
  }
}
