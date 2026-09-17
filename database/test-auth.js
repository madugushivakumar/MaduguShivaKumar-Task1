/**
 * Automated Authentication & RBAC Test Suite
 *
 * Runs 16 automated test cases verifying:
 * 1. Successful student registration
 * 2. Duplicate email rejection
 * 3. Duplicate student ID rejection
 * 4. Invalid registration inputs
 * 5. Role tampering rejection (attempted ADMIN registration)
 * 6. Successful login (returns JWT, no password_hash)
 * 7. Wrong password rejection
 * 8. Nonexistent email rejection
 * 9. Missing JWT rejection
 * 10. Malformed JWT rejection
 * 11. Invalid / Expired JWT rejection
 * 12. Student accessing Admin endpoint rejection (403 Forbidden)
 * 13. Admin accessing Admin endpoint success (200 OK)
 * 14. GET /api/auth/me profile retrieval
 * 15. Student accessing Student endpoint success (200 OK)
 * 16. Admin accessing Student endpoint rejection (403 Forbidden)
 *
 * Usage: node database/test-auth.js
 */
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api/auth`;

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

async function runAuthTests() {
  console.log('==================================================');
  console.log('🛡️  Starting Joineazy Authentication & RBAC Test Suite');
  console.log(`📡 Target API: ${BASE_URL}`);
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

  const timestamp = Date.now();
  const testStudent = {
    name: 'Test Student',
    email: `student_${timestamp}@university.edu`,
    password: 'Password123!',
    studentId: `STU_${timestamp}`.slice(0, 20),
  };

  try {
    // -------------------------------------------------------------
    // Test 1: Successful Registration
    // -------------------------------------------------------------
    const regRes = await request(`${BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify(testStudent),
    });
    const regUser = regRes.data?.data?.user;
    const regToken = regRes.data?.data?.token;

    assertTest(
      'Successful Student Registration',
      regRes.status === 201 &&
        regUser?.role === 'STUDENT' &&
        !regUser?.password_hash &&
        Boolean(regToken),
      `Status: ${regRes.status}, Created User ID: ${regUser?.id}, Role: ${regUser?.role}`
    );

    // -------------------------------------------------------------
    // Test 2: Duplicate Email Rejection
    // -------------------------------------------------------------
    const dupEmailRes = await request(`${BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify({
        ...testStudent,
        studentId: `STU_DIFF_${timestamp}`.slice(0, 20),
      }),
    });
    assertTest(
      'Duplicate Email Registration Rejected',
      dupEmailRes.status === 409,
      `Status: ${dupEmailRes.status}, Message: "${dupEmailRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 3: Duplicate Student ID Rejection
    // -------------------------------------------------------------
    const dupIdRes = await request(`${BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify({
        ...testStudent,
        email: `different_${timestamp}@university.edu`,
      }),
    });
    assertTest(
      'Duplicate Student ID Registration Rejected',
      dupIdRes.status === 409,
      `Status: ${dupIdRes.status}, Message: "${dupIdRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 4: Invalid Registration Input (Short password)
    // -------------------------------------------------------------
    const invalidInputRes = await request(`${BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'A',
        email: 'invalid-email',
        password: '123',
        studentId: '',
      }),
    });
    assertTest(
      'Invalid Registration Input Rejected',
      invalidInputRes.status === 400,
      `Status: ${invalidInputRes.status}, Message: "${invalidInputRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 5: Role Tampering Rejection
    // -------------------------------------------------------------
    const roleTamperRes = await request(`${BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Hacker User',
        email: `hacker_${timestamp}@university.edu`,
        password: 'Password123!',
        studentId: `HACK_${timestamp}`.slice(0, 20),
        role: 'ADMIN',
      }),
    });
    assertTest(
      'Role Tampering Prevented (Self-Admin Registration Forbidden)',
      roleTamperRes.status === 403,
      `Status: ${roleTamperRes.status}, Message: "${roleTamperRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 6: Successful Student Login
    // -------------------------------------------------------------
    const loginRes = await request(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password,
      }),
    });
    const loggedUser = loginRes.data?.data?.user;
    const studentToken = loginRes.data?.data?.token;

    assertTest(
      'Successful Student Login',
      loginRes.status === 200 &&
        Boolean(studentToken) &&
        !loggedUser?.password_hash,
      `Status: ${loginRes.status}, Token Issued: true, Password Hash Excluded: true`
    );

    // -------------------------------------------------------------
    // Test 7: Wrong Password Rejected
    // -------------------------------------------------------------
    const wrongPassRes = await request(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testStudent.email,
        password: 'IncorrectPassword999!',
      }),
    });
    assertTest(
      'Wrong Password Rejected',
      wrongPassRes.status === 401,
      `Status: ${wrongPassRes.status}, Message: "${wrongPassRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 8: Nonexistent Account Rejected
    // -------------------------------------------------------------
    const nonExistentRes = await request(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'ghost.user.999@university.edu',
        password: 'Password123!',
      }),
    });
    assertTest(
      'Nonexistent Account Login Rejected',
      nonExistentRes.status === 401,
      `Status: ${nonExistentRes.status}, Message: "${nonExistentRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 9: Missing JWT on Protected Endpoint
    // -------------------------------------------------------------
    const missingTokenRes = await request(`${BASE_URL}/me`);
    assertTest(
      'Missing JWT Token Rejected',
      missingTokenRes.status === 401,
      `Status: ${missingTokenRes.status}, Message: "${missingTokenRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 10: Malformed JWT Token Rejected
    // -------------------------------------------------------------
    const malformedTokenRes = await request(`${BASE_URL}/me`, {
      headers: { Authorization: 'Bearer this-is-not-a-valid-token' },
    });
    assertTest(
      'Malformed JWT Token Rejected',
      malformedTokenRes.status === 401,
      `Status: ${malformedTokenRes.status}, Message: "${malformedTokenRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 11: Invalid Signature JWT Rejected
    // -------------------------------------------------------------
    const fakeToken = jwt.sign(
      { id: 'fake-id', role: 'ADMIN' },
      'wrong_secret_key'
    );
    const invalidSigRes = await request(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${fakeToken}` },
    });
    assertTest(
      'Invalid JWT Signature Rejected',
      invalidSigRes.status === 401,
      `Status: ${invalidSigRes.status}, Message: "${invalidSigRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 12: Student Accessing Admin-Only API Forbidden (RBAC)
    // -------------------------------------------------------------
    const studentAccessAdminRes = await request(`${BASE_URL}/test-admin`, {
      token: studentToken,
    });
    assertTest(
      'Student Accessing Admin API Forbidden (403)',
      studentAccessAdminRes.status === 403,
      `Status: ${studentAccessAdminRes.status}, Message: "${studentAccessAdminRes.data?.message}"`
    );

    // -------------------------------------------------------------
    // Test 13: Admin Login & Accessing Admin API (RBAC)
    // -------------------------------------------------------------
    const adminLoginRes = await request(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const adminToken = adminLoginRes.data?.data?.token;

    const adminAccessAdminRes = await request(`${BASE_URL}/test-admin`, {
      token: adminToken,
    });
    assertTest(
      'Admin Accessing Admin API Permitted (200)',
      adminAccessAdminRes.status === 200 &&
        adminAccessAdminRes.data?.data?.user?.role === 'ADMIN',
      `Status: ${adminAccessAdminRes.status}, Role: ${adminAccessAdminRes.data?.data?.user?.role}`
    );

    // -------------------------------------------------------------
    // Test 14: Profile Retrieval via GET /api/auth/me
    // -------------------------------------------------------------
    const meRes = await request(`${BASE_URL}/me`, {
      token: studentToken,
    });
    const profile = meRes.data?.data?.user;
    assertTest(
      'GET /api/auth/me Retrieves Current User Profile',
      meRes.status === 200 &&
        profile?.email === testStudent.email &&
        profile?.student_id === testStudent.studentId &&
        !profile?.password_hash,
      `Retrieved: ${profile?.name} (${profile?.email}), Student ID: ${profile?.student_id}`
    );

    // -------------------------------------------------------------
    // Test 15: Student Accessing Student-Only API Permitted (200)
    // -------------------------------------------------------------
    const studentAccessStudentRes = await request(`${BASE_URL}/test-student`, {
      token: studentToken,
    });
    assertTest(
      'Student Accessing Student API Permitted (200)',
      studentAccessStudentRes.status === 200,
      `Status: ${studentAccessStudentRes.status}`
    );

    // -------------------------------------------------------------
    // Test 16: Admin Accessing Student-Only API Forbidden (RBAC)
    // -------------------------------------------------------------
    const adminAccessStudentRes = await request(`${BASE_URL}/test-student`, {
      token: adminToken,
    });
    assertTest(
      'Admin Accessing Student-Only API Forbidden (403)',
      adminAccessStudentRes.status === 403,
      `Status: ${adminAccessStudentRes.status}, Message: "${adminAccessStudentRes.data?.message}"`
    );

    console.log('\n==================================================');
    console.log(`📊 Test Results: ${passed}/${total} Passed`);
    console.log('==================================================');

    if (passed === total) {
      console.log('🎉 ALL 16 AUTHENTICATION & RBAC TESTS PASSED!');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test Suite Execution Failed:', error);
    process.exit(1);
  }
}

runAuthTests();
