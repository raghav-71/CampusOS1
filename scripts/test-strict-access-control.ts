/**
 * CampusOS Strict Access Control & Security Test Suite
 * Tests role boundaries, semester isolation, faculty teaching assignments,
 * document-level authorization, and AI context isolation.
 */

import { AuthorizationService } from '../src/services/authorizationService';
import { campusRepository } from '../src/repositories/campusRepository';
import { ContextBuilder } from '../src/lib/ai/context/ContextBuilder';
import { AISearchEngine } from '../src/lib/ai/tools/search';

async function runAccessControlTests() {
  console.log('====================================================');
  console.log('🔒 RUNNING CAMPUSOS STRICT ACCESS CONTROL VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST GROUP 1: Faculty Multi-Subject & Multi-Semester Scoping
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: Faculty Multi-Subject & Multi-Semester Permissions ---');

  const priyaEmail = 'dr.priya.nair@campusos.edu';
  const priyaTeaching = AuthorizationService.getFacultyTeachingAssignments(priyaEmail);
  const priyaSemesters = AuthorizationService.getFacultyAuthorizedSemesters(priyaEmail);

  assert(
    priyaTeaching.length === 3,
    'Dr. Priya Nair has 3 teaching assignments across different semesters',
    `Found: ${priyaTeaching.length}`
  );

  assert(
    priyaSemesters.includes(1) && priyaSemesters.includes(5) && priyaSemesters.includes(6),
    'Dr. Priya Nair is authorized for Semesters 1, 5, and 6',
    `Semesters: ${priyaSemesters.join(', ')}`
  );

  assert(
    AuthorizationService.canFacultyManageSubject(priyaEmail, 'Operating Systems', 5),
    'Dr. Priya Nair CAN manage Operating Systems in Semester 5'
  );

  assert(
    AuthorizationService.canFacultyManageSubject(priyaEmail, 'Problem Solving & C Programming', 1),
    'Dr. Priya Nair CAN manage Problem Solving & C Programming in Semester 1'
  );

  assert(
    AuthorizationService.canFacultyManageSubject(priyaEmail, 'Cloud Computing & DevOps', 6),
    'Dr. Priya Nair CAN manage Cloud Computing & DevOps in Semester 6'
  );

  assert(
    !AuthorizationService.canFacultyManageSubject(priyaEmail, 'Computer Networks', 5),
    'Dr. Priya Nair CANNOT manage Computer Networks in Semester 5 (Taught by Dr. Sunita)',
    'Expected false'
  );

  assert(
    !AuthorizationService.canFacultyManageSubject(priyaEmail, 'Database Management Systems', 3),
    'Dr. Priya Nair CANNOT manage DBMS in Semester 3 (Taught by Prof. Rajesh)',
    'Expected false'
  );

  // ----------------------------------------------------
  // TEST GROUP 2: Faculty Mutation Authorization Validation
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Faculty Upload & Publish Validation ---');

  const validUpload = AuthorizationService.validateFacultyUpload(
    { id: 'FAC001', email: priyaEmail, role: 'teacher' },
    { subjectCode: 'CS501', subject: 'Operating Systems', semesterNumber: 5 }
  );
  assert(validUpload.allowed, 'Valid upload for assigned subject/sem allowed');

  const invalidSubjectUpload = AuthorizationService.validateFacultyUpload(
    { id: 'FAC001', email: priyaEmail, role: 'teacher' },
    { subjectCode: 'CS503', subject: 'Computer Networks', semesterNumber: 5 }
  );
  assert(
    !invalidSubjectUpload.allowed && invalidSubjectUpload.status === 403,
    'Unauthorized subject upload blocked with 403',
    invalidSubjectUpload.error
  );

  const invalidSemesterUpload = AuthorizationService.validateFacultyUpload(
    { id: 'FAC001', email: priyaEmail, role: 'teacher' },
    { subjectCode: 'CS301', subject: 'Data Structures', semesterNumber: 3 }
  );
  assert(
    !invalidSemesterUpload.allowed && invalidSemesterUpload.status === 403,
    'Unauthorized semester upload blocked with 403',
    invalidSemesterUpload.error
  );

  // ----------------------------------------------------
  // TEST GROUP 3: Student Semester Access Isolation
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Student Semester Isolation ---');

  const sem5Student = { id: 'usr-001', email: 'student5@campusos.demo', role: 'student' as const, semesterNumber: 5 as const };

  assert(
    AuthorizationService.canStudentAccessSemester(5, 5),
    'Semester 5 student CAN access Semester 5'
  );

  assert(
    !AuthorizationService.canStudentAccessSemester(5, 3),
    'Semester 5 student CANNOT access Semester 3'
  );

  assert(
    !AuthorizationService.canStudentAccessSemester(5, 1),
    'Semester 5 student CANNOT access Semester 1'
  );

  // ----------------------------------------------------
  // TEST GROUP 4: Direct Document Access & Download Enforcement
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: Direct Document ID & Download Security ---');

  // Test authorized document
  const authorizedDoc = await campusRepository.getDocumentById('doc-501', sem5Student);
  assert(
    authorizedDoc !== null && authorizedDoc.id === 'doc-501',
    'Semester 5 student can access Semester 5 OS document (doc-501)'
  );

  // Test unauthorized document
  let blockedError: any = null;
  try {
    await campusRepository.getDocumentById('doc-301', sem5Student);
  } catch (err: any) {
    blockedError = err;
  }
  assert(
    blockedError !== null && blockedError.status === 403,
    'Direct request for Semester 3 DBMS document (doc-301) by Sem 5 student throws 403 Forbidden',
    blockedError ? blockedError.message : 'No error thrown!'
  );

  // Test download endpoint authorization
  let downloadBlocked: any = null;
  try {
    await campusRepository.downloadDocument('doc-101', sem5Student);
  } catch (err: any) {
    downloadBlocked = err;
  }
  assert(
    downloadBlocked !== null && downloadBlocked.status === 403,
    'Direct download request for Semester 1 document (doc-101) throws 403 Forbidden'
  );

  // ----------------------------------------------------
  // TEST GROUP 5: AI Context & Search Isolation
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: AI Context Isolation & Search Security ---');

  const studentContext = await ContextBuilder.buildCampusAIContext({
    userProfile: sem5Student,
    currentPath: '/student-dashboard',
    currentTab: 'notes',
  });

  const formattedPrompt = ContextBuilder.formatContextForPrompt(studentContext);

  assert(
    formattedPrompt.includes('Operating Systems') && formattedPrompt.includes('Semester 5'),
    'Student AI Context contains Semester 5 courses and attendance'
  );

  assert(
    !formattedPrompt.includes('BCA101') && !formattedPrompt.includes('BCA301'),
    'Student AI Context does NOT contain courses from other semesters'
  );

  assert(
    formattedPrompt.includes('STRICT ACCESS CONTROL POLICY'),
    'Student AI Context enforces strict prompt-level access control boundary'
  );

  const searchResults = await AISearchEngine.searchAll('Operating Systems', 'student', sem5Student);
  assert(
    searchResults.length > 0 && searchResults.every((r) => !r.title.includes('Semester 3')),
    'AISearchEngine strictly returns authorized Semester 5 results'
  );

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAccessControlTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
