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
      -- Users table remains the same
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE,
          wallet_address TEXT UNIQUE NOT NULL,
          role TEXT CHECK(role IN ('investor', 'enterprise')) NOT NULL DEFAULT 'investor'
      );

      -- Invoices table REVAMPED for EVM and Vaultify structure
      CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          sme_address TEXT NOT NULL,         -- The wallet address of the SME
          chain_id INTEGER NOT NULL,         -- The chain where the vault was minted (e.g., 1, 137)
          
          -- On-Chain Data
          vault_contract_address TEXT,       -- Address of the deployed InvoiceNFT contract
          token_id BIGINT,                   -- The unique ID of the minted ERC721 token
          tx_hash TEXT UNIQUE,               -- The hash of the minting transaction
          
          -- Off-Chain Metadata
          ipfs_cid TEXT UNIQUE NOT NULL,     -- The IPFS CID from the OCR service
          invoice_amount NUMERIC NOT NULL,   -- The face value of the invoice
          funding_goal NUMERIC NOT NULL,     -- The amount the SME wants to receive
          
          -- Status
          status TEXT DEFAULT 'Pending Funding', -- e.g., 'Pending Funding', 'Funded', 'Repaid'
          created_at TIMESTAMPTZ DEFAULT NOW()
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

export default pool;