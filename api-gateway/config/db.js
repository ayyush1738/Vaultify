// dbConnect.js
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to the PostgreSQL database.');

    const createTables = `
  CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      wallet_address TEXT UNIQUE NOT NULL,
      role TEXT CHECK(role IN ('investor', 'enterprise')) NOT NULL DEFAULT 'investor'
  );

  CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      username TEXT,
      cid TEXT NOT NULL,
      tx_sig TEXT,
      amount NUMERIC NOT NULL,
      inv_amount NUMERIC,
      creator TEXT NOT NULL,
      mint TEXT,
      investor_pubkey TEXT,
      customer_pubkey TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      paid BOOLEAN DEFAULT FALSE
  );
`;


    await client.query(createTables);
    client.release();
    console.log('✅ Tables ensured.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.stack);
  }
};

initDb();

export default pool;