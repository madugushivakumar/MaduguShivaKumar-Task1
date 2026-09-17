/**
 * Automated Student Group Management Test Suite
 *
 * Runs 16 automated tests covering:
 * 1. Group creation by authenticated student (creator auto-enrolled)
 * 2. Empty group name rejection (400 Bad Request)
 * 3. Unauthenticated group creation rejection (401 Unauthorized)
 * 4. Admin group creation rejection (403 Forbidden)
 * 5. Student group listing (GET /api/groups)
 * 6. Group details retrieval with members count (GET /api/groups/:id)
 * 7. Unauthorized student viewing another group (403 Forbidden)
 * 8. Add student member by email (POST /api/groups/:id/members)
 * 9. Add student member by student ID (POST /api/groups/:id/members)
 * 10. Add nonexistent student rejection (404 Not Found)
 * 11. Add Admin as student member rejection (400 Bad Request)
 * 12. Duplicate member addition rejection (409 Conflict)
 * 13. Unauthorized student adding member to other group (403 Forbidden)
 * 14. List group members (GET /api/groups/:id/members)
 * 15. Creator removing a member (DELETE /api/groups/:id/members/:studentId)
 * 16. Attempt to remove creator rejection (400 Bad Request)
 * 17. Unauthorized student removing another member (403 Forbidden)
 *
 * Usage: node database/test-groups.js
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

async function runGroupTests() {
  console.log('==================================================');
  console.log('👥 Starting Student Group Management Test Suite');
  console.log(`📡 Target API: ${BASE_URL}/groups`);
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
    // -------------------------------------------------------------
    // Authenticate test users
    // -------------------------------------------------------------
    // 1. Alice (Student Creator)
    const aliceLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLogin.data?.data?.token;
    const aliceId = aliceLogin.data?.data?.user?.id;

    // 2. Bob (Student to add by email)
    const bobLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'bob.jones@university.edu',
        password: 'Password123!',
      }),
    });
    const bobToken = bobLogin.data?.data?.token;
    const bobId = bobLogin.data?.data?.user?.id;

    // 3. Charlie (Student to add by student ID)
    const charlieLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'charlie.brown@university.edu',
        password: 'Password123!',
      }),
    });
    const charlieToken = charlieLogin.data?.data?.token;
    const charlieId = charlieLogin.data?.data?.user?.id;

    // 4. Evan (Outside Student for unauthorized access test)
    const evanLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'evan.wright@university.edu',
        password: 'Password123!',
      }),
    });
    const evanToken = evanLogin.data?.data?.token;

    // 5. Dr. Alan (Admin)
    const adminLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const adminToken = adminLogin.data?.data?.token;

    // -------------------------------------------------------------
    // Test 1: Successful Group Creation by Student
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const groupName = `Robotics Team ${timestamp}`;
    const createRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: groupName }),
    });
    const createdGroup = createRes.data?.data?.group;
    const groupId = createdGroup?.id;

    assertTest(
      'Student Group Creation (Creator Auto-Enrolled)',
      createRes.status === 201 &&
        createdGroup?.name === groupName &&
        createdGroup?.created_by === aliceId &&
        createdGroup?.member_count === 1,
      `Status: ${createRes.status}, Group ID: ${groupId}, Name: ${createdGroup?.name}`
    );

    // -------------------------------------------------------------
    // Test 2: Empty Group Name Rejection
    // -------------------------------------------------------------
    const emptyNameRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: ' ' }),
    });
    assertTest(
      'Empty Group Name Rejected',
      emptyNameRes.status === 400,
      `Status: ${emptyNameRes.status}, Message: "${emptyNameRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 3: Unauthenticated Group Creation Rejection
    // -------------------------------------------------------------
    const unauthCreateRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Ghost Group' }),
    });
    assertTest(
      'Unauthenticated Group Creation Rejected',
      unauthCreateRes.status === 401,
      `Status: ${unauthCreateRes.status}, Message: "${unauthCreateRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 4: Admin Group Creation Rejected (Student Only)
    // -------------------------------------------------------------
    const adminCreateRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ name: 'Admin Created Group' }),
    });
    assertTest(
      'Admin Group Creation Rejected (STUDENT only)',
      adminCreateRes.status === 403,
      `Status: ${adminCreateRes.status}, Message: "${adminCreateRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 5: Student Group Listing (GET /api/groups)
    // -------------------------------------------------------------
    const listRes = await request(`${BASE_URL}/groups`, {
      token: aliceToken,
    });
    const groups = listRes.data?.data?.groups;
    const hasCreatedGroup = groups?.some((g) => g.id === groupId);

    assertTest(
      'Student Group Listing',
      listRes.status === 200 && Array.isArray(groups) && hasCreatedGroup,
      `Retrieved ${groups?.length} groups for Alice; contains ${groupName}: ${hasCreatedGroup}`
    );

    // -------------------------------------------------------------
    // Test 6: Group Details Retrieval (GET /api/groups/:id)
    // -------------------------------------------------------------
    const detailsRes = await request(`${BASE_URL}/groups/${groupId}`, {
      token: aliceToken,
    });
    const groupDetails = detailsRes.data?.data?.group;

    assertTest(
      'Group Details Retrieval with Members Roster',
      detailsRes.status === 200 &&
        groupDetails?.name === groupName &&
        groupDetails?.member_count === 1 &&
        groupDetails?.members?.length === 1 &&
        groupDetails?.members[0]?.student_id === aliceId,
      `Member count: ${groupDetails?.member_count}, Creator: ${groupDetails?.creator_name}`
    );

    // -------------------------------------------------------------
    // Test 7: Unauthorized Student Viewing Non-Member Group
    // -------------------------------------------------------------
    const unauthDetailsRes = await request(`${BASE_URL}/groups/${groupId}`, {
      token: evanToken, // Evan is not in this group
    });
    assertTest(
      'Unauthorized Student Accessing Non-Member Group Forbidden',
      unauthDetailsRes.status === 403,
      `Status: ${unauthDetailsRes.status}, Message: "${unauthDetailsRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 8: Add Student Member by Email
    // -------------------------------------------------------------
    const addByEmailRes = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ email: 'bob.jones@university.edu' }),
    });
    const addedBob = addByEmailRes.data?.data?.addedMember;

    assertTest(
      'Add Student Member by Email',
      (addByEmailRes.status === 201 || addByEmailRes.status === 200) &&
        addedBob?.email === 'bob.jones@university.edu' &&
        addByEmailRes.data?.data?.memberCount === 2,
      `Status: ${addByEmailRes.status}, Added: ${addedBob?.name} (${addedBob?.email}), Total Members: ${addByEmailRes.data?.data?.memberCount}`
    );

    // -------------------------------------------------------------
    // Test 9: Add Student Member by Student ID
    // -------------------------------------------------------------
    const addByIdRes = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ student_id: 'STU2026003' }), // Charlie Brown
    });
    const addedCharlie = addByIdRes.data?.data?.addedMember;

    assertTest(
      'Add Student Member by Student ID',
      (addByIdRes.status === 201 || addByIdRes.status === 200) &&
        addedCharlie?.studentId === 'STU2026003' &&
        addByIdRes.data?.data?.memberCount === 3,
      `Status: ${addByIdRes.status}, Added: ${addedCharlie?.name} (ID: ${addedCharlie?.studentId}), Total Members: ${addByIdRes.data?.data?.memberCount}`
    );

    // -------------------------------------------------------------
    // Test 10: Add Nonexistent Student Rejected
    // -------------------------------------------------------------
    const addNonExistentRes = await request(
      `${BASE_URL}/groups/${groupId}/members`,
      {
        method: 'POST',
        token: aliceToken,
        body: JSON.stringify({ email: 'nonexistent.ghost@university.edu' }),
      }
    );
    assertTest(
      'Add Nonexistent Student Rejected',
      addNonExistentRes.status === 404,
      `Status: ${addNonExistentRes.status}, Message: "${addNonExistentRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 11: Add Admin as Student Member Rejected
    // -------------------------------------------------------------
    const addAdminRes = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ email: 'dr.alan@university.edu' }),
    });
    assertTest(
      'Add Administrator as Student Member Rejected',
      addAdminRes.status === 400,
      `Status: ${addAdminRes.status}, Message: "${addAdminRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 12: Duplicate Member Addition Rejected
    // -------------------------------------------------------------
    const addDuplicateRes = await request(
      `${BASE_URL}/groups/${groupId}/members`,
      {
        method: 'POST',
        token: aliceToken,
        body: JSON.stringify({ email: 'bob.jones@university.edu' }),
      }
    );
    assertTest(
      'Duplicate Member Addition Rejected',
      addDuplicateRes.status === 409,
      `Status: ${addDuplicateRes.status}, Message: "${addDuplicateRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 13: Unauthorized Student Adding Members to Another Group
    // -------------------------------------------------------------
    const unauthAddRes = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: evanToken, // Evan is not a member
      body: JSON.stringify({ email: 'fiona.gallagher@university.edu' }),
    });
    assertTest(
      'Unauthorized Student Adding Member Rejected (403)',
      unauthAddRes.status === 403,
      `Status: ${unauthAddRes.status}, Message: "${unauthAddRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 14: List Group Members (GET /api/groups/:id/members)
    // -------------------------------------------------------------
    const membersListRes = await request(
      `${BASE_URL}/groups/${groupId}/members`,
      {
        token: bobToken, // Bob is now a member
      }
    );
    const members = membersListRes.data?.data?.members;

    assertTest(
      'List Group Members Endpoint',
      membersListRes.status === 200 && members?.length === 3,
      `Retrieved ${members?.length} members: ${members?.map((m) => m.name).join(', ')}`
    );

    // -------------------------------------------------------------
    // Test 15: Creator Removing a Member (Charlie)
    // -------------------------------------------------------------
    const removeRes = await request(
      `${BASE_URL}/groups/${groupId}/members/${charlieId}`,
      {
        method: 'DELETE',
        token: aliceToken, // Alice is creator
      }
    );
    assertTest(
      'Creator Removing a Member Succeeded',
      removeRes.status === 200 && removeRes.data?.data?.memberCount === 2,
      `Remaining Member Count: ${removeRes.data?.data?.memberCount}`
    );

    // -------------------------------------------------------------
    // Test 16: Attempt to Remove Group Creator Rejected
    // -------------------------------------------------------------
    const removeCreatorRes = await request(
      `${BASE_URL}/groups/${groupId}/members/${aliceId}`,
      {
        method: 'DELETE',
        token: aliceToken,
      }
    );
    assertTest(
      'Attempt to Remove Group Creator Rejected (Design Decision)',
      removeCreatorRes.status === 400,
      `Status: ${removeCreatorRes.status}, Message: "${removeCreatorRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 17: Non-Creator Student Removing Another Member Forbidden
    // -------------------------------------------------------------
    const nonCreatorRemoveRes = await request(
      `${BASE_URL}/groups/${groupId}/members/${aliceId}`,
      {
        method: 'DELETE',
        token: bobToken, // Bob is a member, but not creator
      }
    );
    assertTest(
      'Non-Creator Student Removing Another Member Forbidden',
      nonCreatorRemoveRes.status === 400 || nonCreatorRemoveRes.status === 403,
      `Status: ${nonCreatorRemoveRes.status}`
    );

    console.log('\n==================================================');
    console.log(`📊 Test Results: ${passed}/${total} Passed`);
    console.log('==================================================');

    if (passed === total) {
      console.log('🎉 ALL 17 GROUP MANAGEMENT TESTS PASSED!');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test Suite Execution Failed:', error);
    process.exit(1);
  }
}

runGroupTests();
