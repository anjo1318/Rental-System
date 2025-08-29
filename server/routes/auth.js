import express from 'express';
import { login, verify } from '../controllers/authController.js'; 
import verifyAdmin from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verifyAdmin, verify);

export default router;