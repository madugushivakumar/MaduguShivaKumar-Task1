/**
 * Automated Student Assignment & Submission Confirmation Test Suite
 *
 * Runs 17 automated tests covering:
 * 1. Student views assignments feed (GET /api/assignments/student)
 * 2. Student views specific assignment details (GET /api/assignments/student/:id)
 * 3. Student views non-allocated assignment rejected (403 Forbidden)
 * 4. Student views non-existent assignment rejected (404 Not Found)
 * 5. Invalid assignment UUID format rejected (400 Bad Request)
 * 6. Unauthenticated confirmation request rejected (401 Unauthorized)
 * 7. Admin attempts confirmation rejected by RBAC (403 Forbidden)
 * 8. Confirmation with missing required fields rejected (400 Bad Request)
 * 9. Confirmation with invalid UUID rejected (400 Bad Request)
 * 10. Confirmation by non-group member rejected (403 Forbidden)
 * 11. Confirmation for unallocated assignment rejected (400 Bad Request)
 * 12. Student successfully confirms submission (200 OK, alreadyConfirmed: false)
 * 13. Group submission status query (GET /api/submissions/:assignmentId/:groupId)
 * 14. Confirmed status & metadata reflected in student feed (GET /api/assignments/student)
 * 15. Confirmed status & metadata reflected in student details (GET /api/assignments/student/:id)
 * 16. Idempotent re-confirmation returns success (200 OK, alreadyConfirmed: true)
 * 17. Teammate synchronization: Teammate observes CONFIRMED status and confirmer's name
 *
 * Usage: node database/test-submissions.js
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

async function runSubmissionTests() {
  console.log('==================================================');
  console.log('📝 Starting Student Submission Confirmation Test Suite');
  console.log(`📡 Target API: ${BASE_URL}/submissions`);
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assertTest(name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] Test ${total}: ${name}`);
      if (details) console.log(`   ↳ ${details}`);
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${name}`);
      if (details) console.error(`   ↳ ${details}`);
    }
  }

  try {
    // 1. Authenticate Admin (Dr. Alan Turing)
    const adminLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const adminToken = adminLoginRes.data?.data?.token;

    // 2. Authenticate Student Alice (Team Alpha creator)
    const aliceLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLoginRes.data?.data?.token;
    const aliceUser = aliceLoginRes.data?.data?.user;

    // 3. Authenticate Student Bob (Team Alpha member / teammate)
    const bobLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'bob.jones@university.edu',
        password: 'Password123!',
      }),
    });
    const bobToken = bobLoginRes.data?.data?.token;

    // 4. Authenticate Outside Student Evan (Not in Team Alpha)
    const evanLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'evan.wright@university.edu',
        password: 'Password123!',
      }),
    });
    const evanToken = evanLoginRes.data?.data?.token;

    // 5. Setup test assignment created by Admin
    const createAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: `Phase 6 Submission Protocol Lab ${Date.now()}`,
        description: 'Comprehensive assignment testing two-step submission verification.',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        onedriveLink: 'https://1drv.ms/f/s!AmTestLabFolderSubmission',
      }),
    });
    const testAssignment = createAssignRes.data?.data?.assignment;

    // 6. Get Alice's Group ("Alpha Innovators")
    const aliceGroupsRes = await request(`${BASE_URL}/groups`, {
      token: aliceToken,
    });
    const teamAlpha =
      (aliceGroupsRes.data?.data?.groups || []).find(
        (g) => g.name === 'Alpha Innovators' || g.name === 'Team Alpha'
      ) || aliceGroupsRes.data?.data?.groups?.[0];
    const teamAlphaId = teamAlpha ? teamAlpha.id : null;

    // Allocate assignment exclusively to Team Alpha
    await request(`${BASE_URL}/assignments/${testAssignment.id}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        groupIds: [teamAlphaId],
      }),
    });

    // Create a second unallocated assignment
    const unallocatedAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: `Unallocated Coursework ${Date.now()}`,
        description: 'Not allocated to Team Alpha.',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        onedriveLink: 'https://onedrive.live.com/unallocated',
      }),
    });
    const unallocatedAssignment = unallocatedAssignRes.data?.data?.assignment;

    // -------------------------------------------------------------
    // TEST 1: Student views coursework feed (GET /api/assignments/student)
    // -------------------------------------------------------------
    const studentFeedRes = await request(`${BASE_URL}/assignments/student`, {
      token: aliceToken,
    });
    const foundInFeed = (studentFeedRes.data?.data?.assignments || []).find(
      (a) => a.id === testAssignment.id
    );
    assertTest(
      'Student views coursework feed (GET /api/assignments/student)',
      studentFeedRes.status === 200 && foundInFeed && foundInFeed.submission_status === 'PENDING',
      `Found assignment with initial submission status: "${foundInFeed?.submission_status}"`
    );

    // -------------------------------------------------------------
    // TEST 2: Student views specific assignment details (GET /api/assignments/student/:id)
    // -------------------------------------------------------------
    const studentDetailRes = await request(`${BASE_URL}/assignments/student/${testAssignment.id}`, {
      token: aliceToken,
    });
    assertTest(
      'Student views specific assignment details (GET /api/assignments/student/:id)',
      studentDetailRes.status === 200 &&
        studentDetailRes.data?.data?.assignment?.id === testAssignment.id &&
        studentDetailRes.data?.data?.assignment?.submission_status === 'PENDING',
      `Title: "${studentDetailRes.data?.data?.assignment?.title}", Status: "${studentDetailRes.data?.data?.assignment?.submission_status}"`
    );

    // -------------------------------------------------------------
    // TEST 3: Student views non-allocated assignment rejected (403 Forbidden)
    // -------------------------------------------------------------
    const forbiddenDetailRes = await request(`${BASE_URL}/assignments/student/${unallocatedAssignment.id}`, {
      token: aliceToken,
    });
    assertTest(
      'Student viewing non-allocated assignment rejected (403 Forbidden)',
      forbiddenDetailRes.status === 403,
      `Status: ${forbiddenDetailRes.status}, Error: "${forbiddenDetailRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 4: Student views non-existent assignment rejected (404 Not Found)
    // -------------------------------------------------------------
    const nonexistentDetailRes = await request(`${BASE_URL}/assignments/student/00000000-0000-0000-0000-000000000000`, {
      token: aliceToken,
    });
    assertTest(
      'Student viewing nonexistent assignment rejected (404 Not Found)',
      nonexistentDetailRes.status === 404,
      `Status: ${nonexistentDetailRes.status}, Error: "${nonexistentDetailRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 5: Invalid assignment UUID format rejected (400 Bad Request)
    // -------------------------------------------------------------
    const invalidUuidDetailRes = await request(`${BASE_URL}/assignments/student/invalid-uuid-format`, {
      token: aliceToken,
    });
    assertTest(
      'Invalid assignment UUID format rejected (400 Bad Request)',
      invalidUuidDetailRes.status === 400,
      `Status: ${invalidUuidDetailRes.status}, Error: "${invalidUuidDetailRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 6: Unauthenticated confirmation request rejected (401 Unauthorized)
    // -------------------------------------------------------------
    const unauthConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        assignmentId: testAssignment.id,
        groupId: teamAlphaId,
      }),
    });
    assertTest(
      'Unauthenticated submission confirmation rejected (401 Unauthorized)',
      unauthConfirmRes.status === 401,
      `Status: ${unauthConfirmRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 7: Admin attempts confirmation rejected by RBAC (403 Forbidden)
    // -------------------------------------------------------------
    const adminConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        assignmentId: testAssignment.id,
        groupId: teamAlphaId,
      }),
    });
    assertTest(
      'Admin confirmation attempt rejected by RBAC (403 Forbidden - Student only)',
      adminConfirmRes.status === 403,
      `Status: ${adminConfirmRes.status}, Error: "${adminConfirmRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 8: Confirmation with missing required fields rejected (400 Bad Request)
    // -------------------------------------------------------------
    const missingFieldsRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: testAssignment.id,
        // missing groupId
      }),
    });
    assertTest(
      'Confirmation with missing groupId rejected (400 Bad Request)',
      missingFieldsRes.status === 400,
      `Status: ${missingFieldsRes.status}, Error: "${missingFieldsRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 9: Confirmation with invalid UUID rejected (400 Bad Request)
    // -------------------------------------------------------------
    const badUuidConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: 'not-a-valid-uuid',
        groupId: teamAlphaId,
      }),
    });
    assertTest(
      'Confirmation with invalid UUID rejected (400 Bad Request)',
      badUuidConfirmRes.status === 400,
      `Status: ${badUuidConfirmRes.status}, Error: "${badUuidConfirmRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 10: Confirmation by non-group member rejected (403 Forbidden)
    // -------------------------------------------------------------
    const nonMemberConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: evanToken, // Evan is not in Team Alpha
      body: JSON.stringify({
        assignmentId: testAssignment.id,
        groupId: teamAlphaId,
      }),
    });
    assertTest(
      'Confirmation by non-group member rejected (403 Forbidden)',
      nonMemberConfirmRes.status === 403,
      `Status: ${nonMemberConfirmRes.status}, Error: "${nonMemberConfirmRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 11: Confirmation for unallocated assignment rejected (400 Bad Request)
    // -------------------------------------------------------------
    const unallocatedConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: unallocatedAssignment.id,
        groupId: teamAlphaId,
      }),
    });
    assertTest(
      'Confirmation for unallocated assignment rejected (400 Bad Request)',
      unallocatedConfirmRes.status === 400,
      `Status: ${unallocatedConfirmRes.status}, Error: "${unallocatedConfirmRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 12: Student successfully confirms submission (200 OK, alreadyConfirmed: false)
    // -------------------------------------------------------------
    const confirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: testAssignment.id,
        groupId: teamAlphaId,
      }),
    });
    const subData = confirmRes.data?.data?.submission;
    assertTest(
      'Student successfully confirms submission (200 OK)',
      confirmRes.status === 200 &&
        confirmRes.data?.data?.alreadyConfirmed === false &&
        subData?.status === 'CONFIRMED' &&
        subData?.confirmed_by === aliceUser.id,
      `Confirmed by Alice (${aliceUser.id}), Status: ${subData?.status}, ConfirmedAt: ${subData?.confirmed_at}`
    );

    // -------------------------------------------------------------
    // TEST 13: Group submission status query (GET /api/submissions/:assignmentId/:groupId)
    // -------------------------------------------------------------
    const statusQueryRes = await request(
      `${BASE_URL}/submissions/${testAssignment.id}/${teamAlphaId}`,
      { token: aliceToken }
    );
    assertTest(
      'Group submission status query (GET /api/submissions/:assignmentId/:groupId)',
      statusQueryRes.status === 200 &&
        statusQueryRes.data?.data?.status === 'CONFIRMED' &&
        statusQueryRes.data?.data?.submission?.confirmed_by_name === aliceUser.name,
      `Status: ${statusQueryRes.data?.data?.status}, Confirmed by: ${statusQueryRes.data?.data?.submission?.confirmed_by_name}`
    );

    // -------------------------------------------------------------
    // TEST 14: Confirmed status & metadata reflected in student feed
    // -------------------------------------------------------------
    const refreshedFeedRes = await request(`${BASE_URL}/assignments/student`, {
      token: aliceToken,
    });
    const refreshedItem = (refreshedFeedRes.data?.data?.assignments || []).find(
      (a) => a.id === testAssignment.id
    );
    assertTest(
      'Confirmed status & metadata reflected in student feed',
      refreshedItem?.submission_status === 'CONFIRMED' &&
        refreshedItem?.confirmed_by_name === aliceUser.name,
      `Submission status: "${refreshedItem?.submission_status}", Confirmed by: "${refreshedItem?.confirmed_by_name}"`
    );

    // -------------------------------------------------------------
    // TEST 15: Confirmed status & metadata reflected in student details
    // -------------------------------------------------------------
    const refreshedDetailRes = await request(
      `${BASE_URL}/assignments/student/${testAssignment.id}`,
      { token: aliceToken }
    );
    const detailAssign = refreshedDetailRes.data?.data?.assignment;
    assertTest(
      'Confirmed status & metadata reflected in student details',
      detailAssign?.submission_status === 'CONFIRMED' &&
        detailAssign?.confirmed_by_name === aliceUser.name,
      `Detail status: "${detailAssign?.submission_status}", Confirmed by: "${detailAssign?.confirmed_by_name}"`
    );

    // -------------------------------------------------------------
    // TEST 16: Idempotent re-confirmation returns success (200 OK, alreadyConfirmed: true)
    // -------------------------------------------------------------
    const repeatConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: testAssignment.id,
        groupId: teamAlphaId,
      }),
    });
    assertTest(
      'Idempotent re-confirmation returns 200 OK with alreadyConfirmed: true',
      repeatConfirmRes.status === 200 &&
        repeatConfirmRes.data?.data?.alreadyConfirmed === true &&
        repeatConfirmRes.data?.data?.submission?.status === 'CONFIRMED',
      `Message: "${repeatConfirmRes.data?.message}", alreadyConfirmed: ${repeatConfirmRes.data?.data?.alreadyConfirmed}`
    );

    // -------------------------------------------------------------
    // TEST 17: Teammate synchronization (Bob sees Alice\'s confirmation)
    // -------------------------------------------------------------
    const bobFeedRes = await request(`${BASE_URL}/assignments/student`, {
      token: bobToken,
    });
    const bobItem = (bobFeedRes.data?.data?.assignments || []).find(
      (a) => a.id === testAssignment.id
    );
    assertTest(
      'Teammate synchronization: Bob observes CONFIRMED status and Alice as confirmer',
      bobItem?.submission_status === 'CONFIRMED' &&
        bobItem?.confirmed_by_name === aliceUser.name,
      `Bob view: Status "${bobItem?.submission_status}", Confirmed by: "${bobItem?.confirmed_by_name}"`
    );

    // Cleanup test assignments
    await request(`${BASE_URL}/assignments/${testAssignment.id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    await request(`${BASE_URL}/assignments/${unallocatedAssignment.id}`, {
      method: 'DELETE',
      token: adminToken,
    });

  } catch (err) {
    console.error('💥 Unhandled error in submission tests:', err);
  }

  console.log('\n==================================================');
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('==================================================\n');

  if (passed === total) {
    console.log('🎉 All Student Assignment & Submission Confirmation Tests Passed!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} tests failed.`);
    process.exit(1);
  }
}

runSubmissionTests();
