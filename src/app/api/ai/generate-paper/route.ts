import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subject, topics, difficulty, totalMarks, semester } = await request.json();

    const marks = totalMarks || 100;
    const diff = difficulty || 'Moderate';
    const sub = subject || 'Operating Systems (CS501)';

    const partAMarks = marks === 100 ? 20 : marks === 50 ? 10 : 5;
    const partBMarks = marks - partAMarks;

    const paper = {
      title: `${sub} — ${diff} Level Examination Paper`,
      subject: sub,
      semester: semester || 'Semester 5',
      difficulty: diff,
      totalMarks: marks,
      duration: marks === 100 ? '3 Hours' : marks === 50 ? '90 Minutes' : '45 Minutes',
      generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      partA: {
        title: `PART A (Short Answer & Conceptual — ${partAMarks} Marks)`,
        questions: [
          '1. Define the term "Thrashing" in virtual memory systems and state its primary cause. (2 Marks)',
          '2. Explain the purpose of the Translation Lookaside Buffer (TLB) with a block diagram. (2 Marks)',
          '3. What is a Critical Section Problem? State the three requirements for a valid solution. (2 Marks)',
          '4. Differentiate between internal and external fragmentation with examples. (2 Marks)',
          '5. State the four Coffman conditions necessary for deadlock to occur. (2 Marks)',
        ],
      },
      partB: {
        title: `PART B (Analytical & Problem-Solving — ${partBMarks} Marks)`,
        questions: [
          '6. Consider the following reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2. Compute the number of page faults using (a) FIFO, (b) LRU, and (c) Optimal replacement for 3 frames. (15 Marks)',
          '7. Explain the Banker’s Algorithm for Deadlock Avoidance. Given 5 processes P0–P4 and 3 resource types (A:10, B:5, C:7), determine if the system is in a safe state and find the safe sequence. (15 Marks)',
          '8. (a) Discuss CPU Scheduling criteria.\n(b) Compare Round Robin vs Shortest Job First with Gantt charts on a given workload. (15 Marks)',
          '9. Describe the Disk Scheduling algorithms: FCFS, SSTF, SCAN, and C-SCAN with track seek head movement simulations. (15 Marks)',
        ],
      },
      answerKey: {
        rubrics: [
          'Part A: 2 Marks each for accurate definition, mathematical formula, or block diagram.',
          'Part B Q6: 5 marks per replacement table, page fault count, and hit ratio calculation.',
          'Part B Q7: 5 marks for Need Matrix calculation, 5 marks for safety vector iteration, 5 marks for final safe sequence.',
        ],
      },
    };

    return NextResponse.json({ paper, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
