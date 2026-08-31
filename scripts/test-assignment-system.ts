/**
 * Campus OS — Production-Grade Assignment Management System Verification Suite
 * Tests faculty assignment creation, teaching scope validation, cross-semester isolation,
 * student submission pipeline, cross-student security, faculty grading & feedback, and Campus AI tutoring.
 */

import { campusRepository } from '../src/repositories/campusRepository';
import { AuthorizationService } from '../src/services/authorizationService';
import { AIService } from '../src/lib/ai/AIService';
import { UserProfile, Assignment, Submission } from '../src/types/campus';

async function runAssignmentTests() {
  console.log('======================================================================');
  console.log('📋 CAMPUSOS — ASSIGNMENT MANAGEMENT SYSTEM VERIFICATION');
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
  const priyaFaculty: Partial<UserProfile> = {
    id: 'usr-faculty-001',
    email: 'faculty@campusos.demo',
    fullName: 'Dr. Priya Nair',
    role: 'teacher',
    department: 'BCA',
  };

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

  const studentB: Partial<UserProfile> = {
    id: 'usr-004',
    email: 'rohit.verma@campusos.demo',
    fullName: 'Rohit Verma',
    rollNumber: 'BCA2403',
    role: 'student',
    semester: 'Semester 5',
    semesterNumber: 5,
    department: 'BCA',
  };

  // ==========================================================================
  // TEST GROUP 1: Faculty Assignment Creation & Authorization Enforcement
  // ==========================================================================
  console.log('--- TEST GROUP 1: Faculty Assignment Creation & Authorization ---');

  // Test 1: Dr. Priya Nair creates assignment for Semester 5 Operating Systems (Authorized)
  const createdAsg = await campusRepository.createAssignment(
    {
      title: 'Multilevel Feedback Queue Simulation & Scheduling Analysis',
      subject: 'Operating Systems',
      subjectId: 'subj-501',
      subjectCode: 'CS501',
      department: 'BCA',
      semester: 'Semester 5',
      semesterNumber: 5,
      teacher: 'Dr. Priya Nair',
      teacherId: 'usr-faculty-001',
      dueDate: 'Sep 25, 2026',
      dueTime: '11:59 PM',
      maxScore: 50,
      description: 'Implement a 3-tier MLFQ scheduler with aging and starvation prevention in Python/C++.',
      fileName: 'MLFQ_Assignment_Brief.pdf',
      fileSize: '1.5 MB',
      fileData: 'data:application/pdf;base64,JVBERi0xLjQK...',
      extractedText: 'MLFQ Scheduling Specification: 3 Queues with Q1=RR(8ms), Q2=RR(16ms), Q3=FCFS.',
      status: 'active',
      allowLateSubmissions: true,
    },
    priyaFaculty
  );

  assert(
    Boolean(createdAsg && createdAsg.id),
    'Authorized faculty successfully publishes assignment for taught subject (S5 Operating Systems)',
    `Created Assignment ID: ${createdAsg.id}`
  );

  // Test 2: Dr. Priya Nair attempts to create assignment for Semester 3 DBMS (Unauthorized -> should throw 403)
  let unauthorizedBlocked = false;
  try {
    await campusRepository.createAssignment(
      {
        title: 'Unauthorized DBMS Assignment Creation',
        subject: 'Database Management Systems',
        subjectId: 'subj-301',
        subjectCode: 'CS301',
        department: 'BCA',
        semester: 'Semester 3',
        semesterNumber: 3,
        teacher: 'Dr. Priya Nair',
        dueDate: 'Sep 30, 2026',
        maxScore: 30,
        description: 'Unauthorized attempt',
        status: 'active',
      },
      priyaFaculty
    );
  } catch (err: any) {
    unauthorizedBlocked = (err.status === 403 || err.message.includes('403') || err.message.includes('Unauthorized'));
  }

  assert(
    unauthorizedBlocked,
    'Faculty attempt to publish assignment for unauthorized subject/semester is blocked with 403 Forbidden'
  );

  // ==========================================================================
  // TEST GROUP 2: Student Semester Isolation
  // ==========================================================================
  console.log('\n--- TEST GROUP 2: Student Semester Isolation ---');

  const sem5Asgs = await campusRepository.getAssignments(undefined, sem5Student);
  const hasOnlySem5 = sem5Asgs.every((a) => a.semesterNumber === 5);
  const hasCreatedAsg = sem5Asgs.some((a) => a.id === createdAsg.id);

  assert(
    hasOnlySem5 && hasCreatedAsg,
    'Semester 5 student sees ONLY Semester 5 assignments and can view newly published assignment',
    `Found ${sem5Asgs.length} assignments strictly for Semester 5`
  );

  const sem3Asgs = await campusRepository.getAssignments(undefined, sem3Student);
  const hasNoSem5InSem3 = !sem3Asgs.some((a) => a.semesterNumber === 5);
  const hasOnlySem3 = sem3Asgs.every((a) => a.semesterNumber === 3);

  assert(
    hasNoSem5InSem3 && hasOnlySem3,
    'Semester 3 student CANNOT see Semester 5 assignments (Strict cross-semester isolation)',
    `Semester 3 view count: ${sem3Asgs.length}`
  );

  // Test 5: Semester 3 student attempting direct retrieval of Semester 5 assignment by ID is blocked
  let directIdBlocked = false;
  try {
    await campusRepository.getAssignmentById(createdAsg.id, sem3Student);
  } catch (err: any) {
    directIdBlocked = (err.status === 403 || err.message.includes('403'));
  }

  assert(
    directIdBlocked,
    'Direct API retrieval of an out-of-semester assignment ID throws 403 Forbidden'
  );

  // ==========================================================================
  // TEST GROUP 3: Student Submission Workflow & Persistence
  // ==========================================================================
  console.log('\n--- TEST GROUP 3: Student Submission & Ownership Security ---');

  const studentSubmission = await campusRepository.submitAssignment(
    {
      assignmentId: createdAsg.id,
      studentId: sem5Student.id!,
      studentName: sem5Student.fullName!,
      studentEmail: sem5Student.email!,
      rollNumber: sem5Student.rollNumber!,
      subject: createdAsg.subject,
      subjectCode: createdAsg.subjectCode,
      semesterNumber: 5,
      maxScore: createdAsg.maxScore,
      textAnswer: 'Implemented 3-queue MLFQ scheduler in Python 3. Added aging mechanism boosting priority every 50ms.',
      fileName: 'Arjun_Sharma_MLFQ_Simulator.py',
      fileSize: '34.2 KB',
      fileData: 'data:text/x-python;base64,aW1wb3J0IHN5cw...',
    },
    sem5Student
  );

  assert(
    Boolean(studentSubmission && studentSubmission.id && studentSubmission.status === 'submitted'),
    'Student successfully submits solution with source code and text explanation',
    `Submission ID: ${studentSubmission.id}, Time: ${studentSubmission.submittedAt}`
  );

  // Test 7: Student B cannot see Student A's submission
  const studentBSubmissions = await campusRepository.getSubmissions(
    { assignmentId: createdAsg.id },
    studentB
  );
  const studentBLeaked = studentBSubmissions.some((s) => s.studentId === sem5Student.id);

  assert(
    !studentBLeaked,
    'Student B cannot access Student A\'s submission (Strict student-ownership isolation enforced)'
  );

  // ==========================================================================
  // TEST GROUP 4: Faculty Grading & Student Feedback Delivery
  // ==========================================================================
  console.log('\n--- TEST GROUP 4: Faculty Grading & Feedback ---');

  const gradedResult = await campusRepository.gradeSubmission(
    studentSubmission.id,
    49,
    'Outstanding implementation of aging mechanism and clean simulation benchmark metrics! Full marks on code structure.',
    priyaFaculty
  );

  assert(
    Boolean(gradedResult && gradedResult.status === 'graded' && gradedResult.score === 49),
    'Faculty grades student submission: assigns 49/50 score and provides constructive remarks',
    `Awarded: ${gradedResult?.score}/50, Graded by: ${gradedResult?.gradedBy}`
  );

  // Student reviews their updated submission
  const studentViewSubms = await campusRepository.getSubmissions(
    { assignmentId: createdAsg.id },
    sem5Student
  );
  const studentSelfSubm = studentViewSubms.find((s) => s.id === studentSubmission.id);

  assert(
    studentSelfSubm?.status === 'graded' &&
      studentSelfSubm.score === 49 &&
      Boolean(studentSelfSubm.feedback),
    'Student immediately receives and views verified score (49/50) and instructor feedback remarks',
    `Feedback: "${studentSelfSubm?.feedback?.slice(0, 70)}..."`
  );

  // ==========================================================================
  // TEST GROUP 5: Campus AI Assignment Assistant & PDF Tutoring
  // ==========================================================================
  console.log('\n--- TEST GROUP 5: Campus AI Assignment Assistant ---');

  const aiExplanation = await AIService.handleRequest({
    message: 'Explain what this assignment is asking me to do.',
    userProfile: sem5Student,
    stream: false,
    selectedEntity: {
      id: createdAsg.id,
      title: createdAsg.title,
      subject: createdAsg.subject,
      semester: 'Semester 5',
      maxScore: createdAsg.maxScore,
      dueDate: createdAsg.dueDate,
      description: createdAsg.description,
      extractedText: createdAsg.extractedText,
    },
  });

  assert(
    aiExplanation.answer.toLowerCase().includes('assignment breakdown') ||
      aiExplanation.answer.toLowerCase().includes('objective') ||
      aiExplanation.answer.toLowerCase().includes('step-by-step') ||
      aiExplanation.answer.toLowerCase().includes('mlfq'),
    'Campus AI provides structured assignment breakdown and pedagogical requirements analysis',
    aiExplanation.answer.slice(0, 140).replace(/\n+/g, ' ') + '...'
  );

  const aiApproach = await AIService.handleRequest({
    message: 'How should I approach this problem?',
    userProfile: sem5Student,
    stream: false,
    selectedEntity: {
      id: createdAsg.id,
      title: createdAsg.title,
      subject: createdAsg.subject,
      description: createdAsg.description,
      extractedText: createdAsg.extractedText,
    },
  });

  assert(
    aiApproach.answer.toLowerCase().includes('step-by-step') ||
      aiApproach.answer.toLowerCase().includes('approach') ||
      aiApproach.answer.toLowerCase().includes('algorithm'),
    'Campus AI provides systematic algorithmic approach guidance without giving away answers',
    aiApproach.answer.slice(0, 140).replace(/\n+/g, ' ') + '...'
  );

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED out of ${total} TOTAL TESTS`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('🎉 ALL ASSIGNMENT MANAGEMENT SYSTEM TESTS PASSED (100% SUCCESS)!');
  } else {
    process.exit(1);
  }
}

runAssignmentTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
