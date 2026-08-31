import { BcaSemester } from '@/types/campus';

export interface SharedDocumentRecord {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'txt' | 'csv';
  fileSize: string;
  sizeBytes: number;
  category: 'notes' | 'question-paper' | 'assignment' | 'syllabus' | 'announcement';
  subject: string;
  subjectCode: string;
  semester: string;
  targetSemester: BcaSemester;
  uploadedBy: string;
  uploadedById: string;
  uploadedAt: string;
  status: 'published' | 'draft' | 'archived';
  visibility: 'students' | 'faculty' | 'public';
  extractedText: string;
  fileData?: string;
  fileUrl?: string;
  downloads: number;
  views: number;
}

export const seedSharedDocuments: SharedDocumentRecord[] = [
  {
    id: 'doc-501',
    title: 'DBMS Normalization & B+ Tree Indexing Guide',
    fileName: 'DBMS_Normalization_Unit3.pdf',
    fileType: 'pdf',
    fileSize: '3.8 MB',
    sizeBytes: 3984588,
    category: 'notes',
    subject: 'Database Management Systems',
    subjectCode: 'CS502',
    semester: 'Semester 5',
    targetSemester: 5,
    uploadedBy: 'Prof. Rajesh Kumar',
    uploadedById: 'usr-faculty-002',
    uploadedAt: '2026-08-20',
    status: 'published',
    visibility: 'students',
    downloads: 142,
    views: 310,
    extractedText: `
DBMS Lecture Notes - Unit 3: Normalization & Indexing
Instructor: Prof. Rajesh Kumar | BCA Semester 5
Topics Covered:
1. Database Anomalies: Update, Insertion, and Deletion anomalies in unnormalized tables.
2. Functional Dependencies: X -> Y definition, Armstrong axioms (Reflexivity, Augmentation, Transitivity).
3. Normal Forms:
   - 1NF: Atomic attribute values only, no repeating groups.
   - 2NF: In 1NF + No partial dependency (non-prime attributes must fully depend on candidate keys).
   - 3NF: In 2NF + No transitive dependency (X -> Y where Y is non-prime and X is not candidate key).
   - BCNF: For every non-trivial functional dependency X -> Y, X must be a superkey.
4. B-Tree & B+ Tree Indexing:
   - B+ Trees store all actual data records in leaf nodes connected as a doubly linked list.
   - Internal nodes store search keys for fast O(log N) tree traversal.
`,
  },
  {
    id: 'doc-502',
    title: 'Operating Systems Virtual Memory & Kernel Deadlocks',
    fileName: 'OS_Virtual_Memory_Deadlocks.pdf',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    sizeBytes: 4404019,
    category: 'notes',
    subject: 'Operating Systems',
    subjectCode: 'CS501',
    semester: 'Semester 5',
    targetSemester: 5,
    uploadedBy: 'Dr. Priya Nair',
    uploadedById: 'usr-faculty-001',
    uploadedAt: '2026-08-22',
    status: 'published',
    visibility: 'students',
    downloads: 189,
    views: 420,
    extractedText: `
Operating Systems Masterclass Notes - Chapter 4 & 5
Instructor: Dr. Priya Nair | BCA Semester 5
1. Process Synchronization & Critical Section Problem:
   - Mutual Exclusion, Progress, Bounded Waiting.
   - Peterson's Solution, Mutex Locks, and Counting Semaphores.
2. Deadlocks:
   - Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
   - Banker's Algorithm: Resource allocation graph, Safety state evaluation, Request algorithm.
3. Virtual Memory & Paging:
   - Logical vs Physical Address translation via Page Tables and TLB.
   - Effective Access Time (EAT) = (1 - p) * ma + p * (page fault service time).
   - Page Replacement: FIFO, Optimal, LRU (Least Recently Used), and Clock Algorithm.
`,
  },
  {
    id: 'doc-503',
    title: 'Computer Networks Subnetting & CIDR Calculation Lab',
    fileName: 'CN_CIDR_Routing_Protocols.pdf',
    fileType: 'pdf',
    fileSize: '2.9 MB',
    sizeBytes: 3040870,
    category: 'notes',
    subject: 'Computer Networks',
    subjectCode: 'CS503',
    semester: 'Semester 5',
    targetSemester: 5,
    uploadedBy: 'Dr. Amit Sen',
    uploadedById: 'usr-faculty-003',
    uploadedAt: '2026-08-18',
    status: 'published',
    visibility: 'students',
    downloads: 165,
    views: 280,
    extractedText: `
Computer Networks Course Guide - Unit 2 & 3
Instructor: Dr. Amit Sen | BCA Semester 5
1. IP Addressing & Subnetting:
   - Classless Inter-Domain Routing (CIDR) notation (/24, /27, /30).
   - Calculating Network ID, First Usable Host, Last Usable Host, and Broadcast Address.
2. Routing Protocols:
   - Distance Vector Routing: Bellman-Ford equation Dx(y) = min_v { c(x,v) + Dv(y) }. Count to infinity problem.
   - Link State Routing: OSPF, Dijkstra Shortest Path First algorithm.
3. Transport Protocols:
   - TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK), Sliding Window flow control, and AIMD congestion control.
`,
  },
  {
    id: 'doc-504',
    title: 'C# Lab SEP Journal 2026',
    fileName: 'C# Lab SEP Journal 2026.pdf',
    fileType: 'pdf',
    fileSize: '4.6 MB',
    sizeBytes: 4823449,
    category: 'notes',
    subject: 'C# & .NET Programming Lab',
    subjectCode: 'CS504',
    semester: 'Semester 5',
    targetSemester: 5,
    uploadedBy: 'Dr. Priya Nair',
    uploadedById: 'usr-faculty-001',
    uploadedAt: '2026-08-25',
    status: 'published',
    visibility: 'students',
    downloads: 215,
    views: 520,
    extractedText: `--- PAGE 1 ---
# C# & .NET LABORATORY JOURNAL 2026
Department of Computer Applications | BCA Semester 5
Course Code: BCA505P | Academic Year: 2026-2027
Instructor: Dr. Priya Nair

TABLE OF CONTENTS
- Experiment 1: Classes, Objects, and Parameterized Constructors
- Experiment 2: Single, Multilevel, and Hierarchical Inheritance with Polymorphism
- Experiment 3: Abstract Classes and Multiple Interface Implementation
- Experiment 4: Delegates, Multicast Delegates, and Event Handling Architecture
- Experiment 5: LINQ (Language Integrated Query) Operations and File Stream I/O
- Experiment 6: Windows Forms GUI Development and ADO.NET Data Binding
- Experiment 7: Defensive Programming, Structured Exception Handling, and Custom Exceptions
- Experiment 8: Multithreading and Asynchronous Programming with Task (Async / Await)

--- PAGE 2 ---
## Experiment 1: Classes, Objects & Constructors
Objective: Implement a Student Information Management System in C# showcasing encapsulation and static member tracking.

Program Specification:
\`\`\`csharp
using System;

public class Student {
    private string studentId;
    private string fullName;
    private double gpa;
    private static int totalEnrolled = 0;

    public Student(string id, string name, double gpa) {
        this.studentId = id;
        this.fullName = name;
        this.gpa = gpa;
        totalEnrolled++;
    }

    public void DisplayProfile() {
        Console.WriteLine($"ID: {studentId} | Name: {fullName} | GPA: {gpa:F2}");
    }

    public static int GetTotalCount() => totalEnrolled;
}
\`\`\`

--- PAGE 3 ---
## Experiment 3: Abstract Classes & Interface Implementation
Objective: Design a Bank Account Processing Engine using abstract base classes and multiple interfaces (ITransaction, IAuditable).

Key Invariants & Theoretical Rules:
- Abstract classes cannot be instantiated directly; they serve as base templates.
- An interface defines contract specifications (signatures only) without state.
- C# allows single class inheritance but multiple interface implementation.

--- PAGE 4 ---
## Experiment 5: LINQ (Language Integrated Query) & File Stream I/O
Objective: Perform complex filtering, projection, and aggregation on student datasets using LINQ queries, and serialize records to CSV file streams.

Sample Query:
\`\`\`csharp
var honorsStudents = from s in studentList
                     where s.GPA >= 3.75
                     orderby s.FullName ascending
                     select new { s.StudentId, s.FullName, s.GPA };
\`\`\`

--- PAGE 5 ---
## Viva Questions & Exam Preparation
1. What is the distinction between \`ref\` and \`out\` parameter passing in C#?
2. Explain the Garbage Collection generational model (Gen 0, Gen 1, Gen 2) in CLR.
3. How do Delegates provide type-safe function pointers in .NET?
4. What is the difference between \`Task.Run\` and \`async / await\`?
`,
  },
  {
    id: 'doc-301',
    title: 'Relational Database Fundamentals & SQL',
    fileName: 'DBMS_Sem3_SQL_Fundamentals.pdf',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    sizeBytes: 2202009,
    category: 'notes',
    subject: 'Database Management Systems',
    subjectCode: 'CS301',
    semester: 'Semester 3',
    targetSemester: 3,
    uploadedBy: 'Prof. Rajesh Kumar',
    uploadedById: 'usr-faculty-002',
    uploadedAt: '2026-08-15',
    status: 'published',
    visibility: 'students',
    downloads: 98,
    views: 190,
    extractedText: `
Database Systems Basics - BCA Semester 3
Instructor: Prof. Rajesh Kumar
- ER Modeling: Entities, Attributes, Relationships, Cardinalities.
- SQL DDL, DML, DCL, TCL Commands.
- Joins: INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN.
`,
  },
  {
    id: 'doc-101',
    title: 'Problem Solving & C Programming Fundamentals',
    fileName: 'C_Programming_Sem1.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    sizeBytes: 2516582,
    category: 'notes',
    subject: 'Problem Solving & C Programming',
    subjectCode: 'CS101',
    semester: 'Semester 1',
    targetSemester: 1,
    uploadedBy: 'Dr. Priya Nair',
    uploadedById: 'usr-faculty-001',
    uploadedAt: '2026-08-10',
    status: 'published',
    visibility: 'students',
    downloads: 110,
    views: 220,
    extractedText: `
Problem Solving and C Programming - Unit 1 & 2
Instructor: Dr. Priya Nair | BCA Semester 1
- Algorithms & Flowcharts
- Control structures: if-else, switch-case, for, while, do-while
- Pointers, Arrays, and Memory Allocation
`,
  },
];
