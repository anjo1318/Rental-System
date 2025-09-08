import express from 'express';
import { login, verify } from '../controllers/authController.js'; 
import verifyAdmin from '../middleware/authMiddleware.js';

const router = express.Router();

//website
router.post('/login', login);
router.get('/verify', verifyAdmin, verify);

//mobile app
router.post('/mobile/login', mobileLogin);
export default router;