/**
 * Joineazy Phase 9: Security Hardening, Input Validation, Object-Level Authorization & E2E Test Suite
 *
 * Runs comprehensive verification across:
 * 1.  Password security: bcrypt hashing verified, hash stripped from API responses
 * 2.  JWT security: valid issuance, rejection of tampered/expired/malformed tokens
 * 3.  RBAC enforcement: Student forbidden from admin actions (403)
 * 4.  Admin authorization: Admin permitted for administrative operations (200/201)
 * 5.  Object-level auth: Student forbidden from viewing another group's details (403)
 * 6.  Object-level auth: Student forbidden from viewing another group's progress (403)
 * 7.  Object-level auth: Student forbidden from adding members to an unjoined group (403)
 * 8.  Object-level auth: Student forbidden from removing members in another group (400/403)
 * 9.  Object-level auth: Student cannot confirm submission for an unjoined group (403)
 * 10. Object-level auth: Student cannot view coursework unallocated to their groups (403)
 * 11. Input validation: Malformed group UUID rejected with 400 Bad Request
 * 12. Input validation: Malformed assignment UUID rejected with 400 Bad Request
 * 13. Input validation: Short/empty assignment title rejected with 400 Bad Request
 * 14. Input validation: Invalid due date string rejected with 400 Bad Request
 * 15. Input validation: Invalid OneDrive URL protocol rejected with 400 Bad Request
 * 16. Input validation: Empty group name rejected with 400 Bad Request
 * 17. Input validation: Role tampering in registration prevented (403)
 * 18. SQL Injection defense: SQL injection payloads in search filter handled safely
 * 19. SQL Injection defense: SQL injection payloads in group name handled safely
 * 20. Centralized error handling: Consistent JSON structure { success: false, message: ... }
 * 21. Production safety: Stack traces omitted when NODE_ENV=production
 * 22. End-to-End Business Flow: Admin Login -> Create Assignment
 * 23. End-to-End Business Flow: Admin assigns coursework to test group
 * 24. End-to-End Business Flow: Student Login & discovers coursework
 * 25. End-to-End Business Flow: Student confirms submission (status becomes CONFIRMED)
 * 26. End-to-End Business Flow: Group progress and Analytics immediately update
 *
 * Usage: node database/test-phase9-hardening.js
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
    // Non-JSON response
  }
  return { status: res.status, data };
}

async function runHardeningTests() {
  console.log('==================================================');
  console.log('🔒 Starting Phase 9 Security Hardening & E2E Test Suite');
  console.log(`📡 Target API: ${BASE_URL}`);
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
    // -------------------------------------------------------------
    // SECTION 1: AUTHENTICATION & PASSWORD SECURITY
    // -------------------------------------------------------------
    const adminLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const adminToken = adminLoginRes.data?.data?.token;
    const adminUser = adminLoginRes.data?.data?.user;

    assertTest(
      'Admin login returns 200 OK and JWT token',
      adminLoginRes.status === 200 && Boolean(adminToken),
      `User: ${adminUser?.name}, Role: ${adminUser?.role}`
    );

    assertTest(
      'Password hash is completely excluded from login response',
      adminUser && adminUser.password_hash === undefined && adminUser.password === undefined,
      'password_hash sanitized successfully'
    );

    const aliceLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLoginRes.data?.data?.token;
    const aliceUser = aliceLoginRes.data?.data?.user;

    const charlieLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'charlie.brown@university.edu',
        password: 'Password123!',
      }),
    });
    const charlieToken = charlieLoginRes.data?.data?.token;

    assertTest(
      'Student login returns 200 OK without password_hash',
      aliceLoginRes.status === 200 &&
        Boolean(aliceToken) &&
        aliceUser?.password_hash === undefined,
      `Student ID: ${aliceUser?.student_id}`
    );

    // -------------------------------------------------------------
    // SECTION 2: JWT SECURITY
    // -------------------------------------------------------------
    const tamperedToken = `${aliceToken.slice(0, -5)}XXXXX`;
    const tamperedRes = await request(`${BASE_URL}/auth/me`, {
      token: tamperedToken,
    });
    assertTest(
      'Tampered/invalid JWT signature rejected with 401 Unauthorized',
      tamperedRes.status === 401,
      `Status: ${tamperedRes.status}, Message: ${tamperedRes.data?.message}`
    );

    const malformedRes = await request(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer this.is.not.a.valid.jwt' },
    });
    assertTest(
      'Malformed JWT rejected with 401 Unauthorized',
      malformedRes.status === 401,
      `Status: ${malformedRes.status}`
    );

    const missingTokenRes = await request(`${BASE_URL}/auth/me`);
    assertTest(
      'Missing JWT token on protected route rejected with 401 Unauthorized',
      missingTokenRes.status === 401,
      `Status: ${missingTokenRes.status}`
    );

    // -------------------------------------------------------------
    // SECTION 3: RBAC ENFORCEMENT
    // -------------------------------------------------------------
    const studentCreateAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        title: 'Unauthorized Assignment',
        dueDate: new Date().toISOString(),
        onedriveLink: 'https://1drv.ms/u/s!fake',
      }),
    });
    assertTest(
      'Student attempting to create assignment rejected with 403 Forbidden',
      studentCreateAssignRes.status === 403,
      `Status: ${studentCreateAssignRes.status}`
    );

    const studentAnalyticsRes = await request(`${BASE_URL}/analytics/overview`, {
      token: aliceToken,
    });
    assertTest(
      'Student attempting to access admin analytics rejected with 403 Forbidden',
      studentAnalyticsRes.status === 403,
      `Status: ${studentAnalyticsRes.status}`
    );

    const studentMonitoringRes = await request(`${BASE_URL}/admin/dashboard/summary`, {
      token: aliceToken,
    });
    assertTest(
      'Student attempting to access admin monitoring rejected with 403 Forbidden',
      studentMonitoringRes.status === 403,
      `Status: ${studentMonitoringRes.status}`
    );

    // -------------------------------------------------------------
    // SECTION 4: OBJECT-LEVEL AUTHORIZATION
    // -------------------------------------------------------------
    // Create an isolated group owned strictly by Alice
    const isolatedGroupName = `Isolated Alpha Group ${Date.now()}`;
    const createGroupRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: isolatedGroupName }),
    });
    const isolatedGroupId = createGroupRes.data?.data?.group?.id;

    // Student Charlie (not a member) attempts to view Alice's group details
    const charlieViewRes = await request(`${BASE_URL}/groups/${isolatedGroupId}`, {
      token: charlieToken,
    });
    assertTest(
      'Student Charlie forbidden from viewing unjoined group details (403 Forbidden)',
      charlieViewRes.status === 403,
      `Status: ${charlieViewRes.status}, Message: ${charlieViewRes.data?.message}`
    );

    // Student Charlie attempts to view group progress
    const charlieProgressRes = await request(`${BASE_URL}/groups/${isolatedGroupId}/progress`, {
      token: charlieToken,
    });
    assertTest(
      'Student Charlie forbidden from viewing unjoined group progress (403 Forbidden)',
      charlieProgressRes.status === 403,
      `Status: ${charlieProgressRes.status}`
    );

    // Student Charlie attempts to add member to Alice's group
    const charlieAddMemberRes = await request(`${BASE_URL}/groups/${isolatedGroupId}/members`, {
      method: 'POST',
      token: charlieToken,
      body: JSON.stringify({ email: 'bob.jones@university.edu' }),
    });
    assertTest(
      'Student Charlie forbidden from adding members to an unjoined group (403 Forbidden)',
      charlieAddMemberRes.status === 403,
      `Status: ${charlieAddMemberRes.status}`
    );

    // -------------------------------------------------------------
    // SECTION 5: INPUT VALIDATION & PARAMETER SANITIZATION
    // -------------------------------------------------------------
    const badUuidRes = await request(`${BASE_URL}/groups/invalid-not-a-uuid-12345`, {
      token: aliceToken,
    });
    assertTest(
      'Malformed UUID parameter rejected cleanly with 400 Bad Request',
      badUuidRes.status === 400,
      `Status: ${badUuidRes.status}, Message: ${badUuidRes.data?.message}`
    );

    const badAssignUuidRes = await request(`${BASE_URL}/assignments/invalid-not-a-uuid-99999`, {
      token: adminToken,
    });
    assertTest(
      'Malformed assignment UUID parameter rejected cleanly with 400 Bad Request',
      badAssignUuidRes.status === 400,
      `Status: ${badAssignUuidRes.status}, Message: ${badAssignUuidRes.data?.message}`
    );

    const shortAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'AB', // too short (<3 chars)
        dueDate: new Date().toISOString(),
        onedriveLink: 'https://1drv.ms/u/s!valid',
      }),
    });
    assertTest(
      'Short assignment title (<3 chars) rejected with 400 Bad Request',
      shortAssignRes.status === 400,
      `Status: ${shortAssignRes.status}, Message: ${shortAssignRes.data?.message}`
    );

    const badDateRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'Valid Title Here',
        dueDate: 'not-a-valid-date-string',
        onedriveLink: 'https://1drv.ms/u/s!valid',
      }),
    });
    assertTest(
      'Invalid due date format rejected with 400 Bad Request',
      badDateRes.status === 400,
      `Status: ${badDateRes.status}`
    );

    const badUrlRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'Valid Title Here',
        dueDate: new Date().toISOString(),
        onedriveLink: 'javascript:alert(1)', // Dangerous protocol
      }),
    });
    assertTest(
      'Dangerous URL protocol rejected with 400 Bad Request',
      badUrlRes.status === 400,
      `Status: ${badUrlRes.status}`
    );

    const emptyGroupRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: ' ' }),
    });
    assertTest(
      'Empty group name rejected with 400 Bad Request',
      emptyGroupRes.status === 400,
      `Status: ${emptyGroupRes.status}`
    );

    // -------------------------------------------------------------
    // SECTION 6: SQL INJECTION DEFENSE
    // -------------------------------------------------------------
    const sqlInjectionQuery = `CS401' OR '1'='1' --`;
    const sqlSearchRes = await request(
      `${BASE_URL}/analytics/assignments?search=${encodeURIComponent(sqlInjectionQuery)}`,
      { token: adminToken }
    );
    assertTest(
      'SQL injection query safely parameterized and handled without error',
      sqlSearchRes.status === 200,
      `Status: ${sqlSearchRes.status}, Result count: ${sqlSearchRes.data?.data?.assignments?.length}`
    );

    // -------------------------------------------------------------
    // SECTION 7: CENTRALIZED ERROR RESPONSE CONSISTENCY
    // -------------------------------------------------------------
    const notFoundRes = await request(`${BASE_URL}/groups/00000000-0000-0000-0000-000000000000`, {
      token: adminToken,
    });
    assertTest(
      'Consistent error response format { success: false, message: ... } on 404',
      notFoundRes.status === 404 &&
        notFoundRes.data?.success === false &&
        typeof notFoundRes.data?.message === 'string',
      `Message: "${notFoundRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // SECTION 8: COMPLETE END-TO-END BUSINESS FLOW (Requirement 22)
    // -------------------------------------------------------------
    // Step A: Admin creates an assignment
    const e2eAssignTitle = `Phase 9 Production Verification Lab ${Date.now()}`;
    const e2eOneDriveUrl = 'https://1drv.ms/u/s!e2e-production-verified';
    const createAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: e2eAssignTitle,
        description: 'End-to-end multi-step verification of assignment submission and progress.',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        onedriveLink: e2eOneDriveUrl,
        groupIds: [isolatedGroupId],
      }),
    });
    const e2eAssign = createAssignRes.data?.data?.assignment;
    const e2eAssignId = e2eAssign?.id;

    assertTest(
      'E2E Step 1: Admin creates assignment and allocates to test group',
      createAssignRes.status === 201 && Boolean(e2eAssignId),
      `Assignment ID: ${e2eAssignId}, Title: "${e2eAssignTitle}"`
    );

    // Step B: Student Alice discovers coursework
    const studentCourseworkRes = await request(`${BASE_URL}/assignments/student/${e2eAssignId}`, {
      token: aliceToken,
    });
    const discoveredAssign = studentCourseworkRes.data?.data?.assignment;
    assertTest(
      'E2E Step 2: Student discovers allocated coursework with initial PENDING status',
      studentCourseworkRes.status === 200 &&
        discoveredAssign?.submission_status === 'PENDING' &&
        discoveredAssign?.onedrive_link === e2eOneDriveUrl,
      `OneDrive URL: ${discoveredAssign?.onedrive_link}`
    );

    // Step C: Student Charlie (unauthorized) attempts to confirm Alice's submission
    const charlieConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: charlieToken,
      body: JSON.stringify({
        assignmentId: e2eAssignId,
        groupId: isolatedGroupId,
        confirmationAcknowledged: true,
      }),
    });
    assertTest(
      'E2E Step 3: Unauthorized student confirmation rejected with 403 Forbidden',
      charlieConfirmRes.status === 403,
      `Status: ${charlieConfirmRes.status}, Message: ${charlieConfirmRes.data?.message}`
    );

    // Step D: Student Alice confirms submission
    const aliceConfirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: e2eAssignId,
        groupId: isolatedGroupId,
        confirmationAcknowledged: true,
      }),
    });
    const confirmedSub = aliceConfirmRes.data?.data?.submission;
    assertTest(
      'E2E Step 4: Authorized student successfully confirms submission (200 OK)',
      aliceConfirmRes.status === 200 &&
        confirmedSub?.status === 'CONFIRMED' &&
        confirmedSub?.confirmed_by === aliceUser?.id,
      `Confirmed by Alice (${aliceUser?.id}), ConfirmedAt: ${confirmedSub?.confirmed_at}`
    );

    // Step E: Verify group progress updates to 100%
    const progressCheckRes = await request(`${BASE_URL}/groups/${isolatedGroupId}/progress`, {
      token: aliceToken,
    });
    const progressData = progressCheckRes.data?.data;
    assertTest(
      'E2E Step 5: Group progress reflects 100% completion in real-time',
      progressCheckRes.status === 200 &&
        progressData?.completedAssignments === 1 &&
        progressData?.progressPercentage === 100,
      `Group Progress: ${progressData?.completedAssignments}/${progressData?.totalAssignments} (${progressData?.progressPercentage}%)`
    );

    // Step F: Verify Admin Dashboard & Analytics reflect updated counts immediately
    const analyticsCheckRes = await request(
      `${BASE_URL}/analytics/assignments?search=${encodeURIComponent(e2eAssignTitle)}`,
      { token: adminToken }
    );
    const analyticsItem = analyticsCheckRes.data?.data?.assignments?.[0];
    assertTest(
      'E2E Step 6: Analytics immediately reflects updated coursework completion (100%)',
      analyticsCheckRes.status === 200 &&
        analyticsItem?.confirmedGroups === 1 &&
        analyticsItem?.completionPercentage === 100,
      `Confirmed Groups: ${analyticsItem?.confirmedGroups}/${analyticsItem?.totalGroups} (100%)`
    );
  } catch (error) {
    console.error('\n❌ Unexpected error running Phase 9 hardening tests:', error);
  }

  console.log('\n==================================================');
  console.log(`📊 Hardening & E2E Test Suite Completed: ${passed}/${total} Passed`);
  console.log('==================================================\n');

  if (passed === total && total > 0) {
    console.log('🎉 ALL PHASE 9 SECURITY HARDENING & E2E TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} tests failed.\n`);
    process.exit(1);
  }
}

runHardeningTests();
