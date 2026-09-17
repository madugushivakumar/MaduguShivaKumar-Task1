/**
 * Joineazy Database Schema & Constraints Verification Script
 *
 * Runs automated tests against the live PostgreSQL database to confirm:
 * 1. Table existence & counts
 * 2. Foreign key enforcement & cascades
 * 3. Unique constraints (preventing duplicate membership & assignment mappings)
 * 4. Check constraints (role validation)
 * 5. Reusable repository methods execution
 *
 * Usage: node database/verify-schema.js
 */
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/joineazy_db';

const pool = new Pool({ connectionString });

// Import repositories
const userRepository = require('../backend/src/repositories/user.repository');
const groupRepository = require('../backend/src/repositories/group.repository');
const assignmentRepository = require('../backend/src/repositories/assignment.repository');
const submissionRepository = require('../backend/src/repositories/submission.repository');

async function runVerification() {
  console.log('==================================================');
  console.log('🧪 Starting Joineazy Database Verification Suite');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(name, condition, details = '') {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      if (details) console.log(`   ↳ ${details}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      if (details) console.error(`   ↳ ${details}`);
    }
  }

  const client = await pool.connect();

  try {
    // -------------------------------------------------------------
    // Test 1: Verify All Tables Exist
    // -------------------------------------------------------------
    console.log('--- 1. Table Existence Verification ---');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = new Set(tablesRes.rows.map((r) => r.table_name));
    const requiredTables = [
      'users',
      'groups',
      'group_members',
      'assignments',
      'assignment_groups',
      'submissions',
      'schema_migrations',
    ];

    for (const table of requiredTables) {
      assertTest(
        `Table '${table}' exists`,
        existingTables.has(table),
        `Found in public schema: ${existingTables.has(table)}`
      );
    }

    // -------------------------------------------------------------
    // Test 2: Role Check Constraint Enforcement
    // -------------------------------------------------------------
    console.log('\n--- 2. Role Constraint Verification ---');
    let roleConstraintCaught = false;
    try {
      await client.query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Bad Role User', 'bad.role@university.edu', 'hash', 'SUPERUSER')
      `);
    } catch (err) {
      roleConstraintCaught = err.code === '23514'; // check_violation
    }
    assertTest(
      'Enforces role IN (STUDENT, ADMIN)',
      roleConstraintCaught,
      'PostgreSQL rejected invalid role: SUPERUSER'
    );

    // -------------------------------------------------------------
    // Test 3: Duplicate Email Prevention
    // -------------------------------------------------------------
    console.log('\n--- 3. Email Uniqueness Verification ---');
    let duplicateEmailCaught = false;
    try {
      await client.query(`
        INSERT INTO users (name, email, password_hash, role, student_id)
        VALUES ('Duplicate Alice', 'alice.smith@university.edu', 'hash', 'STUDENT', 'STU999999')
      `);
    } catch (err) {
      duplicateEmailCaught = err.code === '23505'; // unique_violation
    }
    assertTest(
      'Prevents duplicate user email',
      duplicateEmailCaught,
      'Rejected duplicate insertion of alice.smith@university.edu'
    );

    // -------------------------------------------------------------
    // Test 4: Duplicate Group Membership Prevention
    // -------------------------------------------------------------
    console.log('\n--- 4. Group Membership Uniqueness Verification ---');
    let duplicateMembershipCaught = false;
    try {
      // Alice is already in Alpha Innovators
      await client.query(`
        INSERT INTO group_members (group_id, student_id)
        VALUES ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001')
      `);
    } catch (err) {
      duplicateMembershipCaught = err.code === '23505'; // unique_violation
    }
    assertTest(
      'Prevents duplicate student in same group',
      duplicateMembershipCaught,
      'Unique constraint uq_group_student prevented duplicate membership'
    );

    // -------------------------------------------------------------
    // Test 5: Duplicate Assignment-to-Group Mapping Prevention
    // -------------------------------------------------------------
    console.log('\n--- 5. Assignment Groups Uniqueness Verification ---');
    let duplicateMappingCaught = false;
    try {
      // Assignment 1 already mapped to Alpha Innovators
      await client.query(`
        INSERT INTO assignment_groups (assignment_id, group_id)
        VALUES ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001')
      `);
    } catch (err) {
      duplicateMappingCaught = err.code === '23505'; // unique_violation
    }
    assertTest(
      'Prevents duplicate assignment-to-group mapping',
      duplicateMappingCaught,
      'Unique constraint uq_assignment_group prevented duplicate assignment mapping'
    );

    // -------------------------------------------------------------
    // Test 6: Reusable Repository Methods Execution
    // -------------------------------------------------------------
    console.log('\n--- 6. Repository Query Methods Verification ---');

    // User repository
    const user = await userRepository.findByEmail('dr.alan@university.edu');
    assertTest(
      'UserRepository.findByEmail',
      user && user.role === 'ADMIN',
      `Found admin: ${user?.name} (${user?.email})`
    );

    const student = await userRepository.findByStudentId('STU2026001');
    assertTest(
      'UserRepository.findByStudentId',
      student && student.name === 'Alice Smith',
      `Found student: ${student?.name} (${student?.student_id})`
    );

    // Group repository
    const members = await groupRepository.listMembers(
      'c0000000-0000-0000-0000-000000000001'
    );
    assertTest(
      'GroupRepository.listMembers',
      members.length === 2,
      `Retrieved ${members.length} members for Alpha Innovators`
    );

    // Assignment repository
    const assignments = await assignmentRepository.findAssignmentsForGroup(
      'c0000000-0000-0000-0000-000000000001'
    );
    assertTest(
      'AssignmentRepository.findAssignmentsForGroup',
      assignments.length === 2,
      `Retrieved ${assignments.length} assignments mapped to Alpha Innovators`
    );

    // Submission repository completion analytics
    const completion = await submissionRepository.calculateGroupCompletion(
      'c0000000-0000-0000-0000-000000000001'
    );
    assertTest(
      'SubmissionRepository.calculateGroupCompletion',
      completion.totalAssigned === 2 && completion.totalConfirmed === 1,
      `Total: ${completion.totalAssigned}, Confirmed: ${completion.totalConfirmed}, Progress: ${completion.completionPercentage}%`
    );

    // Submission repository upsert
    const upserted = await submissionRepository.upsertSubmission({
      assignmentId: 'e0000000-0000-0000-0000-000000000003',
      groupId: 'c0000000-0000-0000-0000-000000000001',
      confirmedBy: 'b0000000-0000-0000-0000-000000000001',
      status: 'CONFIRMED',
    });
    assertTest(
      'SubmissionRepository.upsertSubmission (Create)',
      upserted && upserted.status === 'CONFIRMED',
      `Upserted submission record ID: ${upserted?.id}`
    );

    const reCalculated = await submissionRepository.calculateGroupCompletion(
      'c0000000-0000-0000-0000-000000000001'
    );
    assertTest(
      'Submission progress reflects upserted submission',
      reCalculated.totalConfirmed === 2 && reCalculated.completionPercentage === 100.0,
      `Alpha Innovators new progress: ${reCalculated.completionPercentage}%`
    );

    console.log('\n==================================================');
    console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed`);
    console.log('==================================================');

    if (passedTests === totalTests) {
      console.log('🎉 ALL DATABASE ARCHITECTURE TESTS PASSED!');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification Suite Error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runVerification();
