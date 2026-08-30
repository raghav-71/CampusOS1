import { BcaSemester } from '@/types/campus';

export interface SemesterInfo {
  semesterNumber: BcaSemester;
  title: string;
  year: 1 | 2 | 3;
  academicYear: string;
  totalCredits: number;
  startDate: string;
  endDate: string;
  description: string;
}

export const seedSemesters: SemesterInfo[] = [
  {
    semesterNumber: 1,
    title: 'Semester 1 — Foundation & Computational Thinking',
    year: 1,
    academicYear: '2026-2027',
    totalCredits: 22,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    description: 'Core fundamentals of computer programming in C, discrete mathematics, digital logic, and communication skills.',
  },
  {
    semesterNumber: 2,
    title: 'Semester 2 — Data Structures & Object Oriented Systems',
    year: 1,
    academicYear: '2026-2027',
    totalCredits: 24,
    startDate: '2027-01-05',
    endDate: '2027-05-20',
    description: 'Linear & non-linear data structures, C++ OOP concepts, computer architecture, and numerical methods.',
  },
  {
    semesterNumber: 3,
    title: 'Semester 3 — Systems Architecture & Database Engineering',
    year: 2,
    academicYear: '2026-2027',
    totalCredits: 24,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    description: 'Relational database theory, SQL/PL-SQL, system software, statistics, and operating environment essentials.',
  },
  {
    semesterNumber: 4,
    title: 'Semester 4 — Web Frameworks, Java & Network Protocols',
    year: 2,
    academicYear: '2026-2027',
    totalCredits: 26,
    startDate: '2027-01-05',
    endDate: '2027-05-20',
    description: 'Core Java programming, frontend web development (HTML/CSS/JS/React), networking concepts, and software engineering principles.',
  },
  {
    semesterNumber: 5,
    title: 'Semester 5 — Advanced Systems, Algorithms & Cloud Infrastructure',
    year: 3,
    academicYear: '2026-2027',
    totalCredits: 26,
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    description: 'Operating systems kernel design, advanced DBMS & normalization, computer networks routing/switching, enterprise Java, and algorithm optimization.',
  },
  {
    semesterNumber: 6,
    title: 'Semester 6 — Full-Stack Capstone, AI/ML & Cyber Defense',
    year: 3,
    academicYear: '2026-2027',
    totalCredits: 28,
    startDate: '2027-01-05',
    endDate: '2027-05-20',
    description: 'Artificial intelligence & ML pipelines, cloud computing & DevOps, cyber security & ethical hacking, and final degree capstone project.',
  },
];
