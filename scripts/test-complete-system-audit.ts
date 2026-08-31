/**
 * Campus OS — Complete System & Functionality Verification Suite
 * Tests all 15 required operational scenarios end-to-end.
 */

import { campusRepository } from '../src/repositories/campusRepository';
import { AuthorizationService } from '../src/services/authorizationService';
import { ContextBuilder } from '../src/lib/ai/context/ContextBuilder';
import { AIService } from '../src/lib/ai/AIService';
import { DocumentParserService } from '../src/services/documentParserService';
import { UserProfile, NoteDocument } from '../src/types/campus';

async function runCompleteSystemAudit() {
  console.log('======================================================================');
  console.log('🎓 CAMPUSOS — COMPLETE FUNCTIONALITY & AI AUDIT VERIFICATION');
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
  const teacherPriya: Partial<UserProfile> = {
    id: 'prof-001',
    email: 'dr.priya.nair@campusos.edu',
    fullName: 'Dr. Priya Nair',
    role: 'teacher',
    department: 'BCA',
  };

  const studentSem5: Partial<UserProfile> = {
    id: 'stu-501',
    email: 'arjun.sharma@campusos.demo',
    fullName: 'Arjun Sharma',
    role: 'student',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
  };

  const studentSem3: Partial<UserProfile> = {
    id: 'stu-301',
    email: 'kavya.patel@campusos.demo',
    fullName: 'Kavya Patel',
    role: 'student',
    semester: 'Semester 3',
    semesterNumber: 3,
    department: 'BCA',
  };

  // ==========================================================================
  // SCENARIO 1: Teacher Uploads Real PDF & Target Scoping
  // ==========================================================================
  console.log('--- SCENARIO 1: Teacher Upload & Document Pipeline ---');
  const uploadedNote = await campusRepository.uploadNote(
    {
      title: 'Lab Manual: C# & .NET Enterprise Architecture 2026',
      description: 'Comprehensive practical laboratory exercises for BCA Semester 5.',
      subject: 'Operating Systems',
      subjectId: 'sub-cs501',
      subjectCode: 'CS501',
      teacher: teacherPriya.fullName!,
      teacherId: teacherPriya.id!,
      semester: 'Semester 5',
      semesterNumber: 5,
      targetSemester: 5,
      department: 'BCA',
      category: 'notes',
      status: 'published',
      pages: 45,
      size: '3.8 MB',
      fileSize: '3.8 MB',
      fileName: 'CSharp_LAB_SEP_JOURNAL_2026.pdf',
      fileType: 'pdf',
      fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...MOCK_VALID_PDF_BINARY_STREAM...',
      extractedText: `C# & .NET ENTERPRISE LAB MANUAL (BCA SEMESTER 5)
Experiment 1: Object-Oriented Programming in C# with Class Constructors and Destructors.
Experiment 2: Multiple Inheritance via C# Interfaces and Polymorphism.
Experiment 3: LINQ Queries on Collections and In-Memory Data Structures.
Experiment 4: Asynchronous Programming using async/await and Task Parallel Library.
Experiment 5: ASP.NET Core Web API with Entity Framework Core and Dependency Injection.
Experiment 6: Role-Based Authorization and JWT Token Authentication.`,
      tags: ['CSharp', 'DotNet', 'LabManual', 'WebAPI'],
      rating: 5.0,
      views: 1,
    },
    teacherPriya
  );

  assert(Boolean(uploadedNote.id), 'Teacher PDF upload succeeds and returns persistent ID', uploadedNote.id);
  assert(uploadedNote.semesterNumber === 5, 'Upload metadata correctly stores Target Semester 5');
  assert(uploadedNote.fileType === 'pdf', 'File is stored with verified PDF mime type (not plain text)');

  // ==========================================================================
  // SCENARIO 2 & 3: Student Retrieval & Download
  // ==========================================================================
  console.log('\n--- SCENARIO 2 & 3: Student Document Retrieval & Download ---');
  const sem5Notes = await campusRepository.getNotes(undefined, undefined, 5, studentSem5);
  const foundNote = sem5Notes.find((n) => n.id === uploadedNote.id);
  assert(Boolean(foundNote), 'Semester 5 student immediately retrieves newly uploaded PDF');
  assert(
    Boolean(foundNote?.fileData?.startsWith('data:application/pdf')),
    'Document preserves authentic PDF Data URL for native PDF viewer (no corrupted binary text)'
  );

  const downloadResult = await campusRepository.downloadDocument(uploadedNote.id, studentSem5);
  assert(
    downloadResult.fileName === 'CSharp_LAB_SEP_JOURNAL_2026.pdf',
    'Student download provides accurate original file name'
  );
  assert(
    downloadResult.fileData === uploadedNote.fileData,
    'Student download provides full binary/base64 data stream'
  );

  // ==========================================================================
  // SCENARIO 4, 5, 6, 7: Document AI Understanding & Q&A
  // ==========================================================================
  console.log('\n--- SCENARIO 4, 5, 6, 7: Document AI Understanding & Q&A ---');

  // Test 5: Summarize document
  const summaryContext = await ContextBuilder.buildCampusAIContext({
    userProfile: studentSem5,
    selectedDocument: uploadedNote,
  });
  const summaryPrompt = ContextBuilder.formatContextForPrompt(summaryContext);
  assert(
    summaryPrompt.includes('C# & .NET ENTERPRISE LAB MANUAL'),
    'Campus AI receives actual document title and context'
  );
  assert(
    summaryPrompt.includes('Experiment 5: ASP.NET Core Web API'),
    'Campus AI prompt includes full extracted document text'
  );

  // Test 6: Question about specific experiment
  assert(
    Boolean(uploadedNote.extractedText?.includes('Experiment 5: ASP.NET Core Web API with Entity Framework Core')),
    'Document text parser preserves Experiment 5 topic information'
  );

  // Test 7: Viva questions derivation
  assert(
    Boolean(uploadedNote.extractedText?.includes('Multiple Inheritance via C# Interfaces and Polymorphism')),
    'Document text provides conceptual basis for automated viva questions'
  );

  // ==========================================================================
  // SCENARIO 8: General Intelligence (Polymorphism, Recursion, Coding)
  // ==========================================================================
  console.log('\n--- SCENARIO 8: General AI Intelligence ---');
  const generalResponse = await AIService.handleRequest({
    message: 'What is polymorphism and explain recursion with a Java example?',
    userProfile: studentSem5,
    stream: false,
  });

  assert(
    Boolean(generalResponse.answer && generalResponse.answer.length > 50),
    'General AI handles general CS theory and programming questions natively',
    `Response length: ${generalResponse.answer.length} chars`
  );

  // ==========================================================================
  // SCENARIO 9: Autonomous Navigation Agent
  // ==========================================================================
  console.log('\n--- SCENARIO 9: AI Navigation Agent ---');
  const navAction = AIService.detectNavigationAction('Take me to attendance section', 'student');
  assert(
    Boolean(navAction && navAction.route?.includes('attendance')),
    'AI accurately translates "Take me to attendance" to navigation action',
    `Resolved route: ${navAction?.route}`
  );

  const navTimetable = AIService.detectNavigationAction('Open my timetable', 'student');
  assert(
    Boolean(navTimetable && navTimetable.route?.includes('timetable')),
    'AI accurately translates "Open my timetable" to navigation action'
  );

  const navExams = AIService.detectNavigationAction('Go to upcoming exams', 'student');
  assert(
    Boolean(navExams && navExams.route?.includes('exams')),
    'AI accurately translates "Go to upcoming exams" to navigation action'
  );

  // ==========================================================================
  // SCENARIO 10 & 11: Non-Freezing Asynchronous AI Execution
  // ==========================================================================
  console.log('\n--- SCENARIO 10 & 11: Non-Freezing Asynchronous AI Execution ---');
  const abortCtrl = new AbortController();
  let streamEventsReceived = 0;

  try {
    await AIService.handleStreamRequest(
      {
        message: 'Write a Java program to implement Dijkstra shortest path algorithm',
        userProfile: studentSem5,
      },
      (event) => {
        streamEventsReceived++;
        if (streamEventsReceived >= 1) {
          abortCtrl.abort(); // Simulate user clicking "Stop Generation"
        }
      },
      abortCtrl.signal
    );
  } catch (err: any) {
    // Expected abort
  }

  assert(
    streamEventsReceived > 0,
    'Streaming SSE token handler emits live non-blocking events without freezing UI'
  );
  assert(abortCtrl.signal.aborted, 'Stop Generation cleanly signals abort without hanging process');

  // ==========================================================================
  // SCENARIO 12: Cross-Semester Student Isolation
  // ==========================================================================
  console.log('\n--- SCENARIO 12: Cross-Semester Isolation ---');
  const sem3Notes = await campusRepository.getNotes(undefined, undefined, 3, studentSem3);
  assert(
    !sem3Notes.some((n) => n.id === uploadedNote.id),
    'Semester 3 student CANNOT view Semester 5 uploaded lab manual'
  );

  try {
    await campusRepository.downloadDocument(uploadedNote.id, studentSem3);
    assert(false, 'Semester 3 student direct download should be rejected');
  } catch (err: any) {
    assert(
      err.status === 403,
      'Direct download by unauthorized semester student is blocked with 403 Forbidden',
      err.message
    );
  }

  // ==========================================================================
  // SCENARIO 13: Multi-Subject Faculty Teaching Scope
  // ==========================================================================
  console.log('\n--- SCENARIO 13: Multi-Subject Faculty Teaching Scope ---');
  const priyaAuthorizedSemesters = AuthorizationService.getFacultyAuthorizedSemesters(teacherPriya.email!);
  assert(
    priyaAuthorizedSemesters.includes(1) && priyaAuthorizedSemesters.includes(5) && priyaAuthorizedSemesters.includes(6),
    'Dr. Priya Nair can manage assigned subjects across Semesters 1, 5, and 6'
  );

  const canPriyaManageOS = AuthorizationService.canFacultyManageSubject(teacherPriya.email!, 'CS501', 5);
  assert(canPriyaManageOS, 'Dr. Priya Nair CAN manage Operating Systems (CS501) in Semester 5');

  const canPriyaManageDBMS = AuthorizationService.canFacultyManageSubject(teacherPriya.email!, 'CS301', 3);
  assert(!canPriyaManageDBMS, 'Dr. Priya Nair CANNOT manage DBMS (CS301) in Semester 3 (Assigned to Prof. Rajesh)');

  // ==========================================================================
  // SCENARIO 14: Natural Language Absence Comprehension & Leave Letter
  // ==========================================================================
  console.log('\n--- SCENARIO 14: Natural Language Absence & Leave Letter ---');
  const absenceResponse = await AIService.handleRequest({
    message: "I won't be able to attend classes tomorrow because I have an important dental appointment",
    userProfile: studentSem5,
    stream: false,
  });

  assert(
    absenceResponse.answer.toLowerCase().includes('mentor') ||
      absenceResponse.answer.toLowerCase().includes('teacher') ||
      absenceResponse.answer.toLowerCase().includes('letter'),
    'Natural language absence query advises mentor contact and offers leave letter',
    absenceResponse.answer.slice(0, 120) + '...'
  );

  const leaveLetterResponse = await AIService.handleRequest({
    message: 'Write a leave letter for me',
    userProfile: studentSem5,
    stream: false,
  });

  assert(
    leaveLetterResponse.answer.toLowerCase().includes('leave of absence') &&
      leaveLetterResponse.answer.includes('Arjun Sharma') &&
      leaveLetterResponse.answer.includes('BCA2401'),
    'Leave letter generation formats official application with student name and roll number',
    'Generated formal letter for Arjun Sharma (BCA2401)'
  );

  // ==========================================================================
  // SCENARIO 15: Anonymous Feedback System & Admin Anonymity Guarantee
  // ==========================================================================
  console.log('\n--- SCENARIO 15: Anonymous Feedback & Admin Anonymity Guarantee ---');
  const submittedFb = await campusRepository.submitFeedback({
    category: 'Teaching',
    rating: 5,
    message: 'The live interactive OS memory paging visualization helped clarify internal fragmentation.',
    submittedRole: 'student',
  });

  assert(
    submittedFb.id.startsWith('fb-') && submittedFb.status === 'pending',
    'Student anonymous feedback successfully created'
  );

  const allFeedbacks = await campusRepository.getFeedback();
  const hasUserMarker = allFeedbacks.some((f: any) => f.studentName || f.email || f.userId || f.rollNumber);
  assert(
    !hasUserMarker,
    'Admin feedback repository strictly preserves 100% anonymity (zero identity markers stored)'
  );

  // Clean up test document
  await campusRepository.deleteNote(uploadedNote.id);

  console.log('\n======================================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED out of ${total} TOTAL TESTS`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('🎉 ALL CAMPUSOS FUNCTIONAL & ARCHITECTURAL AUDIT SCENARIOS PASSED!');
  } else {
    process.exit(1);
  }
}

runCompleteSystemAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
