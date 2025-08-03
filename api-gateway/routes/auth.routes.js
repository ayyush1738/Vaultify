import { Router } from 'express';
import {enterpriseLogin, getNonce, investorLogin} from "../controllers/auth.controller.js"

const router = Router();

router.get("/nonce", getNonce);
router.post("/enterprise", enterpriseLogin);
router.post("/investor", investorLogin);
export default router;

