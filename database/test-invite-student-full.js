/**
 * Comprehensive Verification Test Suite for Phase 4 "Invite Student"
 *
 * Covers:
 * TEST 1: Existing Charlie Brown (email + student ID) -> 201 Reused, no duplicate
 * TEST 2: New friend (new email + new student ID) -> 201 Created in PostgreSQL, membership created, roster updated
 * TEST 3: Duplicate invitation for same new friend -> 409 Conflict
 * TEST 4: Existing email + wrong Student ID -> 409 Conflict, account not modified
 * TEST 5: Existing Student ID + wrong email -> 409 Conflict, account not modified
 * TEST 6: Email belongs to Student A, Student ID belongs to Student B -> 409 Conflict
 * TEST 7: Invalid email -> 400 Validation Error
 * TEST 8: Invalid Student ID -> 400 Validation Error
 * TEST 9: Unauthorized user attempts to add a member -> 403 Forbidden
 * TEST 10: Nonexistent group -> 404 Not Found
 * Database verification: Checks users and group_members rows, uniqueness, roles, password hashes.
 *
 * Usage: node database/test-invite-student-full.js
 */
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

async function runTests() {
  console.log('==================================================');
  console.log('🧪 Starting "Invite Student" Comprehensive Test Suite');
  console.log(`📡 Base URL: ${BASE_URL}`);
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
    // 1. Authenticate Alice (Student Creator)
    const aliceLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLogin.data?.data?.token;
    const aliceId = aliceLogin.data?.data?.user?.id;

    // 2. Authenticate Evan (Unauthorized student for non-member test)
    const evanLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'evan.wright@university.edu',
        password: 'Password123!',
      }),
    });
    const evanToken = evanLogin.data?.data?.token;

    // 3. Create a fresh test group for this run
    const timestamp = Date.now();
    const groupName = `Invite Test Group ${timestamp}`;
    const createGroupRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: groupName }),
    });
    const groupId = createGroupRes.data?.data?.group?.id;
    console.log(`📌 Created Test Group: "${groupName}" (ID: ${groupId})\n`);

    // -------------------------------------------------------------
    // TEST 1: Existing Charlie Brown
    // -------------------------------------------------------------
    const initialCharlieRows = await pool.query(
      'SELECT id, name, email, student_id, role FROM users WHERE email = $1',
      ['charlie.brown@university.edu']
    );
    const charlieIdBefore = initialCharlieRows.rows[0]?.id;

    const test1Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: 'charlie.brown@university.edu',
        studentId: 'STU2026003',
      }),
    });

    const postCharlieRows = await pool.query(
      'SELECT id, name, email, student_id, role FROM users WHERE email = $1',
      ['charlie.brown@university.edu']
    );

    const test1Member = test1Res.data?.data?.addedMember;
    assertTest(
      'TEST 1: Existing Charlie Brown (Reused, no duplicate user)',
      test1Res.status === 201 &&
        postCharlieRows.rowCount === 1 &&
        postCharlieRows.rows[0].id === charlieIdBefore &&
        test1Member?.email === 'charlie.brown@university.edu' &&
        test1Member?.studentId === 'STU2026003',
      `Status: ${test1Res.status}, User ID: ${test1Member?.id}, User count in DB: ${postCharlieRows.rowCount}`
    );

    // -------------------------------------------------------------
    // TEST 2: New Friend (new email + new student ID)
    // -------------------------------------------------------------
    const friendEmail = `friend_${timestamp}@university.edu`;
    const friendStudentId = `STU_${timestamp}`;

    const test2Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: friendEmail,
        studentId: friendStudentId,
      }),
    });

    const friendRows = await pool.query(
      'SELECT id, name, email, student_id, role, password_hash FROM users WHERE email = $1',
      [friendEmail.toLowerCase()]
    );
    const friendInDb = friendRows.rows[0];

    const friendMemberRows = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND student_id = $2',
      [groupId, friendInDb?.id]
    );

    const rosterRes = await request(`${BASE_URL}/groups/${groupId}/members`, {
      token: aliceToken,
    });
    const roster = rosterRes.data?.data?.members || [];
    const friendInRoster = roster.find((m) => m.email === friendEmail.toLowerCase());

    assertTest(
      'TEST 2: New Friend Created in PostgreSQL & Added to Team Roster',
      test2Res.status === 201 &&
        friendRows.rowCount === 1 &&
        friendInDb?.role === 'STUDENT' &&
        friendInDb?.student_id === friendStudentId.toUpperCase() &&
        friendMemberRows.rowCount === 1 &&
        Boolean(friendInRoster),
      `Status: ${test2Res.status}, DB Users: ${friendRows.rowCount}, DB GroupMembers: ${friendMemberRows.rowCount}, Name: "${friendInDb?.name}"`
    );

    // -------------------------------------------------------------
    // TEST 3: Duplicate Same Friend Again
    // -------------------------------------------------------------
    const test3Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: friendEmail,
        studentId: friendStudentId,
      }),
    });

    const friendMemberCountAfter = await pool.query(
      'SELECT COUNT(*)::int as count FROM group_members WHERE group_id = $1 AND student_id = $2',
      [groupId, friendInDb?.id]
    );

    assertTest(
      'TEST 3: Duplicate Member Addition Rejected (409 Conflict, No duplicate row)',
      test3Res.status === 409 && friendMemberCountAfter.rows[0].count === 1,
      `Status: ${test3Res.status}, Message: "${test3Res.data?.message}", Memberships in DB: ${friendMemberCountAfter.rows[0].count}`
    );

    // -------------------------------------------------------------
    // TEST 4: Existing Email + Wrong Student ID
    // -------------------------------------------------------------
    const test4Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: 'bob.jones@university.edu', // Bob's student ID is STU2026002
        studentId: 'STU9999999', // Non-matching ID
      }),
    });

    const bobCheck = await pool.query(
      'SELECT student_id FROM users WHERE email = $1',
      ['bob.jones@university.edu']
    );

    assertTest(
      'TEST 4: Existing Email + Wrong Student ID Rejected (409/400, Account unmodified)',
      (test4Res.status === 409 || test4Res.status === 400) &&
        bobCheck.rows[0].student_id === 'STU2026002',
      `Status: ${test4Res.status}, Message: "${test4Res.data?.message}", Bob's student_id in DB: ${bobCheck.rows[0].student_id}`
    );

    // -------------------------------------------------------------
    // TEST 5: Existing Student ID + Wrong Email
    // -------------------------------------------------------------
    const test5Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: `wrong_email_${timestamp}@university.edu`,
        studentId: 'STU2026002', // Bob's student ID
      }),
    });

    const bobEmailCheck = await pool.query(
      'SELECT email FROM users WHERE student_id = $1',
      ['STU2026002']
    );

    assertTest(
      'TEST 5: Existing Student ID + Wrong Email Rejected (409/400, Account unmodified)',
      (test5Res.status === 409 || test5Res.status === 400) &&
        bobEmailCheck.rows[0].email === 'bob.jones@university.edu',
      `Status: ${test5Res.status}, Message: "${test5Res.data?.message}", Bob's email in DB: ${bobEmailCheck.rows[0].email}`
    );

    // -------------------------------------------------------------
    // TEST 6: Email belongs to Student A, Student ID belongs to Student B
    // -------------------------------------------------------------
    const test6Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: 'bob.jones@university.edu', // Student A
        studentId: 'STU2026004', // Student B (Diana Prince)
      }),
    });

    assertTest(
      'TEST 6: Different Students Combination Rejected (409 Conflict)',
      test6Res.status === 409 &&
        test6Res.data?.message?.includes('different students'),
      `Status: ${test6Res.status}, Message: "${test6Res.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 7: Invalid Email Format
    // -------------------------------------------------------------
    const test7Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: 'not-an-email',
        studentId: 'STU2026011',
      }),
    });

    assertTest(
      'TEST 7: Invalid Email Format Rejected (400 Bad Request)',
      test7Res.status === 400,
      `Status: ${test7Res.status}, Message: "${test7Res.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 8: Invalid Student ID (e.g. empty or length < 2)
    // -------------------------------------------------------------
    const test8Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        email: 'valid.student@university.edu',
        studentId: ' ',
      }),
    });

    assertTest(
      'TEST 8: Invalid Student ID Rejected (400 Bad Request)',
      test8Res.status === 400,
      `Status: ${test8Res.status}, Message: "${test8Res.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 9: Unauthorized User Attempts to Add Member
    // -------------------------------------------------------------
    const test9Res = await request(`${BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      token: evanToken, // Evan is not in this group
      body: JSON.stringify({
        email: 'diana.prince@university.edu',
        studentId: 'STU2026004',
      }),
    });

    assertTest(
      'TEST 9: Unauthorized User Adding Member Rejected (403 Forbidden)',
      test9Res.status === 403,
      `Status: ${test9Res.status}, Message: "${test9Res.data?.message}"`
    );

    // -------------------------------------------------------------
    // TEST 10: Nonexistent Group
    // -------------------------------------------------------------
    const nonExistentGroupId = '00000000-0000-0000-0000-000000000000';
    const test10Res = await request(
      `${BASE_URL}/groups/${nonExistentGroupId}/members`,
      {
        method: 'POST',
        token: aliceToken,
        body: JSON.stringify({
          email: 'diana.prince@university.edu',
          studentId: 'STU2026004',
        }),
      }
    );

    assertTest(
      'TEST 10: Nonexistent Group Rejected (404 Not Found)',
      test10Res.status === 404,
      `Status: ${test10Res.status}, Message: "${test10Res.data?.message}"`
    );

    // -------------------------------------------------------------
    // Security & Data Integrity Verification in PostgreSQL
    // -------------------------------------------------------------
    const securityCheck = await pool.query(
      'SELECT id, email, role, password_hash FROM users WHERE email = $1',
      [friendEmail.toLowerCase()]
    );
    const secUser = securityCheck.rows[0];
    const isStudentRole = secUser.role === 'STUDENT';
    const hasSecureHash =
      secUser.password_hash.startsWith('$2') &&
      secUser.password_hash.length >= 60;

    assertTest(
      'Security Verification: Role is strictly STUDENT & Password Hash is Secure Bcrypt',
      isStudentRole && hasSecureHash,
      `Role: "${secUser.role}", Bcrypt Hash Prefix: "${secUser.password_hash.slice(0, 7)}..."`
    );

    console.log('\n==================================================');
    console.log(`📊 Comprehensive Test Results: ${passed}/${total} Passed`);
    console.log('==================================================');

    if (passed === total) {
      console.log('🎉 ALL COMPREHENSIVE TESTS PASSED SUCCESSFULLY!\n');
    } else {
      console.error(`⚠️ ${total - passed} tests failed.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test suite fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
