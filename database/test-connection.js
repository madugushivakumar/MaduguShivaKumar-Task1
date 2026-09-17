/**
 * Database Connection Verification Script
 *
 * Usage: node database/test-connection.js
 */
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/joineazy_db';

console.log('--------------------------------------------------');
console.log('🔍 Testing PostgreSQL Database Connection');
console.log(`📡 URL: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
console.log('--------------------------------------------------');

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  const start = Date.now();
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version(), NOW() AS current_time');
    const duration = Date.now() - start;

    console.log('✅ Connection Successful!');
    console.log(`⏱️ Latency: ${duration}ms`);
    console.log(`🕒 Server Time: ${result.rows[0].current_time}`);
    console.log(`📦 DB Version: ${result.rows[0].version}`);
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Database Connection Failed!');
    console.error(`⏱️ Attempt Duration: ${duration}ms`);
    console.error(`⚠️ Error Details: ${error.message}`);
    console.error('\nTroubleshooting Tips:');
    console.error('1. Check if PostgreSQL service is running locally or via Docker.');
    console.error('2. Verify credentials in backend/.env match your DB instance.');
    console.error('3. Start Docker DB container: docker compose up -d postgres\n');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
