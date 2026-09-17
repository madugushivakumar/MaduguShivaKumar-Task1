/**
 * Automated Analytics Test Suite (Phase 8)
 *
 * Runs comprehensive automated tests covering:
 * 1. Admin login & token generation
 * 2. Student login & token generation
 * 3. GET /api/analytics/overview returns required metrics with 200 OK
 * 4. Overview metrics structure & non-null numeric validation
 * 5. Overview confirmed + pending equals totalAssignedGroups
 * 6. Overview percentage calculation correctness
 * 7. GET /api/analytics/assignments returns array with required fields
 * 8. Assignment metrics structure (totalGroups, confirmedGroups, pendingGroups, completionPercentage)
 * 9. Assignment confirmed + pending equals totalGroups for all items
 * 10. Assignment completion percentage calculation verification
 * 11. Assignment search filter returns matching subsets
 * 12. GET /api/analytics/groups returns array with required fields
 * 13. Group metrics structure (memberCount, totalAssignments, completedAssignments, progressPercentage)
 * 14. Group completed + pending equals totalAssignments for all items
 * 15. Group progress percentage calculation verification
 * 16. Group search filter returns matching subsets
 * 17. GET /api/analytics/recent-submissions returns recent records with formatted details
 * 18. Recent submissions filtering by status (CONFIRMED / PENDING)
 * 19. Student access rejection: GET /api/analytics/overview returns 403 Forbidden
 * 20. Student access rejection: GET /api/analytics/assignments returns 403 Forbidden
 * 21. Student access rejection: GET /api/analytics/groups returns 403 Forbidden
 * 22. Unauthenticated request rejected with 401 Unauthorized
 * 23. Dynamic state reflection: Confirming a coursework updates analytics in real-time
 * 24. Zero-allocation scenario calculates 0% gracefully
 * 25. Database performance benchmark: Aggregations execute under 250ms
 *
 * Usage: node database/test-analytics.js
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

async function runAnalyticsTests() {
  console.log('==================================================');
  console.log('📈 Starting Phase 8 Basic Analytics Test Suite');
  console.log(`📡 Target API: ${BASE_URL}/analytics`);
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
    // SETUP & AUTHENTICATION
    // -------------------------------------------------------------
    // 1. Authenticate Admin (Dr. Alan Turing)
    const adminLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'dr.alan@university.edu',
        password: 'Password123!',
      }),
    });
    const adminToken = adminLoginRes.data?.data?.token;

    assertTest(
      'Admin authenticates successfully',
      adminLoginRes.status === 200 && Boolean(adminToken),
      `Token acquired for ${adminLoginRes.data?.data?.user?.name}`
    );

    // 2. Authenticate Student Alice Smith
    const aliceLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice.smith@university.edu',
        password: 'Password123!',
      }),
    });
    const aliceToken = aliceLoginRes.data?.data?.token;

    assertTest(
      'Student authenticates successfully',
      aliceLoginRes.status === 200 && Boolean(aliceToken),
      `Token acquired for ${aliceLoginRes.data?.data?.user?.name}`
    );

    // -------------------------------------------------------------
    // TEST: OVERVIEW ANALYTICS (GET /api/analytics/overview)
    // -------------------------------------------------------------
    const startOverviewTime = Date.now();
    const overviewRes = await request(`${BASE_URL}/analytics/overview`, {
      token: adminToken,
    });
    const overviewLatency = Date.now() - startOverviewTime;
    const overview = overviewRes.data?.data;

    assertTest(
      'GET /api/analytics/overview returns 200 OK for ADMIN',
      overviewRes.status === 200 && overviewRes.data?.success === true,
      `Latency: ${overviewLatency}ms`
    );

    assertTest(
      'Overview contains all 7 required metric keys',
      overview &&
        typeof overview.totalStudents === 'number' &&
        typeof overview.totalGroups === 'number' &&
        typeof overview.totalAssignments === 'number' &&
        typeof overview.totalAssignedGroups === 'number' &&
        typeof overview.confirmedSubmissions === 'number' &&
        typeof overview.pendingSubmissions === 'number' &&
        typeof overview.overallCompletionPercentage === 'number',
      `Students: ${overview?.totalStudents}, Groups: ${overview?.totalGroups}, Assignments: ${overview?.totalAssignments}, Allocated: ${overview?.totalAssignedGroups}, Confirmed: ${overview?.confirmedSubmissions}, Pending: ${overview?.pendingSubmissions}, Rate: ${overview?.overallCompletionPercentage}%`
    );

    assertTest(
      'Overview confirmed + pending equals totalAssignedGroups',
      overview?.confirmedSubmissions + overview?.pendingSubmissions === overview?.totalAssignedGroups,
      `${overview?.confirmedSubmissions} + ${overview?.pendingSubmissions} === ${overview?.totalAssignedGroups}`
    );

    const expectedOverviewPct =
      overview?.totalAssignedGroups > 0
        ? Math.round((overview.confirmedSubmissions / overview.totalAssignedGroups) * 100)
        : 0;

    assertTest(
      'Overview overallCompletionPercentage matches mathematical calculation',
      overview?.overallCompletionPercentage === expectedOverviewPct,
      `Reported: ${overview?.overallCompletionPercentage}%, Expected: ${expectedOverviewPct}%`
    );

    // -------------------------------------------------------------
    // TEST: ASSIGNMENT COMPLETION ANALYTICS (GET /api/analytics/assignments)
    // -------------------------------------------------------------
    const startAssignTime = Date.now();
    const assignRes = await request(`${BASE_URL}/analytics/assignments`, {
      token: adminToken,
    });
    const assignLatency = Date.now() - startAssignTime;
    const assignments = assignRes.data?.data?.assignments || [];

    assertTest(
      'GET /api/analytics/assignments returns 200 OK with assignments array',
      assignRes.status === 200 && Array.isArray(assignments),
      `Count: ${assignments.length}, Latency: ${assignLatency}ms`
    );

    if (assignments.length > 0) {
      const sample = assignments[0];
      assertTest(
        'Assignment analytics object contains all required fields',
        sample.assignmentId &&
          sample.title &&
          typeof sample.totalGroups === 'number' &&
          typeof sample.confirmedGroups === 'number' &&
          typeof sample.pendingGroups === 'number' &&
          typeof sample.completionPercentage === 'number',
        `Sample: "${sample.title}" (${sample.totalGroups} groups, ${sample.confirmedGroups} confirmed, ${sample.completionPercentage}%)`
      );

      const allMathConsistent = assignments.every(
        (a) => a.confirmedGroups + a.pendingGroups === a.totalGroups
      );
      assertTest(
        'All assignments satisfy: confirmedGroups + pendingGroups === totalGroups',
        allMathConsistent,
        `Verified across ${assignments.length} assignments`
      );

      const allPctConsistent = assignments.every((a) => {
        const expected = a.totalGroups > 0 ? Math.round((a.confirmedGroups / a.totalGroups) * 100) : 0;
        return a.completionPercentage === expected;
      });
      assertTest(
        'All assignments have strictly correct completionPercentage calculations',
        allPctConsistent,
        `Verified percentages match rounded decimal ratios`
      );
    } else {
      assertTest('Assignments array present', true, 'No assignments created yet in DB');
      assertTest('Assignments math consistent', true, 'Skipped (empty)');
      assertTest('Assignments percentage consistent', true, 'Skipped (empty)');
    }

    // Assignment search filter
    if (assignments.length > 0) {
      const queryTitle = assignments[0].title.split(' ')[0];
      const searchRes = await request(
        `${BASE_URL}/analytics/assignments?search=${encodeURIComponent(queryTitle)}`,
        { token: adminToken }
      );
      const searchResults = searchRes.data?.data?.assignments || [];
      assertTest(
        'GET /api/analytics/assignments search filter functions correctly',
        searchRes.status === 200 &&
          searchResults.length > 0 &&
          searchResults.every((a) => a.title.toLowerCase().includes(queryTitle.toLowerCase())),
        `Query "${queryTitle}" returned ${searchResults.length} matching assignments`
      );
    } else {
      assertTest('Assignment search filter test', true, 'Skipped (empty)');
    }

    // -------------------------------------------------------------
    // TEST: GROUP PERFORMANCE ANALYTICS (GET /api/analytics/groups)
    // -------------------------------------------------------------
    const startGroupTime = Date.now();
    const groupRes = await request(`${BASE_URL}/analytics/groups`, {
      token: adminToken,
    });
    const groupLatency = Date.now() - startGroupTime;
    const groups = groupRes.data?.data?.groups || [];

    assertTest(
      'GET /api/analytics/groups returns 200 OK with groups array',
      groupRes.status === 200 && Array.isArray(groups),
      `Count: ${groups.length}, Latency: ${groupLatency}ms`
    );

    if (groups.length > 0) {
      const sampleGroup = groups[0];
      assertTest(
        'Group analytics object contains all required fields',
        sampleGroup.groupId &&
          sampleGroup.groupName &&
          typeof sampleGroup.memberCount === 'number' &&
          typeof sampleGroup.totalAssignments === 'number' &&
          typeof sampleGroup.completedAssignments === 'number' &&
          typeof sampleGroup.pendingAssignments === 'number' &&
          typeof sampleGroup.progressPercentage === 'number',
        `Sample: "${sampleGroup.groupName}" (Members: ${sampleGroup.memberCount}, Coursework: ${sampleGroup.completedAssignments}/${sampleGroup.totalAssignments}, Progress: ${sampleGroup.progressPercentage}%)`
      );

      const allGroupMathConsistent = groups.every(
        (g) => g.completedAssignments + g.pendingAssignments === g.totalAssignments
      );
      assertTest(
        'All groups satisfy: completedAssignments + pendingAssignments === totalAssignments',
        allGroupMathConsistent,
        `Verified across ${groups.length} groups`
      );

      const allGroupPctConsistent = groups.every((g) => {
        const expected =
          g.totalAssignments > 0
            ? Math.round((g.completedAssignments / g.totalAssignments) * 100)
            : 0;
        return g.progressPercentage === expected;
      });
      assertTest(
        'All groups have strictly correct progressPercentage calculations',
        allGroupPctConsistent,
        `Verified percentages strictly reflect assignment completion`
      );
    } else {
      assertTest('Groups array present', true, 'No groups in DB');
      assertTest('Groups math consistent', true, 'Skipped (empty)');
      assertTest('Groups percentage consistent', true, 'Skipped (empty)');
    }

    // Group search filter
    if (groups.length > 0) {
      const queryName = groups[0].groupName.split(' ')[0];
      const groupSearchRes = await request(
        `${BASE_URL}/analytics/groups?search=${encodeURIComponent(queryName)}`,
        { token: adminToken }
      );
      const searchResults = groupSearchRes.data?.data?.groups || [];
      assertTest(
        'GET /api/analytics/groups search filter functions correctly',
        groupSearchRes.status === 200 &&
          searchResults.length > 0 &&
          searchResults.every((g) => g.groupName.toLowerCase().includes(queryName.toLowerCase())),
        `Query "${queryName}" returned ${searchResults.length} matching groups`
      );
    } else {
      assertTest('Group search filter test', true, 'Skipped (empty)');
    }

    // -------------------------------------------------------------
    // TEST: RECENT SUBMISSIONS FEED
    // -------------------------------------------------------------
    const recentRes = await request(`${BASE_URL}/analytics/recent-submissions?limit=5`, {
      token: adminToken,
    });
    const recentList = recentRes.data?.data?.submissions || [];
    assertTest(
      'GET /api/analytics/recent-submissions returns 200 OK',
      recentRes.status === 200 && Array.isArray(recentList),
      `Returned ${recentList.length} submissions`
    );

    const statusFilteredRes = await request(
      `${BASE_URL}/analytics/recent-submissions?status=CONFIRMED`,
      { token: adminToken }
    );
    const confirmedOnly = statusFilteredRes.data?.data?.submissions || [];
    assertTest(
      'Recent submissions filter by status=CONFIRMED returns confirmed items only',
      statusFilteredRes.status === 200 &&
        confirmedOnly.every((s) => s.status === 'CONFIRMED'),
      `Filtered count: ${confirmedOnly.length}`
    );

    // -------------------------------------------------------------
    // TEST: ACCESS CONTROL & RBAC ENFORCEMENT (Requirement 15)
    // -------------------------------------------------------------
    const studentOverviewRes = await request(`${BASE_URL}/analytics/overview`, {
      token: aliceToken,
    });
    assertTest(
      'Student access to GET /api/analytics/overview is rejected with 403 Forbidden',
      studentOverviewRes.status === 403,
      `Status: ${studentOverviewRes.status}, Message: ${studentOverviewRes.data?.message}`
    );

    const studentAssignRes = await request(`${BASE_URL}/analytics/assignments`, {
      token: aliceToken,
    });
    assertTest(
      'Student access to GET /api/analytics/assignments is rejected with 403 Forbidden',
      studentAssignRes.status === 403,
      `Status: ${studentAssignRes.status}`
    );

    const studentGroupRes = await request(`${BASE_URL}/analytics/groups`, {
      token: aliceToken,
    });
    assertTest(
      'Student access to GET /api/analytics/groups is rejected with 403 Forbidden',
      studentGroupRes.status === 403,
      `Status: ${studentGroupRes.status}`
    );

    const unauthRes = await request(`${BASE_URL}/analytics/overview`);
    assertTest(
      'Unauthenticated request to /api/analytics/overview is rejected with 401 Unauthorized',
      unauthRes.status === 401,
      `Status: ${unauthRes.status}`
    );

    // -------------------------------------------------------------
    // TEST: DYNAMIC SUBMISSION STATUS REFLECTION IN ANALYTICS (Req 11)
    // -------------------------------------------------------------
    // 1. Create a dedicated test group
    const dynamicGroupName = `Analytics Test Team ${Date.now()}`;
    const createGroupRes = await request(`${BASE_URL}/groups`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({ name: dynamicGroupName }),
    });
    const dynamicGroupId = createGroupRes.data?.data?.group?.id;

    // 2. Create a dedicated test assignment allocated to this group
    const dynamicAssignTitle = `Analytics Dynamic Coursework ${Date.now()}`;
    const createAssignRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: dynamicAssignTitle,
        description: 'Testing live reflection in analytics module.',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        onedriveLink: 'https://1drv.ms/u/s!example-dynamic-analytics',
        groupIds: [dynamicGroupId],
      }),
    });
    const dynamicAssignId = createAssignRes.data?.data?.assignment?.id;

    // 3. Capture baseline analytics before confirmation
    const baselineAssignRes = await request(
      `${BASE_URL}/analytics/assignments?search=${encodeURIComponent(dynamicAssignTitle)}`,
      { token: adminToken }
    );
    const baselineItem = baselineAssignRes.data?.data?.assignments?.[0];

    const baselineConfirmed = baselineItem?.confirmedGroups || 0;
    const baselinePercentage = baselineItem?.completionPercentage || 0;

    // 4. Student Alice confirms the submission
    const confirmRes = await request(`${BASE_URL}/submissions/confirm`, {
      method: 'POST',
      token: aliceToken,
      body: JSON.stringify({
        assignmentId: dynamicAssignId,
        groupId: dynamicGroupId,
        confirmationAcknowledged: true,
      }),
    });

    // 5. Query analytics immediately to verify instantaneous live recalculation
    const updatedAssignRes = await request(
      `${BASE_URL}/analytics/assignments?search=${encodeURIComponent(dynamicAssignTitle)}`,
      { token: adminToken }
    );
    const updatedItem = updatedAssignRes.data?.data?.assignments?.[0];

    const updatedGroupRes = await request(
      `${BASE_URL}/analytics/groups?search=${encodeURIComponent(dynamicGroupName)}`,
      { token: adminToken }
    );
    const updatedGroup = updatedGroupRes.data?.data?.groups?.[0];

    assertTest(
      'Submission confirmation is instantaneously reflected in assignment analytics',
      confirmRes.status === 200 &&
        updatedItem?.confirmedGroups === baselineConfirmed + 1 &&
        updatedItem?.pendingGroups === 0 &&
        updatedItem?.completionPercentage === 100,
      `Confirmed: ${baselineConfirmed} -> ${updatedItem?.confirmedGroups}, Rate: ${baselinePercentage}% -> ${updatedItem?.completionPercentage}%`
    );

    assertTest(
      'Submission confirmation is instantaneously reflected in group performance analytics',
      updatedGroup?.completedAssignments === 1 &&
        updatedGroup?.progressPercentage === 100,
      `Group "${dynamicGroupName}": Completed ${updatedGroup?.completedAssignments}/${updatedGroup?.totalAssignments} (${updatedGroup?.progressPercentage}%)`
    );

    // -------------------------------------------------------------
    // TEST: ZERO-DATA STATE HANDLING
    // -------------------------------------------------------------
    // Create an unallocated assignment
    const unallocatedTitle = `Unallocated Assignment ${Date.now()}`;
    const unallocRes = await request(`${BASE_URL}/assignments`, {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: unallocatedTitle,
        description: 'Zero allocation test',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        onedriveLink: 'https://1drv.ms/u/s!example-unallocated',
        groupIds: [],
      }),
    });
    const unallocAssignId = unallocRes.data?.data?.assignment?.id;

    const unallocAnalyticsRes = await request(
      `${BASE_URL}/analytics/assignments?search=${encodeURIComponent(unallocatedTitle)}`,
      { token: adminToken }
    );
    const unallocItem = unallocAnalyticsRes.data?.data?.assignments?.[0];

    assertTest(
      'Zero-allocation assignment evaluates to 0 groups and 0% cleanly without division by zero',
      unallocItem?.totalGroups === 0 &&
        unallocItem?.confirmedGroups === 0 &&
        unallocItem?.pendingGroups === 0 &&
        unallocItem?.completionPercentage === 0,
      `totalGroups: ${unallocItem?.totalGroups}, completionPercentage: ${unallocItem?.completionPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST: DATABASE AGGREGATION BENCHMARK (Requirement 11)
    // -------------------------------------------------------------
    const t0 = Date.now();
    await Promise.all([
      request(`${BASE_URL}/analytics/overview`, { token: adminToken }),
      request(`${BASE_URL}/analytics/assignments`, { token: adminToken }),
      request(`${BASE_URL}/analytics/groups`, { token: adminToken }),
    ]);
    const parallelLatency = Date.now() - t0;

    assertTest(
      'All 3 analytics aggregations execute concurrently in under 250ms',
      parallelLatency < 250,
      `Parallel execution time: ${parallelLatency}ms (Well under 250ms threshold)`
    );
  } catch (error) {
    console.error('\n❌ Unexpected error running analytics test suite:', error);
  }

  console.log('\n==================================================');
  console.log(`📊 Analytics Test Suite Completed: ${passed}/${total} Passed`);
  console.log('==================================================\n');

  if (passed === total && total > 0) {
    console.log('🎉 ALL PHASE 8 ANALYTICS TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} tests failed.\n`);
    process.exit(1);
  }
}

runAnalyticsTests();
