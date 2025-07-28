// routes/invoiceRoutes.js
import { Router } from 'express';
import multer from 'multer';
import { mintInvoiceVault } from '../controllers/invoice.controller.js';

const router = Router();

// Configure multer for in-memory file storage
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /api/v1/invoices/mint
 * @description A single endpoint to handle invoice upload, OCR, ZK-proof generation,
 *              and broadcasting the mint transaction via 1inch.
 * @param {file} file - The invoice file (PDF, JPG, PNG).
 * @body {string} smeAddress - The wallet address of the SME.
 * @body {number} chainId - The target chain ID.
 * @body {number} fundingGoal - The amount the SME wishes to receive.
 */
router.post('/mint', uploadMiddleware.single('file'), mintInvoiceVault);

export default router;