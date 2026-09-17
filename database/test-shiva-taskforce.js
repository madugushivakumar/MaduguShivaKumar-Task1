const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
  console.log('--------------------------------------------------');
  console.log('Testing User Example: Shiva Inviting Friend in TaskForce');
  console.log('--------------------------------------------------');

  // Check members of Joineazy TaskForce
  const resBefore = await pool.query(`
    SELECT gm.id as membership_id, gm.joined_at, u.name, u.email, u.student_id, u.role
    FROM group_members gm
    JOIN users u ON gm.student_id = u.id
    WHERE gm.group_id = 'f160d43c-1b88-48e1-b368-9601e39d35f1'
    ORDER BY gm.joined_at ASC
  `);
  console.log(`Current Members of Joineazy TaskForce (${resBefore.rowCount}):`);
  console.table(resBefore.rows);

  // 1. Login as Charlie Brown (active member of TaskForce)
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'charlie.brown@university.edu', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.token;
  console.log('Charlie Login status:', loginRes.status, 'Token issued:', Boolean(token));

  // 2. Add member friend@university.edu / STU2026010
  const addRes = await fetch('http://localhost:5000/api/groups/f160d43c-1b88-48e1-b368-9601e39d35f1/members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      email: 'friend@university.edu',
      studentId: 'STU2026010'
    })
  });
  const addData = await addRes.json();
  console.log('Add Member response status:', addRes.status);
  console.log('Add Member data:', JSON.stringify(addData, null, 2));

  // 3. GET /api/groups/f160d43c-1b88-48e1-b368-9601e39d35f1/members
  const listRes = await fetch('http://localhost:5000/api/groups/f160d43c-1b88-48e1-b368-9601e39d35f1/members', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const listData = await listRes.json();
  console.log(`\nRefreshed Members List from API (${listData?.data?.count}):`);
  console.table(listData?.data?.members);

  // 4. Check PostgreSQL DB directly
  const dbCheck = await pool.query(`
    SELECT gm.id as membership_id, gm.joined_at, u.name, u.email, u.student_id as institutional_id, u.role
    FROM group_members gm
    JOIN users u ON gm.student_id = u.id
    WHERE gm.group_id = 'f160d43c-1b88-48e1-b368-9601e39d35f1'
    ORDER BY gm.joined_at ASC
  `);
  console.log(`\nDirect PostgreSQL Verification (${dbCheck.rowCount} members in group):`);
  console.table(dbCheck.rows);

  await pool.end();
}

verify().catch(console.error);
