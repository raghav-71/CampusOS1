import { campusRepository } from '../src/repositories/campusRepository';
import { AuthorizationService } from '../src/services/authorizationService';
import { ContextBuilder } from '../src/lib/ai/context/ContextBuilder';
import { NoteDocument, UserProfile } from '../src/types/campus';

async function runEndToEndVerification() {
  console.log('===========================================================');
  console.log('CAMPUSOS: FACULTY -> STUDENT CONTENT DELIVERY VERIFICATION');
  console.log('===========================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    }
  }

  // Define User Profiles
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

  // 1. Check Faculty Authorized Semesters & Subjects
  console.log('\n--- Phase 1: Faculty Scope & Targeting Verification ---');
  const priyaSemesters = AuthorizationService.getFacultyAuthorizedSemesters(teacherPriya.email!);
  assert(priyaSemesters.includes(5) && priyaSemesters.includes(1), 'Dr. Priya Nair is authorized for Semesters 1, 5, and 6');
  assert(!priyaSemesters.includes(3) && !priyaSemesters.includes(4), 'Dr. Priya Nair is NOT authorized for Semesters 3 and 4');

  const priyaSem5Subjects = AuthorizationService.getFacultyAuthorizedSubjects(teacherPriya.email!, 5);
  assert(priyaSem5Subjects.some(s => s.subjectName === 'Operating Systems'), 'Dr. Priya Nair can target Operating Systems in Semester 5');

  // 2. Faculty Uploads & Publishes Note
  console.log('\n--- Phase 2: Faculty Content Upload & Publishing ---');
  const noteUploadPayload = {
    title: 'Unit 4 — Process Synchronization & Classical IPC Problems',
    description: 'Comprehensive guide covering Dining Philosophers, Readers-Writers problem, and Peterson Algorithm.',
    subject: 'Operating Systems',
    subjectId: 'sub-cs501',
    subjectCode: 'CS501',
    teacher: teacherPriya.fullName!,
    teacherId: teacherPriya.id!,
    semester: 'Semester 5',
    semesterNumber: 5 as const,
    targetSemester: 5 as const,
    category: 'notes' as const,
    status: 'published' as const,
    pages: 28,
    fileSize: '4.2 MB',
    fileName: 'OS_Unit4_ProcessSync_PriyaNair.pdf',
    fileType: 'pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...MOCK_VALID_PDF_DATA...',
    extractedText: 'UNIT 4: PROCESS SYNCHRONIZATION\n1. Critical Section Problem and Criteria: Mutual Exclusion, Progress, Bounded Waiting.\n2. Peterson Solution for Two Processes.\n3. Hardware Instructions: TestAndSet, CompareAndSwap.\n4. Semaphores (Counting and Binary) and Mutex Locks.\n5. Classical IPC Problems: Dining Philosophers Problem, Readers-Writers Problem, Producer-Consumer with Bounded Buffer.',
    tags: ['OperatingSystems', 'Synchronization', 'IPC', 'Semaphores'],
    rating: 5.0,
    views: 1,
    size: '4.2 MB',
    department: 'BCA' as const,
  };

  const uploadedNote = await campusRepository.uploadNote(noteUploadPayload);
  assert(Boolean(uploadedNote.id), `Note successfully created with ID: ${uploadedNote.id}`);
  assert(uploadedNote.semesterNumber === 5, 'Note assigned semesterNumber = 5');
  assert(Boolean(uploadedNote.extractedText && uploadedNote.extractedText.length > 50), 'Note contains extractedText for AI & study reader');

  // 3. Shared Repository Sync Verification
  console.log('\n--- Phase 3: Shared Repository Multi-Model Sync ---');
  const sharedDocs = await campusRepository.getSharedDocuments(5, studentSem5);
  const syncedDoc = sharedDocs.find(d => d.id === uploadedNote.id);
  assert(Boolean(syncedDoc), 'Uploaded note is automatically indexed in the unified sharedDocuments repository');
  assert(syncedDoc?.targetSemester === 5, 'Shared document has targetSemester = 5');

  // 4. Student Retrieval for Target Semester (Semester 5)
  console.log('\n--- Phase 4: Semester 5 Student Retrieval & Document Access ---');
  const sem5Notes = await campusRepository.getNotes(undefined, undefined, 5, studentSem5);
  const foundForSem5 = sem5Notes.find(n => n.id === uploadedNote.id);
  assert(Boolean(foundForSem5), 'Semester 5 student successfully retrieves the newly published note in library');
  assert(foundForSem5?.extractedText === noteUploadPayload.extractedText, 'Semester 5 student gets full extracted text');

  // Test Download for Authorized Student
  try {
    const sem5Download = await campusRepository.downloadDocument(uploadedNote.id, studentSem5);
    assert(Boolean(sem5Download?.fileName), 'Semester 5 student is ALLOWED to download the document');
    assert(sem5Download?.fileData === noteUploadPayload.fileData, 'Semester 5 student gets the actual fileData URL');
  } catch (err: any) {
    assert(false, `Semester 5 download failed unexpectedly: ${err.message}`);
  }

  // 5. Strict Cross-Semester Isolation (Semester 3 Student)
  console.log('\n--- Phase 5: Cross-Semester Isolation & Security Enforcement ---');
  const sem3Notes = await campusRepository.getNotes(undefined, undefined, 3, studentSem3);
  const foundForSem3 = sem3Notes.find(n => n.id === uploadedNote.id);
  assert(!foundForSem3, 'Semester 3 student CANNOT see Semester 5 note in their library');

  // Test Unauthorized Direct Download (Should throw 403 Forbidden)
  try {
    await campusRepository.downloadDocument(uploadedNote.id, studentSem3);
    assert(false, 'Semester 3 student download should have been REJECTED by authorization');
  } catch (err: any) {
    assert(err.status === 403, `Semester 3 student download correctly REJECTED with 403: "${err.message}"`);
  }

  // 6. Campus AI Context Extraction & Summarization
  console.log('\n--- Phase 6: Campus AI Document Context & Security ---');
  const sem5AIContext = await ContextBuilder.buildCampusAIContext({
    userProfile: studentSem5,
    selectedDocument: uploadedNote,
  });
  const sem5AIPrompt = ContextBuilder.formatContextForPrompt(sem5AIContext);
  assert(sem5AIPrompt.includes('UNIT 4: PROCESS SYNCHRONIZATION'), 'Campus AI prompt includes actual extracted text for Sem 5 student');
  assert(sem5AIPrompt.includes('Peterson Solution'), 'Campus AI prompt includes chapter concepts');

  // AI Context for Unauthorized Student
  const sem3AIContext = await ContextBuilder.buildCampusAIContext({
    userProfile: studentSem3,
    selectedDocument: uploadedNote,
  });
  const sem3AIPrompt = ContextBuilder.formatContextForPrompt(sem3AIContext);
  assert(sem3AIPrompt.includes('[RESTRICTED DOCUMENT ACCESS]'), 'Campus AI blocks document context for unauthorized Semester 3 student');
  assert(!sem3AIPrompt.includes('Peterson Solution'), 'Extracted text is NEVER leaked into AI prompt for unauthorized student');

  // 7. Faculty Uploads & Publishes Question Paper
  console.log('\n--- Phase 7: Question Paper Delivery & Cross-Semester Access ---');
  const uploadedQP = await campusRepository.uploadQuestionPaper({
    teacherId: teacherPriya.id!,
    teacherName: teacherPriya.fullName!,
    subjectId: 'sub-cs501',
    subject: 'Operating Systems',
    subjectCode: 'CS501',
    semester: 'Semester 5',
    semesterNumber: 5,
    year: 'Final Year (TY)' as any,
    examType: 'End-Term',
    title: 'Operating Systems End-Term University Model Paper 2025',
    fileName: 'OS_EndTerm_Model_2025.pdf',
    fileSize: '2.1 MB',
    fileData: 'data:application/pdf;base64,JVBERi0x...QP_DATA...',
    extractedText: 'BCA SEMESTER 5 END TERM EXAMINATION: OPERATING SYSTEMS\nTime: 3 Hours | Max Marks: 100\nQ1. Explain virtual memory management and page replacement algorithms.\nQ2. Solve the banker algorithm for deadlock avoidance given allocation matrix.',
    description: 'Official model question paper for university exam preparation.',
    totalMarks: 100,
    maxMarks: 100,
    duration: '3 Hours',
  });
  assert(Boolean(uploadedQP.id), `Question paper uploaded with ID: ${uploadedQP.id}`);

  // Query by Sem 5 student
  const sem5QPs = await campusRepository.getQuestionPapers(undefined, undefined, 5, studentSem5);
  const foundQP = sem5QPs.find(q => q.id === uploadedQP.id);
  assert(Boolean(foundQP), 'Semester 5 student finds newly uploaded question paper');
  assert(Boolean(foundQP?.extractedText?.includes('banker algorithm')), 'Extracted questions available for AI solutions');

  // Query by Sem 3 student
  const sem3QPs = await campusRepository.getQuestionPapers(undefined, undefined, 3, studentSem3);
  assert(!sem3QPs.some(q => q.id === uploadedQP.id), 'Semester 3 student cannot see Semester 5 question paper');

  // Clean up Question Paper
  await campusRepository.deleteQuestionPaper(uploadedQP.id);

  // 8. Note Lifecycle & Deletion
  console.log('\n--- Phase 8: Note Lifecycle & Deletion ---');
  const deleteResult = await campusRepository.deleteNote(uploadedNote.id);
  assert(deleteResult === true, 'Faculty successfully deletes/archives note');
  const afterDeleteNotes = await campusRepository.getNotes(undefined, undefined, 5, studentSem5);
  assert(!afterDeleteNotes.some(n => n.id === uploadedNote.id), 'Deleted note is immediately removed from Student library');

  console.log('\n===========================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('===========================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL END-TO-END CONTENT DELIVERY VERIFICATIONS PASSED!');
  } else {
    process.exit(1);
  }
}

runEndToEndVerification().catch((err) => {
  console.error('Fatal Error during verification:', err);
  process.exit(1);
});
