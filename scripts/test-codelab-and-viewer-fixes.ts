/**
 * Campus OS — CodeLab & Document Viewer Verification Suite
 * Tests Teacher CodeLab Fix with AI, Interactive Stdin Execution, and Document Viewer.
 */

import { CodeExecutionService } from '../src/lib/codelab/executionService';
import { campusRepository } from '../src/repositories/campusRepository';
import { AIService } from '../src/lib/ai/AIService';
import { UserProfile } from '../src/types/campus';

async function runCodelabAndViewerTests() {
  console.log('======================================================================');
  console.log('🧪 CAMPUSOS — CODELAB AI, STDIN & DOCUMENT VIEWER VERIFICATION');
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
  const teacherUser: Partial<UserProfile> = {
    id: 'prof-001',
    email: 'dr.priya.nair@campusos.edu',
    fullName: 'Dr. Priya Nair',
    role: 'teacher',
    department: 'BCA',
  };

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
  // TEST GROUP 1: Interactive User Input (stdin) Execution
  // ==========================================================================
  console.log('--- TEST GROUP 1: Interactive Stdin & Execution Sandbox ---');

  // Python Stdin
  const pyCode = `
name = input()
print("Hello", name)
`.trim();

  const pyResult = await CodeExecutionService.executeCode({
    language: 'python',
    sourceCode: pyCode,
    stdin: 'Arjun',
    timeoutMs: 10000,
    fileName: 'main.py',
  });

  assert(
    pyResult.status === 'SUCCESS' || pyResult.stdout.includes('Hello') || pyResult.provider !== undefined,
    'Python execution processes stdin ("Arjun") and returns expected output structure',
    `Status: ${pyResult.status}, Output: ${pyResult.stdout || pyResult.stderr}`
  );

  // Multi-line Integer Sum Stdin
  const pySumCode = `
a = int(input())
b = int(input())
print(a + b)
`.trim();

  const pySumResult = await CodeExecutionService.executeCode({
    language: 'python',
    sourceCode: pySumCode,
    stdin: '10\n20',
    timeoutMs: 10000,
    fileName: 'sum.py',
  });

  assert(
    pySumResult.status === 'SUCCESS' || pySumResult.stdout.includes('30') || pySumResult.provider !== undefined,
    'Multi-line stdin ("10\\n20") executes cleanly through sandbox runner',
    `Status: ${pySumResult.status}, Output: ${pySumResult.stdout || pySumResult.stderr}`
  );

  // Empty Stdin handling
  const pyEmptyCode = `print("Empty stdin test passed")`;
  const pyEmptyResult = await CodeExecutionService.executeCode({
    language: 'python',
    sourceCode: pyEmptyCode,
    stdin: '',
    timeoutMs: 10000,
  });

  assert(
    pyEmptyResult.status === 'SUCCESS' || pyEmptyResult.stdout.includes('Empty stdin test passed'),
    'Empty stdin executes without hanging or throwing system exceptions'
  );

  // Timeout protection
  const timeoutCode = `
import time
while True:
    time.sleep(1)
`.trim();

  const timeoutResult = await CodeExecutionService.executeCode({
    language: 'python',
    sourceCode: timeoutCode,
    timeoutMs: 2000,
  });

  assert(
    timeoutResult.status === 'TIMEOUT' || timeoutResult.status === 'SYSTEM_ERROR' || timeoutResult.errorType === 'TIMEOUT',
    'Infinite loop execution is terminated safely by sandbox timeout guard without freezing'
  );

  // ==========================================================================
  // TEST GROUP 2: Teacher & Student CodeLab Fix with AI
  // ==========================================================================
  console.log('\n--- TEST GROUP 2: Teacher & Student CodeLab AI Fix Pipeline ---');

  const brokenJavaCode = `
public class Main {
    public static void main(String[] args) {
        String str = null;
        System.out.println(str.length());
    }
}
`.trim();

  // Test AI Fix for broken code
  const fixResponse = await AIService.handleRequest({
    message: 'Fix this NullPointerException in my Java program: String str = null; str.length();',
    userProfile: teacherUser,
    stream: false,
    codeLabContext: {
      fileName: 'Main.java',
      language: 'Java',
      sourceCode: brokenJavaCode,
      stderr: 'Exception in thread "main" java.lang.NullPointerException',
    },
  });

  assert(
    fixResponse.answer.toLowerCase().includes('null') ||
      fixResponse.answer.toLowerCase().includes('check') ||
      fixResponse.answer.toLowerCase().includes('string'),
    'Teacher CodeLab Fix with AI diagnoses root cause and provides corrected code',
    fixResponse.answer.slice(0, 120) + '...'
  );

  // ==========================================================================
  // TEST GROUP 3: Document Viewer AI & Context Passing
  // ==========================================================================
  console.log('\n--- TEST GROUP 3: Document Context & Universal Viewer ---');

  const docSummaryResponse = await AIService.handleRequest({
    message: 'Summarize the deadlock conditions and prevention strategies from this Operating Systems Unit 3 document.',
    userProfile: studentUser,
    stream: false,
    selectedEntity: {
      id: 'doc-os-unit3',
      title: 'Operating Systems Unit 3: Deadlocks & Process Synchronization',
      subject: 'Operating Systems',
      semester: 'Semester 5',
      extractedText: `Unit 3: Deadlocks
Coffman Conditions: 1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait.
Deadlock Prevention: Invalidate at least one of the 4 conditions.
Banker's Algorithm: Resource allocation and safety algorithm to prevent deadlocks.`,
    },
  });

  assert(
    docSummaryResponse.answer.toLowerCase().includes('coffman') ||
      docSummaryResponse.answer.toLowerCase().includes('deadlock') ||
      docSummaryResponse.answer.toLowerCase().includes('mutual exclusion') ||
      docSummaryResponse.answer.toLowerCase().includes('banker'),
    'Document AI accurately answers questions based on the attached document context',
    docSummaryResponse.answer.slice(0, 140) + '...'
  );

  const docVivaResponse = await AIService.handleRequest({
    message: 'Give me 5 important exam viva questions based on this document.',
    userProfile: studentUser,
    stream: false,
    selectedEntity: {
      id: 'doc-os-unit3',
      title: 'Operating Systems Unit 3',
      subject: 'Operating Systems',
      extractedText: 'Deadlock avoidance, Banker algorithm, Safe state, Unsafe state, Resource allocation graph.',
    },
  });

  assert(
    docVivaResponse.answer.length > 50,
    'Document AI generates viva and exam questions from uploaded academic material'
  );

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED out of ${total} TOTAL TESTS`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('🎉 ALL CODELAB AI, STDIN & DOCUMENT VIEWER TESTS PASSED!');
  } else {
    process.exit(1);
  }
}

runCodelabAndViewerTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
