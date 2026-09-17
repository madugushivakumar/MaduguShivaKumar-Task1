/**
 * Automated Progress Tracking and Monitoring Test Suite
 *
 * Runs 18 automated tests covering:
 * 1. Group progress with 0 assignments evaluates to 0%
 * 2. Group progress partial completion calculation (50%)
 * 3. Group progress 100% completion calculation
 * 4. Student accessing own group progress permitted (200 OK)
 * 5. Student accessing another group's progress forbidden (403 Forbidden)
 * 6. Invalid group UUID rejected (400 Bad Request)
 * 7. Nonexistent group UUID rejected (404 Not Found)
 * 8. Admin dashboard summary statistics (GET /api/admin/dashboard/summary)
 * 9. Admin groups progress list (GET /api/admin/groups)
 * 10. Admin group search filter by group name
 * 11. Admin group details with member roster & coursework status (GET /api/admin/groups/:id)
 * 12. Admin assignment-wise monitoring (GET /api/admin/submissions/assignment/:id)
 * 13. Admin group-wise submissions monitoring (GET /api/admin/submissions/group/:id)
 * 14. Student-wise confirmation tracking distinguishes confirmer from teammate
 * 15. Student-wise tracking search filter by student name / code
 * 16. Unauthenticated monitoring request rejected (401 Unauthorized)
 * 17. Student accessing admin monitoring endpoints rejected (403 Forbidden)
 * 18. Dynamic update: confirmation immediately updates progress without stale state
 *
 * Usage: node database/test-progress.js
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

async function runProgressTests() {
  console.log('==================================================');
  console.log('📊 Starting Progress Tracking & Monitoring Test Suite');
  console.log(`📡 Target API: ${BASE_URL}/admin & ${BASE_URL}/groups/:id/progress`);
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

    // 2. Authenticate Student Alice (Member of Alpha Innovators)
    const aliceLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLoginRes.data?.data?.token;
    const aliceUser = aliceLoginRes.data?.data?.user;

    // 3. Authenticate Student Charlie (Member of Cloud Architects, NOT Alpha Innovators)
    const charlieLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'charlie.brown@university.edu',
        password: 'Password123!',
      }),
    });
    const charlieToken = charlieLoginRes.data?.data?.token;

    // 4. Create a dedicated isolated test group for progress calculation tests
    const testGroupName = `Progress Test Group ${Date.now()}`;
    const createGroupRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        name: testGroupName,
      }),
    });
    const testGroup = createGroupRes.data?.data?.group;
    const testGroupId = testGroup.id;

    // Add Bob Jones to the test group so we have multiple members
    await request(`${BASE_URL}/groups/${testGroupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: 'bob.jones@university.edu',
      }),
    });

    // -------------------------------------------------------------
    // TEST 1: Group progress with 0 assignments evaluates to 0%
    // -------------------------------------------------------------
    const zeroProgressRes = await request(`${BASE_URL}/groups/${testGroupId}/progress`, {
      token: aliceToken,
    });
    const zeroData = zeroProgressRes.data?.data;
    assertTest(
      'Group progress with 0 assignments evaluates to 0%',
      zeroProgressRes.status === 200 &&
        zeroData?.totalAssignments === 0 &&
        zeroData?.completedAssignments === 0 &&
        zeroData?.progressPercentage === 0,
      `Total: ${zeroData?.totalAssignments}, Progress: ${zeroData?.progressPercentage}%`
    );

    // Setup 2 test assignments allocated to testGroup
    const assign1Res = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: `Progress Lab A ${Date.now()}`,
        description: 'First assignment for progress testing.',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        onedriveLink: 'https://onedrive.live.com/test-progress-1',
      }),
    });
    const assign1 = assign1Res.data?.data?.assignment;

    const assign2Res = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: `Progress Lab B ${Date.now()}`,
        description: 'Second assignment for progress testing.',
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        onedriveLink: 'https://onedrive.live.com/test-progress-2',
      }),
    });
    const assign2 = assign2Res.data?.data?.assignment;

    // Allocate both assignments to testGroup
    await request(`${BASE_URL}/assignments/${assign1.id}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ groupIds: [testGroupId] }),
    });
    await request(`${BASE_URL}/assignments/${assign2.id}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ groupIds: [testGroupId] }),
    });

    // Confirm assignment 1 by Alice
    await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: assign1.id,
        groupId: testGroupId,
      }),
    });

    // -------------------------------------------------------------
    // TEST 2: Group progress partial completion calculation (1 of 2 = 50%)
    // -------------------------------------------------------------
    const partialProgressRes = await request(`${BASE_URL}/groups/${testGroupId}/progress`, {
      token: aliceToken,
    });
    const partialData = partialProgressRes.data?.data;
    assertTest(
      'Group progress partial completion calculation (1 of 2 = 50%)',
      partialProgressRes.status === 200 &&
        partialData?.totalAssignments === 2 &&
        partialData?.completedAssignments === 1 &&
        partialData?.pendingAssignments === 1 &&
        partialData?.progressPercentage === 50,
      `Completed: ${partialData?.completedAssignments}/2, Progress: ${partialData?.progressPercentage}%`
    );

    // Confirm assignment 2 by Alice
    await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: assign2.id,
        groupId: testGroupId,
      }),
    });

    // -------------------------------------------------------------
    // TEST 3: Group progress 100% completion calculation (2 of 2 = 100%)
    // -------------------------------------------------------------
    const fullProgressRes = await request(`${BASE_URL}/groups/${testGroupId}/progress`, {
      token: aliceToken,
    });
    const fullData = fullProgressRes.data?.data;
    assertTest(
      'Group progress 100% completion calculation (2 of 2 = 100%)',
      fullProgressRes.status === 200 &&
        fullData?.totalAssignments === 2 &&
        fullData?.completedAssignments === 2 &&
        fullData?.pendingAssignments === 0 &&
        fullData?.progressPercentage === 100,
      `Completed: ${fullData?.completedAssignments}/2, Progress: ${fullData?.progressPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST 4: Student accessing own group progress permitted (200 OK)
    // -------------------------------------------------------------
    assertTest(
      'Student accessing own group progress permitted (200 OK)',
      fullProgressRes.status === 200 && fullData?.groupId === testGroupId,
      `Group ID: ${fullData?.groupId}, Name: "${fullData?.groupName}"`
    );

    // -------------------------------------------------------------
    // TEST 5: Student accessing another group's progress forbidden (403 Forbidden)
    // -------------------------------------------------------------
    const forbiddenRes = await request(`${BASE_URL}/groups/${testGroupId}/progress`, {
      token: charlieToken, // Charlie is not in testGroup
    });
    assertTest(
      'Student accessing another group\'s progress forbidden (403 Forbidden)',
      forbiddenRes.status === 403,
      `Status: ${forbiddenRes.status}, Error: "${forbiddenRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 6: Invalid group UUID rejected (400 Bad Request)
    // -------------------------------------------------------------
    const invalidUuidRes = await request(`${BASE_URL}/groups/not-a-valid-uuid/progress`, {
      token: aliceToken,
    });
    assertTest(
      'Invalid group UUID rejected (400 Bad Request)',
      invalidUuidRes.status === 400,
      `Status: ${invalidUuidRes.status}, Error: "${invalidUuidRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 7: Nonexistent group UUID rejected (404 Not Found)
    // -------------------------------------------------------------
    const notFoundRes = await request(
      `${BASE_URL}/groups/00000000-0000-0000-0000-000000000000/progress`,
      { token: adminToken }
    );
    assertTest(
      'Nonexistent group UUID rejected (404 Not Found)',
      notFoundRes.status === 404,
      `Status: ${notFoundRes.status}, Error: "${notFoundRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 8: Admin dashboard summary statistics (GET /api/admin/dashboard/summary)
    // -------------------------------------------------------------
    const summaryRes = await request(`${BASE_URL}/admin/dashboard/summary`, {
      token: adminToken,
    });
    const summaryData = summaryRes.data?.data;
    assertTest(
      'Admin dashboard summary statistics (GET /api/admin/dashboard/summary)',
      summaryRes.status === 200 &&
        typeof summaryData?.totalStudents === 'number' &&
        typeof summaryData?.totalGroups === 'number' &&
        typeof summaryData?.totalAssignments === 'number' &&
        typeof summaryData?.overallCompletionPercentage === 'number',
      `Students: ${summaryData?.totalStudents}, Groups: ${summaryData?.totalGroups}, Assignments: ${summaryData?.totalAssignments}, Overall Completion: ${summaryData?.overallCompletionPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST 9: Admin groups progress list (GET /api/admin/groups)
    // -------------------------------------------------------------
    const adminGroupsRes = await request(`${BASE_URL}/admin/groups`, {
      token: adminToken,
    });
    const allGroups = adminGroupsRes.data?.data?.groups || [];
    const foundTestGroup = allGroups.find((g) => g.groupId === testGroupId);
    assertTest(
      'Admin groups progress list (GET /api/admin/groups)',
      adminGroupsRes.status === 200 &&
        allGroups.length > 0 &&
        foundTestGroup &&
        foundTestGroup.progressPercentage === 100,
      `Total Groups listed: ${allGroups.length}, Test Group Progress: ${foundTestGroup?.progressPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST 10: Admin group search filter by group name
    // -------------------------------------------------------------
    const searchRes = await request(
      `${BASE_URL}/admin/groups?search=${encodeURIComponent(testGroupName)}`,
      { token: adminToken }
    );
    const searchGroups = searchRes.data?.data?.groups || [];
    assertTest(
      'Admin group search filter by group name',
      searchRes.status === 200 &&
        searchGroups.length === 1 &&
        searchGroups[0].groupName === testGroupName,
      `Found matching group: "${searchGroups[0]?.groupName}"`
    );

    // -------------------------------------------------------------
    // TEST 11: Admin group details with member roster & coursework status (GET /api/admin/groups/:id)
    // -------------------------------------------------------------
    const groupDetailsRes = await request(`${BASE_URL}/admin/groups/${testGroupId}`, {
      token: adminToken,
    });
    const groupDetails = groupDetailsRes.data?.data;
    assertTest(
      'Admin group details with member roster & coursework status (GET /api/admin/groups/:id)',
      groupDetailsRes.status === 200 &&
        groupDetails?.members?.length === 2 &&
        groupDetails?.assignments?.length === 2 &&
        groupDetails?.assignments[0]?.submission_status === 'CONFIRMED',
      `Members: ${groupDetails?.members?.length}, Assigned Coursework: ${groupDetails?.assignments?.length}`
    );

    // -------------------------------------------------------------
    // TEST 12: Admin assignment-wise monitoring (GET /api/admin/submissions/assignment/:id)
    // -------------------------------------------------------------
    const assignSubRes = await request(
      `${BASE_URL}/admin/submissions/assignment/${assign1.id}`,
      { token: adminToken }
    );
    const assignSubData = assignSubRes.data?.data;
    assertTest(
      'Admin assignment-wise monitoring (GET /api/admin/submissions/assignment/:id)',
      assignSubRes.status === 200 &&
        assignSubData?.assignedGroupsCount >= 1 &&
        assignSubData?.confirmedGroupsCount >= 1 &&
        assignSubData?.completionPercentage === 100,
      `Assigned: ${assignSubData?.assignedGroupsCount}, Confirmed: ${assignSubData?.confirmedGroupsCount}, Completion: ${assignSubData?.completionPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST 13: Admin group-wise submissions monitoring (GET /api/admin/submissions/group/:id)
    // -------------------------------------------------------------
    const groupSubRes = await request(
      `${BASE_URL}/admin/submissions/group/${testGroupId}`,
      { token: adminToken }
    );
    assertTest(
      'Admin group-wise submissions monitoring (GET /api/admin/submissions/group/:id)',
      groupSubRes.status === 200 &&
        groupSubRes.data?.data?.assignments?.length === 2,
      `Retrieved ${groupSubRes.data?.data?.assignments?.length} assignments for group`
    );

    // -------------------------------------------------------------
    // TEST 14: Student-wise confirmation tracking distinguishes confirmer from teammate
    // -------------------------------------------------------------
    const studentWiseRes = await request(
      `${BASE_URL}/admin/submissions/student-wise?groupId=${testGroupId}&assignmentId=${assign1.id}`,
      { token: adminToken }
    );
    const records = studentWiseRes.data?.data?.records || [];
    const aliceRecord = records.find((r) => r.studentEmail === 'alice.smith@university.edu');
    const bobRecord = records.find((r) => r.studentEmail === 'bob.jones@university.edu');

    assertTest(
      'Student-wise confirmation tracking distinguishes confirmer from teammate',
      studentWiseRes.status === 200 &&
        records.length === 2 &&
        aliceRecord?.isConfirmer === true &&
        bobRecord?.isConfirmer === false &&
        aliceRecord?.groupSubmissionStatus === 'CONFIRMED' &&
        bobRecord?.groupSubmissionStatus === 'CONFIRMED' &&
        bobRecord?.confirmedByName === 'Alice Smith',
      `Alice isConfirmer: ${aliceRecord?.isConfirmer}, Bob isConfirmer: ${bobRecord?.isConfirmer}, Confirmed By: "${bobRecord?.confirmedByName}"`
    );

    // -------------------------------------------------------------
    // TEST 15: Student-wise tracking search filter by student code / email
    // -------------------------------------------------------------
    const studentSearchRes = await request(
      `${BASE_URL}/admin/submissions/student-wise?search=STU2026001`,
      { token: adminToken }
    );
    const filteredRecords = studentSearchRes.data?.data?.records || [];
    assertTest(
      'Student-wise tracking search filter by student code / email',
      studentSearchRes.status === 200 &&
        filteredRecords.length > 0 &&
        filteredRecords.every((r) => r.studentCode === 'STU2026001'),
      `Returned ${filteredRecords.length} records matching "STU2026001"`
    );

    // -------------------------------------------------------------
    // TEST 16: Unauthenticated monitoring request rejected (401 Unauthorized)
    // -------------------------------------------------------------
    const unauthRes = await request(`${BASE_URL}/admin/dashboard/summary`);
    assertTest(
      'Unauthenticated monitoring request rejected (401 Unauthorized)',
      unauthRes.status === 401,
      `Status: ${unauthRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 17: Student accessing admin monitoring endpoints rejected (403 Forbidden)
    // -------------------------------------------------------------
    const studentAdminRes = await request(`${BASE_URL}/admin/groups`, {
      token: aliceToken,
    });
    assertTest(
      'Student accessing admin monitoring endpoints rejected (403 Forbidden)',
      studentAdminRes.status === 403,
      `Status: ${studentAdminRes.status}, Error: "${studentAdminRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 18: Dynamic update: adding new coursework updates progress immediately
    // -------------------------------------------------------------
    // Create a 3rd assignment and allocate to testGroup
    const assign3Res = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: `Progress Lab C (Dynamic) ${Date.now()}`,
        description: 'Third assignment testing real-time recalculation.',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        onedriveLink: 'https://onedrive.live.com/test-progress-3',
      }),
    });
    const assign3 = assign3Res.data?.data?.assignment;

    await request(`${BASE_URL}/assignments/${assign3.id}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ groupIds: [testGroupId] }),
    });

    // Now testGroup has 3 assignments, 2 confirmed -> 67%
    const dynamicProgressRes = await request(`${BASE_URL}/groups/${testGroupId}/progress`, {
      token: aliceToken,
    });
    const dynamicData = dynamicProgressRes.data?.data;
    assertTest(
      'Dynamic update: new assignment immediately recalculates progress without cache stale state',
      dynamicProgressRes.status === 200 &&
        dynamicData?.totalAssignments === 3 &&
        dynamicData?.completedAssignments === 2 &&
        dynamicData?.pendingAssignments === 1 &&
        dynamicData?.progressPercentage === 67,
      `Total: ${dynamicData?.totalAssignments}, Completed: ${dynamicData?.completedAssignments}, Progress: ${dynamicData?.progressPercentage}% (Expected 67%)`
    );

    // Cleanup test assignments
    await request(`${BASE_URL}/assignments/${assign1.id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    await request(`${BASE_URL}/assignments/${assign2.id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    await request(`${BASE_URL}/assignments/${assign3.id}`, {
      method: 'DELETE',
      token: adminToken,
    });

  } catch (err) {
    console.error('💥 Unhandled error in progress tests:', err);
  }

  console.log('\n==================================================');
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('==================================================\n');

  if (passed === total) {
    console.log('🎉 All Progress Tracking & Monitoring Tests Passed!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} tests failed.`);
    process.exit(1);
  }
}

runProgressTests();
