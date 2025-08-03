// routes/investor.routes.js
import { Router } from 'express';
import { getAvailableInvoices, fundInvoice } from '../controllers/investor.controller.js';

const router = Router();

router.get('/available', getAvailableInvoices);
router.post('/fund/:id', fundInvoice); // ID is invoice ID

export default router;
