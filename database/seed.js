/**
 * Joineazy Database Seed Runner
 *
 * Populates development seed data: Admins, Students, Groups,
 * Memberships, Assignments, Group Mappings, Submissions.
 *
 * Usage: node database/seed.js
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/joineazy_db';

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

async function runSeed() {
  console.log('==================================================');
  console.log('🌱 Seeding Joineazy PostgreSQL Database');
  console.log('==================================================');

  const client = await pool.connect();

  try {
    const seedFile = path.resolve(__dirname, 'seeds/001_seed_initial_data.sql');
    if (!fs.existsSync(seedFile)) {
      throw new Error(`Seed SQL file not found: ${seedFile}`);
    }

    const sql = fs.readFileSync(seedFile, 'utf8');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    // Count seeded records across all entities
    const uCount = await client.query('SELECT COUNT(*) FROM users');
    const gCount = await client.query('SELECT COUNT(*) FROM groups');
    const gmCount = await client.query('SELECT COUNT(*) FROM group_members');
    const aCount = await client.query('SELECT COUNT(*) FROM assignments');
    const agCount = await client.query('SELECT COUNT(*) FROM assignment_groups');
    const sCount = await client.query('SELECT COUNT(*) FROM submissions');

    console.log('\n📊 Seed Records Summary:');
    console.log(`👤 Users             : ${uCount.rows[0].count}`);
    console.log(`👥 Groups            : ${gCount.rows[0].count}`);
    console.log(`🤝 Group Members     : ${gmCount.rows[0].count}`);
    console.log(`📚 Assignments       : ${aCount.rows[0].count}`);
    console.log(`🔗 Assignment Groups : ${agCount.rows[0].count}`);
    console.log(`📝 Submissions       : ${sCount.rows[0].count}`);

    console.log('\n==================================================');
    console.log('✅ Database seeded successfully with test data!');
    console.log('🔑 All test accounts use password: Password123!');
    console.log('==================================================');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
