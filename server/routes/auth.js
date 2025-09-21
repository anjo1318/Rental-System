import express from 'express';
import { login, mobileOwnerLogin, mobileUserLogin, verify  } from '../controllers/authController.js'; 
import verifyAdmin from '../middleware/authMiddleware.js';

const router = express.Router();

//website
router.post('/login', login);
router.get('/verify', verifyAdmin, verify);

//mobile app User
router.post('/mobile/user-login', mobileUserLogin);

//mobiel app Owner
router.post('/mobile/owner-login', mobileOwnerLogin);
export default router;