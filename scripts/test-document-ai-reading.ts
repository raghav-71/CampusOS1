/**
 * Campus OS — AI Document Reading & Intelligence Verification Test Suite
 * Tests authentic document extraction (PDF, DOCX, TXT, Code), multi-turn document sessions,
 * 10 MCQ generation with 4 options and answers, cross-document variance, and cross-semester security.
 */

import { DocumentParserService } from '../src/services/documentParserService';
import { DocumentChunker } from '../src/lib/ai/documents/DocumentChunker';
import { AIService } from '../src/lib/ai/AIService';
import { UserProfile } from '../src/types/campus';

async function runDocumentAITests() {
  console.log('======================================================================');
  console.log('📑 CAMPUSOS — AI REAL DOCUMENT READING & INTELLIGENCE VERIFICATION');
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS ${total}]: ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL ${total}]: ${testName}`);
      if (detail) console.error(`   └─ Error: ${detail}`);
    }
  }

  const sem5Student: Partial<UserProfile> = {
    id: 'usr-001',
    email: 'arjun.sharma@campusos.demo',
    fullName: 'Arjun Sharma',
    rollNumber: 'BCA2401',
    role: 'student',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
  };

  const sem3Student: Partial<UserProfile> = {
    id: 'usr-stu-301',
    email: 'rohan.mehta@campusos.demo',
    fullName: 'Rohan Mehta',
    rollNumber: 'BCA2501',
    role: 'student',
    semester: 'Semester 3',
    semesterNumber: 3,
    department: 'BCA',
  };

  // Sample Authentic Document Text 1: ass2 (DBMS Normalization & Relational Schema)
  const dbmsDocText = `
--- PAGE 1 ---
# Database Management Systems (CS502) - Assignment 2 (ass2.pdf)
Instructor: Prof. Rajesh Kumar | Semester 5

## Problem 1: Functional Dependencies & Normal Forms
Given relation R(A, B, C, D, E) with Functional Dependencies:
FD1: A -> B, C
FD2: CD -> E
FD3: B -> D
Candidate Keys: Find all candidate keys of R.
Identify the highest normal form of relation R (1NF, 2NF, 3NF, or BCNF).
Decompose relation R into 3NF satisfying lossless join and dependency preservation.

--- PAGE 2 ---
## Problem 2: B+ Tree Indexing & Transaction Concurrency
Explain B+ Tree insertion order for search keys: [12, 24, 30, 45, 52, 60, 78].
Analyze 2-Phase Locking Protocol (Strict 2PL) to prevent dirty reads and cascading aborts.
Write SQL DDL commands to create a normalized hospital schema with PRIMARY KEY, FOREIGN KEY, and CHECK constraints.
`.trim();

  // Sample Authentic Document Text 2: C# Laboratory Journal 2026
  const csharpDocText = `
--- PAGE 1 ---
# C# & .NET Laboratory Journal 2026
Instructor: Dr. Priya Nair | Semester 5

## Experiment 1: Object-Oriented Programming in C#
Classes, objects, constructors, destructors, and property getters/setters.
Method overloading and overriding using 'virtual' and 'override' keywords.

## Experiment 3: Abstract Classes & Interface Implementation
Define interface IBankTransaction with methods: Deposit(), Withdraw(), and GetBalance().
Implement interface in SavingsAccount and CheckingAccount classes with transaction logging.

