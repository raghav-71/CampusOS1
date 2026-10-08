/**
 * CampusOS — Real-Time Notifications & Announcements Center Test Suite
 * Validates teacher announcement authorization, student semester isolation,
 * automatic notification creation, document delivery, read/unread states, and resource deep linking.
 */

import { campusRepository } from '../src/repositories/campusRepository';
import { AuthorizationService } from '../src/services/authorizationService';
import { notificationService } from '../src/services/notificationService';
import { UserProfile, Announcement, NoteDocument } from '../src/types/campus';

async function runNotificationTests() {
  console.log('======================================================================');
  console.log('🔔 CAMPUSOS — NOTIFICATIONS & ANNOUNCEMENTS CENTER VERIFICATION');
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

  // --- Profiles ---
  const teacherPriya: Partial<UserProfile> = {
    id: 'usr-faculty-001',
    email: 'faculty@campusos.demo',
    fullName: 'Dr. Priya Nair',
    role: 'teacher',
    department: 'BCA',
  };

  const teacherRajesh: Partial<UserProfile> = {
    id: 'usr-faculty-002',
    email: 'faculty2@campusos.demo',
    fullName: 'Prof. Rajesh Kumar',
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

  const studentSem4: Partial<UserProfile> = {
    id: 'stu-401',
    email: 'neha.sharma@campusos.demo',
    fullName: 'Neha Sharma',
    role: 'student',
    semester: 'Semester 4',
    semesterNumber: 4,
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
  // TEST GROUP 1: Faculty Teaching Assignment Scope for Announcements
  // ==========================================================================
  console.log('--- TEST GROUP 1: Faculty Teaching Scope for Announcements ---');

  // Priya teaches OS in S5 -> Allowed
  const priyaValid = AuthorizationService.validateFacultyAnnouncement(teacherPriya, {
    subject: 'Operating Systems',
    subjectCode: 'CS501',
    targetSemester: 5,
  });
  assert(priyaValid.allowed, 'Dr. Priya Nair CAN publish announcement for Operating Systems in Semester 5');

  // Priya does NOT teach DBMS in S3 -> Blocked (DBMS in S3 taught by Prof. Rajesh)
  const priyaInvalidSubject = AuthorizationService.validateFacultyAnnouncement(teacherPriya, {
    subject: 'Database Management Systems',
    subjectCode: 'CS301',
    targetSemester: 3,
  });
  assert(
    !priyaInvalidSubject.allowed && priyaInvalidSubject.status === 403,
    'Dr. Priya Nair CANNOT publish announcement for Semester 3 (Not assigned to teach S3)',
    priyaInvalidSubject.error
  );

  // Priya does NOT teach Computer Networks in S5 -> Blocked
  const priyaInvalidS5Subj = AuthorizationService.validateFacultyAnnouncement(teacherPriya, {
    subject: 'Computer Networks',
    subjectCode: 'CS503',
    targetSemester: 5,
  });
  assert(
    !priyaInvalidS5Subj.allowed && priyaInvalidS5Subj.status === 403,
    'Dr. Priya Nair CANNOT publish announcement for Computer Networks in Semester 5 (Taught by Dr. Amit Sen)',
    priyaInvalidS5Subj.error
  );

  // Prof. Rajesh Kumar teaches DBMS in S3 and Advanced DBMS in S5 -> Allowed
  const rajeshValidS3 = AuthorizationService.validateFacultyAnnouncement(teacherRajesh, {
    subject: 'Database Management Systems',
    subjectCode: 'CS301',
    targetSemester: 3,
  });
  assert(rajeshValidS3.allowed, 'Prof. Rajesh Kumar CAN publish announcement for DBMS in Semester 3');

  const rajeshValidS5 = AuthorizationService.validateFacultyAnnouncement(teacherRajesh, {
    subject: 'Database Management Systems (Advanced)',
    subjectCode: 'CS502',
    targetSemester: 5,
  });
  assert(rajeshValidS5.allowed, 'Prof. Rajesh Kumar CAN publish announcement for Advanced DBMS in Semester 5');

  // ==========================================================================
  // TEST GROUP 2: Teacher Publishes Announcement & Student Visibility
  // ==========================================================================
  console.log('\n--- TEST GROUP 2: Announcement Creation & Semester Isolation ---');

  // Rajesh publishes DBMS announcement for Semester 5
  const createdAnnouncement = await campusRepository.createAnnouncement(
    {
      id: `ann-test-${Date.now()}`,
      title: 'DBMS Unit 3 Indexing & B-Tree Assignment Notice',
      body: 'All BCA Semester 5 students must review the indexing strategies and complete Problem Set 3 before next Tuesday.',
      priority: 'high',
      category: 'Assignment',
      type: 'ANNOUNCEMENT',
      time: 'Just now',
      author: teacherRajesh.fullName!,
      authorId: teacherRajesh.id!,
      read: false,
      targetRole: 'student',
      targetSemester: 5,
      semesterNumber: 5,
      subject: 'Database Management Systems (Advanced)',
      subjectCode: 'CS502',
      targetDepartment: 'BCA',
    },
    teacherRajesh
  );

  assert(Boolean(createdAnnouncement.id), 'Teacher Rajesh successfully publishes Semester 5 DBMS announcement');

  // Semester 5 Student checks notifications
  const sem5Notifs = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const foundInSem5 = sem5Notifs.find((a) => a.id === createdAnnouncement.id);
  assert(Boolean(foundInSem5), 'Semester 5 Student CAN see the Semester 5 DBMS announcement');

  // Semester 4 Student checks notifications -> Must NOT see it
  const sem4Notifs = await campusRepository.getAnnouncements('student', studentSem4.id, 4, studentSem4);
  const foundInSem4 = sem4Notifs.find((a) => a.id === createdAnnouncement.id);
  assert(!foundInSem4, 'Semester 4 Student CANNOT see the Semester 5 announcement (Strict Isolation)');

  // Semester 3 Student checks notifications -> Must NOT see it
  const sem3Notifs = await campusRepository.getAnnouncements('student', studentSem3.id, 3, studentSem3);
  const foundInSem3 = sem3Notifs.find((a) => a.id === createdAnnouncement.id);
  assert(!foundInSem3, 'Semester 3 Student CANNOT see the Semester 5 announcement (Strict Isolation)');

  // ==========================================================================
  // TEST GROUP 3: Automatic Notifications on Note Upload (Requirement 4 & 5)
  // ==========================================================================
  console.log('\n--- TEST GROUP 3: Automatic Document Upload Notifications ---');

  const uploadedNote = await campusRepository.uploadNote(
    {
      title: 'DBMS Unit 3 Query Optimization & B+ Trees',
      description: 'Comprehensive query plan analysis and tree indexing lecture notes.',
      subject: 'Database Management Systems (Advanced)',
      subjectId: 'subj-502',
      subjectCode: 'CS502',
      semester: 'Semester 5',
      semesterNumber: 5,
      targetSemester: 5,
      department: 'BCA',
      teacher: teacherRajesh.fullName!,
      teacherId: teacherRajesh.id!,
      tags: ['DBMS', 'BTree', 'Optimization'],
      pages: 32,
      size: '4.2 MB',
      fileSize: '4.2 MB',
      fileName: 'DBMS_Unit3_Optimization_Notes.pdf',
      fileType: 'pdf',
      fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...MOCK_DBMS_STREAM...',
      extractedText: 'Chapter 3: Query Optimization, Cost Estimation, and B+ Tree Indexing.',
      category: 'notes',
      status: 'published',
      rating: 5.0,
      views: 1,
    },
    teacherRajesh
  );

  assert(Boolean(uploadedNote.id), 'Teacher Rajesh uploads DBMS Unit 3 Notes for Semester 5');

  // Verify automatic notification was generated
  const sem5AfterUpload = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const docNotification = sem5AfterUpload.find(
    (a) => a.relatedEntityId === uploadedNote.id || a.title.includes('DBMS Unit 3 Query Optimization')
  );
  assert(Boolean(docNotification), 'Automatic notification was generated for Semester 5 students upon note upload');
  assert(docNotification?.type === 'DOCUMENT', 'Generated notification has type DOCUMENT');
  assert(docNotification?.subject === 'Database Management Systems (Advanced)', 'Generated notification references DBMS subject');
  assert(docNotification?.relatedEntity === 'note', 'Generated notification has relatedEntity = "note" for deep linking');

  // Verify other semesters did NOT receive this note notification
  const sem4AfterUpload = await campusRepository.getAnnouncements('student', studentSem4.id, 4, studentSem4);
  const leakedToSem4 = sem4AfterUpload.find((a) => a.relatedEntityId === uploadedNote.id);
  assert(!leakedToSem4, 'Semester 4 students received NO notification for Semester 5 notes');

  // Verify Semester 5 student can open and download the document
  const retrievedDoc = await campusRepository.getDocumentById(uploadedNote.id, studentSem5);
  assert(retrievedDoc !== null, 'Semester 5 student can retrieve/view the newly notified document');

  const downloadResult = await campusRepository.downloadDocument(uploadedNote.id, studentSem5);
  assert(downloadResult.fileName === 'DBMS_Unit3_Optimization_Notes.pdf', 'Semester 5 student can download the document');

  // Verify Semester 4 student is BLOCKED from downloading the document
  let sem4DownloadBlocked = false;
  try {
    await campusRepository.downloadDocument(uploadedNote.id, studentSem4);
  } catch (err: any) {
    sem4DownloadBlocked = err.status === 403 || err.message.includes('Access Denied');
  }
  assert(sem4DownloadBlocked, 'Semester 4 student is blocked with 403 when attempting to download Semester 5 note');

  // ==========================================================================
  // TEST GROUP 4: Automatic Notifications on Assignment Creation
  // ==========================================================================
  console.log('\n--- TEST GROUP 4: Automatic Assignment Creation Notifications ---');

  const createdAssignment = await campusRepository.createAssignment(
    {
      title: 'Operating Systems: Process Synchronization & Deadlock Lab',
      subject: 'Operating Systems',
      subjectCode: 'CS501',
      subjectId: 'subj-501',
      department: 'BCA',
      semester: 'Semester 5',
      semesterNumber: 5,
      teacher: teacherPriya.fullName!,
      teacherId: teacherPriya.id!,
      dueDate: '2026-09-15',
      dueTime: '11:59 PM',
      maxScore: 100,
      description: 'Implement Peterson algorithm and Dining Philosophers in C.',
      status: 'active',
      allowLateSubmissions: false,
    },
    teacherPriya
  );

  assert(Boolean(createdAssignment.id), 'Teacher Priya created new OS assignment for Semester 5');

  // Verify automatic assignment notification for Semester 5 students
  const sem5AfterAsg = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const asgNotification = sem5AfterAsg.find((a) => a.relatedEntityId === createdAssignment.id);
  assert(Boolean(asgNotification), 'Automatic notification was generated for Semester 5 students upon assignment creation');
  assert(asgNotification?.type === 'ASSIGNMENT', 'Generated notification has type ASSIGNMENT');
  assert(asgNotification?.relatedEntity === 'assignment', 'Generated notification has relatedEntity = "assignment"');

  // ==========================================================================
  // TEST GROUP 5: Read / Unread System & Unread Counter
  // ==========================================================================
  console.log('\n--- TEST GROUP 5: Read / Unread System & Real-Time Sync ---');

  const initialNotifs = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const testNotice = initialNotifs[0];

  // 1. Mark as read
  await campusRepository.markNotificationRead(testNotice.id, studentSem5.id);
  const afterRead = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const readItem = afterRead.find((a) => a.id === testNotice.id);
  assert(readItem?.read === true, 'Notification markNotificationRead updates read state to true');

  // 2. Mark as unread
  await campusRepository.markNotificationUnread(testNotice.id, studentSem5.id);
  const afterUnread = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const unreadItem = afterUnread.find((a) => a.id === testNotice.id);
  assert(unreadItem?.read === false, 'Notification markNotificationUnread updates read state to false');

  // 3. Mark all as read
  await campusRepository.markAllNotificationsRead(studentSem5.id);
  const afterMarkAll = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const allRead = afterMarkAll.every((a) => a.read === true);
  assert(allRead, 'markAllNotificationsRead successfully marks all student notifications as read');

  // ==========================================================================
  // TEST GROUP 6: Notification Deletion Security
  // ==========================================================================
  console.log('\n--- TEST GROUP 6: Notification Deletion Security ---');

  // Priya cannot delete Rajesh's announcement
  let unauthorizedDeleteBlocked = false;
  try {
    await campusRepository.deleteAnnouncement(createdAnnouncement.id, teacherPriya);
  } catch (err: any) {
    unauthorizedDeleteBlocked = err.status === 403;
  }
  assert(unauthorizedDeleteBlocked, 'Teacher Priya CANNOT delete announcement published by Prof. Rajesh (403 Forbidden)');

  // Rajesh can delete his own announcement
  const deleted = await campusRepository.deleteAnnouncement(createdAnnouncement.id, teacherRajesh);
  assert(deleted, 'Author Prof. Rajesh CAN delete his own announcement');

  const afterDelete = await campusRepository.getAnnouncements('student', studentSem5.id, 5, studentSem5);
  const stillExists = afterDelete.find((a) => a.id === createdAnnouncement.id);
  assert(!stillExists, 'Deleted announcement is immediately removed from student notification feed');

  console.log('\n======================================================================');
  console.log(`NOTIFICATIONS & ANNOUNCEMENTS AUDIT: ${passed} PASSED out of ${total} TOTAL TESTS`);
  console.log('======================================================================');

  if (passed !== total) {
    console.error('❌ SOME TESTS FAILED!');
    process.exit(1);
  } else {
    console.log('🎉 ALL NOTIFICATIONS & ANNOUNCEMENTS FUNCTIONALITY PASSED WITH 100% ACCURACY!');
  }
}

runNotificationTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
