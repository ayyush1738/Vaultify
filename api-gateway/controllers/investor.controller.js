// controllers/investor.controller.js
import { query } from '../config/db.js';
import * as blockchainService from '../services/blockchain.service.js';

export const getAvailableInvoices = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT id, customer_name, invoice_amount, ipfs_cid, preferred_token_symbol, due_date
      FROM enterpriseInv 
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `);

    res.json({ invoices: rows });
  } catch (err) {
    console.error('Error fetching available invoices:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const fundInvoice = async (req, res) => {
  const { id } = req.params;
  const { investorAddress } = req.body;

  if (!investorAddress) {
    return res.status(400).json({ message: "Missing investor address." });
  }

  try {
    const { rows } = await query(`SELECT * FROM enterpriseInv WHERE id = $1`, [id]);

    if (!rows.length) return res.status(404).json({ message: "Invoice not found." });
    const invoice = rows[0];

    const result = await blockchainService.fundInvoiceOnChain({
      investorAddress,
      nftId: invoice.nft_id, // <--- USE THE CORRECT ID
      amount: invoice.fundingAmount, // Note: You were sending invoice_amount before
      tokenSymbol: invoice.preferred_token_symbol,
    });

    // Update DB
    await query(`
      UPDATE enterpriseInv
      SET status = 'funded', investor_pubkey = $1, funded_amount = $2
      WHERE id = $3
    `, [investorAddress, invoice.invoice_amount, id]);

    res.status(200).json({ message: "Invoice funded successfully.", txHash: result.txHash });
  } catch (err) {
    console.error("Funding failed:", err);
    res.status(500).json({ message: err.message || "Failed to fund invoice." });
  }
};
