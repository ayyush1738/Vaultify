import express from 'express';
import { query } from '../config/db.js';

// ... (imports)

const router = express.Router();

// GET /api/v1/invoices/sme/:address
router.get('/sme/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const { rows } = await query(`
      SELECT 
        id,
        ipfs_cid,
        tx_hash,
        invoice_amount,
        status,
        -- FIX: Use the correct column name from the database schema
        preferred_token_symbol,
        created_at
      FROM enterpriseInv
      WHERE sme_address = $1
      ORDER BY created_at DESC
    `, [address]);

    const formatted = rows.map((inv) => ({
      id: `INV-${String(inv.id).padStart(3, '0')}`,
      customerName: 'N/A', 
      invoiceAmount: inv.invoice_amount,
      // FIX: Map the database column to the front-end type property name
      preferredTokenSymbol: inv.preferred_token,
      status:
        inv.status === 'funded'
          ? 'Funded'
          : inv.status === 'repaid'
          ? 'Repaid'
          : 'Pending Funding',
      txHash: inv.tx_hash,
      ipfsHash: inv.ipfs_cid,
      createdAt: inv.created_at,
      fundedAmount: null,
    }));

    res.json({ invoices: formatted });
  } catch (err) {
    console.error('❌ Error fetching SME invoices:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;