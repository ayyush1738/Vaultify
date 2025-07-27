import { Router } from 'express';
import {enterpriseLogin, getNonce} from "../controllers/auth.controller.js"

const router = Router();

router.get("/nonce", getNonce);
router.post("/enterprise", enterpriseLogin);

export default router;

