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
    const seedsDir = path.resolve(__dirname, 'seeds');
    const seedFiles = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (seedFiles.length === 0) {
      throw new Error(`No seed SQL files found in: ${seedsDir}`);
    }

    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      console.log(`▶️  Applying seed file: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Seeded successfully: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    // Count seeded records across all entities
    const uCount = await client.query('SELECT COUNT(*) FROM users');
    const cCount = await client.query('SELECT COUNT(*) FROM courses');
    const csCount = await client.query('SELECT COUNT(*) FROM course_students');
    const gCount = await client.query('SELECT COUNT(*) FROM groups');
    const gmCount = await client.query('SELECT COUNT(*) FROM group_members');
    const aCount = await client.query('SELECT COUNT(*) FROM assignments');
    const agCount = await client.query('SELECT COUNT(*) FROM assignment_groups');
    const sCount = await client.query('SELECT COUNT(*) FROM submissions');

    console.log('\n📊 Seed Records Summary:');
    console.log(`👤 Users             : ${uCount.rows[0].count}`);
    console.log(`🎓 Courses           : ${cCount.rows[0].count}`);
    console.log(`📑 Enrollments       : ${csCount.rows[0].count}`);
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
