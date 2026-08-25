/**
 * Local Document Pipeline & Lightweight RAG
 * Chunks, indexes, and retrieves relevant snippets from question papers, syllabus, and lecture notes.
 */

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  subject: string;
  semester?: number;
  text: string;
  page?: number;
  tags: string[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  matchedTerms: string[];
}

class DocumentPipeline {
  private chunks: DocumentChunk[] = [];

  constructor() {
    this.initDefaultAcademicCorpus();
  }

  private initDefaultAcademicCorpus() {
    this.chunks = [
      // Operating Systems
      {
        id: 'chk-os-001',
        docId: 'qp-os-mid2026',
        docTitle: 'Operating Systems Mid-Term Question Paper 2026',
        subject: 'Operating Systems',
        semester: 5,
        text: 'Section A: Process synchronization, critical section problem, Peterson algorithm, and Semaphores. Dining philosophers problem implementation using mutex.',
        tags: ['os', 'synchronization', 'semaphores', 'critical section', 'mutex'],
      },
      {
        id: 'chk-os-002',
        docId: 'qp-os-mid2026',
        docTitle: 'Operating Systems Mid-Term Question Paper 2026',
        subject: 'Operating Systems',
        semester: 5,
        text: 'Section B: Memory management, paging vs segmentation, virtual memory, demand paging, and page replacement algorithms (FIFO, LRU, Optimal). Calculate page faults for reference string.',
        tags: ['os', 'memory management', 'paging', 'virtual memory', 'page replacement', 'lru', 'fifo'],
      },
      {
        id: 'chk-os-003',
        docId: 'qp-os-end2025',
        docTitle: 'Operating Systems End-Term Question Paper 2025',
        subject: 'Operating Systems',
        semester: 5,
        text: 'Deadlock characteristics (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait). Bankers algorithm for deadlock avoidance with resource allocation matrices.',
        tags: ['os', 'deadlock', 'bankers algorithm', 'deadlock avoidance'],
      },

      // Database Management Systems (DBMS)
      {
        id: 'chk-dbms-001',
        docId: 'qp-dbms-mid2026',
        docTitle: 'DBMS Mid-Term Question Paper 2026',
        subject: 'Database Management Systems',
        semester: 5,
        text: 'Question 1: Explain Database Normalization. Differentiate between 1NF, 2NF, 3NF, and BCNF with student database relations. Lossless decomposition and dependency preservation.',
        tags: ['dbms', 'normalization', '1nf', '2nf', '3nf', 'bcnf', 'functional dependency'],
      },
      {
        id: 'chk-dbms-002',
        docId: 'qp-dbms-mid2026',
        docTitle: 'DBMS Mid-Term Question Paper 2026',
        subject: 'Database Management Systems',
        semester: 5,
        text: 'Question 2: Transaction management and ACID properties. Serializability testing using precedence graph. Concurrency control protocols: Two-Phase Locking (2PL) and Timestamp Ordering.',
        tags: ['dbms', 'transactions', 'acid', 'concurrency', '2pl', 'serializability'],
      },
      {
        id: 'chk-dbms-003',
        docId: 'notes-dbms-indexing',
        docTitle: 'DBMS Chapter 8 Lecture Notes: Indexing & B-Trees',
        subject: 'Database Management Systems',
        semester: 5,
        text: 'B+ Tree index structure. Search, insertion, and deletion algorithms. Primary versus secondary indexing, clustered vs unclustered indices.',
        tags: ['dbms', 'b+ tree', 'indexing', 'b-trees'],
      },

      // Computer Networks
      {
        id: 'chk-cn-001',
        docId: 'qp-cn-mid2026',
        docTitle: 'Computer Networks Mid-Term Question Paper 2026',
        subject: 'Computer Networks',
        semester: 5,
        text: 'OSI 7-layer reference model versus TCP/IP protocol suite. Subnetting calculations (CIDR /24, /26), IPv4 header structure, and ARP protocol.',
        tags: ['cn', 'networks', 'osi model', 'tcp/ip', 'subnetting', 'cidr', 'ipv4'],
      },
      {
        id: 'chk-cn-002',
        docId: 'qp-cn-mid2026',
        docTitle: 'Computer Networks Mid-Term Question Paper 2026',
        subject: 'Computer Networks',
        semester: 5,
        text: 'Transport layer: TCP 3-way handshake, flow control with sliding window, congestion control (Slow Start, Congestion Avoidance, Fast Retransmit).',
        tags: ['cn', 'tcp', 'handshake', 'flow control', 'sliding window', 'congestion control'],
      },

      // Java Programming
      {
        id: 'chk-java-001',
        docId: 'qp-java-mid2026',
        docTitle: 'Java Programming Mid-Term Question Paper 2026',
        subject: 'Java Programming',
        semester: 5,
        text: 'Object-oriented programming in Java: Inheritance, polymorphism, abstract classes versus interfaces. Multithreading using Thread class and Runnable interface with synchronization.',
        tags: ['java', 'oop', 'polymorphism', 'inheritance', 'interfaces', 'threads', 'concurrency'],
      },
    ];
  }

  addDocument(docId: string, title: string, subject: string, text: string, semester?: number) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    paragraphs.forEach((p, idx) => {
      this.chunks.push({
        id: `chk-${docId}-${idx + 1}`,
        docId,
        docTitle: title,
        subject,
        semester,
        text: p.trim(),
        tags: this.extractKeywords(p),
      });
    });
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'were', 'what'].includes(w));
  }

  search(query: string, filterSubject?: string, topK: number = 3): SearchResult[] {
    const queryTerms = this.extractKeywords(query);
    if (queryTerms.length === 0) return [];

    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      if (filterSubject && filterSubject !== 'all' && !chunk.subject.toLowerCase().includes(filterSubject.toLowerCase())) {
        continue;
      }

      let score = 0;
      const matchedTerms: string[] = [];
      const chunkText = chunk.text.toLowerCase();

      for (const term of queryTerms) {
        if (chunk.tags.includes(term)) {
          score += 3;
          matchedTerms.push(term);
        } else if (chunkText.includes(term)) {
          score += 1.5;
          matchedTerms.push(term);
        }
      }

      if (score > 0) {
        results.push({ chunk, score, matchedTerms });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  getAllDocuments() {
    const map = new Map<string, { docId: string; docTitle: string; subject: string; chunksCount: number }>();
    for (const c of this.chunks) {
      if (!map.has(c.docId)) {
        map.set(c.docId, { docId: c.docId, docTitle: c.docTitle, subject: c.subject, chunksCount: 0 });
      }
      map.get(c.docId)!.chunksCount++;
    }
    return Array.from(map.values());
  }
}

export const documentPipeline = new DocumentPipeline();
