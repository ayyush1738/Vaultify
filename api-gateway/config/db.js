import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text, params) => pool.query(text, params);

export const initDb = async () => {
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

      CREATE TABLE IF NOT EXISTS enterpriseInv (
        id SERIAL PRIMARY KEY,
        sme_address TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        ipfs_cid TEXT UNIQUE NOT NULL,
        invoice_amount NUMERIC NOT NULL,
        funded_amount NUMERIC,
        preferred_token_symbol TEXT,
        nft_id INTEGER, 
        tx_hash TEXT UNIQUE,
        investor_pubkey TEXT,
        status TEXT CHECK(status IN ('pending', 'funded', 'repaid')) NOT NULL DEFAULT 'pending',
        due_date TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT NOW()
        -- Optional fields if needed:
        -- , chain_id INTEGER
      );
    `;

    await client.query(createTables);
    client.release();
    console.log('✅ Tables ensured for Vaultify EVM architecture.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.stack);
  }
};

initDb();
