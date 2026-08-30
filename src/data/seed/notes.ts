import { NoteDocument } from '@/types/campus';

export interface SeedNoteWithContent extends NoteDocument {
  extractedText: string;
}

export const seedNotes: SeedNoteWithContent[] = [
  // Semester 5 Notes
  {
    id: 'note-501',
    title: 'DBMS Unit 3: Normalization & Query Optimization',
    subject: 'Database Management Systems',
    subjectId: 'subj-502',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
    teacher: 'Prof. Rajesh Kumar',
    teacherId: 'usr-faculty-002',
    tags: ['DBMS', 'Normalization', '3NF', 'BCNF', 'Indexing'],
    uploadedAt: '2026-08-20',
    downloads: 142,
    pages: 28,
    size: '3.8 MB',
    fileSize: '3.8 MB',
    isNew: false,
    rating: 4.9,
    views: 310,
    description: 'Comprehensive study notes on Functional Dependencies, 1NF to BCNF, lossless join decomposition, and B+ Tree indexes.',
    extractedText: `
DBMS Lecture Notes - Unit 3: Normalization & Indexing
Instructor: Prof. Rajesh Kumar | BCA Semester 5
1. Database Anomalies:
   - Insertion, Update, and Deletion anomalies in unnormalized relations.
2. Functional Dependencies:
   - Definition: X -> Y holds if whenever two tuples agree on X, they must agree on Y.
   - Armstrong Axioms: Reflexivity, Augmentation, Transitivity.
3. Normal Forms:
   - 1NF: Atomic values only, no multi-valued or composite attributes.
   - 2NF: In 1NF + No partial dependency (every non-prime attribute is fully functionally dependent on primary key).
   - 3NF: In 2NF + No transitive dependency (if X -> Y and Y is non-prime, X must be a superkey).
   - BCNF: For every non-trivial functional dependency X -> Y, X MUST be a superkey.
4. Indexing:
   - Dense vs Sparse Indexing.
   - B+ Trees: Internal nodes store keys for routing, leaf nodes contain data records/pointers in a doubly linked list.
`,
  },
  {
    id: 'note-502',
    title: 'Operating Systems: Virtual Memory & Deadlock Avoidance',
    subject: 'Operating Systems',
    subjectId: 'subj-501',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
    teacher: 'Dr. Priya Nair',
    teacherId: 'usr-faculty-001',
    tags: ['OS', 'Deadlocks', 'Bankers Algorithm', 'Paging', 'TLB'],
    uploadedAt: '2026-08-22',
    downloads: 189,
    pages: 34,
    size: '4.2 MB',
    fileSize: '4.2 MB',
    isNew: true,
    rating: 4.8,
    views: 420,
    description: 'Detailed analysis of Paging, Segmentation, TLB cache hit ratio calculations, Banker’s Algorithm safety state, and page replacement algorithms.',
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
    id: 'note-503',
    title: 'Computer Networks: CIDR Subnetting & Routing Algorithms',
    subject: 'Computer Networks',
    subjectId: 'subj-503',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
    teacher: 'Dr. Amit Sen',
    teacherId: 'usr-faculty-003',
    tags: ['Networks', 'CIDR', 'Subnetting', 'OSI', 'Routing'],
    uploadedAt: '2026-08-18',
    downloads: 165,
    pages: 22,
    size: '2.9 MB',
    fileSize: '2.9 MB',
    isNew: false,
    rating: 4.7,
    views: 280,
    description: 'Practical guide to IPv4/IPv6 addressing, Variable Length Subnet Masking (VLSM), Dijkstra link-state routing, and Distance Vector Bellman-Ford.',
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

  // Semester 3 Notes
  {
    id: 'note-301',
    title: 'Relational Database Fundamentals & SQL',
    subject: 'Database Management Systems',
    subjectId: 'subj-301',
    semester: 'Semester 3',
    semesterNumber: 3,
    department: 'BCA',
    teacher: 'Prof. Rajesh Kumar',
    teacherId: 'usr-faculty-002',
    tags: ['DBMS', 'SQL', 'Relational Algebra', 'Keys'],
    uploadedAt: '2026-08-15',
    downloads: 98,
    pages: 18,
    size: '2.1 MB',
    fileSize: '2.1 MB',
    isNew: false,
    rating: 4.6,
    views: 190,
    description: 'Introduction to ER modeling, primary & foreign keys, SQL joins, aggregate functions, and nested subqueries.',
    extractedText: `
Database Systems Basics - BCA Semester 3
Instructor: Prof. Rajesh Kumar
- ER Modeling: Entities, Attributes, Relationships, Cardinalities.
- SQL DDL, DML, DCL, TCL Commands.
- Joins: INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN.
`,
  },
];
