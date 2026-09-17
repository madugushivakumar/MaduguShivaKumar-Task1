const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:shiva@localhost:5432/joineazy_db';
const url = new URL(dbUrl);

async function initDatabase() {
  // Connect to default 'postgres' database to check/create 'joineazy_db'
  const client = new Client({
    host: url.hostname,
    port: url.port || 5432,
    user: url.username,
    password: url.password,
    database: 'postgres',
  });

  try {
    await client.connect();
    const dbName = url.pathname.replace('/', '');
    const checkRes = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkRes.rowCount === 0) {
      console.log(`[Init DB] Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[Init DB] Database '${dbName}' created successfully.`);
    } else {
      console.log(`[Init DB] Database '${dbName}' already exists.`);
    }
    await client.end();
  } catch (err) {
    console.error(`[Init DB Error] ${err.message}`);
    await client.end();
    process.exit(1);
  }
}

initDatabase();
