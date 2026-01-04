import express from 'express';
import { 
  login, 
  mobileOwnerLogin, 
  mobileUserLogin, 
  verify, 
  forgotPassword,
  verifyResetToken,
  resetPassword
} from '../controllers/authController.js'; 
import verifyAdmin from '../middleware/authMiddleware.js';

const router = express.Router();

// Website
router.post('/login', login);
router.get('/verify', verifyAdmin, verify);

// Mobile app User
router.post('/mobile/user-login', mobileUserLogin);

// Mobile app Owner
router.post('/mobile/owner-login', mobileOwnerLogin);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;
