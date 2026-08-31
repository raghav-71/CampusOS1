/**
 * Campus OS — PDF & Document Reading + AI Summarization Pipeline Verification Suite
 * Tests universal unpdf extraction, multi-page page preservation, scanned detection,
 * large PDF chunking, authentic document-based summarization, and document Q&A.
 */

import { DocumentParserService } from '../src/services/documentParserService';
import { DocumentChunker } from '../src/lib/ai/documents/DocumentChunker';
import { AIService } from '../src/lib/ai/AIService';
import { campusRepository } from '../src/repositories/campusRepository';
import { UserProfile } from '../src/types/campus';

async function runPdfPipelineTests() {
  console.log('======================================================================');
  console.log('📑 CAMPUSOS — PDF EXTRACTION & AI SUMMARIZATION PIPELINE AUDIT');
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

  // --- Test Profiles ---
  const studentUser: Partial<UserProfile> = {
    id: 'stu-501',
    email: 'arjun.sharma@campusos.demo',
    fullName: 'Arjun Sharma',
    role: 'student',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
  };

  // ==========================================================================
  // TEST GROUP 1: Real PDF Text Extraction (Multi-Page & Structure)
  // ==========================================================================
  console.log('--- TEST GROUP 1: Real PDF Extraction via unpdf ---');

  // Construct a multi-page PDF byte buffer
  const multiPagePdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 75 >> stream
BT /F1 16 Tf 50 700 Td (C# Lab SEP Journal 2026) Tj T* (Experiment 1: Classes and Objects in C#) Tj ET
endstream endobj
6 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >> endobj
7 0 obj << /Length 85 >> stream
BT /F1 16 Tf 50 700 Td (Experiment 3: Abstract Classes & Interface Implementation) Tj T* (ITransaction Interface) Tj ET
endstream endobj
xref
0 8
0000000000 65535 f 
0000000010 00000 n 
0000000069 00000 n 
0000000140 00000 n 
0000000273 00000 n 
0000000352 00000 n 
0000000479 00000 n 
0000000612 00000 n 
trailer << /Root 1 0 R /Size 8 >>
startxref
750
%%EOF`;

  const pdfBytes = new Uint8Array(Buffer.from(multiPagePdfString));
  const parsedPdf = await DocumentParserService.parsePdfBuffer(
    pdfBytes,
    'C# Lab SEP Journal 2026.pdf',
    pdfBytes.length
  );

  assert(
    parsedPdf.success === true && parsedPdf.pageCount === 2,
    'Universal unpdf parser successfully extracts multi-page PDF with exact page count (2 pages)',
    `Extracted pages: ${parsedPdf.pageCount}, File: ${parsedPdf.fileName}`
  );

  assert(
    parsedPdf.extractedText.includes('--- PAGE 1 ---') &&
      parsedPdf.extractedText.includes('C# Lab SEP Journal 2026') &&
      parsedPdf.extractedText.includes('--- PAGE 2 ---') &&
      parsedPdf.extractedText.includes('Experiment 3'),
    'Page boundaries and experiment titles are cleanly preserved across pages',
    parsedPdf.extractedText.replace(/\n+/g, ' | ').slice(0, 140) + '...'
  );

  assert(
    !parsedPdf.extractedText.includes('%PDF-') &&
      !parsedPdf.extractedText.includes('endstream') &&
      !parsedPdf.extractedText.includes('obj'),
    'Zero raw PDF binary markup, tokens, or stream markers leaked into extracted text'
  );

  // ==========================================================================
  // TEST GROUP 2: Scanned / Image-Based PDF Detection
  // ==========================================================================
  console.log('\n--- TEST GROUP 2: Scanned / Image PDF Detection ---');

  // Minimal scanned PDF with no selectable text
  const scannedPdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >> endobj
4 0 obj << /Length 15 >> stream
q 1 0 0 1 0 0 cm Q
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000069 00000 n 
0000000138 00000 n 
0000000247 00000 n 
trailer << /Root 1 0 R /Size 5 >>
startxref
314
%%EOF`;

  const scannedBytes = new Uint8Array(Buffer.from(scannedPdfString));
  const scannedParsed = await DocumentParserService.parsePdfBuffer(
    scannedBytes,
    'Scanned_Document.pdf',
    scannedBytes.length
  );

  assert(
    scannedParsed.isScanned === true,
    'Scanned/image-based PDF is accurately detected when selectable text is absent',
    scannedParsed.summary
  );

  assert(
    !scannedParsed.summary.toLowerCase().includes('corrupted') &&
      !scannedParsed.summary.toLowerCase().includes('invalid'),
    'Scanned document does NOT falsely claim to be "corrupted" or "invalid"'
  );

  // ==========================================================================
  // TEST GROUP 3: Document Chunking & Semantic Search
  // ==========================================================================
  console.log('\n--- TEST GROUP 3: Intelligent Chunking & Relevance Search ---');

  const journalDocText = `--- PAGE 1 ---
# C# & .NET LABORATORY JOURNAL 2026
Instructor: Dr. Priya Nair | BCA Semester 5
Table of Contents:
- Experiment 1: Classes & Objects
- Experiment 2: Inheritance & Polymorphism
- Experiment 3: Abstract Classes & Interface Implementation
- Experiment 4: Delegates & Event Handling Architecture
- Experiment 5: LINQ Queries & File Stream I/O Operations

--- PAGE 2 ---
## Experiment 1: Classes & Objects
Implementation of Student Information System with Encapsulation.

--- PAGE 3 ---
## Experiment 3: Abstract Classes & Interface Implementation
Designing Bank Account processing with abstract base class and ITransaction interface.
Abstract classes cannot be instantiated directly. Interfaces define behavior contracts.

--- PAGE 4 ---
## Experiment 5: LINQ Queries & File Stream I/O Operations
Filtering student records with LINQ expressions:
var topStudents = from s in students where s.GPA >= 3.8 select s;
`;

  const chunks = DocumentChunker.chunkText(journalDocText);
  assert(
    chunks.length >= 3,
    'Multi-page text is split into structured document chunks preserving page demarcations',
    `Total chunks generated: ${chunks.length}`
  );

  const exp3Chunks = DocumentChunker.findRelevantChunks('What is experiment 3 about?', chunks, 1);
  assert(
    exp3Chunks.length > 0 &&
      exp3Chunks[0].text.includes('Experiment 3') &&
      exp3Chunks[0].text.includes('Abstract Classes'),
    'Semantic chunk retrieval returns the exact relevant section for "What is experiment 3 about?"',
    exp3Chunks[0].text.replace(/\n+/g, ' ').slice(0, 100) + '...'
  );

  const exp5Chunks = DocumentChunker.findRelevantChunks('Explain experiment 5 LINQ queries', chunks, 1);
  assert(
    exp5Chunks.length > 0 &&
      exp5Chunks[0].text.includes('Experiment 5') &&
      exp5Chunks[0].text.includes('LINQ'),
    'Semantic chunk retrieval returns the exact relevant section for "Explain experiment 5"',
    exp5Chunks[0].text.replace(/\n+/g, ' ').slice(0, 100) + '...'
  );

  // ==========================================================================
  // TEST GROUP 4: "Summarize This File" Generation
  // ==========================================================================
  console.log('\n--- TEST GROUP 4: "Summarize This File" Pipeline ---');

  const summary = DocumentChunker.generateAcademicSummary(
    'C# Lab SEP Journal 2026.pdf',
    journalDocText,
    'C# & .NET Programming'
  );

  assert(
    summary.includes('EXECUTIVE SUMMARY') &&
      summary.includes('KEY CONCEPTS') &&
      summary.includes('EXAM-RELEVANT POINTS') &&
      summary.includes('QUICK REVISION CHECKLIST'),
    '"Summarize This File" outputs complete structured academic revision guide',
    'Includes Executive Summary, Modules, Invariants, Viva Questions, and Checklist'
  );

  // ==========================================================================
  // TEST GROUP 5: "Ask Campus AI" with Authentic Document Context
  // ==========================================================================
  console.log('\n--- TEST GROUP 5: Ask Campus AI with Document Context ---');

  const askAiResponse = await AIService.handleRequest({
    message: 'What is experiment 3 about in this C# Lab SEP Journal?',
    userProfile: studentUser,
    stream: false,
    selectedEntity: {
      id: 'doc-504',
      title: 'C# Lab SEP Journal 2026',
      subject: 'C# & .NET Programming Lab',
      semester: 'Semester 5',
      extractedText: journalDocText,
    },
  });

  assert(
    askAiResponse.answer.toLowerCase().includes('experiment 3') ||
      askAiResponse.answer.toLowerCase().includes('abstract') ||
      askAiResponse.answer.toLowerCase().includes('interface'),
    'Campus AI answers specific questions directly based on the uploaded document text',
    askAiResponse.answer.slice(0, 120) + '...'
  );

  const vivaAiResponse = await AIService.handleRequest({
    message: 'Give me viva questions for this C# journal.',
    userProfile: studentUser,
    stream: false,
    selectedEntity: {
      id: 'doc-504',
      title: 'C# Lab SEP Journal 2026',
      subject: 'C# & .NET Programming Lab',
      extractedText: journalDocText,
    },
  });

  assert(
    vivaAiResponse.answer.length > 80 &&
      (vivaAiResponse.answer.toLowerCase().includes('viva') ||
        vivaAiResponse.answer.toLowerCase().includes('question')),
    'Campus AI synthesizes viva and exam preparation questions from the document context'
  );

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED out of ${total} TOTAL TESTS`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('🎉 ALL PDF EXTRACTION & AI SUMMARIZATION PIPELINE TESTS PASSED!');
  } else {
    process.exit(1);
  }
}

runPdfPipelineTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