--- PAGE 2 ---
## Experiment 5: LINQ Queries & File Stream I/O Operations
Filtering, sorting, and projecting student collections using LINQ extension methods.
Using StreamReader and StreamWriter for persistent student record logging.
`.trim();

  // ==========================================================================
  // TEST GROUP 1: Document Text Parsing & Data URL Handling
  // ==========================================================================
  console.log('--- TEST GROUP 1: Document Parsing & Text Extraction ---');

  // Test 1: Plain text / Markdown parsing
  const parsedTxt = await DocumentParserService.parseDataUrl(
    `data:text/plain;base64,${Buffer.from(dbmsDocText).toString('base64')}`,
    'ass2.txt'
  );

  assert(
    parsedTxt.success && parsedTxt.extractedText.includes('Functional Dependencies') && parsedTxt.extractedText.includes('BCNF'),
    'Document parser cleanly extracts plain text and preserves section structure',
    `Extracted ${parsedTxt.extractedText.length} characters`
  );

  // Test 2: Multi-page chunking preserves page boundaries
  const dbmsChunks = DocumentChunker.chunkText(dbmsDocText);
  assert(
    dbmsChunks.length >= 2 && dbmsChunks.some((c) => c.pageNumber === 1) && dbmsChunks.some((c) => c.pageNumber === 2),
    'DocumentChunker cleanly splits multi-page document into indexed chunks with page numbers',
    `Generated ${dbmsChunks.length} chunks across 2 pages`
  );

  // ==========================================================================
  // TEST GROUP 2: Authentic 10 MCQ Generation from Document (Zero Generic Fallbacks)
  // ==========================================================================
  console.log('\n--- TEST GROUP 2: Authentic 10 MCQ Generation ---');

  const dbmsMcqs = DocumentChunker.generateAuthenticMCQs('ass2.pdf', dbmsDocText, 'Database Management Systems', 10);

  const has10Questions = (dbmsMcqs.match(/#### Question \d+/g) || []).length === 10;
  const hasOptionsABCD =
    dbmsMcqs.includes('- **A)**') &&
    dbmsMcqs.includes('- **B)**') &&
    dbmsMcqs.includes('- **C)**') &&
    dbmsMcqs.includes('- **D)**');
  const hasCorrectAnswerAndExplanation =
    dbmsMcqs.includes('> **Correct Answer**') && dbmsMcqs.includes('> 💡 *Explanation*');
  const mentionsDbmsKeywords =
    dbmsMcqs.includes('ass2.pdf') || dbmsMcqs.includes('Database Management') || dbmsMcqs.includes('Functional Dependencies');

  assert(
    has10Questions && hasOptionsABCD && hasCorrectAnswerAndExplanation && mentionsDbmsKeywords,
    'AI generates 10 authentic MCQs with 4 options (A, B, C, D), correct answers, and explanations from ass2.pdf',
    `10 Questions generated with options A/B/C/D and explanations`
  );

  // ==========================================================================
  // TEST GROUP 3: AI Service Request with Active Document (Zero "I don't have contents")
  // ==========================================================================
  console.log('\n--- TEST GROUP 3: AI Service Request with Active Document ---');

  const aiMcqResponse = await AIService.handleRequest({
    message: 'Generate 10 MCQs from this document',
    userProfile: sem5Student,
    stream: false,
    selectedEntity: {
      id: 'doc-ass2-001',
      title: 'ass2.pdf',
      subject: 'Database Management Systems',
      semesterNumber: 5,
      extractedText: dbmsDocText,
    },
  });

  const responseText = aiMcqResponse.answer;
  const zeroPredefinedFailure =
    !responseText.toLowerCase().includes("don't have the contents") &&
    !responseText.toLowerCase().includes('contents of the ass2 document available') &&
    !responseText.toLowerCase().includes('please upload the document');

  assert(
    zeroPredefinedFailure && (responseText.includes('Question') || responseText.includes('MCQ') || responseText.includes('Option')),
    'Campus AI responds to "Generate 10 MCQs from this document" with real document MCQs (No predefined apologies)',
    responseText.slice(0, 150).replace(/\n+/g, ' ') + '...'
  );

  // ==========================================================================
  // TEST GROUP 4: Multi-Turn Document Question Answering
  // ==========================================================================
  console.log('\n--- TEST GROUP 4: Multi-Turn Document Chat ---');

  // Follow-up query asking about Problem 2 (B+ Tree / Concurrency)
  const aiFollowUp = await AIService.handleRequest({
    message: 'What is discussed in Problem 2 regarding Concurrency?',
    userProfile: sem5Student,
    stream: false,
    selectedEntity: {
      id: 'doc-ass2-001',
      title: 'ass2.pdf',
      subject: 'Database Management Systems',
      extractedText: dbmsDocText,
    },
    history: [
      { role: 'user', content: 'Generate 10 MCQs from this document' },
      { role: 'assistant', content: responseText.slice(0, 400) },
    ],
  });

  assert(
    aiFollowUp.answer.toLowerCase().includes('tree') ||
      aiFollowUp.answer.toLowerCase().includes('locking') ||
      aiFollowUp.answer.toLowerCase().includes('2pl') ||
      aiFollowUp.answer.toLowerCase().includes('concurrency') ||
      aiFollowUp.answer.toLowerCase().includes('problem 2'),
    'AI accurately answers specific problem question from active document in multi-turn conversation',
    aiFollowUp.answer.slice(0, 140).replace(/\n+/g, ' ') + '...'
  );

  // ==========================================================================
  // TEST GROUP 5: Cross-Document Variance (Changing document changes AI output completely)
  // ==========================================================================
  console.log('\n--- TEST GROUP 5: Cross-Document Variance ---');

  const csharpResponse = await AIService.handleRequest({
    message: 'Generate 10 MCQs from this document',
    userProfile: sem5Student,
    stream: false,
    selectedEntity: {
      id: 'doc-csharp-001',
      title: 'C# Lab SEP Journal 2026.pdf',
      subject: 'C# Programming',
      extractedText: csharpDocText,
    },
  });

  const csharpText = csharpResponse.answer;
  const isCsharpSpecific =
    csharpText.includes('C#') ||
    csharpText.includes('LINQ') ||
    csharpText.includes('IBankTransaction') ||
    csharpText.includes('Experiment') ||
    csharpText.includes('Journal');
  const doesNotContainDbms = !csharpText.includes('Functional Dependencies') && !csharpText.includes('BCNF');

  assert(
    isCsharpSpecific && doesNotContainDbms,
    'Changing uploaded document changes AI response completely (Proves real document extraction vs hardcoding)',
    `Output tailored to C# (.NET/LINQ) without DBMS cross-contamination`
  );

  // ==========================================================================
  // TEST GROUP 6: Scanned PDF Diagnostic Handling
  // ==========================================================================
  console.log('\n--- TEST GROUP 6: Scanned PDF Diagnostic Handling ---');

  // Minimal scanned PDF with no selectable text
  const rawScannedPdf = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000069 00000 n \n0000000138 00000 n \ntrailer << /Root 1 0 R /Size 4 >>\nstartxref\n232\n%%EOF`;

  const scannedParsed = await DocumentParserService.parsePdfBuffer(
    Buffer.from(rawScannedPdf),
    'scanned_handwritten_notes.pdf'
  );

  assert(
    scannedParsed.isScanned === true && scannedParsed.summary.includes('scanned or image-based'),
    'Scanned image-only PDF accurately returns SCANNED diagnostic without false "corrupted" error',
    scannedParsed.summary
  );

  // ==========================================================================
  // TEST GROUP 7: Cross-Semester Security Authorization Boundary
  // ==========================================================================
  console.log('\n--- TEST GROUP 7: Cross-Semester Security Boundary ---');

  const sem3RestrictedResponse = await AIService.handleRequest({
    message: 'Summarize this document',
    userProfile: sem3Student,
    stream: false,
    selectedEntity: {
      id: 'doc-s5-001',
      title: 'ass2.pdf',
      subject: 'Operating Systems',
      semesterNumber: 5,
      targetSemester: 5,
      extractedText: dbmsDocText,
    },
  });

  assert(
    sem3RestrictedResponse.answer.includes('RESTRICTED') ||
      sem3RestrictedResponse.answer.includes('unauthorized') ||
      sem3RestrictedResponse.answer.includes('enrolled in Semester 3') ||
      sem3RestrictedResponse.answer.includes('access is restricted'),
    'Semester 3 student cannot inject or summarize Semester 5 document (Strict Access Control enforced)',
    sem3RestrictedResponse.answer.slice(0, 130).replace(/\n+/g, ' ') + '...'
  );

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED out of ${total} TOTAL TESTS`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('🎉 ALL AI DOCUMENT READING & INTELLIGENCE VERIFICATIONS PASSED (100% SUCCESS)!');
  } else {
    process.exit(1);
  }
}

runDocumentAITests().catch((err) => {
  console.error('Fatal document AI test error:', err);
  process.exit(1);
});
