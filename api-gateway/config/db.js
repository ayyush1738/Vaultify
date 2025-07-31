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
      -- Users table can be used for associating SMEs with a username or other profile data
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE,
          wallet_address TEXT UNIQUE NOT NULL,
          role TEXT CHECK(role IN ('investor', 'enterprise')) NOT NULL DEFAULT 'investor'
      );

      -- Invoices table as per your specification
      CREATE TABLE IF NOT EXISTS enterpriseInv (
          id SERIAL PRIMARY KEY ,
          sme_address TEXT NOT NULL,
          token_id BIGINT,
          ipfs_cid TEXT UNIQUE NOT NULL,
          invoice_amount NUMERIC NOT NULL,
          tx_hash TEXT UNIQUE,
          investor_pubkey TEXT,
          status TEXT DEFAULT 'Pending Funding' NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await client.query(createTables);
    client.release();
    console.log('✅ Tables ensured for Vaultify EVM architecture.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.stack);
    // In a real app, you might want to exit if the DB can't be initialized
    // process.exit(1); 
  }
};

// Run the initialization
initDb();

// Export a dedicated query function that uses the pool
export function query(text, params) {
  return pool.query(text, params);
}