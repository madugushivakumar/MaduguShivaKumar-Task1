/**
 * Joineazy Database Migration Runner
 *
 * Scans database/migrations/ for .sql files, verifies against
 * schema_migrations, and executes pending migrations in strict numeric order.
 *
 * Usage: node database/migrate.js
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

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  console.log('==================================================');
  console.log('🚀 Running Joineazy Database Migrations');
  console.log(`📁 Migrations Directory: ${migrationsDir}`);
  console.log('==================================================');

  const client = await pool.connect();

  try {
    // 1. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch already executed migrations
    const appliedResult = await client.query(
      'SELECT migration_name FROM schema_migrations ORDER BY id ASC'
    );
    const appliedMigrations = new Set(
      appliedResult.rows.map((row) => row.migration_name)
    );

    // 3. Scan migrations directory
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('ℹ️  No SQL migration files found.');
      return;
    }

    let appliedCount = 0;

    for (const file of files) {
      if (appliedMigrations.has(file)) {
        console.log(`⏩ Skipping already applied: ${file}`);
        continue;
      }

      console.log(`\n▶️  Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute migration within an atomic transaction
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT DO NOTHING',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ Applied successfully: ${file}`);
        appliedCount++;
      } catch (migrationError) {
        await client.query('ROLLBACK');
        console.error(`❌ Migration failed: ${file}`);
        throw migrationError;
      }
    }

    console.log('\n==================================================');
    console.log(`🎉 Migration completed! Total newly applied: ${appliedCount}`);
    console.log('==================================================');
  } catch (error) {
    console.error('\n❌ Migration Runner encountered an error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
