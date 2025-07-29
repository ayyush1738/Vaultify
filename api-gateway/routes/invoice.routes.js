import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { mintInvoice, parseInvoice } from '../controllers/invoice.controller.js';

const router = Router();

// POST /api/v1/enterprise/
router.post('/', upload.single('file'), mintInvoice);

// POST /api/v1/enterprise/parse
router.post('/parse', upload.single('file'), parseInvoice);

// ... (keep other routes as-is, or similarly move to controller when ready)
export default router;
