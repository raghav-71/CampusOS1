import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface AIResponse {
  answer: string;
  category: 'explanation' | 'quiz' | 'code' | 'general';
  quizData?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const academicKnowledgeBase: Record<string, string> = {
  'virtual memory': `**Virtual Memory** is a memory management capability that provides an idealized abstraction of the storage resources that are actually available on a given machine.\n\n### Key Mechanisms:\n1. **Paging:** Divides virtual address space into equal pages (usually 4KB), mapped to physical frames via the **Page Table**.\n2. **Translation Lookaside Buffer (TLB):** Hardware cache for rapid address translation.\n3. **Page Fault Handling:** When an unmapped page is referenced, the OS swaps it from disk (swap space) into RAM using replacement heuristics (LRU, FIFO, Clock).`,
  'bcnf': `**Boyce-Codd Normal Form (BCNF)** is an advanced stage of database normalization that is strictly stronger than 3NF.\n\n### Formal Definition:\nA relational schema $R$ is in BCNF if for every non-trivial functional dependency $X \\rightarrow Y$, **$X$ is a Super Key** of $R$.\n\n- **Eliminates:** All redundancy based on functional dependencies.\n- **3NF vs BCNF:** 3NF allows $X \\rightarrow Y$ if $Y$ is a prime attribute; BCNF disallows this.`,
  'tcp': `**TCP (Transmission Control Protocol)** provides reliable, ordered, and error-checked stream delivery over IP networks.\n\n### 3-Way Handshake (Connection Establishment):\n1. **SYN:** Client sends SYN packet (seq = $x$).\n2. **SYN-ACK:** Server responds with SYN-ACK (seq = $y$, ack = $x+1$).\n3. **ACK:** Client sends ACK packet (ack = $y+1$). Connection is **ESTABLISHED**.\n\n### Features:\n- Sliding Window Flow Control\n- Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit)`,
  'dijkstra': `**Dijkstra’s Algorithm** computes the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.\n\n### Complexity:\n- Using Min-Heap (Priority Queue): $\\mathcal{O}((V + E) \\log V)$\n- Using Fibonacci Heap: $\\mathcal{O}(E + V \\log V)$\n\n*Note:* If edges contain negative weights, use the **Bellman-Ford Algorithm** ($\\\\mathcal{O}(VE)$).`,
};

export async function POST(request: NextRequest) {
  try {
    const { message, mode, subject } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();

    // Mode 1: Quiz Generator
    if (mode === 'quiz' || lower.includes('quiz') || lower.includes('question')) {
      return NextResponse.json({
        category: 'quiz',
        answer: 'Here is a practice multiple-choice question on Operating Systems:',
        quizData: {
          question: 'Which of the following page replacement algorithms does NOT suffer from Belady’s Anomaly?',
          options: ['FIFO (First-In, First-Out)', 'LRU (Least Recently Used)', 'Random Replacement', 'Second-Chance Algorithm'],
          correctIndex: 1,
          explanation: 'LRU is a stack-based algorithm. Stack algorithms never exhibit Belady’s anomaly when the number of frames increases.',
        },
      });
    }

    // Mode 2: Code Debugger
    if (mode === 'code' || lower.includes('code') || lower.includes('debug') || lower.includes('function')) {
      return NextResponse.json({
        category: 'code',
        answer: `### Code Analysis & Bug Diagnosis ✨\n\n**Identified Issue:** Off-by-one boundary condition in array indexing and unreleased dynamic memory.\n\n\`\`\`c\n// Optimized & Fixed Implementation:\nvoid reverseArray(int arr[], int n) {\n    int left = 0, right = n - 1;\n    while (left < right) {\n        int temp = arr[left];\n        arr[left] = arr[right];\n        arr[right] = temp;\n        left++;\n        right--;\n    }\n}\n\`\`\`\n\n- **Time Complexity:** $\\mathcal{O}(n)$ linear scan\n- **Space Complexity:** $\\mathcal{O}(1)$ auxiliary in-place swap`,
      });
    }

    // Mode 3: Concept Explanations
    for (const [key, responseText] of Object.entries(academicKnowledgeBase)) {
      if (lower.includes(key)) {
        return NextResponse.json({
          category: 'explanation',
          answer: responseText,
        });
      }
    }

    // General academic tutor fallback
    return NextResponse.json({
      category: 'general',
      answer: `### CampusOS AI Study Assistant ✨\n\nHere is a structured overview regarding **"${message}"** for ${subject || 'Computer Applications'}:\n\n1. **Core Concept:** This topic forms a foundational pillar in undergraduate computer science curriculum, directly tested in university examinations.\n2. **Practical Application:** Widely applied in systems programming, database query optimization, and enterprise networking.\n3. **Exam Tip:** Ensure you draw the architectural block diagram and write formal time/space complexities when answering in final exams!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
