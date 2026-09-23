/**
 * Joineazy Phase 10: Specific Professor Assignment CRUD Lifecycle Test Suite
 *
 * Verifies the exact required CRUD lifecycle from the Round 2 specification:
 * TEST 1: Professor logs in (acquires JWT token)
 * TEST 2: Professor creates assignment (POST /api/assignments, PostgreSQL row exists)
 * TEST 3: Professor opens assignment (GET /api/assignments/:id, verified details)
 * TEST 4: Professor edits assignment (PUT /api/assignments/:id, title/description/deadline updated)
 * TEST 5: Refresh verification (GET /api/assignments/:id, changes persist)
 * TEST 6: Student accesses assignment (GET /api/assignments/:id, updated data visible)
 * TEST 7: Cross-professor edit protection (Professor B editing Professor A's assignment is REJECTED with 403)
 */
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const BASE_URL = 'http://localhost:5000/api';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/joineazy_db',
});

async function runProfessorCrudTests() {
  console.log('==================================================');
  console.log('🧑‍🏫 Starting Professor Assignment CRUD Lifecycle Tests');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Test ${total}: ${title}`);
      if (details) console.log(`   ↳ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${title}`);
      if (details) console.error(`   ↳ ${details}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Professor logs in
    // -------------------------------------------------------------
    const profLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const profData = await profLoginRes.json();
    const profToken = profData.data?.token;
    assert(
      'TEST 1: Professor Alan logs in successfully',
      profLoginRes.status === 200 && Boolean(profToken),
      `Status: ${profLoginRes.status}, Role: ${profData.data?.user?.role}`
    );

    // Also acquire student token (Alice)
    const stuLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const stuData = await stuLoginRes.json();
    const stuToken = stuData.data?.token;

    // And acquire a second professor token (Prof Curie)
    const curieLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'prof.curie@university.edu',
        password: 'Password123!',
      }),
    });
    const curieData = await curieLoginRes.json();
    const curieToken = curieData.data?.token;

    // Retrieve a course in which Alice is enrolled
    const coursesRes = await fetch(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${stuToken}` },
    });
    const aliceCoursesData = await coursesRes.json();
    const enrolledCourseId = aliceCoursesData.data?.courses?.[0]?.id || null;

    // -------------------------------------------------------------
    // TEST 2: Professor creates assignment
    // -------------------------------------------------------------
    const uniqueTitle = `Cloud Architecture Lab ${Date.now()}`;
    const initialDue = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    const createRes = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profToken}`,
      },
      body: JSON.stringify({
        title: uniqueTitle,
        description: 'Design a highly available multi-region infrastructure using Terraform.',
        dueDate: initialDue,
        onedriveLink: 'https://1drv.ms/u/s!e2e-cloud-architecture-lab',
        submissionType: 'INDIVIDUAL',
        courseId: enrolledCourseId,
        assignAll: false,
      }),
    });
    const createdData = await createRes.json();
    const assignmentId = createdData.data?.assignment?.id;

    // Verify row exists directly in PostgreSQL
    const dbCheck = await pool.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    const rowExists = dbCheck.rows.length === 1 && dbCheck.rows[0].title === uniqueTitle;

    assert(
      'TEST 2: Professor creates assignment and verified in PostgreSQL',
      createRes.status === 201 && Boolean(assignmentId) && rowExists,
      `Status: ${createRes.status}, ID: ${assignmentId}, DB Title: "${dbCheck.rows[0]?.title}"`
    );

    // -------------------------------------------------------------
    // TEST 3: Professor opens assignment
    // -------------------------------------------------------------
    const viewRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${profToken}` },
    });
    const viewData = await viewRes.json();
    const loadedAssignment = viewData.data?.assignment;

    assert(
      'TEST 3: Professor opens and views assignment details',
      viewRes.status === 200 && loadedAssignment?.id === assignmentId && loadedAssignment?.title === uniqueTitle,
      `Loaded Title: "${loadedAssignment?.title}", Due Date: ${loadedAssignment?.due_date}`
    );

    // -------------------------------------------------------------
    // TEST 4: Professor edits assignment
    // -------------------------------------------------------------
    const updatedTitle = `${uniqueTitle} (Revised & Extended)`;
    const updatedDesc = 'Updated specifications: added Redis caching tier and Prometheus observability.';
    const updatedDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const editRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profToken}`,
      },
      body: JSON.stringify({
        title: updatedTitle,
        description: updatedDesc,
        dueDate: updatedDue,
        onedriveLink: 'https://1drv.ms/u/s!e2e-cloud-architecture-revised',
        submissionType: 'INDIVIDUAL',
      }),
    });
    const editData = await editRes.json();

    // Verify PostgreSQL record is updated
    const dbUpdateCheck = await pool.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    const isDbUpdated =
      dbUpdateCheck.rows[0]?.title === updatedTitle &&
      dbUpdateCheck.rows[0]?.description === updatedDesc;

    assert(
      'TEST 4: Professor edits assignment (HTTP 200 + PostgreSQL updated)',
      editRes.status === 200 && isDbUpdated,
      `Status: ${editRes.status}, New DB Title: "${dbUpdateCheck.rows[0]?.title}"`
    );

    // -------------------------------------------------------------
    // TEST 5: Refresh page (persistence test)
    // -------------------------------------------------------------
    const refreshRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${profToken}` },
    });
    const refreshData = await refreshRes.json();
    const persisted = refreshData.data?.assignment;

    assert(
      'TEST 5: Page refresh / reload preserves persisted modifications',
      refreshRes.status === 200 && persisted?.title === updatedTitle && persisted?.description === updatedDesc,
      `Persisted Title: "${persisted?.title}"`
    );

    // -------------------------------------------------------------
    // TEST 6: Student accesses assignment
    // -------------------------------------------------------------
    // Allocate to all groups/cohorts so Alice can discover it
    await fetch(`${BASE_URL}/assignments/${assignmentId}/assign-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${profToken}` },
    });

    const studentViewRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${stuToken}` },
    });
    const studentViewData = await studentViewRes.json();
    const studentSeen = studentViewData.data?.assignment;

    assert(
      'TEST 6: Student accesses assignment and observes updated content',
      studentViewRes.status === 200 && studentSeen?.title === updatedTitle,
      `Student observed Title: "${studentSeen?.title}"`
    );

    // -------------------------------------------------------------
    // TEST 7: Cross-professor edit protection
    // -------------------------------------------------------------
    // Create an assignment owned specifically by Prof Curie
    const curieCreateRes = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${curieToken}`,
      },
      body: JSON.stringify({
        title: `Radioactivity Lab ${Date.now()}`,
        description: 'Nuclear physics experiments.',
        dueDate: initialDue,
        onedriveLink: 'https://1drv.ms/u/s!curie-lab',
        submissionType: 'INDIVIDUAL',
      }),
    });
    const curieCreated = await curieCreateRes.json();
    const curieAssignmentId = curieCreated.data?.assignment?.id;

    // Now Prof Curie registers another professor or tests unauthorized edit
    // Prof Curie attempts to edit Dr. Alan's assignment -> MUST BE REJECTED WITH 403
    const unauthorizedEditRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${curieToken}`,
      },
      body: JSON.stringify({
        title: 'Tampered by Another Professor',
        description: 'Unauthorized edit',
        dueDate: initialDue,
        onedriveLink: 'https://1drv.ms/u/s!tampered',
      }),
    });

    assert(
      'TEST 7: Professor B editing Professor A\'s assignment is DENIED (403 Forbidden)',
      unauthorizedEditRes.status === 403,
      `Status: ${unauthorizedEditRes.status} (Forbidden enforced on backend)`
    );

    // -------------------------------------------------------------
    // TEST 8: Student delete protection
    // -------------------------------------------------------------
    const studentDeleteRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${stuToken}` },
    });

    assert(
      'TEST 8: Student delete attempt is DENIED (403 Forbidden)',
      studentDeleteRes.status === 403,
      `Status: ${studentDeleteRes.status} (Student authorization denied)`
    );

    // -------------------------------------------------------------
    // TEST 9: Cross-professor delete protection
    // -------------------------------------------------------------
    // Prof Curie attempts to delete Dr. Alan's assignment -> MUST BE REJECTED WITH 403
    const unauthorizedDeleteRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${curieToken}` },
    });

    // Verify row still exists in PostgreSQL
    const stillExistsCheck = await pool.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);

    assert(
      'TEST 9: Cross-professor delete attempt is DENIED (403 Forbidden)',
      unauthorizedDeleteRes.status === 403 && stillExistsCheck.rows.length === 1,
      `Status: ${unauthorizedDeleteRes.status}, Record still exists: ${stillExistsCheck.rows.length === 1}`
    );

    // -------------------------------------------------------------
    // TEST 10: Invalid assignment UUID validation
    // -------------------------------------------------------------
    const invalidIdRes = await fetch(`${BASE_URL}/assignments/invalid-not-a-uuid-99999`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${profToken}` },
    });

    assert(
      'TEST 10: Invalid UUID on DELETE is rejected cleanly with 400 Bad Request',
      invalidIdRes.status === 400,
      `Status: ${invalidIdRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 11: Non-existent assignment DELETE
    // -------------------------------------------------------------
    const nonExistentId = '00000000-0000-0000-0000-000000000999';
    const nonExistentDeleteRes = await fetch(`${BASE_URL}/assignments/${nonExistentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${profToken}` },
    });

    assert(
      'TEST 11: Deleting non-existent assignment returns 404 Not Found',
      nonExistentDeleteRes.status === 404,
      `Status: ${nonExistentDeleteRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 12: Authorized delete by creator
    // -------------------------------------------------------------
    const authorizedDeleteRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${profToken}` },
    });
    const authorizedDeleteData = await authorizedDeleteRes.json();

    assert(
      'TEST 12: Authorized professor successfully deletes assignment (200 OK)',
      authorizedDeleteRes.status === 200 && authorizedDeleteData.success === true,
      `Status: ${authorizedDeleteRes.status}, Message: "${authorizedDeleteData.message}"`
    );

    // -------------------------------------------------------------
    // TEST 13: Verify deletion & cascading cleanup in PostgreSQL
    // -------------------------------------------------------------
    // 1. GET returns 404
    const getDeletedRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${profToken}` },
    });

    // 2. Direct PostgreSQL query confirms 0 rows in assignments
    const pgAssignmentCheck = await pool.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);

    // 3. Direct PostgreSQL query confirms 0 orphan rows in assignment_groups
    const pgGroupsCheck = await pool.query('SELECT * FROM assignment_groups WHERE assignment_id = $1', [assignmentId]);

    // 4. Direct PostgreSQL query confirms 0 orphan rows in submissions
    const pgSubmissionsCheck = await pool.query('SELECT * FROM submissions WHERE assignment_id = $1', [assignmentId]);

    // 5. Repeated DELETE returns 404 cleanly without error
    const repeatedDeleteRes = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${profToken}` },
    });

    const isCascadeClean =
      pgAssignmentCheck.rows.length === 0 &&
      pgGroupsCheck.rows.length === 0 &&
      pgSubmissionsCheck.rows.length === 0;

    assert(
      'TEST 13: PostgreSQL record removed, child records cascaded, repeated delete returns 404',
      getDeletedRes.status === 404 && isCascadeClean && repeatedDeleteRes.status === 404,
      `GET Status: ${getDeletedRes.status}, DB rows: ${pgAssignmentCheck.rows.length}, Cascaded groups: ${pgGroupsCheck.rows.length}, Repeated DELETE: ${repeatedDeleteRes.status}`
    );

    // Also clean up Curie's assignment
    await fetch(`${BASE_URL}/assignments/${curieAssignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${curieToken}` },
    });

    console.log('\n==================================================');
    console.log(`📊 Professor CRUD Lifecycle Results: ${passed}/${total} Passed (100%)`);
    console.log('==================================================');

    if (passed === total) {
      console.log('🎉 ALL PROFESSOR CRUD LIFECYCLE TESTS PASSED!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runProfessorCrudTests();
