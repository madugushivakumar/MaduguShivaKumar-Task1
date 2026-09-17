/**
 * Automated Assignment Management Test Suite
 *
 * Runs 17 automated tests covering:
 * 1. Admin creates assignment successfully (201 Created)
 * 2. Student attempts to create assignment (403 Forbidden)
 * 3. Unauthenticated assignment creation (401 Unauthorized)
 * 4. Invalid / short title rejected (400 Bad Request)
 * 5. Invalid due date format rejected (400 Bad Request)
 * 6. Invalid OneDrive URL rejected (400 Bad Request)
 * 7. Admin retrieves assignment list (GET /api/assignments)
 * 8. Admin updates assignment details (PUT /api/assignments/:id)
 * 9. Student attempts to edit assignment (403 Forbidden)
 * 10. Update nonexistent assignment rejected (404 Not Found)
 * 11. Admin assigns to specific groups (POST /api/assignments/:id/groups)
 * 12. Duplicate group assignment handled idempotently
 * 13. Assign to nonexistent group ID rejected (404 Not Found)
 * 14. Admin assigns to all groups (POST /api/assignments/:id/assign-all)
 * 15. Student assignment discovery (GET /api/assignments/student returns enrolled coursework)
 * 16. Outside student does NOT receive unallocated coursework
 * 17. Student viewing non-allocated assignment details rejected (403 Forbidden)
 *
 * Usage: node database/test-assignments.js
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

async function runAssignmentTests() {
  console.log('==================================================');
  console.log('📚 Starting Assignment Management Test Suite');
  console.log(`📡 Target API: ${BASE_URL}/assignments`);
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
    if (!adminToken) throw new Error('Failed to authenticate admin for tests.');

    // 2. Authenticate Student Alice (enrolled in groups)
    const aliceLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLoginRes.data?.data?.token;
    if (!aliceToken) throw new Error('Failed to authenticate student Alice.');

    // 3. Authenticate Outside Student Evan (not in Alice's group)
    const evanLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'evan.wright@university.edu',
        password: 'Password123!',
      }),
    });
    const evanToken = evanLoginRes.data?.data?.token;
    if (!evanToken) throw new Error('Failed to authenticate student Evan.');

    // 4. Create a dedicated test group for Alice
    const groupName = `Assignment Lab Group ${Date.now()}`;
    const createGroupRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: groupName }),
    });
    const testGroupId = createGroupRes.data?.data?.group?.id;
    if (!testGroupId) throw new Error('Failed to create test group for Alice.');

    let createdAssignmentId = null;

    // Test 1: Admin Creates Assignment
    const dueTime = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const createRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: `Distributed Consensus Lab ${Date.now()}`,
        description: 'Implement Raft leader election and heartbeat consensus.',
        due_date: dueTime,
        onedrive_link: 'https://onedrive.live.com/?id=sample-raft-folder-101',
      }),
    });

    createdAssignmentId = createRes.data?.data?.assignment?.id;
    assertTest(
      'Admin Creates Assignment Successfully',
      createRes.status === 201 && !!createdAssignmentId,
      `Status: ${createRes.status}, ID: ${createdAssignmentId}`
    );

    // Test 2: Student Attempts to Create Assignment -> 403
    const studentCreateRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        title: 'Unauthorized Student Homework',
        description: 'Should be rejected',
        due_date: dueTime,
        onedrive_link: 'https://onedrive.live.com/?id=student-unauth',
      }),
    });
    assertTest(
      'Student Attempting to Create Assignment Rejected (403)',
      studentCreateRes.status === 403,
      `Status: ${studentCreateRes.status}, Message: "${studentCreateRes.data?.message}"`
    );

    // Test 3: Unauthenticated Creation -> 401
    const unauthCreateRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Anonymous Assignment',
        due_date: dueTime,
        onedrive_link: 'https://onedrive.live.com',
      }),
    });
    assertTest(
      'Unauthenticated Assignment Creation Rejected (401)',
      unauthCreateRes.status === 401,
      `Status: ${unauthCreateRes.status}`
    );

    // Test 4: Invalid / Short Title -> 400
    const shortTitleRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'ab',
        due_date: dueTime,
        onedrive_link: 'https://onedrive.live.com',
      }),
    });
    assertTest(
      'Short Assignment Title Rejected (400)',
      shortTitleRes.status === 400,
      `Status: ${shortTitleRes.status}, Message: "${shortTitleRes.data?.message}"`
    );

    // Test 5: Invalid Due Date -> 400
    const invalidDateRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'Valid Assignment Title',
        due_date: 'not-a-valid-date-string',
        onedrive_link: 'https://onedrive.live.com',
      }),
    });
    assertTest(
      'Invalid Due Date Format Rejected (400)',
      invalidDateRes.status === 400,
      `Status: ${invalidDateRes.status}`
    );

    // Test 6: Invalid OneDrive URL -> 400
    const invalidUrlRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'Valid Assignment Title',
        due_date: dueTime,
        onedrive_link: 'ftp://not-an-http-link',
      }),
    });
    assertTest(
      'Invalid OneDrive URL Protocol Rejected (400)',
      invalidUrlRes.status === 400,
      `Status: ${invalidUrlRes.status}`
    );

    // Test 7: Admin Retrieves Assignment List
    const listRes = await request(`${BASE_URL}/assignments`, {
      method: 'GET',
      token: adminToken,
    });
    const foundInList = listRes.data?.data?.assignments?.some((a) => a.id === createdAssignmentId);
    assertTest(
      'Admin Retrieves Assignment List',
      listRes.status === 200 && foundInList,
      `Found created assignment in list: ${foundInList}, Total: ${listRes.data?.data?.count}`
    );

    // Test 8: Admin Updates Assignment Details
    const updateRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}`, {
      method: 'PUT',
      token: adminToken,
      body: JSON.stringify({
        title: 'Distributed Consensus & Raft Protocol Lab (Revised)',
        description: 'Updated instructions: Include benchmark charts for 5-node clusters.',
      }),
    });
    assertTest(
      'Admin Updates Assignment Details',
      updateRes.status === 200 &&
        updateRes.data?.data?.assignment?.title.includes('(Revised)'),
      `Status: ${updateRes.status}, New Title: "${updateRes.data?.data?.assignment?.title}"`
    );

    // Test 9: Student Attempts to Edit Assignment -> 403
    const studentEditRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}`, {
      method: 'PUT',
      token: aliceToken,
      body: JSON.stringify({
        title: 'Student Tampered Title',
      }),
    });
    assertTest(
      'Student Attempting to Edit Assignment Rejected (403)',
      studentEditRes.status === 403,
      `Status: ${studentEditRes.status}`
    );

    // Test 10: Update Nonexistent Assignment -> 404
    const nonexistentId = '00000000-0000-0000-0000-000000000000';
    const notFoundEditRes = await request(`${BASE_URL}/assignments/${nonexistentId}`, {
      method: 'PUT',
      token: adminToken,
      body: JSON.stringify({
        title: 'Nonexistent Update',
      }),
    });
    assertTest(
      'Update Nonexistent Assignment Rejected (404)',
      notFoundEditRes.status === 404,
      `Status: ${notFoundEditRes.status}`
    );

    // Test 11: Admin Assigns Assignment to Specific Group
    const assignGroupRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        group_ids: [testGroupId],
      }),
    });
    assertTest(
      'Admin Assigns Assignment to Specific Groups',
      assignGroupRes.status === 200 && assignGroupRes.data?.data?.totalAssigned >= 1,
      `Status: ${assignGroupRes.status}, Total Assigned Groups: ${assignGroupRes.data?.data?.totalAssigned}`
    );

    // Test 12: Duplicate Group Assignment Handled Idempotently
    const duplicateAssignRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        group_ids: [testGroupId],
      }),
    });
    assertTest(
      'Duplicate Group Assignment Handled Cleanly / Idempotently',
      duplicateAssignRes.status === 200,
      `Status: ${duplicateAssignRes.status}`
    );

    // Test 13: Assign to Nonexistent Group ID -> 404
    const invalidGroupAssignRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        group_ids: ['ffffffff-ffff-ffff-ffff-ffffffffffff'],
      }),
    });
    assertTest(
      'Assign to Nonexistent Group ID Rejected (404)',
      invalidGroupAssignRes.status === 404,
      `Status: ${invalidGroupAssignRes.status}, Message: "${invalidGroupAssignRes.data?.message}"`
    );

    // Test 14: Student Assignment Discovery (Alice retrieves assigned coursework)
    const studentFeedRes = await request(`${BASE_URL}/assignments/student`, {
      method: 'GET',
      token: aliceToken,
    });
    const aliceReceived = studentFeedRes.data?.data?.assignments?.some((a) => a.id === createdAssignmentId);
    assertTest(
      'Student Assignment Discovery (Alice retrieves assigned coursework)',
      studentFeedRes.status === 200 && aliceReceived,
      `Status: ${studentFeedRes.status}, Alice Received Assignment: ${aliceReceived}`
    );

    // Test 15: Outside Student Without Membership Does NOT Receive Unassigned Coursework
    const evanFeedRes = await request(`${BASE_URL}/assignments/student`, {
      method: 'GET',
      token: evanToken,
    });
    const evanReceived = evanFeedRes.data?.data?.assignments?.some((a) => a.id === createdAssignmentId);
    assertTest(
      'Outside Student Does NOT Receive Unallocated Assignment',
      evanFeedRes.status === 200 && !evanReceived,
      `Evan Received: ${evanReceived} (Expected false)`
    );

    // Test 16: Student Viewing Non-Allocated Assignment Details -> 403 Forbidden
    const unallocatedDetailsRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}`, {
      method: 'GET',
      token: evanToken,
    });
    assertTest(
      'Student Accessing Non-Allocated Assignment Details Forbidden (403)',
      unallocatedDetailsRes.status === 403,
      `Status: ${unallocatedDetailsRes.status}, Message: "${unallocatedDetailsRes.data?.message}"`
    );

    // Test 17: Admin Assigns to All Groups
    const assignAllRes = await request(`${BASE_URL}/assignments/${createdAssignmentId}/assign-all`, {
      method: 'POST',
      token: adminToken,
    });
    assertTest(
      'Admin Assigns Assignment to All System Groups',
      assignAllRes.status === 200 && assignAllRes.data?.data?.totalAssigned > 0,
      `Status: ${assignAllRes.status}, Total Assigned Groups: ${assignAllRes.data?.data?.totalAssigned}`
    );

  } catch (err) {
    console.error('\n❌ Test Suite Execution Failed:', err);
  }

  console.log('\n==================================================');
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('==================================================');

  if (passed === total && total > 0) {
    console.log('🎉 ALL 17 ASSIGNMENT MANAGEMENT TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`💥 FAILED ${total - passed} TESTS.\n`);
    process.exit(1);
  }
}

runAssignmentTests();
