import { query } from '../config/db.js';

/**
 * Fetch all invoices associated with a specific SME address.
 * @param {string} smeAddress - The wallet address of the SME.
 * @returns {Promise<Array>} - List of invoice rows.
 */
export async function getInvoicesBySme(smeAddress) {
    const sql = `
        SELECT * 
        FROM invoices 
        WHERE sme_address = $1 
        ORDER BY created_at DESC;
    `;
    const { rows } = await query(sql, [smeAddress]);
    return rows;
}

/**
 * Create a new invoice entry in the database.
 * @param {Object} data - Invoice data payload.
 * @returns {Promise<Object>} - The newly created invoice row.
 */
export async function createInvoice(data) {
    const sql = `
        INSERT INTO invoices (
            sme_address, 
            chain_id, 
            vault_contract_address, 
            token_id, 
            tx_hash,
            ipfs_cid, 
            invoice_amount, 
            funding_goal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    const params = [
        data.sme_address,
        data.chain_id,
        data.vault_contract_address,
        data.token_id,
        data.tx_hash,
        data.ipfs_cid,
        data.invoice_amount,
        data.funding_goal
    ];

    const { rows } = await query(sql, params);
    return rows[0];
}

/**
 * Update the status of an invoice by ID.
 * @param {number} id - The ID of the invoice.
 * @param {string} status - The new status (e.g., 'funded', 'repaid').
 * @returns {Promise<Object>} - The updated invoice row.
 */
export async function updateInvoiceStatus(id, status) {
    const sql = `
        UPDATE invoices 
        SET status = $1 
        WHERE id = $2
        RETURNING *;
    `;
    
    const { rows } = await query(sql, [status, id]);

    if (rows.length === 0) {
        throw new Error("Invoice not found or could not be updated.");
    }

    return rows[0];
}
