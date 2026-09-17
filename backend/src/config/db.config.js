const { Pool } = require('pg');
const { env } = require('./env.config');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: env.isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err.message);
});

/**
 * Execute a query with the connection pool
 * @param {string} text - SQL query string
 * @param {Array} [params] - Query parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.isDevelopment) {
    console.log(`[DB] executed query: { duration: ${duration}ms, rows: ${res.rowCount} }`);
  }
  return res;
};

/**
 * Check database connection status
 * @returns {Promise<boolean>}
 */
const checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1 AS health_check');
    client.release();
    return true;
  } catch (error) {
    console.warn(`[DB Warning] Connection check failed: ${error.message}`);
    return false;
  }
};

/**
 * Gracefully close the connection pool
 */
const closePool = async () => {
  await pool.end();
  console.log('[DB] PostgreSQL pool has ended.');
};

module.exports = {
  pool,
  query,
  checkConnection,
  closePool,
};
