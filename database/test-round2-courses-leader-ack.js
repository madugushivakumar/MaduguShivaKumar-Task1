/**
 * Automated Test Suite for Round 2 Requirements:
 * 1. Course Management (CRUD, enrollment, syllabus)
 * 2. Professor & Student Workflows
 * 3. Individual Submissions & Self-Acknowledgment
 * 4. Group Assignment Workflow & Strict Leader-Only Acknowledgment (403 for non-leaders)
 * 5. Teammate Status Synchronization
 * 6. Professor Dashboard & Course Analytics
 *
 * Usage: node database/test-round2-courses-leader-ack.js
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token && { Authorization: `Bearer ${options.token}` }),
      ...options.headers,
    },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // Non-JSON
  }
  return { status: res.status, data };
}

async function runRound2Tests() {
  console.log('==================================================');
  console.log('🎓 Starting Round 2 Evolution Test Suite');
  console.log('Testing: Courses, Submissions, & Leader-Only Acknowledgment');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assertTest(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Test ${total}: ${name}`);
      if (details) console.log(`   ↳ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${name}`);
      if (details) console.error(`   ↳ ${details}`);
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Authenticate users
    // Professor Dr. Alan Turing
    const alanLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const alanToken = alanLogin.data?.data?.token;

    // Student Alice Smith (Leader of Alpha Innovators)
    const aliceLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLogin.data?.data?.token;

    // Student Bob Jones (Member of Alpha Innovators, NOT leader)
    const bobLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'bob.jones@university.edu',
        password: 'Password123!',
      }),
    });
    const bobToken = bobLogin.data?.data?.token;

    assertTest('Authentication Setup', Boolean(alanToken && aliceToken && bobToken), 'Acquired tokens for Professor Alan, Leader Alice, and Member Bob');

    // -------------------------------------------------------------
    // PHASE 5: COURSES
    // -------------------------------------------------------------
    // Test 2: Professor creates a new course
    const courseCode = `CS${timestamp.toString().slice(-4)}`;
    const createCourseRes = await request(`${BASE_URL}/courses`, {
      method: 'POST',
      token: alanToken,
      body: JSON.stringify({
        name: `Advanced Distributed Systems ${timestamp}`,
        code: courseCode,
        description: 'Comprehensive study of distributed ledger, Raft consensus, and vector clocks.',
      }),
    });
    const createdCourse = createCourseRes.data?.data?.course;
    assertTest(
      'Professor Creates Course (POST /api/courses)',
      createCourseRes.status === 201 && createdCourse?.code === courseCode,
      `Status: ${createCourseRes.status}, Course ID: ${createdCourse?.id}, Code: ${createdCourse?.code}`
    );

    // Test 3: Student attempting to create course rejected (403 Forbidden)
    const studentCreateCourseRes = await request(`${BASE_URL}/courses`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        name: 'Student Unauthorized Course',
        code: `HACK${timestamp.toString().slice(-4)}`,
      }),
    });
    assertTest(
      'Student Attempting to Create Course Rejected (403)',
      studentCreateCourseRes.status === 403,
      `Status: ${studentCreateCourseRes.status}`
    );

    // Test 4: Enroll Student into Course
    const enrollRes = await request(`${BASE_URL}/courses/${createdCourse.id}/enroll`, {
      method: 'POST',
      token: alanToken,
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
      }),
    });
    assertTest(
      'Enroll Student into Course (POST /api/courses/:id/enroll)',
      enrollRes.status === 200 && enrollRes.data?.success === true,
      `Status: ${enrollRes.status}, Student: Alice Smith`
    );

    // Also enroll Bob
    await request(`${BASE_URL}/courses/${createdCourse.id}/enroll`, {
      method: 'POST',
      token: alanToken,
      body: JSON.stringify({ email: 'bob.jones@university.edu' }),
    });

    // Test 5: Student Retrieves Enrolled Courses (GET /api/courses)
    const studentCoursesRes = await request(`${BASE_URL}/courses`, {
      method: 'GET',
      token: aliceToken,
    });
    const aliceCourses = studentCoursesRes.data?.data?.courses || [];
    const hasEnrolledCourse = aliceCourses.some((c) => c.id === createdCourse.id);
    assertTest(
      'Student Retrieves Enrolled Courses (GET /api/courses)',
      studentCoursesRes.status === 200 && hasEnrolledCourse,
      `Found enrolled course ${courseCode} in Alice's courses list (total: ${aliceCourses.length})`
    );

    // -------------------------------------------------------------
    // PHASE 6 & 8: INDIVIDUAL ASSIGNMENT & SUBMISSION
    // -------------------------------------------------------------
    // Test 6: Professor creates an INDIVIDUAL assignment
    const createIndivAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: alanToken,
      body: JSON.stringify({
        title: `Individual Research Paper ${timestamp}`,
        description: 'Independent research paper on Paxos vs Raft trade-offs.',
        due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
        onedrive_link: 'https://1drv.ms/u/s!individual-research-paper',
        course_id: createdCourse.id,
        submission_type: 'INDIVIDUAL',
      }),
    });
    const indivAssignment = createIndivAssignRes.data?.data?.assignment;
    assertTest(
      'Professor Creates INDIVIDUAL Assignment',
      createIndivAssignRes.status === 201 && indivAssignment?.submission_type === 'INDIVIDUAL',
      `Assignment ID: ${indivAssignment?.id}, Type: ${indivAssignment?.submission_type}`
    );

    // Test 7: Student Submits Individual Assignment
    const submitIndivRes = await request(`${BASE_URL}/assignments/${indivAssignment.id}/submit`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        submissionLink: 'https://github.com/alice/raft-research-paper',
      }),
    });
    assertTest(
      'Student Submits Individual Assignment (POST /api/assignments/:id/submit)',
      submitIndivRes.status === 200 && submitIndivRes.data?.data?.status === 'SUBMITTED',
      `Status: ${submitIndivRes.data?.data?.status}, Link: ${submitIndivRes.data?.data?.submission_link}`
    );

    // Test 8: Student Acknowledges Individual Assignment
    const ackIndivRes = await request(`${BASE_URL}/assignments/${indivAssignment.id}/acknowledge`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({}),
    });
    assertTest(
      'Student Acknowledges Individual Assignment (POST /api/assignments/:id/acknowledge)',
      ackIndivRes.status === 200 && ackIndivRes.data?.data?.status === 'ACKNOWLEDGED',
      `Status: ${ackIndivRes.data?.data?.status}, is_acknowledged: ${ackIndivRes.data?.data?.is_acknowledged}`
    );

    // -------------------------------------------------------------
    // PHASE 9: GROUP ASSIGNMENT & STRICT LEADER-ONLY ACKNOWLEDGMENT
    // -------------------------------------------------------------
    // Group: Alpha Innovators (id: c0000000-0000-0000-0000-000000000001)
    // Leader: Alice Smith (b0000000-0000-0000-0000-000000000001)
    // Member: Bob Jones (b0000000-0000-0000-0000-000000000002)
    const alphaGroupId = 'c0000000-0000-0000-0000-000000000001';

    // Test 9: Professor creates a GROUP assignment allocated to Alpha Innovators
    const createGroupAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: alanToken,
      body: JSON.stringify({
        title: `Distributed Key-Value Store Project ${timestamp}`,
        description: 'Collaborative group project building a partitioned KV store.',
        due_date: new Date(Date.now() + 86400000 * 14).toISOString(),
        onedrive_link: 'https://1drv.ms/u/s!group-kv-store-submission',
        course_id: createdCourse.id,
        submission_type: 'GROUP',
        group_ids: [alphaGroupId],
      }),
    });
    const groupAssignment = createGroupAssignRes.data?.data?.assignment;
    assertTest(
      'Professor Creates GROUP Assignment Allocated to Team',
      createGroupAssignRes.status === 201 && groupAssignment?.submission_type === 'GROUP',
      `Assignment ID: ${groupAssignment?.id}, Allocated to Group: Alpha Innovators`
    );

    // Test 10: Non-leader group member (Bob) attempts to acknowledge group assignment -> REJECTED (403 Forbidden)
    const nonLeaderAckRes = await request(`${BASE_URL}/assignments/${groupAssignment.id}/acknowledge`, {
      method: 'POST',
      token: bobToken,
      body: JSON.stringify({
        groupId: alphaGroupId,
      }),
    });
    assertTest(
      'CRITICAL: Non-Leader Member Attempting Acknowledgment REJECTED (403 Forbidden)',
      nonLeaderAckRes.status === 403,
      `Status: ${nonLeaderAckRes.status}, Message: "${nonLeaderAckRes.data?.message}"`
    );

    // Test 11: Group Leader (Alice) Acknowledges Group Assignment -> ACCEPTED (200 OK)
    const leaderAckRes = await request(`${BASE_URL}/assignments/${groupAssignment.id}/acknowledge`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        groupId: alphaGroupId,
      }),
    });
    assertTest(
      'Group Leader (Alice) Successfully Acknowledges Group Submission (200 OK)',
      leaderAckRes.status === 200 && leaderAckRes.data?.data?.status === 'ACKNOWLEDGED',
      `Status: ${leaderAckRes.data?.data?.status}, is_acknowledged: ${leaderAckRes.data?.data?.is_acknowledged}, Confirmer: Alice`
    );

    // Test 12: Teammate Bob Observes Synchronized ACKNOWLEDGED Status (GET /api/assignments/:id/status)
    const bobStatusRes = await request(`${BASE_URL}/assignments/${groupAssignment.id}/status?groupId=${alphaGroupId}`, {
      method: 'GET',
      token: bobToken,
    });
    const bobObservedStatus = bobStatusRes.data?.data;
    assertTest(
      'Teammate (Bob) Observes Synchronized ACKNOWLEDGED Status',
      bobStatusRes.status === 200 &&
        bobObservedStatus?.status === 'ACKNOWLEDGED' &&
        bobObservedStatus?.isAcknowledged === true &&
        bobObservedStatus?.isGroupLeader === false,
      `Bob View: Status=${bobObservedStatus?.status}, isAcknowledged=${bobObservedStatus?.isAcknowledged}, isGroupLeader=${bobObservedStatus?.isGroupLeader}`
    );

    // -------------------------------------------------------------
    // PHASE 4 & 18: PROFESSOR DASHBOARD & ANALYTICS
    // -------------------------------------------------------------
    // Test 13: Professor Retrieves Coursework Submissions Feed (GET /api/assignments/:id/submissions)
    const profSubmissionsRes = await request(`${BASE_URL}/assignments/${groupAssignment.id}/submissions`, {
      method: 'GET',
      token: alanToken,
    });
    assertTest(
      'Professor Retrieves Assignment Submissions Feed',
      profSubmissionsRes.status === 200 && profSubmissionsRes.data?.data?.submissions?.length >= 1,
      `Status: ${profSubmissionsRes.status}, Total Submissions: ${profSubmissionsRes.data?.data?.totalSubmissions}`
    );

    // Test 14: Dedicated Professor Dashboard (GET /api/professor/dashboard)
    const profDashboardRes = await request(`${BASE_URL}/professor/dashboard`, {
      method: 'GET',
      token: alanToken,
    });
    const profData = profDashboardRes.data?.data;
    assertTest(
      'Dedicated Professor Dashboard (GET /api/professor/dashboard)',
      profDashboardRes.status === 200 &&
        profData?.totalCourses >= 1 &&
        profData?.courses?.length >= 1 &&
        typeof profData?.submissionRate === 'number',
      `Courses: ${profData?.totalCourses}, Students: ${profData?.totalStudents}, Assignments: ${profData?.totalAssignments}, Submission Rate: ${profData?.submissionRate}%`
    );

    // Test 15: Course Analytics (GET /api/courses/:id/analytics)
    const courseAnalyticsRes = await request(`${BASE_URL}/courses/${createdCourse.id}/analytics`, {
      method: 'GET',
      token: alanToken,
    });
    assertTest(
      'Course Analytics (GET /api/courses/:id/analytics)',
      courseAnalyticsRes.status === 200 && courseAnalyticsRes.data?.data?.assignments?.length >= 1,
      `Course: ${courseAnalyticsRes.data?.data?.courseCode}, Assignments Count: ${courseAnalyticsRes.data?.data?.assignments?.length}`
    );

    console.log('\n==================================================');
    console.log(`📊 Round 2 Test Suite Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log('==================================================');

    if (passed === total) {
      console.log('🎉 ALL ROUND 2 ARCHITECTURE & WORKFLOW TESTS PASSED!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test Suite Error:', err);
    process.exit(1);
  }
}

runRound2Tests();
